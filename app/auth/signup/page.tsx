"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Github, UserPlus, Check, X } from "lucide-react"

function validatePassword(password: string) {
  const requirements = [
    { label: "Al menos 8 caracteres", met: password.length >= 8 },
    { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Una letra minúscula", met: /[a-z]/.test(password) },
    { label: "Un número", met: /[0-9]/.test(password) },
    { label: "Un carácter especial (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const strength = requirements.filter((r) => r.met).length
  let strengthLabel = "Muy débil"
  let strengthColor = "bg-red-500"

  if (strength === 5) {
    strengthLabel = "Muy fuerte"
    strengthColor = "bg-green-500"
  } else if (strength === 4) {
    strengthLabel = "Fuerte"
    strengthColor = "bg-green-400"
  } else if (strength === 3) {
    strengthLabel = "Media"
    strengthColor = "bg-yellow-500"
  } else if (strength === 2) {
    strengthLabel = "Débil"
    strengthColor = "bg-orange-500"
  }

  return { requirements, strength, strengthLabel, strengthColor, isValid: strength >= 4 }
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const passwordValidation = useMemo(() => validatePassword(password), [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos de seguridad")
      setIsLoading(false)
      return
    }

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 13) {
      setError("Debes tener al menos 13 años para registrarte")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            date_of_birth: dateOfBirth,
          },
        },
      })
      if (error) throw error

      if (data?.user?.identities?.length === 0) {
        setError("Ya existe una cuenta con este correo electrónico")
        setIsLoading(false)
        return
      }

      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: "google" | "github") => {
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
      setError(error instanceof Error ? error.message : "Error al registrarse")
      setIsLoading(false)
    }
  }

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
              <CardTitle className="text-2xl font-bold text-white">Crear cuenta</CardTitle>
              <CardDescription className="text-neutral-400">
                Regístrate para comenzar a usar la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OAuth Buttons - Updated to B&W */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white transition-all"
                  onClick={() => handleOAuthSignUp("google")}
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
                  Registrarse con Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white transition-all"
                  onClick={() => handleOAuthSignUp("github")}
                  disabled={isLoading}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Registrarse con GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-900 px-2 text-neutral-500">O crea una cuenta con email</span>
                </div>
              </div>

              {/* Sign Up Form - Updated to B&W */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-neutral-300">
                    Nombre completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-neutral-300">
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20 [color-scheme:dark]"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-300">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                  {password && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordValidation.strengthColor} transition-all duration-300`}
                            style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 min-w-[70px]">
                          {passwordValidation.strengthLabel}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {passwordValidation.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs">
                            {req.met ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-neutral-500" />
                            )}
                            <span className={req.met ? "text-green-500" : "text-neutral-500"}>{req.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-neutral-300">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white focus:ring-white/20"
                  />
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      {password === confirmPassword ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">Las contraseñas coinciden</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">Las contraseñas no coinciden</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition-all"
                  disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>

              <p className="text-center text-sm text-neutral-400">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="font-medium text-white hover:text-neutral-300 transition-colors">
                  Iniciar sesión
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
