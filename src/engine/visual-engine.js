/**
 * Unimed Privacy Pro - Visual Engine
 * Handles Canvas particles effect (pauses on tab inactive & prefers-reduced-motion).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UnimedVisualEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let animationFrameId = null;
  let particles = [];
  let isRunning = false;
  const PARTICLE_COUNT = 30;

  function init(settingsManager) {
    settingsManager.get(function (settings) {
      updateState(settings);
    });

    settingsManager.onChanged(function (updatedSettings) {
      updateState(updatedSettings);
    });

    // Pause particles when document is hidden to conserve GPU/CPU
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopParticles();
      } else {
        settingsManager.get(updateState);
      }
    });
  }

  function updateState(settings) {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDocHidden = typeof document !== 'undefined' && document.hidden;
    const shouldRun = settings.particleEffect && !prefersReducedMotion && !isDocHidden;

    if (shouldRun) {
      startParticles();
    } else {
      stopParticles();
    }
  }

  function startParticles() {
    if (isRunning) return;
    isRunning = true;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'unimed-particle-canvas';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999;
        opacity: 0.6;
        transition: opacity 0.4s ease;
      `;
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      createParticles();
    } else {
      canvas.style.display = 'block';
    }

    render();
  }

  function stopParticles() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (canvas) {
      canvas.style.display = 'none';
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const w = window.innerWidth || 800;
    const h = window.innerHeight || 600;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 153, 93, ' : 'rgba(0, 204, 126, ',
        alpha: Math.random() * 0.5 + 0.2,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6 - 0.1
      });
    }
  }

  function render() {
    if (!isRunning || !ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(render);
  }


  return {
    init
  };
});
