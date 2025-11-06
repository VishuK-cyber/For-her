const audio = document.getElementById("audio");
const visualizer = document.getElementById("visualizer");
const ctx = visualizer.getContext("2d");

visualizer.width = window.innerWidth;
visualizer.height = window.innerHeight;

let audioCtx, analyser, source;

function startAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  audio.volume = 0;
audio.play();

let fadeIn = setInterval(() => {
  if (audio.volume < 0.7) {
    audio.volume += 0.02;
  } else {
    clearInterval(fadeIn);
  }
}, 120);


  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, visualizer.width, visualizer.height);

  const gradient = ctx.createLinearGradient(0, 0, visualizer.width, visualizer.height);
  gradient.addColorStop(0, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,200,255,0.6)");
  ctx.fillStyle = gradient;

  let barWidth = (visualizer.width / bufferLength) * 1.5;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    let barHeight = dataArray[i] / 2;
    ctx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

document.getElementById("start-screen").addEventListener("click", () => {
  document.getElementById("start-screen").style.opacity = "0";
  setTimeout(() => (document.getElementById("start-screen").style.display = "none"), 300);
  startAudio();
});
/* --- subtle particle haze & force fades after audio start --- */
(function(){
  const container = document.getElementById('container');
  const audio = document.getElementById('audio');

  // create canvas for particles
  const canvas = document.createElement('canvas');
  canvas.id = 'particleHaze';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '1';   // behind the content (container z-index is 5)
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  // create gentle particles
  const particles = [];
  for(let i=0;i<28;i++){
    particles.push({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: 10 + Math.random()*40,
      vx: (Math.random()-0.5)*0.2,
      vy: (Math.random()-0.5)*0.2,
      alpha: 0.02 + Math.random()*0.06
    });
  }

  function drawParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    for(let p of particles){
      ctx.beginPath();
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grd.addColorStop(0, `rgba(255,205,140, ${p.alpha})`);
      grd.addColorStop(1, `rgba(255,205,140, 0)`);
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      // move
      p.x += p.vx;
      p.y += p.vy;
      // wrap around softly
      if(p.x < -100) p.x = innerWidth + 100;
      if(p.x > innerWidth + 100) p.x = -100;
      if(p.y < -100) p.y = innerHeight + 100;
      if(p.y > innerHeight + 100) p.y = -100;
    }
  }

  // animate only after audio begins (keeps CPU low)
  let hazeRunning = false;
  function startHaze(){
    if(hazeRunning) return;
    hazeRunning = true;
    (function loop(){
      drawParticles();
      requestAnimationFrame(loop);
    })();
  }

  // ensure the visual fade shows after user tap
  const startScreen = document.getElementById('start-screen');
  startScreen && startScreen.addEventListener('click', () => {
    // small delay so fades happen after tap
    setTimeout(()=> {
      container.style.opacity = '1';
      startHaze();
    }, 450);
  });

  // also start haze if audio programmatically starts
  audio && audio.addEventListener('play', startHaze);
})();




