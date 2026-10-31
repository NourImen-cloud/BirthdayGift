/* ─────────────────────────────────────────────────────────
   WishBlow — script.js
   Scene engine + all interactions
───────────────────────────────────────────────────────── */

// ══════════════════════════════════════════════════════
// SCENE MANAGER
// ══════════════════════════════════════════════════════
const scenes = ['lock','loading','puzzle','greeting','letter','heart','wish','fireworks'];
let currentScene = 'lock';

function goTo(id) {
  const from = document.getElementById(`scene-${currentScene}`);
  const to   = document.getElementById(`scene-${id}`);
  if (!to || currentScene === id) return;

  from.style.opacity = '0';
  from.style.pointerEvents = 'none';
  setTimeout(() => from.classList.remove('active'), 500);

  to.classList.add('active');
  setTimeout(() => { to.style.opacity = '1'; to.style.pointerEvents = 'all'; }, 30);

  currentScene = id;
  if (onEnter[id]) onEnter[id]();
}

// ══════════════════════════════════════════════════════
// PARTICLES / FLOATERS HELPERS
// ══════════════════════════════════════════════════════
function spawnParticles(containerId, count = 20) {
  const el = document.getElementById(containerId);
  if (!el) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;
      animation-duration:${5+Math.random()*8}s;
      animation-delay:${Math.random()*6}s;
      opacity:${.2+Math.random()*.5};
      background:hsl(${195+Math.random()*25},85%,75%);
    `;
    el.appendChild(p);
  }
}

// ══════════════════════════════════════════════════════
// HAND-DRAWN DOODLES — cats, lilies, sparkles, hearts
// ══════════════════════════════════════════════════════
const DOODLES = {
  cat: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 46 Q9 30 14 19 Q8 14 11 6 Q18 10 21 17 Q30 13 39 17 Q42 10 49 6 Q52 14 46 19 Q51 30 46 46 Q30 53 14 46Z"/>
    <circle cx="22" cy="29" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="38" cy="29" r="1.6" fill="currentColor" stroke="none"/>
    <path d="M26 35 Q30 38 34 35"/>
    <path d="M14 33 Q4 31 3 27" stroke-width="1.4"/>
    <path d="M46 33 Q56 31 57 27" stroke-width="1.4"/>
  </svg>`,
  lily: `<svg viewBox="0 0 40 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 63 Q17 42 20 27"/>
    <path d="M20 27 Q9 22 7 11 Q16 13 20 22 Q24 13 33 11 Q31 22 20 27Z"/>
    <path d="M20 22 Q14 12 16 3 Q20 9 20 18 Q20 9 24 3 Q26 12 20 22Z"/>
    <path d="M9 40 Q3 42 1 47" stroke-width="1.4"/>
    <path d="M31 45 Q37 47 39 52" stroke-width="1.4"/>
  </svg>`,
  sparkle: `<svg viewBox="0 0 30 30" fill="currentColor" stroke="none">
    <path d="M15 1 Q17.5 12 29 15 Q17.5 18 15 29 Q12.5 18 1 15 Q12.5 12 15 1Z"/>
  </svg>`,
  heart: `<svg viewBox="0 0 30 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 25 C1 15 1 7 8 3.5 C12 1.5 15 4.5 15 8.5 C15 4.5 18 1.5 22 3.5 C29 7 29 15 15 25Z"/>
  </svg>`
};

function spawnDoodles(containerId, types = ['cat','lily','sparkle'], count = 8) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const d = document.createElement('div');
    d.className = 'doodle doodle-' + type;
    d.innerHTML = DOODLES[type];
    const size = 26 + Math.random() * 30;
    const rot = (Math.random() - 0.5) * 40;
    d.style.cssText = `
      position:absolute;
      left:${Math.random()*92}%; top:${Math.random()*88}%;
      width:${size}px; height:${size}px;
      transform:rotate(${rot}deg);
      opacity:${0.18 + Math.random()*0.22};
      animation:doodleDrift ${6+Math.random()*6}s ease-in-out infinite;
      animation-delay:${Math.random()*4}s;
    `;
    el.appendChild(d);
  }
}

function spawnFloaters(containerId, emojis, count = 18) {
  const el = document.getElementById(containerId);
  if (!el) return;
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'floater';
    f.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    f.style.cssText = `
      left:${Math.random()*100}%;
      animation-duration:${6+Math.random()*10}s;
      animation-delay:${Math.random()*8}s;
      font-size:${1.2+Math.random()*1.4}rem;
    `;
    el.appendChild(f);
  }
}

