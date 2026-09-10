import React, { useEffect, useRef } from 'react';

interface FlightCanvasProps {
  status: 'idle' | 'flying' | 'crashed' | 'claimed';
  multiplier: number;
  onExplosionComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'fire' | 'smoke' | 'spark' | 'trail' | 'star';
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  alpha: number;
}

export const FlightCanvas: React.FC<FlightCanvasProps> = ({
  status,
  multiplier,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for continuous physics across renders
  const stateRef = useRef({
    status,
    multiplier,
    planeX: 0,
    planeY: 0,
    planeAngle: -15, // degrees
    planeScale: 1,
    screenShake: 0,
    flightPoints: [] as { x: number; y: number }[],
    particles: [] as Particle[],
    clouds: [] as Cloud[],
    stars: [] as { x: number; y: number; size: number; alpha: number; speed: number }[],
    afterburnerPulse: 0,
    claimedZoomX: 0,
    claimedZoomY: 0,
  });

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current.status = status;
    stateRef.current.multiplier = multiplier;
  }, [status, multiplier]);

  // Handle Explosion Spawn
  const hasTriggeredExplosion = useRef(false);
  useEffect(() => {
    if (status === 'crashed' && !hasTriggeredExplosion.current) {
      hasTriggeredExplosion.current = true;
      const { planeX, planeY } = stateRef.current;
      stateRef.current.screenShake = 18;

      // Spawn fiery debris and shockwaves
      const newParticles: Particle[] = [];
      const colors = ['#ff2a5f', '#ff7a00', '#ffd200', '#ffffff', '#ff4d00'];

      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 2;
        newParticles.push({
          x: planeX,
          y: planeY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 45 + 30,
          type: Math.random() > 0.4 ? 'fire' : 'spark',
        });
      }

      // Smoke clouds
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        newParticles.push({
          x: planeX + (Math.random() * 20 - 10),
          y: planeY + (Math.random() * 20 - 10),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size: Math.random() * 24 + 14,
          color: '#475569',
          alpha: 0.8,
          life: 0,
          maxLife: Math.random() * 60 + 50,
          type: 'smoke',
        });
      }

      stateRef.current.particles.push(...newParticles);
    } else if (status !== 'crashed') {
      hasTriggeredExplosion.current = false;
    }
  }, [status]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    // Initialize Stars & Clouds
    if (stateRef.current.stars.length === 0) {
      for (let i = 0; i < 65; i++) {
        stateRef.current.stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.6 + 0.2,
        });
      }
    }

    if (stateRef.current.clouds.length === 0) {
      for (let i = 0; i < 6; i++) {
        stateRef.current.clouds.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.8),
          speed: Math.random() * 0.8 + 0.4,
          scale: Math.random() * 0.6 + 0.6,
          alpha: Math.random() * 0.25 + 0.15,
        });
      }
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          width = canvas.width = entry.contentRect.width;
          height = canvas.height = entry.contentRect.height;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      const s = stateRef.current;

      // Handle screen shake
      ctx.save();
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
        s.screenShake *= 0.9;
        if (s.screenShake < 0.2) s.screenShake = 0;
      }

      // Background Sky Gradient
      // Higher multiplier gives deeper stratosphere/cosmic navy
      const altitudeProgress = Math.min((s.multiplier - 1) / 30, 1);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      
      if (altitudeProgress < 0.5) {
        skyGrad.addColorStop(0, '#0a1738');
        skyGrad.addColorStop(0.5, '#071026');
        skyGrad.addColorStop(1, '#040714');
      } else {
        skyGrad.addColorStop(0, '#100e34');
        skyGrad.addColorStop(0.5, '#0a0d24');
        skyGrad.addColorStop(1, '#03050d');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Grid / Altitude Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      const gridSpacing = 44;
      const speedMultiplier = s.status === 'flying' ? Math.min(s.multiplier, 15) : 1;
      const gridOffset = (Date.now() * 0.04 * speedMultiplier) % gridSpacing;

      for (let y = gridOffset; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Stars
      ctx.fillStyle = '#ffffff';
      s.stars.forEach((star) => {
        star.y += star.speed * (s.status === 'flying' ? speedMultiplier * 0.8 : 0.4);
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        ctx.globalAlpha = star.alpha * (0.6 + 0.4 * Math.sin(Date.now() * 0.003 + star.x));
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      // Clouds
      s.clouds.forEach((cloud) => {
        cloud.y += cloud.speed * (s.status === 'flying' ? speedMultiplier * 0.6 : 0.3);
        cloud.x -= cloud.speed * 0.3;
        if (cloud.y > height + 80) {
          cloud.y = -80;
          cloud.x = Math.random() * width;
        }
        if (cloud.x < -120) cloud.x = width + 60;

        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.scale, cloud.scale);
        ctx.fillStyle = `rgba(148, 163, 184, ${cloud.alpha})`;
        
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.arc(28, -12, 38, 0, Math.PI * 2);
        ctx.arc(65, 0, 30, 0, Math.PI * 2);
        ctx.arc(42, 14, 25, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Target Coordinates for Airplane
      const originX = width * 0.12;
      const originY = height * 0.82;
      const targetMaxX = width * 0.74;
      const targetMaxY = height * 0.22;

      let targetX = originX;
      let targetY = originY;

      if (s.status === 'idle') {
        // Floating gentle hover
        targetX = originX;
        targetY = originY + Math.sin(Date.now() * 0.004) * 6;
        s.planeAngle = -10 + Math.sin(Date.now() * 0.003) * 3;
        s.flightPoints = [];
      } else if (s.status === 'flying') {
        // Progress based on multiplier: 1.00x is origin, 10x is 70% of distance, 50x is near top-right
        const progress = Math.min((Math.log10(s.multiplier) / Math.log10(50)), 1);
        targetX = originX + (targetMaxX - originX) * Math.pow(progress, 0.75);
        targetY = originY - (originY - targetMaxY) * Math.pow(progress, 0.78) + Math.sin(Date.now() * 0.01) * 3;
        
        // Pitch angle
        const targetPitch = -24 - Math.min(progress * 16, 12);
        s.planeAngle += (targetPitch - s.planeAngle) * 0.1;

        // Add flight curve point
        s.flightPoints.push({ x: targetX, y: targetY });
        if (s.flightPoints.length > 120) {
          s.flightPoints.shift();
        }

        // Emit contrail particles
        if (Math.random() > 0.1) {
          s.particles.push({
            x: targetX - 25 * Math.cos((s.planeAngle * Math.PI) / 180),
            y: targetY - 25 * Math.sin((s.planeAngle * Math.PI) / 180),
            vx: -Math.cos((s.planeAngle * Math.PI) / 180) * (Math.random() * 3 + 2) + (Math.random() - 0.5),
            vy: -Math.sin((s.planeAngle * Math.PI) / 180) * (Math.random() * 3 + 2) + (Math.random() - 0.5),
            size: Math.random() * 4 + 2,
            color: Math.random() > 0.4 ? '#38bdf8' : '#f59e0b',
            alpha: 0.8,
            life: 0,
            maxLife: 28,
            type: 'trail',
          });
        }
      } else if (s.status === 'claimed') {
        // Safe escape: Jet accelerates up and away safely!
        s.claimedZoomX += 14;
        s.claimedZoomY -= 9;
        targetX = s.planeX + s.claimedZoomX;
        targetY = s.planeY + s.claimedZoomY;
        s.planeAngle = -38;
      }

      // Smooth plane movement
      if (s.status !== 'crashed') {
        s.planeX += (targetX - s.planeX) * 0.25;
        s.planeY += (targetY - s.planeY) * 0.25;
      }

      // Draw Flight Path Trajectory Curve (if flying or claimed)
      if ((s.status === 'flying' || s.status === 'claimed' || s.status === 'crashed') && s.flightPoints.length > 2) {
        ctx.save();
        // Glowing curve
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        for (let i = 0; i < s.flightPoints.length; i++) {
          ctx.lineTo(s.flightPoints[i].x, s.flightPoints[i].y);
        }
        
        ctx.strokeStyle = s.status === 'crashed' ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = s.status === 'crashed' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Translucent gradient area under trajectory
        ctx.lineTo(s.flightPoints[s.flightPoints.length - 1].x, originY);
        ctx.lineTo(originX, originY);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, targetMaxY, 0, originY);
        areaGrad.addColorStop(0, s.status === 'crashed' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.22)');
        areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.fillStyle = areaGrad;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }

      // Draw Particles (Contrail, Fire, Smoke, Sparks)
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.type === 'smoke') {
          p.size += 0.4;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.alpha * 0.45, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'fire') {
          p.size = Math.max(p.size * 0.97, 0.5);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        } else if (p.type === 'trail') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(p.alpha * 0.6, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw Airplane if not crashed
      if (s.status !== 'crashed') {
        drawAirplane(ctx, s.planeX, s.planeY, s.planeAngle, s.status, s.multiplier);
      } else {
        // When crashed, draw expanding fiery shockwave ring
        const shockwaveLife = 1 - (s.screenShake / 18);
        if (shockwaveLife < 1) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(s.planeX, s.planeY, shockwaveLife * 90 + 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 100, 50, ${1 - shockwaveLife})`;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden">
      <canvas
        id="skyfly-canvas"
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

/**
 * Render a sleek, detailed, high-resolution supersonic airplane
 */
function drawAirplane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleDeg: number,
  status: 'idle' | 'flying' | 'crashed' | 'claimed',
  multiplier: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const scale = 1.15;
  ctx.scale(scale, scale);

  // Afterburner Engine Thruster Fire
  if (status === 'flying' || status === 'claimed') {
    const pulse = Math.sin(Date.now() * 0.04) * 4;
    const flameLength = 26 + Math.min(multiplier * 1.5, 45) + pulse;

    // Outer Blue Plasma Flame
    ctx.beginPath();
    ctx.moveTo(-36, -3);
    ctx.quadraticCurveTo(-36 - flameLength, 0, -36, 3);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Inner Hot Core Flame
    ctx.beginPath();
    ctx.moveTo(-36, -2);
    ctx.quadraticCurveTo(-36 - flameLength * 0.65, 0, -36, 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#ffd200';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Airplane Body Drawing
  // Drop Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Main Delta Wings
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-24, -28); // Left wingtip
  ctx.lineTo(-20, -6);
  ctx.lineTo(-34, -4);
  ctx.lineTo(-34, 4);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-24, 28); // Right wingtip
  ctx.closePath();
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  // Wing stripes / modern aviation accent
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.lineTo(-14, -20);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-15, -9);
  ctx.closePath();
  ctx.fillStyle = '#0284c7';
  ctx.fill();

  // Fuselage (Sleek aerodynamic jet nose)
  ctx.beginPath();
  ctx.moveTo(42, 0); // Sharp nose
  ctx.bezierCurveTo(24, -7, -15, -7, -35, -4); // Top curve
  ctx.lineTo(-35, 4);
  ctx.bezierCurveTo(-15, 7, 24, 7, 42, 0); // Bottom curve
  ctx.closePath();

  // Metallic fuselage gradient
  const bodyGrad = ctx.createLinearGradient(0, -7, 0, 7);
  bodyGrad.addColorStop(0, '#f8fafc');
  bodyGrad.addColorStop(0.5, '#e2e8f0');
  bodyGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Cockpit Canopy (tinted cyan glass reflection)
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.bezierCurveTo(15, -4, 2, -4, -4, 0);
  ctx.bezierCurveTo(2, 4, 15, 4, 22, 0);
  ctx.closePath();
  const glassGrad = ctx.createLinearGradient(0, -4, 0, 4);
  glassGrad.addColorStop(0, '#38bdf8');
  glassGrad.addColorStop(0.7, '#0284c7');
  glassGrad.addColorStop(1, '#075985');
  ctx.fillStyle = glassGrad;
  ctx.fill();

  // Canopy shine line
  ctx.beginPath();
  ctx.moveTo(18, -1.5);
  ctx.lineTo(2, -2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Vertical Tail Fin
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-32, -18);
  ctx.lineTo(-36, -18);
  ctx.lineTo(-30, 0);
  ctx.closePath();
  ctx.fillStyle = '#0369a1';
  ctx.fill();

  // Wingtip navigation lights
  // Red port light
  ctx.beginPath();
  ctx.arc(-24, -28, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 6;
  ctx.fill();

  // Green starboard light
  ctx.beginPath();
  ctx.arc(-24, 28, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 6;
  ctx.fill();

  ctx.restore();
}
