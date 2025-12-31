"use client"

import { useEffect, useRef } from "react"

interface LogoParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  rotation: number
  rotationSpeed: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: LogoParticle[] = []
    const particleCount = 15

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 30,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.12 + 0.03,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
      })
    }

    const drawLogo = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity

      ctx.font = `bold ${size}px "Noto Sans SC", "Noto Sans JP", sans-serif`
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("光", 0, 0)

      ctx.restore()
    }

    let animationId: number
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed

        if (particle.x < -particle.size) particle.x = canvas.width + particle.size
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size

        drawLogo(particle.x, particle.y, particle.size, particle.rotation, particle.opacity)
      })

      animationId = requestAnimationFrame(animate)
    }

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ background: "#000000" }} />
}