// ══════════════════════════════════════════════════════
// MUSIC — local <audio> element (reliable, no iframe/origin issues)
// ══════════════════════════════════════════════════════
// NOTE: the old version used a hidden YouTube iframe. That silently fails
// on file:// pages and in many browsers because of autoplay + cross-origin
// restrictions, which is why the song never actually played. A plain
// <audio> tag we control directly is far more dependable — just drop your
// own mp3 at assets/music/song.mp3 (see config.js -> musicFile).
const bgAudio = document.getElementById('bg-audio');
let musicPlaying = false;
let musicTriedAutoplay = false;

if (bgAudio && CONFIG.musicFile) {
  bgAudio.src = CONFIG.musicFile;
  bgAudio.volume = 0.55;
}

function startMusic() {
  if (!bgAudio) return;
  const p = bgAudio.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      musicPlaying = true;
      updateMusicBtn();
    }).catch(() => {
      // Autoplay blocked — leave the button visible so the person can tap it.
      musicPlaying = false;
      updateMusicBtn();
    });
  } else {
    musicPlaying = true;
    updateMusicBtn();
  }
}

function stopMusic() {
  if (bgAudio) bgAudio.pause();
  musicPlaying = false;
  updateMusicBtn();
}

function toggleMusic() {
  if (musicPlaying) stopMusic(); else startMusic();
}

function updateMusicBtn() {
  const btn = document.getElementById('music-btn');
  const hint = document.getElementById('music-hint');
  if (btn) {
    btn.textContent = musicPlaying ? '🎵' : '🔇';
    btn.classList.toggle('muted', !musicPlaying);
  }
  if (hint) hint.classList.toggle('show', !musicPlaying);
}

// The very first tap anywhere (e.g. a keypad digit) is a genuine user
// gesture, which is exactly what browsers require before allowing audio to
// play. We use it to unlock/start the music immediately, instead of only
// trying later inside a chain of setTimeouts (which is what broke it before).
function unlockMusicOnce() {
  if (musicTriedAutoplay || !bgAudio) return;
  musicTriedAutoplay = true;
  startMusic();
}

// ══════════════════════════════════════════════════════
// SCENE 1 — LOCK SCREEN
// ══════════════════════════════════════════════════════
let pinBuffer = '';

function setupLock() {
  const polImg = document.getElementById('polaroid-photo');
  if (polImg) {
    const lockSrc = CONFIG.lockPhoto || (CONFIG.photos && CONFIG.photos[0] && CONFIG.photos[0].src) || 'assets/photos/photo1.jpg';
    polImg.src = lockSrc;
    polImg.style.display = 'block';
    if (polImg.parentElement) polImg.parentElement.classList.remove('no-photo');
    polImg.onerror = () => {
      polImg.style.display = 'none';
      if (polImg.parentElement) polImg.parentElement.classList.add('no-photo');
    };
  }
  spawnParticles('lock-particles', 25);
  spawnDoodles('lock-doodles', ['cat','lily','sparkle'], 7);
  document.querySelectorAll('.key[data-val]').forEach(k => {
    k.addEventListener('click', () => handleKey(k.dataset.val));
  });
  document.getElementById('key-del').addEventListener('click', handleDel);
}

function handleKey(val) {
  unlockMusicOnce();
  if (pinBuffer.length >= 4) return;
  pinBuffer += val;
  updateDots();
  if (pinBuffer.length === 4) setTimeout(checkCode, 300);
}

function handleDel() {
  pinBuffer = pinBuffer.slice(0,-1);
  updateDots();
  clearError();
}

function updateDots() {
  for (let i=0;i<4;i++){
    document.getElementById(`dot-${i}`).classList.toggle('filled', i < pinBuffer.length);
  }
}

function checkCode() {
  if (pinBuffer === CONFIG.unlockCode) {
    // Correct!
    document.getElementById('lock-icon').textContent = '🔓';
    document.querySelectorAll('.dot').forEach(d => {
      d.style.background = '#4ade80';
      d.style.boxShadow  = '0 0 12px #4ade80';
    });
    setTimeout(() => goTo('loading'), 800);
  } else {
    showError();
    document.getElementById('lock-polaroid').classList.add('shake');
    setTimeout(() => {
      document.getElementById('lock-polaroid').classList.remove('shake');
    }, 600);
    pinBuffer = '';
    updateDots();
  }
}

function showError() {
  document.getElementById('lock-error').classList.add('show');
  setTimeout(clearError, 2000);
}
function clearError() {
  document.getElementById('lock-error').classList.remove('show');
}

