"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { LanguageSelector } from "@/components/auth/LanguageSelector"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Github, Mail, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError(t("enterEmailForReset"))
      return
    }

    const supabase = createClient()
    setIsResettingPassword(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setResetEmailSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("resetPasswordError"))
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <>
      <AnimatedBackground />
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-white pb-[5.5px] select-none pointer-events-none mb-3">
              <span className="text-5xl font-bold leading-none text-white">光</span>
            </div>
            <div className="text-base font-semibold tracking-tight text-white select-none pointer-events-none">
              Hikari
            </div>
          </div>

          <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">{t("welcome")}</CardTitle>
              <CardDescription className="text-neutral-400">{t("loginSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OAuth Buttons */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white transition-all"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t("continueWithGoogle")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white transition-all"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  {t("continueWithGitHub")}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-900 px-2 text-neutral-500">{t("orContinueWithEmail")}</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-neutral-300">
                      {t("password")}
                    </Label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResettingPassword}
                      className="text-xs text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {isResettingPassword ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {t("sending")}
                        </span>
                      ) : (
                        t("forgotPassword")
                      )}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>

                {resetEmailSent && (
                  <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                    {t("resetEmailSent")}
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition-all"
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isLoading ? t("signingIn") : t("signIn")}
                </Button>
              </form>

              <p className="text-center text-sm text-neutral-400">
                {t("noAccount")}{" "}
                <Link href="/auth/signup" className="font-medium text-white hover:text-neutral-300 transition-colors">
                  {t("createAccount")}
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Hikari. {t("copyright")}.
          </p>
        </div>
      </div>
    </>
  )
}
