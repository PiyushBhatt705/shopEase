import React, { useEffect, useRef } from "react";

const Confetti = ({ duration = 5000 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      "#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", 
      "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", 
      "#10b981", "#22c55e", "#84cc16", "#eab308", "#f97316"
    ];

    const particles = [];
    const maxParticles = 150;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.opacity = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Add slight drift
        this.speedX += Math.sin(this.y / 30) * 0.05;

        // Slow fade out at bottom or end
        if (this.y > height - 100) {
          this.opacity -= 0.02;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        
        // Alternate shapes: rectangles, circles, triangles
        if (this.size % 2 === 0) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
        } else if (this.size % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;
      particles.forEach((p) => {
        if (p.opacity > 0 && p.y < height) {
          p.update();
          p.draw();
          activeCount++;
        }
      });

      if (activeCount > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    // End loop after duration
    const timeout = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, duration);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default Confetti;