// ══════════════════════════════════════════════════════
// SCENE 2 — LOADING
// ══════════════════════════════════════════════════════
function runLoading() {
  spawnFloaters('loading-floaters',['🩵','✨','🎀','🎁','💫','🎊','🌸'],20);
  startMusic();
  let pct = 0;
  const bar = document.getElementById('loading-bar');
  const pctEl = document.getElementById('loading-pct');
  const iv = setInterval(() => {
    pct += Math.random()*3 + 1;
    if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(()=>goTo('puzzle'), 500); }
    bar.style.width = pct + '%';
    pctEl.textContent = Math.floor(pct) + '%';
  }, 80);
}

// ══════════════════════════════════════════════════════
// SCENE 3 — GREETING
// ══════════════════════════════════════════════════════
function runGreeting() {
  if (CONFIG.birthdayDate) {
    const gd = document.getElementById('greeting-date');
    if (gd) gd.textContent = CONFIG.birthdayDate;
  }
  if (CONFIG.greetingPhoto) {
    const gp = document.getElementById('greeting-photo');
    if (gp) gp.src = CONFIG.greetingPhoto;
  }
  spawnFloaters('greeting-floaters',['🩵','✨','🌸','💫','🎀'],14);
  spawnDoodles('greeting-doodles', ['lily','sparkle','heart'], 6);
  const els = ['.greeting-date','.greeting-title','.greeting-quote','#scene-greeting .btn-primary'];
  els.forEach((sel,i)=>{
    const el = document.querySelector(sel);
    if(!el)return;
    setTimeout(()=>{
      el.style.transition='opacity .8s ease, transform .8s ease';
      el.style.opacity='1';el.style.transform='translateY(0)';
    }, 300 + i*250);
  });
  document.getElementById('btn-greeting-next').addEventListener('click',()=>goTo('letter'), {once:true});
}

// ══════════════════════════════════════════════════════
// SCENE 4 — LETTER (typewriter)
// ══════════════════════════════════════════════════════
function runLetter() {
  spawnDoodles('letter-doodles', ['lily','cat'], 5);
  const body   = document.getElementById('letter-body');
  const card   = document.getElementById('letter-card');
  const text   = CONFIG.letter;
  let i = 0, cursor;

  // Slide card in
  card.style.opacity = '0'; card.style.transform = 'translateY(40px)';
  setTimeout(()=>{
    card.style.transition = 'opacity .8s, transform .8s';
    card.style.opacity = '1'; card.style.transform = 'translateY(0)';
  }, 100);

  // Typewriter
  cursor = document.createElement('span');
  cursor.className = 'letter-cursor';
  body.appendChild(cursor);

  function type() {
    if (i >= text.length) { cursor.remove(); return; }
    const chunk = text[i++];
    const node = document.createTextNode(chunk);
    body.insertBefore(node, cursor);
    body.parentElement.scrollTop = body.parentElement.scrollHeight;
    setTimeout(type, chunk==='\n' ? 180 : 18);
  }
  setTimeout(type, 600);

  // After the letter, show the photo-collage (`heart`) before the wish scene
  document.getElementById('btn-letter-next').addEventListener('click',()=>goTo('heart'),{once:true});
}

