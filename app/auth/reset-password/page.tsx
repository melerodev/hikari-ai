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
import { useState, useEffect } from "react"
import { Lock, Loader2, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsValidSession(true)
      }
      setIsCheckingSession(false)
    }

    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t("passwordTooShort"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      await supabase.auth.signOut()

      setIsSuccess(true)

      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("resetPasswordError"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("loading")}</span>
          </div>
        </div>
      </>
    )
  }

  if (!isValidSession) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
          <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-xl shadow-2xl max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">{t("invalidResetLink")}</CardTitle>
              <CardDescription className="text-neutral-400">{t("invalidResetLinkDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full bg-white hover:bg-neutral-200 text-black font-semibold">
                  {t("backToLogin")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (isSuccess) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
          <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-xl shadow-2xl max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 place-items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">{t("passwordResetSuccess")}</CardTitle>
              <CardDescription className="text-neutral-400">{t("passwordResetSuccessDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full bg-white hover:bg-neutral-200 text-black font-semibold">
                  {t("backToLogin")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
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
              <CardTitle className="text-2xl font-bold text-white">{t("resetPassword")}</CardTitle>
              <CardDescription className="text-neutral-400">{t("resetPasswordSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-300">
                    {t("newPassword")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder={t("newPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-neutral-300">
                    {t("confirmNewPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder={t("confirmPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>

                <p className="text-xs text-neutral-500">{t("passwordRequirements")}</p>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition-all"
                  disabled={isLoading}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {isLoading ? t("updating") : t("resetPassword")}
                </Button>
              </form>

              <p className="text-center text-sm text-neutral-400">
                <Link href="/auth/login" className="font-medium text-white hover:text-neutral-300 transition-colors">
                  {t("backToLogin")}
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
