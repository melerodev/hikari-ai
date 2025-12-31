import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"

export default function VerifyEmailPage() {
  return (
    <>
      <AnimatedBackground />
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Verifica tu email</CardTitle>
              <CardDescription className="text-neutral-400">
                Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada
                y haz clic en el enlace para activar tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-neutral-400">
                ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
                <Link href="/auth/signup" className="font-medium text-white hover:text-neutral-300 transition-colors">
                  intenta registrarte de nuevo
                </Link>
              </p>
              <p className="text-center text-sm text-neutral-400">
                <Link href="/auth/login" className="font-medium text-white hover:text-neutral-300 transition-colors">
                  Volver al inicio de sesión
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Hikari. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </>
  )
}
