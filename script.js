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

  audio.play();

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