// ══════════════════════════════════════════════════════
// SCENE 2.5 — PUZZLE REVEAL
// ══════════════════════════════════════════════════════
function runPuzzle() {
  spawnDoodles('puzzle-doodles', ['sparkle','lily'], 6);
  const board = document.getElementById('puzzle-board');
  const caption = document.getElementById('puzzle-caption');
  // Ensure we reference the live button node (replace old node first to clear listeners)
  let nextBtn = document.getElementById('btn-puzzle-next');
  if (nextBtn) {
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    nextBtn = document.getElementById('btn-puzzle-next');
  }
  board.innerHTML = '';
  caption.textContent = CONFIG.puzzleCaption || '';
  caption.classList.remove('show');
  if (nextBtn) nextBtn.style.display = 'none';

  const size = 3; // 3x3 pieces
  const img = CONFIG.puzzleImage || (CONFIG.photos[0] && CONFIG.photos[0].src);
  const pieces = [];

  const imgObj = new Image();
  imgObj.src = img;
  imgObj.onload = () => {
    if (imgObj.naturalWidth && imgObj.naturalHeight) {
      const ar = imgObj.naturalWidth / imgObj.naturalHeight;
      if (ar > 1.25) board.style.aspectRatio = Math.min(ar, 1.5).toString();
      else if (ar < 0.8) board.style.aspectRatio = Math.max(ar, 0.75).toString();
      else board.style.aspectRatio = '1 / 1';
    }
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.style.backgroundImage = `url(${img})`;
      piece.style.backgroundSize = `${size*100}% ${size*100}%`;
      piece.style.backgroundPosition = `${c*100/(size-1)}% ${r*100/(size-1)}%`;
      const dx  = (Math.random()-0.5) * 500;
      const dy  = (Math.random()-0.5) * 500;
      const rot = (Math.random()-0.5) * 220;
      piece.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg)`;
      piece.style.transitionDelay = `${(r*size+c) * 90}ms`;
      board.appendChild(piece);
      pieces.push(piece);
    }
  }

  // let the browser paint the scattered state, then animate pieces home
  requestAnimationFrame(() => requestAnimationFrame(() => {
    pieces.forEach(p => { p.style.transform = 'translate(0,0) rotate(0deg)'; });
  }));

  const totalDelay = 700 + size*size*90 + 500;
  setTimeout(() => {
    caption.classList.add('show');
    nextBtn.style.display = 'inline-block';
    requestAnimationFrame(() => nextBtn.classList.add('show'));
  }, totalDelay);

  // Wire the current (cloned) button node to advance scenes
  if (nextBtn) nextBtn.addEventListener('click', () => goTo('greeting'), {once:true});
}

// ══════════════════════════════════════════════════════
// SCENE 5 — HEART OF US (scrapbook photo collage)
// ══════════════════════════════════════════════════════
const HEART_EMOJIS = ['🩵','✨','🌸','🎀','💫'];

function runHeart() {
  spawnDoodles('heart-doodles', ['lily','cat','sparkle'], 7);
  const collage = document.getElementById('heart-collage');
  collage.innerHTML = '';
  const photos = CONFIG.photos.slice(0, 5);

  photos.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = `heart-photo hp-${i+1}`;
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
      <div class="heart-photo-fallback">${HEART_EMOJIS[i % HEART_EMOJIS.length]}</div>
      <span class="heart-photo-tape"></span>
    `;
    card.style.opacity = '0';
    card.style.transform += ' scale(.6)';
    collage.appendChild(card);
    setTimeout(() => {
      card.style.transition = 'opacity .6s ease, transform .6s ease';
      card.style.opacity = '1';
      card.style.transform = card.style.transform.replace(' scale(.6)', '');
    }, 200 + i*160);
  });

  const btn = document.getElementById('btn-heart-next');
  btn.replaceWith(btn.cloneNode(true));
  document.getElementById('btn-heart-next').addEventListener('click', () => goTo('wish'), {once:true});
}

// ══════════════════════════════════════════════════════
// SCENE 6 — MAKE A WISH (candles)
// ══════════════════════════════════════════════════════
let candlesOut = 0, totalCandles = CONFIG.age;
let micStream = null;

function buildCandles() {
  const wrap = document.getElementById('cake-candles');
  wrap.innerHTML = '';
  candlesOut = 0;
  totalCandles = CONFIG.age || 22;
  const cakeNum = document.querySelector('.cake-number');
  if (cakeNum) cakeNum.textContent = totalCandles;
  for (let i=0;i<totalCandles;i++){
    const c = document.createElement('div');
    c.className = 'candle';
    c.id = `candle-${i}`;
    c.innerHTML = `<div class="candle-flame"></div><div class="candle-stick"></div>`;
    c.addEventListener('click',()=>blowCandle(i));
    wrap.appendChild(c);
  }
}

function blowCandle(i) {
  const c = document.getElementById(`candle-${i}`);
  if (!c || c.classList.contains('out')) return;
  c.classList.add('out');
  candlesOut++;
  if (candlesOut >= totalCandles) setTimeout(allCandlesOut, 800);
}

function blowAll() {
  for(let i=0;i<totalCandles;i++) blowCandle(i);
}

function allCandlesOut() {
  if (micStream) { micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
  goTo('fireworks');
}

function tryMic() {
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia({audio:true,video:false})
    .then(stream=>{
      micStream = stream;
      const ctx2 = new (window.AudioContext||window.webkitAudioContext)();
      const src  = ctx2.createMediaStreamSource(stream);
      const analyser = ctx2.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      let lastBlow = 0;
      function check() {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a,b)=>a+b,0)/buf.length;
        if (avg > 38 && Date.now()-lastBlow > 300) {
          lastBlow = Date.now();
          // find first candle still lit
          for(let i=0;i<totalCandles;i++){
            const c=document.getElementById(`candle-${i}`);
            if(c&&!c.classList.contains('out')){ blowCandle(i); break; }
          }
        }
        if (candlesOut < totalCandles) requestAnimationFrame(check);
      }
      requestAnimationFrame(check);
    })
    .catch(()=>{}); // silently ignore if no mic
}

