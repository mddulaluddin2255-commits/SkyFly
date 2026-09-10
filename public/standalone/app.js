/**
 * SkyFly Standalone Arcade Multiplier Game Engine
 * Fully client-side, zero backend required. Ready for Netlify or Capacitor wrapper.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB6ItOxR1Gz_d36bpMUvAenX9YHnnnsfQQ",
  authDomain: "sky-fly-de6b5.firebaseapp.com",
  projectId: "sky-fly-de6b5",
  storageBucket: "sky-fly-de6b5.firebasestorage.app",
  messagingSenderId: "567699378875",
  appId: "1:567699378875:web:3da5744d0c095da3984f9e"
};

const ADMOB_CONFIG = {
  appId: "ca-app-pub-6326541829707953~3162110645",
  rewardedAdUnitId: "ca-app-pub-6326541829707953/5714272318"
};

class SkyFlyGame {
  constructor() {
    this.canvas = document.getElementById('flightCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.status = 'idle'; // idle, flying, crashed, claimed
    this.multiplier = 1.00;
    this.crashMultiplier = 1.00;
    this.currentScore = 0;
    this.highScore = parseInt(localStorage.getItem('skyfly_high_score') || '0', 10);
    this.flightStartTime = 0;
    this.flightInterval = null;
    this.animFrame = null;
    this.particles = [];
    this.flightPath = [];

    this.initCanvas();
    this.bindEvents();
    this.renderLoop();
    this.updateHUD();
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  bindEvents() {
    const btnStart = document.getElementById('btnStart');
    const btnClaim = document.getElementById('btnClaim');
    const btnRestart = document.getElementById('btnRestart');

    if (btnStart) btnStart.addEventListener('click', () => this.startFlight());
    if (btnClaim) btnClaim.addEventListener('click', () => this.claimScore());
    if (btnRestart) btnRestart.addEventListener('click', () => this.startFlight());
  }

  startFlight() {
    this.status = 'flying';
    this.flightStartTime = Date.now();
    this.flightPath = [];
    this.particles = [];
    
    // Hidden crash multiplier between 1.00 and 50.00
    const rand = Math.random();
    if (rand < 0.15) {
      this.crashMultiplier = 1.01 + Math.random() * 0.4;
    } else if (rand < 0.6) {
      this.crashMultiplier = 1.4 + Math.random() * 3.6;
    } else if (rand < 0.88) {
      this.crashMultiplier = 5.0 + Math.random() * 15.0;
    } else {
      this.crashMultiplier = 20.0 + Math.random() * 30.0;
    }
    this.crashMultiplier = Math.min(Math.max(parseFloat(this.crashMultiplier.toFixed(2)), 1.01), 50.00);

    document.getElementById('homeUI').style.display = 'none';
    document.getElementById('gameUI').style.display = 'flex';
    document.getElementById('crashedUI').style.display = 'none';

    clearInterval(this.flightInterval);
    this.flightInterval = setInterval(() => {
      const elapsed = (Date.now() - this.flightStartTime) / 1000;
      this.multiplier = parseFloat((1.00 + Math.pow(elapsed * 0.4, 1.45)).toFixed(2));

      if (this.multiplier >= this.crashMultiplier) {
        this.crash();
      } else {
        this.updateHUD();
      }
    }, 30);
  }

  claimScore() {
    if (this.status !== 'flying') return;
    clearInterval(this.flightInterval);
    this.status = 'claimed';
    const points = Math.floor(this.multiplier * 10);
    this.currentScore += points;
    if (points > this.highScore) {
      this.highScore = points;
      localStorage.setItem('skyfly_high_score', this.highScore.toString());
    }
    this.showResultModal(true, points);
  }

  crash() {
    clearInterval(this.flightInterval);
    this.status = 'crashed';
    this.multiplier = this.crashMultiplier;
    this.updateHUD();

    // Spawn explosion particles
    const originX = this.width * 0.7;
    const originY = this.height * 0.35;
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40,
        color: ['#ff4444', '#ffbb00', '#ffffff'][Math.floor(Math.random() * 3)]
      });
    }

    setTimeout(() => {
      this.showResultModal(false, 0);
    }, 1000);
  }

  showResultModal(claimed, points) {
    document.getElementById('crashedUI').style.display = 'flex';
    document.getElementById('modalTitle').innerText = claimed ? 'SCORE SECURED!' : 'AIRPLANE CRASHED!';
    document.getElementById('modalScore').innerText = claimed ? `+${points} PTS` : '+0 PTS';
    document.getElementById('modalMultiplier').innerText = `At ${this.multiplier.toFixed(2)}x`;
  }

  updateHUD() {
    const el = document.getElementById('multiplier');
    if (el) el.innerText = `${this.multiplier.toFixed(2)}x`;
    const scorePreview = document.getElementById('scorePreview');
    if (scorePreview) scorePreview.innerText = `CLAIM +${Math.floor(this.multiplier * 10)} PTS`;
    const curScoreEl = document.getElementById('curScore');
    if (curScoreEl) curScoreEl.innerText = this.currentScore;
    const hiScoreEl = document.getElementById('hiScore');
    if (hiScoreEl) hiScoreEl.innerText = this.highScore;
  }

  renderLoop() {
    const ctx = this.ctx;
    ctx.fillStyle = '#071026';
    ctx.fillRect(0, 0, this.width, this.height);

    // Starfield
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + (Date.now() * 0.05)) % this.width;
      const sy = (i * 53) % this.height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Airplane trajectory
    if (this.status === 'flying' || this.status === 'crashed') {
      const progress = Math.min((this.multiplier - 1) / 30, 1);
      const px = this.width * 0.15 + (this.width * 0.65) * progress;
      const py = this.height * 0.8 - (this.height * 0.55) * progress;

      ctx.strokeStyle = this.status === 'crashed' ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.width * 0.15, this.height * 0.8);
      ctx.lineTo(px, py);
      ctx.stroke();

      if (this.status !== 'crashed') {
        // Draw airplane
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-0.35);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(-15, -15);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      if (p.life > p.maxLife) this.particles.splice(i, 1);
    }

    requestAnimationFrame(() => this.renderLoop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SkyFlyGame();
});
