"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { LanguageSelector } from "@/components/auth/LanguageSelector"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function AuthCodeErrorPage() {
  const { t } = useLanguage()

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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">{t("authError")}</CardTitle>
              <CardDescription className="text-neutral-400">{t("authErrorDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                className="w-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition-all"
              >
                <Link href="/auth/login">{t("backToLogin")}</Link>
              </Button>
              <p className="text-center text-sm text-neutral-400">
                {t("authErrorHelp")}{" "}
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
