// FULL script.js replacement — paste entire file

const startScreen = document.getElementById('start-screen');
const container = document.getElementById('container');
const audio = document.getElementById('audio');
const vizCanvas = document.getElementById('visualizer');

// helper to ensure container fades in AFTER tap
function showContainer() {
  container.style.opacity = '1';
}

// Audio play + gentle fade
async function startAudioWithFade() {
  try {
    audio.volume = 0.0;
    await audio.play();
    // gentle fade-in
    let vol = 0;
    const fade = setInterval(() => {
      vol += 0.025;
      audio.volume = Math.min(vol, 0.75);
      if (audio.volume >= 0.74) clearInterval(fade);
    }, 120);
  } catch (e) {
    console.log('Audio play blocked or failed:', e);
  }
}

// Visualizer setup (bars — wide, warm colour)
function startVisualizer() {
  if (!audio) return;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // HiDPI canvas sizing
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    vizCanvas.width = window.innerWidth * dpr;
    vizCanvas.height = window.innerHeight * dpr;
    vizCanvas.style.width = window.innerWidth + 'px';
    vizCanvas.style.height = window.innerHeight + 'px';
    const ctx = vizCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const ctx = vizCanvas.getContext('2d');

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // clear softly
    ctx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);

    // draw warm vertical bars centered bottom area
    const width = window.innerWidth;
    const height = window.innerHeight;
    const bars = 48;
    const barW = (width / bars) * 0.9;
    let x = (width - (bars * (barW + 2))) / 2;

    for (let i = 0; i < bars; i++) {
      const v = dataArray[i + 2] || 0;
      const h = (v / 255) * (height * 0.38);
      // gradient
      const g = ctx.createLinearGradient(x, height - h, x, height);
      g.addColorStop(0, 'rgba(255,200,140,0.18)');
      g.addColorStop(1, 'rgba(255,160,50,0.9)');
      ctx.fillStyle = g;
      const y = height - h - 80; // lift a bit from bottom
      const radius = 6;
      // rounded rect bar
      roundRect(ctx, x, y, barW, h, radius, true, false);
      x += barW + 2;
    }
  }

  // rounded rect draw helper
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (r === undefined) r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  draw();
}

// LIGHT particle haze behind content (low CPU)
function startParticleHaze() {
  const canvas = document.createElement('canvas');
  canvas.id = 'haze';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '5'; // below container (container is 30)
  canvas.style.pointerEvents = 'none';
  canvas.style.mixBlendMode = 'screen';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 24; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: 20 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: 0.02 + Math.random() * 0.05
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grd.addColorStop(0, `rgba(255,200,140, ${p.a})`);
      grd.addColorStop(1, `rgba(255,200,140, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -100) p.x = innerWidth + 100;
      if (p.x > innerWidth + 100) p.x = -100;
      if (p.y < -100) p.y = innerHeight + 100;
      if (p.y > innerHeight + 100) p.y = -100;
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// Click/tap handler — single reliable entry point
startScreen && startScreen.addEventListener('click', async () => {
  // hide start, show content
  startScreen.style.display = 'none';
  showContainer();

  // start audio, visual, haze
  await startAudioWithFade();
  startVisualizer();
  startParticleHaze();
});







