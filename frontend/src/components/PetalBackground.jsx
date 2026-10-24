import React, { useEffect, useRef } from 'react';

export default function PetalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Rose petal color palettes (Crimson Velvet, Romantic Rose, Burgundy, Blush)
    const petalPalettes = [
      {
        light: '#ff4d6d',
        mid: '#c9184a',
        dark: '#800f2f',
        vein: 'rgba(255, 180, 195, 0.45)'
      },
      {
        light: '#e01e37',
        mid: '#a71e34',
        dark: '#641220',
        vein: 'rgba(255, 170, 180, 0.4)'
      },
      {
        light: '#ff758f',
        mid: '#d90429',
        dark: '#74001a',
        vein: 'rgba(255, 210, 220, 0.45)'
      },
      {
        light: '#f72585',
        mid: '#b5179e',
        dark: '#7209b7',
        vein: 'rgba(255, 200, 240, 0.4)'
      }
    ];

    const petalCount = window.innerWidth < 768 ? 24 : 38;
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      const palette = petalPalettes[i % petalPalettes.length];
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height * 0.2,
        size: Math.random() * 7 + (window.innerWidth < 768 ? 10 : 13), // 10-17px mobile, 13-20px desktop
        speedY: Math.random() * 0.75 + 0.65, // gentle drift ~0.65 - 1.4 px/frame
        swaySpeed: Math.random() * 0.02 + 0.012,
        swayAmp: Math.random() * 1.5 + 0.8,
        swayOffset: Math.random() * Math.PI * 2,
        angle: Math.random() * 360,
        angleSpeed: (Math.random() - 0.5) * 0.8,
        flipAngle: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.025 + 0.015,
        opacity: Math.random() * 0.22 + 0.75,
        colorLight: palette.light,
        colorMid: palette.mid,
        colorDark: palette.dark,
        veinColor: palette.vein
      });
    }

    // Helper to draw realistic organic rose petal
    const drawRosePetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      
      // 3D tumble flip along X axis
      const scaleX = Math.cos(p.flipAngle);
      ctx.scale(scaleX, 1);

      const s = p.size;

      // Radial velvety shading
      const grad = ctx.createRadialGradient(0, -s * 0.2, s * 0.1, 0, 0, s * 1.15);
      grad.addColorStop(0, p.colorLight);
      grad.addColorStop(0.65, p.colorMid);
      grad.addColorStop(1, p.colorDark);

      ctx.beginPath();
      // Organic Rose Petal Geometry (heart-cupped shape)
      ctx.moveTo(0, -s * 0.7);
      ctx.bezierCurveTo(-s * 0.55, -s * 1.05, -s * 0.95, -s * 0.25, -s * 0.72, s * 0.45);
      ctx.bezierCurveTo(-s * 0.4, s * 0.92, -s * 0.12, s * 1.05, 0, s * 1.12);
      ctx.bezierCurveTo(s * 0.12, s * 1.05, s * 0.4, s * 0.92, s * 0.72, s * 0.45);
      ctx.bezierCurveTo(s * 0.95, -s * 0.25, s * 0.55, -s * 1.05, 0, -s * 0.7);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.globalAlpha = p.opacity;
      ctx.fill();

      // Subtle delicate petal center vein highlight
      ctx.beginPath();
      ctx.moveTo(0, s * 0.95);
      ctx.quadraticCurveTo(s * 0.08, s * 0.1, 0, -s * 0.35);
      ctx.strokeStyle = p.veinColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        
        // Dynamic motion: falling, swaying breeze, rotating, and flipping
        p.swayOffset += p.swaySpeed;
        p.x += Math.sin(p.swayOffset) * p.swayAmp;
        p.y += p.speedY;
        p.angle += p.angleSpeed;
        p.flipAngle += p.flipSpeed;

        drawRosePetal(p);

        // Respawn smoothly when off screen
        if (p.y > height + 40) {
          p.y = -35;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) p.x = -35;
        if (p.x < -40) p.x = width + 40;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 5
      }}
    />
  );
}
