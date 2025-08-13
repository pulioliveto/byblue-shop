"use client"

import { useEffect, useRef } from "react"

export default function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Network nodes
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      type: "person" | "tech"
      opacity: number
      pulsePhase: number
    }> = []

    // Create nodes
    for (let i = 0; i < 12; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 4 + 3,
        type: Math.random() > 0.5 ? "person" : "tech",
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let animationId: number

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.offsetWidth) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.offsetHeight) node.vy *= -1

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.offsetWidth, node.x))
        node.y = Math.max(0, Math.min(canvas.offsetHeight, node.y))

        // Update pulse
        node.pulsePhase += 0.02
        const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7

        // Draw connections
        nodes.forEach((otherNode, j) => {
          if (i >= j) return

          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3
            ctx.strokeStyle =
              node.type === "person" && otherNode.type === "tech"
                ? `rgba(59, 130, 246, ${opacity})` // Blue for person-tech connections
                : `rgba(34, 197, 94, ${opacity})` // Green for other connections
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.stroke()
          }
        })

        // Draw node
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * pulse)

        if (node.type === "person") {
          gradient.addColorStop(0, `rgba(59, 130, 246, ${node.opacity * pulse})`)
          gradient.addColorStop(1, `rgba(59, 130, 246, 0)`)
        } else {
          gradient.addColorStop(0, `rgba(34, 197, 94, ${node.opacity * pulse})`)
          gradient.addColorStop(1, `rgba(34, 197, 94, 0)`)
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Draw inner core
        ctx.fillStyle =
          node.type === "person"
            ? `rgba(59, 130, 246, ${node.opacity + 0.3})`
            : `rgba(34, 197, 94, ${node.opacity + 0.3})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 0.3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full opacity-60" style={{ width: "100%", height: "100%" }} />
}
