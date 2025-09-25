// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

// Inicializamos cliente Supabase con la service role key (⚠️ solo usar en el backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 🔹 Función para refrescar access token cuando expire
async function refreshAccessToken(token) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      })

    const res = await fetch(url, { method: "POST" })
    const refreshedTokens = await res.json()

    if (!res.ok) throw refreshedTokens

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("❌ Error refrescando token", error)
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.force-ssl",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
          ].join(" "),
          access_type: "offline", // necesario para refresh token
          prompt: "consent", // fuerza a Google a dar refresh token
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 🔹 Primer login → guardar en Supabase
      if (account && profile) {
        try {
          await supabase.from("users").upsert({
            id: profile.sub, // ID único de Google
            email: profile.email,
            youtube_refresh_token: account.refresh_token, // 👈 guardamos el refresh token
          })
          console.log(`✅ Usuario ${profile.email} guardado en Supabase`)
        } catch (err) {
          console.error("❌ Error guardando usuario en Supabase:", err)
        }

        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user: profile.sub,
        }
      }

      // 🔹 Token aún válido → lo usamos
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // 🔹 Token expirado → refrescar
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.id = token.user
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