function runWish() {
  buildCandles();
  spawnStars();
  spawnDoodles('wish-doodles', ['sparkle','heart'], 8);
  tryMic();
  document.getElementById('btn-blow-all').addEventListener('click', blowAll, {once:true});
}

function spawnStars() {
  const el = document.getElementById('wish-stars');
  el.innerHTML='';
  for(let i=0;i<60;i++){
    const s=document.createElement('div');s.className='star';
    const sz=1+Math.random()*2;
    s.style.cssText=`
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      width:${sz}px;height:${sz}px;
      animation-duration:${1.5+Math.random()*3}s;
      animation-delay:${Math.random()*3}s;
    `;
    el.appendChild(s);
  }
}

// ══════════════════════════════════════════════════════
// SCENE 7 — FIREWORKS
// ══════════════════════════════════════════════════════
let fwRAF = null;

function runFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx    = canvas.getContext('2d');
  const W = ()=>canvas.width  = window.innerWidth;
  const H = ()=>canvas.height = window.innerHeight;
  W(); H();
  window.addEventListener('resize',()=>{W();H();});

  const particles = [];
  const COLORS = [
    '#89CFF0','#7DD3FC','#38BDF8','#0284C7',
    '#fff','#BAE6FD','#60A5FA','#FBBF24'
  ];

  class Particle {
    constructor(x,y,color){
      this.x=x; this.y=y; this.color=color;
      const angle=Math.random()*Math.PI*2;
      const speed=2+Math.random()*6;
      this.vx=Math.cos(angle)*speed;
      this.vy=Math.sin(angle)*speed - Math.random()*2;
      this.alpha=1; this.radius=2+Math.random()*3;
      this.gravity=.06; this.drag=.97;
    }
    update(){
      this.vy+=this.gravity; this.vx*=this.drag; this.vy*=this.drag;
      this.x+=this.vx; this.y+=this.vy;
      this.alpha-=.012;
    }
    draw(c){ c.save(); c.globalAlpha=Math.max(0,this.alpha);
      c.fillStyle=this.color; c.beginPath();
      c.arc(this.x,this.y,this.radius,0,Math.PI*2);
      c.fill(); c.restore(); }
  }

  function burst(x,y){
    const color=COLORS[Math.floor(Math.random()*COLORS.length)];
    for(let i=0;i<80;i++) particles.push(new Particle(x,y,color));
  }

  let lastBurst=0;
  function loop(ts){
    fwRAF=requestAnimationFrame(loop);
    ctx.fillStyle='rgba(3,11,20,.18)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(ts-lastBurst>600){
      lastBurst=ts;
      burst(Math.random()*canvas.width, Math.random()*canvas.height*.6+50);
    }
    for(let i=particles.length-1;i>=0;i--){
      particles[i].update(); particles[i].draw(ctx);
      if(particles[i].alpha<=0) particles.splice(i,1);
    }
  }
  if(fwRAF) cancelAnimationFrame(fwRAF);
  requestAnimationFrame(loop);

  // initial big burst
  setTimeout(()=>{
    for(let i=0;i<5;i++)
      setTimeout(()=>burst(canvas.width/2+(Math.random()-.5)*300, canvas.height*.3+(Math.random()-.5)*100),i*200);
  },400);

  // Reveal final text
  const fc = document.getElementById('final-content');
  setTimeout(()=>{
    fc.style.transition='opacity 1.2s ease, transform 1.2s ease';
    fc.style.opacity='1'; fc.style.transform='translateY(0)';
  }, 1000);

  document.getElementById('btn-replay').addEventListener('click', ()=>{
    if(fwRAF){ cancelAnimationFrame(fwRAF); fwRAF=null; }
    fc.style.opacity='0'; fc.style.transform='translateY(40px)';
    pinBuffer=''; updateDots();
    document.getElementById('lock-icon').textContent='🔒';
    document.querySelectorAll('.dot').forEach(d=>{d.style.background='';d.style.boxShadow='';});
    document.getElementById('letter-body').innerHTML='';
    goTo('lock');
  },{once:true});
}

// ══════════════════════════════════════════════════════
// ON-ENTER HOOKS
// ══════════════════════════════════════════════════════
const onEnter = {
  lock:      () => {},
  loading:   runLoading,
  puzzle:    runPuzzle,
  greeting:  runGreeting,
  letter:    runLetter,
  heart:     runHeart,
  wish:      runWish,
  fireworks: runFireworks
};

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupLock();
  document.getElementById('music-btn').addEventListener('click', toggleMusic);
});