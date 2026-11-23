/* =========================================================
   BLOOMING BIRTHDAY WISHES — INTERACTIVE ENGINE
   1. Cute Illustrated Default Memory Cards (Zero broken images!)
   2. Web Audio API Music Box & Cute SFX
   3. Interactive Cupid Bow & Arrow Slingshot Physics
   4. Crimson Cinema Reveal Transition
   5. Procedural Growing Heart-Blossom Tree + Drifting Petals
   6. 3x3 Photo Grid + Lightbox + Live Photo Replacement
   7. Interactive Candle Blow + Gift Fireworks & Confetti
   8. Live Personalizer Drawer (Saved to localStorage)
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "blooming_birthday_config_v2_debby";

  /* ---------------------------------------------------------
     1. DEFAULT CUTE ILLUSTRATED SVG MEMORIES (9 CARDS)
     --------------------------------------------------------- */
  function escapeXml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function makeCuteMemorySvg({ bg1, bg2, emoji, title, doodleColor = "#ff9ebb", badge }) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bg1}"/>
            <stop offset="100%" stop-color="${bg2}"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#g)"/>
        <circle cx="72" cy="74" r="46" fill="${doodleColor}" opacity="0.22"/>
        <circle cx="338" cy="310" r="64" fill="${doodleColor}" opacity="0.20"/>
        <circle cx="322" cy="86" r="18" fill="#ffffff" opacity="0.55"/>
        <circle cx="88" cy="316" r="14" fill="#ffffff" opacity="0.55"/>
        <rect x="44" y="44" width="312" height="312" rx="34" fill="rgba(255,255,255,0.48)" stroke="rgba(255,255,255,0.85)" stroke-width="4"/>
        <text x="200" y="202" text-anchor="middle" font-size="112" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">${escapeXml(emoji)}</text>
        <rect x="96" y="252" width="208" height="36" rx="18" fill="#ffffff" opacity="0.9"/>
        <text x="200" y="276" text-anchor="middle" font-size="17" font-weight="700" fill="#5e2a36" font-family="Plus Jakarta Sans, Segoe UI, sans-serif">${escapeXml(title)}</text>
        <text x="200" y="324" text-anchor="middle" font-size="15" fill="#8b5561" font-family="Plus Jakarta Sans, Segoe UI, sans-serif">${escapeXml(badge)}</text>
      </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const DEFAULT_PHOTOS = [
    {
      src: "images/debby-pose-1.jpg",
      caption: "Senyum paling manis & bikin adem ✨🐦",
    },
    {
      src: makeCuteMemorySvg({ bg1: "#ffe0ec", bg2: "#fff2d6", doodleColor: "#ff7aa2", emoji: "🕊️✨", title: "Dirahmati Tuhan", badge: "selalu dalam lindungan-Nya" }),
      caption: "Doa terbaik: semoga setiap langkah Debby selalu dirahmati Tuhan 🕊️✨",
    },
    {
      src: "images/debby-pose-2.jpg",
      caption: "Pose gemes favorit yang nggak pernah gagal bikin senyum 💘",
    },
    {
      src: makeCuteMemorySvg({ bg1: "#dff8ec", bg2: "#fff0d9", doodleColor: "#74c69d", emoji: "🌷💛", title: "Sehat & Bijaksana", badge: "sehat jiwa dan raga" }),
      caption: "Semakin bijaksana dalam perjalanan hidup, selalu sehat jiwa dan raga 🌷💛",
    },
    {
      src: "images/debby-puppy.jpg",
      caption: "Senyum paling ceria & paling lucu sedunia 🐶💖",
    },
    {
      src: makeCuteMemorySvg({ bg1: "#ffe7d6", bg2: "#ffd6e6", doodleColor: "#ff9e80", emoji: "🍰🧋", title: "Janji Traktir!", badge: "doakan rezeki lancar ya hehe" }),
      caption: "Doakan juga ada rezeki nanti, biar kutraktir tipis-tipis seperti janjiku kemarin! 🍰🧋",
    },
    {
      src: "images/debby-pose-3.jpg",
      caption: "Peace sign penuh cinta buat Debby Friska Aruan ✌️💕",
    },
    {
      src: "images/debby-1.jpeg",
      caption: "4 ekspresi lucu Debby dalam satu frame spesial 📸💘",
    },
    {
      src: "images/debby-pose-4.jpg",
      caption: "Sampai bertemu kembali, wahai orang yang istimewa di hatiku 🌷✨",
    },
  ];

  const DEFAULT_CONFIG = {
    recipient: "Debby Friska Aruan",
    letterTitle: "Selamat Ulang Tahun, Debby Friska Aruan",
    letterParagraphs: [
      "Selamat ulang tahun ya, Debby! Semoga di usia yang baru ini hidupmu selalu dirahmati Tuhan, dipenuhi sukacita, dan dilancarkan setiap langkahmu.",
      "Semoga semakin bijaksana dalam perjalanan hidup, semakin kuat, dan selalu diberikan kesehatan jiwa dan raga.",
      "Doakan juga ya semoga ada rezeki nanti — biar kutraktir tipis-tipis seperti janjiku kemarin hehe 🍰🧋✨",
      "Sampai bertemu kembali, wahai orang yang istimewa di hatiku. 🌷💘",
    ],
    sender: "Janpiter Purba",
    voucher: "Janji Traktiran Tipis-Tipis dari Janpiter Purba (doakan rezekinya lancar ya!) 🍰🧋💘",
    badge: "HAPPY BIRTHDAY DEBBY",
    whatsapp: "6285260471692",
    photos: DEFAULT_PHOTOS.map((p) => ({ ...p })),
  };

  const config = structuredClone(DEFAULT_CONFIG);

  /* ---------------------------------------------------------
     2. CUTE WEB AUDIO API MUSIC BOX & SFX
     --------------------------------------------------------- */
  let audioCtx = null;
  let musicPlaying = false;
  let musicTimer = null;
  let noteIdx = 0;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration = 0.28, type = "sine", volume = 0.08, delay = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  const SFX = {
    twang() {
      playTone(220, 0.16, "triangle", 0.07);
      playTone(330, 0.12, "sine", 0.05, 0.03);
    },
    hitHeart() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        playTone(f, 0.38, "sine", 0.09, i * 0.065);
      });
    },
    celebrate() {
      [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5].forEach((f, i) => {
        playTone(f, 0.42, "triangle", 0.075, i * 0.07);
      });
    },
    blowCandle() {
      playTone(380, 0.14, "sine", 0.05);
      playTone(587.33, 0.22, "sine", 0.07, 0.1);
      playTone(880, 0.34, "sine", 0.07, 0.18);
    },
    pop() {
      playTone(540, 0.07, "sine", 0.08);
      playTone(860, 0.09, "triangle", 0.06, 0.03);
    },
    envelopeOpen() {
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        playTone(f, 0.34, "sine", 0.07, i * 0.06);
      });
    },
    coinTap(pitchBoost = 0) {
      playTone(520 + Math.min(360, pitchBoost * 16), 0.12, "triangle", 0.065);
      playTone(780 + Math.min(420, pitchBoost * 20), 0.16, "sine", 0.05, 0.04);
    },
    puppyYip() {
      playTone(620, 0.09, "sine", 0.08);
      playTone(840, 0.11, "triangle", 0.07, 0.07);
      playTone(720, 0.08, "sine", 0.05, 0.16);
    },
  };

  // Sweet music-box "Happy Birthday" notes [freq, beats]
  const HBD_MELODY = [
    [392.0, 0.75], [392.0, 0.25], [440.0, 1.0], [392.0, 1.0], [523.25, 1.0], [493.88, 2.0],
    [392.0, 0.75], [392.0, 0.25], [440.0, 1.0], [392.0, 1.0], [587.33, 1.0], [523.25, 2.0],
    [392.0, 0.75], [392.0, 0.25], [783.99, 1.0], [659.25, 1.0], [523.25, 1.0], [493.88, 1.0], [440.0, 1.6],
    [698.46, 0.75], [698.46, 0.25], [659.25, 1.0], [523.25, 1.0], [587.33, 1.0], [523.25, 2.4],
  ];

  function scheduleNextMusicNote() {
    if (!musicPlaying || usingCustomMp3) return;
    const [freq, beats] = HBD_MELODY[noteIdx % HBD_MELODY.length];
    noteIdx += 1;
    const ms = beats * 420;
    playTone(freq, Math.min(0.95, (ms / 1000) * 1.15), "sine", 0.055);
    playTone(freq * 2, 0.18, "triangle", 0.015);
    musicTimer = window.setTimeout(scheduleNextMusicNote, ms);
  }

  const bgAudio = document.getElementById("bg-audio");
  const vinylDisc = document.getElementById("vinyl-disc");
  let usingCustomMp3 = false;
  let customMp3ObjectUrl = null;
  if (bgAudio) {
    bgAudio.volume = 0.45;
  }

  function updateVinylUi() {
    const btn = document.getElementById("music-toggle-btn");
    const label = document.getElementById("music-icon");
    btn.setAttribute("aria-pressed", String(musicPlaying));
    if (vinylDisc) vinylDisc.classList.toggle("spinning", musicPlaying);
    label.textContent = musicPlaying ? (usingCustomMp3 ? "Lagu 🎵" : "Playing 🎵") : "Musik";
  }

  function toggleMusic(forceState, silentToast = false) {
    const next = typeof forceState === "boolean" ? forceState : !musicPlaying;
    musicPlaying = next;
    if (musicTimer) clearTimeout(musicTimer);

    if (!musicPlaying) {
      if (bgAudio) bgAudio.pause();
      updateVinylUi();
      return;
    }

    ensureAudio();
    if (bgAudio && bgAudio.getAttribute("src")) {
      const playPromise = bgAudio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            usingCustomMp3 = true;
            updateVinylUi();
            if (!silentToast) showToast("Memutar lagu latar favorit 💿🎵");
          })
          .catch(() => {
            // No music/lagu.mp3 found — seamlessly fall back to synthesized music box!
            usingCustomMp3 = false;
            updateVinylUi();
            scheduleNextMusicNote();
            if (!silentToast) showToast("Musik kotak ulang tahun aktif 🎵");
          });
        return;
      }
    }

    usingCustomMp3 = false;
    updateVinylUi();
    scheduleNextMusicNote();
    if (!silentToast) showToast("Musik kotak ulang tahun aktif 🎵");
  }

  /* ---------------------------------------------------------
     DOM REFERENCES & TOAST
     --------------------------------------------------------- */
  const sceneIntro = document.getElementById("scene-intro");
  const sceneReveal = document.getElementById("scene-reveal");
  const sceneMain = document.getElementById("scene-main");
  const introFxCanvas = document.getElementById("intro-fx-canvas");
  const targetHeart = document.getElementById("target-heart");
  const heartSpeech = document.getElementById("heart-speech");
  const bowStage = document.getElementById("bow-stage");
  const bowGroup = document.getElementById("bow-group");
  const bowString = document.getElementById("bow-string");
  const nockedArrow = document.getElementById("nocked-arrow");
  const flyingArrow = document.getElementById("flying-arrow");
  const aimGuide = document.getElementById("aim-guide");
  const pullSubhint = document.getElementById("pull-subhint");
  const quickShootBtn = document.getElementById("quick-shoot-btn");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------------------------------------------------------
     3. SCENE 1: INTERACTIVE CUPID BOW & ARROW
     --------------------------------------------------------- */
  document.body.classList.add("locked");

  const introParticles = [];
  let introRaf = null;
  let bowPos = { x: 180, y: 500, angle: -0.65 };
  let isDragging = false;
  let pullDistance = 0;
  let currentAimAngle = -0.65;
  let arrowInFlight = false;
  let heartPierced = false;
  let missCount = 0;

  function getHeartCenter() {
    const r = targetHeart.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * 0.44 };
  }

  function layoutBow() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    introFxCanvas.width = w * devicePixelRatio;
    introFxCanvas.height = h * devicePixelRatio;
    bowStage.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const heart = getHeartCenter();
    if (w < 640) {
      bowPos.x = Math.max(76, w * 0.27);
      bowPos.y = Math.min(h - 148, h * 0.70);
    } else if (w < 1024) {
      bowPos.x = Math.max(104, w * 0.24);
      bowPos.y = Math.min(h - 140, h * 0.72);
    } else {
      bowPos.x = Math.max(130, w * 0.25);
      bowPos.y = Math.min(h - 150, h * 0.72);
    }
    bowPos.angle = Math.atan2(heart.y - bowPos.y, heart.x - bowPos.x);
    if (!isDragging) {
      currentAimAngle = bowPos.angle;
      updateBowVisual(0, currentAimAngle);
    }
  }

  function updateBowVisual(pull, angleRad) {
    const deg = (angleRad * 180) / Math.PI;
    bowGroup.setAttribute("transform", `translate(${bowPos.x}, ${bowPos.y}) rotate(${deg})`);
    const stringX = -30 - pull;
    bowString.setAttribute("d", `M -30 -52 L ${stringX} 0 L -30 52`);
    nockedArrow.setAttribute("transform", `translate(${-pull}, 0)`);

    if (pull > 14) {
      const power = Math.min(1, pull / 95);
      const speed = 13 + power * 15;
      const vx = Math.cos(angleRad) * speed;
      const vy = Math.sin(angleRad) * speed;
      let d = `M ${bowPos.x} ${bowPos.y}`;
      let px = bowPos.x;
      let py = bowPos.y;
      let curVy = vy;
      for (let i = 0; i < 18; i++) {
        px += vx * 1.4;
        py += curVy * 1.4;
        curVy += 0.22;
        d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      aimGuide.setAttribute("d", d);
      aimGuide.classList.add("visible");
    } else {
      aimGuide.classList.remove("visible");
    }
  }

  function spawnHeartBurst(x, y, count = 26) {
    const colors = ["#ff4d7e", "#ff85a8", "#ffd166", "#ff6b6b", "#ffb3c6"];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const spd = 2.4 + Math.random() * 5.6;
      introParticles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 1.2,
        size: 7 + Math.random() * 10,
        alpha: 1,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.14,
        color: colors[i % colors.length],
      });
    }
  }

  function drawMiniHeart(ctx, x, y, size, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size * 0.5;
    ctx.moveTo(0, s * 0.7);
    ctx.bezierCurveTo(-s * 1.3, -s * 0.2, -s * 0.8, -s * 1.25, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.8, -s * 1.25, s * 1.3, -s * 0.2, 0, s * 0.7);
    ctx.fill();
    ctx.restore();
  }

  function animateIntroFx() {
    const ctx = introFxCanvas.getContext("2d");
    const dpr = devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = introParticles.length - 1; i >= 0; i--) {
      const p = introParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14;
      p.rot += p.vrot;
      p.alpha -= 0.018;
      if (p.alpha <= 0) {
        introParticles.splice(i, 1);
      } else {
        drawMiniHeart(ctx, p.x, p.y, p.size, p.rot, p.color, p.alpha);
      }
    }

    if (!sceneIntro.classList.contains("hidden")) {
      introRaf = requestAnimationFrame(animateIntroFx);
    }
  }

  function fireArrow(angleRad, pull, guaranteedHit = false) {
    if (arrowInFlight || heartPierced) return;
    arrowInFlight = true;
    nockedArrow.style.opacity = "0";
    aimGuide.classList.remove("visible");
    SFX.twang();

    const heart = getHeartCenter();
    const distToHeart = Math.hypot(heart.x - bowPos.x, heart.y - bowPos.y);
    const idealAngle = Math.atan2(heart.y - bowPos.y, heart.x - bowPos.x);

    // Gentle Cupid homing assist so it feels joyful and never frustrating
    let angleDiff = Math.atan2(Math.sin(angleRad - idealAngle), Math.cos(angleRad - idealAngle));
    const willAssist = guaranteedHit || (Math.abs(angleDiff) < 0.48 && pull >= 26);
    const launchAngle = willAssist ? idealAngle : angleRad;

    const duration = Math.max(360, Math.min(540, distToHeart * 0.82));
    const startTime = performance.now();
    const startX = bowPos.x;
    const startY = bowPos.y;
    const endX = willAssist ? heart.x - Math.cos(launchAngle) * 10 : startX + Math.cos(launchAngle) * 1400;
    const endY = willAssist ? heart.y - Math.sin(launchAngle) * 10 : startY + Math.sin(launchAngle) * 1400;
    const arcLift = willAssist ? Math.min(56, distToHeart * 0.12) : 30;

    flyingArrow.style.opacity = "1";

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      // Quadratic bezier flight
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2 - arcLift;
      const inv = 1 - t;
      const x = inv * inv * startX + 2 * inv * t * cx + t * t * endX;
      const y = inv * inv * startY + 2 * inv * t * cy + t * t * endY;
      const dx = 2 * inv * (cx - startX) + 2 * t * (endX - cx);
      const dy = 2 * inv * (cy - startY) + 2 * t * (endY - cy);
      const rotDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

      flyingArrow.setAttribute("transform", `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)})`);

      const distNow = Math.hypot(x - heart.x, y - heart.y);
      if ((willAssist && t >= 0.98) || distNow < heart.r) {
        onHeartHit(x, y, rotDeg);
        return;
      }

      if (t < 1 && x > -80 && x < window.innerWidth + 80 && y > -80 && y < window.innerHeight + 80) {
        requestAnimationFrame(step);
      } else {
        // Missed! Reset arrow with a cute playful message
        arrowInFlight = false;
        flyingArrow.style.opacity = "0";
        nockedArrow.style.opacity = "1";
        missCount += 1;
        heartSpeech.textContent = missCount === 1 ? "yah meleset dikit 😜 coba lagi!" : "arahin ke aku dong! 💘";
        heartSpeech.classList.add("visible");
        if (missCount >= 2) {
          quickShootBtn.classList.remove("hidden");
        }
      }
    }

    requestAnimationFrame(step);
  }

  function onHeartHit(x, y, rotDeg) {
    heartPierced = true;
    arrowInFlight = false;
    flyingArrow.setAttribute("transform", `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rotDeg.toFixed(1)})`);
    targetHeart.classList.remove("excited");
    targetHeart.classList.add("pierced");
    heartSpeech.textContent = "kena deh!! 💘✨";
    heartSpeech.classList.add("visible");
    SFX.hitHeart();
    spawnHeartBurst(x, y, 32);
    if (!musicPlaying) {
      setTimeout(() => toggleMusic(true, true), 450);
    }

    // Transition to Crimson Cinema Reveal (Scene 2)
    setTimeout(() => {
      startCrimsonReveal();
    }, 620);
  }

  function getPointerPos(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onDragStart(e) {
    if (arrowInFlight || heartPierced) return;
    e.preventDefault();
    ensureAudio();
    isDragging = true;
    bowGroup.classList.add("dragging");
    targetHeart.classList.add("excited");
    heartSpeech.textContent = "ehh mau dipanah nih? 👀💘";
    heartSpeech.classList.add("visible");
    pullSubhint.textContent = "Arahkan ke hati lalu lepaskan! 🎯";
  }

  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pt = getPointerPos(e);
    const dx = bowPos.x - pt.x;
    const dy = bowPos.y - pt.y;
    const rawDist = Math.hypot(dx, dy);
    pullDistance = Math.min(96, rawDist);
    if (rawDist > 8) {
      currentAimAngle = Math.atan2(dy, dx);
    }
    updateBowVisual(pullDistance, currentAimAngle);
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    bowGroup.classList.remove("dragging");
    targetHeart.classList.remove("excited");

    const releasedPull = pullDistance;
    const releasedAngle = currentAimAngle;
    pullDistance = 0;
    updateBowVisual(0, bowPos.angle);

    if (releasedPull >= 20) {
      fireArrow(releasedAngle, releasedPull, false);
    } else {
      heartSpeech.textContent = "tarik lebih jauh lagi ya 🏹";
      heartSpeech.classList.add("visible");
    }
  }

  bowGroup.addEventListener("mousedown", onDragStart);
  bowGroup.addEventListener("touchstart", onDragStart, { passive: false });
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchend", onDragEnd);

  quickShootBtn.addEventListener("click", () => {
    ensureAudio();
    const heart = getHeartCenter();
    const idealAngle = Math.atan2(heart.y - bowPos.y, heart.x - bowPos.x);
    updateBowVisual(75, idealAngle);
    setTimeout(() => {
      updateBowVisual(0, idealAngle);
      fireArrow(idealAngle, 85, true);
    }, 180);
  });

  // Gently show cute speech bubble after 1.6s on intro
  setTimeout(() => {
    if (!heartPierced && !isDragging) {
      heartSpeech.classList.add("visible");
    }
  }, 1500);

  /* ---------------------------------------------------------
     4. SCENE 2: CRIMSON CINEMA REVEAL
     --------------------------------------------------------- */
  function startCrimsonReveal() {
    sceneReveal.setAttribute("aria-hidden", "false");
    sceneReveal.classList.add("active");

    setTimeout(() => {
      sceneIntro.classList.add("leaving");
      setTimeout(() => sceneIntro.classList.add("hidden"), 500);
    }, 550);

    // Hold cinematic greeting then open Blooming Tree Main Stage
    setTimeout(() => {
      enterMainScene();
    }, 2950);
  }

  /* ---------------------------------------------------------
     5. SCENE 3: PROCEDURAL BLOOMING HEART TREE CANVAS
     --------------------------------------------------------- */
  const treeCanvas = document.getElementById("tree-canvas");
  let treeStarted = false;
  let treeBranches = [];
  let treeHearts = [];
  let fallingPetals = [];
  let treeStartTime = 0;

  function buildHeartTree() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    treeCanvas.width = w * devicePixelRatio;
    treeCanvas.height = h * devicePixelRatio;

    const isMobile = w <= 820;
    const isTablet = w > 820 && w <= 1120;
    const baseX = isMobile ? w * 0.5 : isTablet ? w * 0.74 : w * 0.72;
    const baseY = h + 16;
    const trunkH = isMobile
      ? Math.min(h * 0.30, 220)
      : isTablet
      ? Math.min(h * 0.38, 290)
      : Math.min(h * 0.44, 340);

    treeBranches = [];
    treeHearts = [];

    // Recursive organic branch generator
    function growBranch(x, y, len, angle, thickness, depth, startDelay) {
      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;
      const ctrlX = (x + endX) / 2 + (Math.random() - 0.5) * len * 0.18;
      const ctrlY = (y + endY) / 2 + (Math.random() - 0.5) * len * 0.1;

      treeBranches.push({
        x, y, ctrlX, ctrlY, endX, endY,
        thickness,
        delay: startDelay,
        duration: 380 + depth * 55,
      });

      if (depth <= 0) return;
      const subCount = depth === 4 ? 3 : 2;
      for (let i = 0; i < subCount; i++) {
        const spread = depth === 4 ? (i - 1) * 0.46 : (i === 0 ? -1 : 1) * (0.34 + Math.random() * 0.22);
        growBranch(
          endX,
          endY,
          len * (0.68 + Math.random() * 0.12),
          angle + spread,
          thickness * 0.66,
          depth - 1,
          startDelay + 230
        );
      }
    }

    growBranch(baseX, baseY, trunkH * 0.46, -Math.PI / 2, isMobile ? 16 : 22, 4, 0);

    // Heart-shaped lush canopy centered above the main fork
    const canopyCx = baseX;
    const canopyCy = baseY - trunkH * (isMobile ? 1.12 : 1.18);
    const scale = isMobile
      ? Math.min(w * 0.020, h * 0.0115, 8.8)
      : isTablet
      ? Math.min(w * 0.012, h * 0.0145, 11.2)
      : Math.min(w * 0.0135, h * 0.0165, 13.8);

    const palette = [
      "#ff4d7e", "#ff759b", "#ff9ebb", "#ffb5c2",
      "#ff8fa3", "#ffbe88", "#ffd166", "#f25c78",
      "#ffccd8", "#f76d82",
    ];

    const heartCount = isMobile ? 280 : 440;
    for (let i = 0; i < heartCount; i++) {
      // Parametric heart curve filled with radial jitter
      const t = Math.random() * Math.PI * 2;
      const fill = Math.pow(Math.random(), 0.52); // dense near edges & evenly lush inside
      const hx = 16 * Math.pow(Math.sin(t), 3) * fill;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * fill;

      const x = canopyCx + hx * scale + (Math.random() - 0.5) * 12;
      const y = canopyCy + hy * scale + (Math.random() - 0.5) * 12;

      treeHearts.push({
        x,
        y,
        size: (isMobile ? 9 : 11) + Math.random() * 14,
        rot: (Math.random() - 0.5) * 0.9,
        color: palette[Math.floor(Math.random() * palette.length)],
        delay: 950 + Math.random() * 1500,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    // Drifting ambient falling heart petals
    fallingPetals = [];
    for (let i = 0; i < 28; i++) {
      fallingPetals.push(createFallingPetal(canopyCx, canopyCy, scale * 14, true));
    }
  }

  function createFallingPetal(cx, cy, spread, randomY = false) {
    const colors = ["#ff6b93", "#ff9ebb", "#ffd166", "#ff8fab", "#ffb88c"];
    return {
      x: cx + (Math.random() - 0.5) * spread * 2.2,
      y: randomY ? Math.random() * window.innerHeight : cy + (Math.random() - 0.3) * spread,
      vx: -0.45 - Math.random() * 0.9,
      vy: 0.65 + Math.random() * 1.15,
      size: 7 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.5 + Math.random() * 0.45,
    };
  }

  function renderTree(now) {
    const ctx = treeCanvas.getContext("2d");
    const dpr = devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const elapsed = now - treeStartTime;

    // Subtle scroll fade so the photo grid & letter stay crisp and legible
    const scrollProgress = Math.min(1, window.scrollY / (h * 0.9));
    const treeAlpha = 1 - scrollProgress * 0.42;
    ctx.save();
    ctx.globalAlpha = treeAlpha;

    // Draw growing branches
    ctx.lineCap = "round";
    ctx.strokeStyle = "#7a443c";
    for (const b of treeBranches) {
      if (elapsed < b.delay) continue;
      const p = Math.min(1, (elapsed - b.delay) / b.duration);
      const ease = 1 - Math.pow(1 - p, 3);
      const curX = b.x + (b.endX - b.x) * ease;
      const curY = b.y + (b.endY - b.y) * ease;
      const curCtrlX = b.x + (b.ctrlX - b.x) * ease;
      const curCtrlY = b.y + (b.ctrlY - b.y) * ease;

      ctx.beginPath();
      ctx.lineWidth = Math.max(1.8, b.thickness);
      ctx.moveTo(b.x, b.y);
      ctx.quadraticCurveTo(curCtrlX, curCtrlY, curX, curY);
      ctx.stroke();
    }

    // Draw blooming heart leaves
    for (const leaf of treeHearts) {
      if (elapsed < leaf.delay) continue;
      const p = Math.min(1, (elapsed - leaf.delay) / 480);
      // Elastic pop-in
      const scale = p < 1 ? 1 - Math.pow(1 - p, 3) * Math.cos(p * Math.PI * 1.4) : 1;
      const sway = Math.sin(now * 0.0014 + leaf.swayOffset) * 2.2;
      drawMiniHeart(ctx, leaf.x + sway, leaf.y, leaf.size * scale, leaf.rot, leaf.color, 0.92 * p);
    }

    ctx.restore();

    // Draw continuous falling heart petals (always visible across page!)
    if (elapsed > 1500) {
      const isMobile = w <= 820;
      const cx = isMobile ? w * 0.5 : w * 0.72;
      const cy = h * 0.34;
      for (const petal of fallingPetals) {
        petal.sway += 0.025;
        petal.x += petal.vx + Math.sin(petal.sway) * 0.55;
        petal.y += petal.vy;
        petal.rot += petal.vrot;
        drawMiniHeart(ctx, petal.x, petal.y, petal.size, petal.rot, petal.color, petal.alpha);

        if (petal.y > h + 30 || petal.x < -40) {
          Object.assign(petal, createFallingPetal(cx, cy, isMobile ? 120 : 200, false));
        }
      }
    }

    requestAnimationFrame(renderTree);
  }

  function enterMainScene() {
    sceneMain.classList.remove("hidden");
    sceneMain.setAttribute("aria-hidden", "false");
    document.body.classList.remove("locked");

    requestAnimationFrame(() => {
      sceneReveal.classList.remove("active");
      sceneReveal.setAttribute("aria-hidden", "true");
      sceneMain.classList.add("visible");
    });

    if (!treeStarted) {
      treeStarted = true;
      buildHeartTree();
      treeStartTime = performance.now();
      requestAnimationFrame(renderTree);
      startBalloonSpawner();
      requestAnimationFrame(() => initScratchCard(false));
    } else {
      buildHeartTree();
      treeStartTime = performance.now();
      requestAnimationFrame(() => initScratchCard(false));
    }
  }

  /* ---------------------------------------------------------
     6. RENDER CONTENT, PHOTO GRID & LIGHTBOX
     --------------------------------------------------------- */
  const photoGridEl = document.getElementById("photo-grid");
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lbCounter = document.getElementById("lb-counter");
  let activePhotoIdx = 0;

  function renderContent() {
    document.getElementById("reveal-post").textContent = `to ${config.recipient}`;
    document.getElementById("hero-recipient-pill").textContent = `untuk ${config.recipient} 🌷`;
    const envTo = document.querySelector(".envelope-to strong");
    if (envTo) envTo.textContent = config.recipient;
    document.getElementById("letter-title").textContent = config.letterTitle;
    document.getElementById("letter-signature").textContent = `- ${config.sender} -`;
    document.getElementById("gift-voucher-desc").textContent = config.voucher;
    document.getElementById("gift-year-pill").textContent = `✨ ${config.badge} ✨`;

    const letterBody = document.getElementById("letter-body");
    letterBody.innerHTML = "";
    config.letterParagraphs.forEach((line) => {
      if (!line.trim()) return;
      const p = document.createElement("p");
      p.textContent = line;
      letterBody.appendChild(p);
    });

    // Render 3x3 Photo Grid
    photoGridEl.innerHTML = "";
    config.photos.forEach((photo, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "photo-card";
      card.setAttribute("aria-label", `Buka kenangan ${idx + 1}: ${photo.caption}`);
      card.innerHTML = `
        <img src="${photo.src}" alt="Kenangan ${idx + 1}" loading="lazy" />
        <div class="photo-overlay">${escapeHtml(photo.caption)}</div>
      `;
      card.addEventListener("click", () => openLightbox(idx));
      photoGridEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function openLightbox(index) {
    activePhotoIdx = (index + config.photos.length) % config.photos.length;
    const item = config.photos[activePhotoIdx];
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.caption;
    if (lbCounter) lbCounter.textContent = `${activePhotoIdx + 1} / ${config.photos.length}`;
    lightboxModal.classList.remove("hidden");
  }

  function closeLightbox() {
    lightboxModal.classList.add("hidden");
  }

  document.getElementById("close-lightbox").addEventListener("click", closeLightbox);
  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
  document.getElementById("lb-prev").addEventListener("click", () => openLightbox(activePhotoIdx - 1));
  document.getElementById("lb-next").addEventListener("click", () => openLightbox(activePhotoIdx + 1));

  /* ---------------------------------------------------------
     7. INTERACTIVE CUTE BIRTHDAY CAKE CANDLE
     --------------------------------------------------------- */
  const cakeBtn = document.getElementById("cake-btn");
  const candleFlame = document.getElementById("candle-flame");
  const candleSmoke = document.getElementById("candle-smoke");
  const cakeHint = document.getElementById("cake-hint");
  let candleBlown = false;

  cakeBtn.addEventListener("click", () => {
    ensureAudio();
    if (!candleBlown) {
      candleBlown = true;
      candleFlame.classList.add("blown");
      candleSmoke.classList.remove("puff");
      void candleSmoke.offsetWidth;
      candleSmoke.classList.add("puff");
      cakeHint.textContent = "Yeay! Semoga semua wish kamu terkabul! ✨ (klik lagi buat nyalain)";
      SFX.blowCandle();
      const rect = cakeBtn.getBoundingClientRect();
      launchFireworkBurst(rect.left + rect.width / 2, rect.top, 42);
      showToast("Make a wish!! 🎂✨");
    } else {
      candleBlown = false;
      candleFlame.classList.remove("blown");
      cakeHint.textContent = "Lilinnya nyala lagi! Klik buat tiup 🎂💨";
    }
  });

  /* ---------------------------------------------------------
     8. SCENE 6: GIFT MODAL + REAL-TIME FIREWORKS & CONFETTI
     --------------------------------------------------------- */
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  const giftModal = document.getElementById("gift-modal");
  const claimBtn = document.getElementById("claim-wishes-btn");
  const fwParticles = [];
  let fwRunning = false;

  function resizeFireworks() {
    fireworksCanvas.width = window.innerWidth * devicePixelRatio;
    fireworksCanvas.height = window.innerHeight * devicePixelRatio;
  }

  function launchFireworkBurst(cx, cy, count = 65) {
    resizeFireworks();
    const colors = ["#ff4d7e", "#ffd166", "#ff8fab", "#64dfdf", "#ff9f1c", "#ffffff", "#c77dff"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 2.2 + Math.random() * 8.2;
      fwParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 1.8,
        size: 3.5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.012,
        isHeart: Math.random() < 0.34,
        rot: Math.random() * Math.PI * 2,
      });
    }
    if (!fwRunning) {
      fwRunning = true;
      requestAnimationFrame(animateFireworks);
    }
  }

  function animateFireworks() {
    const ctx = fireworksCanvas.getContext("2d");
    const dpr = devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.14;
      p.alpha -= p.decay;
      p.rot += 0.08;

      if (p.alpha <= 0) {
        fwParticles.splice(i, 1);
      } else if (p.isHeart) {
        drawMiniHeart(ctx, p.x, p.y, p.size * 2.2, p.rot, p.color, p.alpha);
      } else {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (fwParticles.length > 0) {
      requestAnimationFrame(animateFireworks);
    } else {
      fwRunning = false;
    }
  }

  function celebrateFireworksShow() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    launchFireworkBurst(w * 0.28, h * 0.32, 60);
    setTimeout(() => launchFireworkBurst(w * 0.72, h * 0.28, 65), 240);
    setTimeout(() => launchFireworkBurst(w * 0.5, h * 0.24, 75), 520);
  }

  document.getElementById("open-gift-btn").addEventListener("click", () => {
    ensureAudio();
    SFX.celebrate();
    giftModal.classList.remove("hidden");
    claimBtn.classList.remove("claimed");
    claimBtn.textContent = "Claim Wishes & Traktiran ❤️";
    celebrateFireworksShow();
  });

  document.getElementById("close-gift-modal").addEventListener("click", () => {
    giftModal.classList.add("hidden");
  });

  giftModal.addEventListener("click", (e) => {
    if (e.target === giftModal) giftModal.classList.add("hidden");
  });

  claimBtn.addEventListener("click", () => {
    ensureAudio();
    SFX.celebrate();
    celebrateFireworksShow();
    claimBtn.classList.add("claimed");
    claimBtn.textContent = "Wishes & Traktiran Claimed! 💖🎉";
    showToast("Hadiah & doa baik resmi diklaim! Selamat ulang tahun Debby! 🎉💘");
  });

  /* ---------------------------------------------------------
     8B. 5 EXTRA CUTE INTERACTIVE FEATURES
     --------------------------------------------------------- */

  // --- Feature 1: Interactive Sealed Envelope ---
  const envelopeStage = document.getElementById("envelope-stage");
  const openEnvelopeBtn = document.getElementById("open-envelope-btn");
  const letterCard = document.getElementById("letter-card");

  openEnvelopeBtn.addEventListener("click", () => {
    if (envelopeStage.classList.contains("opening")) return;
    ensureAudio();
    SFX.envelopeOpen();
    envelopeStage.classList.add("opening");
    const rect = envelopeStage.getBoundingClientRect();
    launchFireworkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 36);

    setTimeout(() => {
      envelopeStage.classList.add("hidden");
      letterCard.classList.remove("hidden");
      letterCard.classList.add("pop-open");
      showToast("Surat spesial dari Janpiter terbuka! 💌✨");
    }, 620);
  });

  // --- Feature 2: Mini-Game "Tap Doakan Rezeki Janpiter!" ---
  const rezekiTapBtn = document.getElementById("rezeki-tap-btn");
  const rezekiCountPill = document.getElementById("rezeki-count-pill");
  const rezekiBarFill = document.getElementById("rezeki-bar-fill");
  const rezekiTierLabel = document.getElementById("rezeki-tier-label");
  const rezekiReaction = document.getElementById("rezeki-reaction");
  let rezekiTaps = 0;

  const REZEKI_MSGS = [
    "Aminn! Dompet Janpiter mulai bergetar ✨",
    "Makin kenceng doanya, makin tebal traktirannya! 🧋",
    "Wah malaikat rezeki ikut senyum nih 😇💸",
    "Semangat tap-nya Debby! Demi jajan enak! 🍰",
    "Gas terus! Janji traktir makin aman! 😆💘",
  ];

  rezekiTapBtn.addEventListener("click", (e) => {
    ensureAudio();
    rezekiTaps += 1;
    SFX.coinTap(rezekiTaps);
    rezekiCountPill.textContent = `${rezekiTaps}x`;

    const pct = Math.min(100, Math.max(6, (rezekiTaps / 25) * 100));
    rezekiBarFill.style.width = `${pct}%`;

    // Floating +1 emoji right at tap point
    const rect = rezekiTapBtn.getBoundingClientRect();
    const fx = e.clientX || rect.left + rect.width / 2;
    const fy = e.clientY || rect.top;
    spawnTapSpark(fx, fy - 12, rezekiTaps % 2 === 0 ? "+1 💸" : "+1 💘", "#d8384a");

    if (rezekiTaps === 10) {
      rezekiTierLabel.textContent = "Level 2: Traktiran Enak + Dessert! 🍰🧋";
      rezekiReaction.textContent = "YEAY NAIK LEVEL! Udah masuk menu dessert & minuman enak nih! 🎉";
      document.getElementById("gift-voucher-desc").textContent =
        "UPGRADED! Traktiran Enak + Dessert & Minuman Manis dari Janpiter Purba 🍰🧋💖";
      SFX.celebrate();
      launchFireworkBurst(fx, fy - 40, 48);
    } else if (rezekiTaps === 25) {
      rezekiTierLabel.textContent = "Level MAX: Traktiran Sultan Spesial Debby! 🍣🎂🎉";
      rezekiReaction.textContent = "WADUH LEVEL MAX!! Semoga rezeki Janpiter ngalir deras kayak air terjun! 💸🎉💘";
      document.getElementById("gift-voucher-desc").textContent =
        "LEVEL MAX UNLOCKED! Traktiran Spesial Bebas Pilih dari Janpiter Purba (berkat 25x+ doa Debby!) 🍣🍰🧋💘";
      SFX.celebrate();
      celebrateFireworksShow();
      showToast("LEVEL MAX! Traktiran Sultan berhasil dibuka! 🎉🍣");
    } else if (rezekiTaps > 25) {
      rezekiReaction.textContent = `Total ${rezekiTaps}x doa terkirim! Janpiter makin semangat nabung buat Debby 💘✨`;
    } else if (rezekiTaps > 10) {
      rezekiReaction.textContent = `Dikit lagi Level Sultan! (${25 - rezekiTaps} tap lagi 🍣✨)`;
    } else {
      rezekiReaction.textContent = REZEKI_MSGS[(rezekiTaps - 1) % REZEKI_MSGS.length];
    }
  });

  // --- Feature 4: Poppable Pastel Balloons ---
  const balloonLayer = document.getElementById("balloon-layer");
  let balloonInterval = null;

  const BALLOON_COLORS = [
    { fill: "#ff9ebb", shine: "#ffd6e3" },
    { fill: "#ffd166", shine: "#fff0bf" },
    { fill: "#ffb88c", shine: "#ffe0cc" },
    { fill: "#cdb4db", shine: "#efe2f6" },
    { fill: "#a8e6cf", shine: "#d9f7eb" },
  ];

  const BALLOON_WISHES = [
    "Dirahmati Tuhan selalu! 🕊️",
    "Sehat jiwa & raga! 💖",
    "Makin bijaksana! 🌷",
    "Bahagia terus Debby! ✨",
    "HBD orang istimewa! 🎂",
    "Rezeki lancar buat traktir! 🧋",
  ];

  function spawnOneBalloon() {
    if (sceneMain.classList.contains("hidden")) return;
    if (balloonLayer.childElementCount >= 6) return;

    const palette = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const onLeft = Math.random() < 0.5;
    const leftPct = onLeft ? 2 + Math.random() * 11 : 85 + Math.random() * 10;
    const dur = 15 + Math.random() * 8;
    const sway = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 16);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pastel-balloon";
    btn.style.left = `${leftPct}%`;
    btn.style.setProperty("--rise-dur", `${dur}s`);
    btn.style.setProperty("--sway-x", `${sway}px`);
    btn.setAttribute("aria-label", "Letuskan balon ucapan");
    btn.innerHTML = `
      <svg viewBox="0 0 60 82" width="54" height="74">
        <path d="M30 60 Q26 70 33 80" fill="none" stroke="#c08a94" stroke-width="1.6" stroke-linecap="round"/>
        <ellipse cx="30" cy="30" rx="23" ry="27" fill="${palette.fill}"/>
        <ellipse cx="22" cy="20" rx="6" ry="10" transform="rotate(-22 22 20)" fill="${palette.shine}" opacity="0.72"/>
        <polygon points="26,56 34,56 30,61" fill="${palette.fill}"/>
      </svg>`;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ensureAudio();
      SFX.pop();
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      btn.classList.add("popping");
      launchFireworkBurst(cx, cy, 22);

      const wish = document.createElement("div");
      wish.className = "balloon-wish-pop";
      wish.style.left = `${Math.max(90, Math.min(window.innerWidth - 90, cx))}px`;
      wish.style.top = `${cy}px`;
      wish.textContent = BALLOON_WISHES[Math.floor(Math.random() * BALLOON_WISHES.length)];
      document.body.appendChild(wish);
      setTimeout(() => wish.remove(), 1450);
      setTimeout(() => btn.remove(), 180);
    });

    btn.addEventListener("animationend", () => btn.remove());
    balloonLayer.appendChild(btn);
  }

  function startBalloonSpawner() {
    if (balloonInterval) return;
    setTimeout(spawnOneBalloon, 1200);
    setTimeout(spawnOneBalloon, 2600);
    balloonInterval = setInterval(spawnOneBalloon, 3400);
  }

  // --- Feature 5: Global Tap Sparkles & Cute Mini-Stickers ---
  const CUTE_TAP_EMOJIS = ["💘", "✨", "🌸", "💖", "⭐", "🌷"];
  const CUTE_TAP_WORDS = ["HBD Debby! 🎂", "lucu banget ✨", "sehat selalu 🌷", "istimewa 💘", "bahagia terus! 💖"];
  let globalTapCount = 0;

  function spawnTapSpark(x, y, text, color = "#e03454") {
    const el = document.createElement("span");
    el.className = "tap-spark";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.fontSize = text.length > 3 ? "0.78rem" : "1rem";
    el.style.setProperty("--tx", `${Math.round((Math.random() - 0.5) * 64)}px`);
    el.style.setProperty("--ty", `${-46 - Math.round(Math.random() * 38)}px`);
    el.style.setProperty("--dur", `${0.85 + Math.random() * 0.35}s`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1250);
  }

  document.addEventListener("click", (e) => {
    if (sceneMain.classList.contains("hidden")) return;
    if (e.target.closest("input, textarea, .customizer-drawer, #scratch-canvas")) return;

    globalTapCount += 1;
    for (let i = 0; i < 3; i++) {
      const sym = CUTE_TAP_EMOJIS[Math.floor(Math.random() * CUTE_TAP_EMOJIS.length)];
      spawnTapSpark(e.clientX + (Math.random() - 0.5) * 18, e.clientY + (Math.random() - 0.5) * 14, sym);
    }
    if (globalTapCount % 3 === 0) {
      const word = CUTE_TAP_WORDS[Math.floor(Math.random() * CUTE_TAP_WORDS.length)];
      spawnTapSpark(e.clientX, e.clientY - 14, word, "#c9253f");
    }
  });

  /* ---------------------------------------------------------
     8C. FEATURE #3: GACHA KAPSUL PESAN MANIS (8 COLLECTIBLES)
     --------------------------------------------------------- */
  const CAPSULE_NOTES = [
    { emoji: "🕊️", text: "Doa #1: Semoga Tuhan selalu menjaga dan merahmati setiap langkahmu ke mana pun kamu pergi, Debby." },
    { emoji: "🌷", text: "Pesan #2: Tetap jadi Debby yang hangat, tulus, dan semakin bijaksana dalam menjalani hidup ya!" },
    { emoji: "😊", text: "Pesan #3: Senyummu itu beneran bikin hari orang lain ikut cerah — jangan lupa sering tersenyum!" },
    { emoji: "💪", text: "Pesan #4: Kalau lagi capek atau banyak pikiran, istirahat sebentar ya. Sehat jiwa & raga itu nomor satu!" },
    { emoji: "🧋", text: "Pesan #5: Pengingat resmi: Janpiter masih ingat janji traktir tipis-tipis kemarin lho hehe~" },
    { emoji: "✨", text: "Pesan #6: Semoga di usia baru ini, hal-hal baik yang kamu doakan diam-diam pelan-pelan jadi nyata." },
    { emoji: "📸", text: "Pesan #7: Nanti pas ketemu lagi, jangan lupa foto bareng ya buat nambah koleksi kenangan lucu!" },
    { emoji: "💘", text: "Pesan #8: Terima kasih sudah hadir & jadi orang yang begitu istimewa di hatiku. — Janpiter Purba" },
  ];

  const capsuleDotsEl = document.getElementById("capsule-dots");
  const capsuleCounterEl = document.getElementById("capsule-counter");
  const capsuleNotePaper = document.getElementById("capsule-note-paper");
  const capsuleNoteEmoji = document.getElementById("capsule-note-emoji");
  const capsuleNoteText = document.getElementById("capsule-note-text");
  const capsuleDrawBtn = document.getElementById("capsule-draw-btn");
  const capsuleBtnLabel = document.getElementById("capsule-btn-label");
  const capsuleIcon = document.getElementById("capsule-icon");
  const collectedCapsuleSet = new Set();
  let lastCapsuleIdx = -1;

  function renderCapsuleDots() {
    capsuleDotsEl.innerHTML = "";
    CAPSULE_NOTES.forEach((_, idx) => {
      const dot = document.createElement("span");
      dot.className = "capsule-dot" + (collectedCapsuleSet.has(idx) ? " collected" : "");
      dot.title = collectedCapsuleSet.has(idx) ? `Pesan #${idx + 1} sudah terbuka` : `Pesan #${idx + 1} belum terbuka`;
      capsuleDotsEl.appendChild(dot);
    });
    capsuleCounterEl.textContent = `${collectedCapsuleSet.size} / ${CAPSULE_NOTES.length} terkumpul`;
  }

  capsuleDrawBtn.addEventListener("click", (e) => {
    ensureAudio();
    const uncollected = CAPSULE_NOTES.map((_, i) => i).filter((i) => !collectedCapsuleSet.has(i));
    let nextIdx;
    if (uncollected.length > 0) {
      nextIdx = uncollected[Math.floor(Math.random() * uncollected.length)];
    } else {
      do {
        nextIdx = Math.floor(Math.random() * CAPSULE_NOTES.length);
      } while (nextIdx === lastCapsuleIdx && CAPSULE_NOTES.length > 1);
    }

    lastCapsuleIdx = nextIdx;
    const wasNew = !collectedCapsuleSet.has(nextIdx);
    collectedCapsuleSet.add(nextIdx);
    const note = CAPSULE_NOTES[nextIdx];

    capsuleNoteEmoji.textContent = note.emoji;
    capsuleNoteText.textContent = note.text;
    capsuleNotePaper.classList.remove("pop");
    void capsuleNotePaper.offsetWidth;
    capsuleNotePaper.classList.add("pop");

    capsuleIcon.classList.remove("wiggle");
    void capsuleIcon.offsetWidth;
    capsuleIcon.classList.add("wiggle");

    renderCapsuleDots();
    SFX.coinTap(collectedCapsuleSet.size * 2);

    if (wasNew && collectedCapsuleSet.size === CAPSULE_NOTES.length) {
      capsuleBtnLabel.textContent = "Semua Terkumpul! Ambil Acak Lagi 🥠";
      SFX.celebrate();
      celebrateFireworksShow();
      showToast("Yeay! Semua 8 pesan rahasia berhasil dikumpulkan! 💖🎉");
    } else if (collectedCapsuleSet.size < CAPSULE_NOTES.length) {
      capsuleBtnLabel.textContent = `Buka Kapsul Berikutnya! (${CAPSULE_NOTES.length - collectedCapsuleSet.size} tersisa)`;
      const rect = capsuleDrawBtn.getBoundingClientRect();
      launchFireworkBurst(e.clientX || rect.left + rect.width / 2, rect.top, 20);
    }
  });

  renderCapsuleDots();

  /* ---------------------------------------------------------
     8D. FEATURE #1: KARTU GOSOK KEJUTAN (SCRATCH-OFF CARD)
     --------------------------------------------------------- */
  const scratchBox = document.getElementById("scratch-box");
  const scratchCanvas = document.getElementById("scratch-canvas");
  const scratchStatus = document.getElementById("scratch-status");
  const scratchRevealBtn = document.getElementById("scratch-reveal-btn");
  const scratchResetBtn = document.getElementById("scratch-reset-btn");

  let scratchCtx = null;
  let isScratching = false;
  let scratchRevealed = false;
  let lastScratchPt = null;
  let scratchCheckCounter = 0;
  let lastScratchWidth = 0;

  function initScratchCard(forceReset = true) {
    if (!scratchBox || !scratchCanvas) return;
    if (scratchRevealed && !forceReset) return;

    const rect = scratchBox.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return;
    if (!forceReset && Math.abs(rect.width - lastScratchWidth) < 4) return;
    lastScratchWidth = rect.width;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    scratchCanvas.width = Math.round(rect.width * dpr);
    scratchCanvas.height = Math.round(rect.height * dpr);
    scratchCtx = scratchCanvas.getContext("2d", { willReadFrequently: true });
    scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;

    // Shimmering rose-gold champagne foil gradient
    const grad = scratchCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f5d0a9");
    grad.addColorStop(0.32, "#f3b6c6");
    grad.addColorStop(0.65, "#f7d9a8");
    grad.addColorStop(1, "#e89eb3");
    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, w, h);

    // Subtle festive diagonal shimmer stripes & sparkle dots
    scratchCtx.save();
    scratchCtx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    scratchCtx.lineWidth = 10;
    for (let x = -h; x < w + h; x += 34) {
      scratchCtx.beginPath();
      scratchCtx.moveTo(x, 0);
      scratchCtx.lineTo(x + h, h);
      scratchCtx.stroke();
    }
    for (let i = 0; i < 36; i++) {
      scratchCtx.fillStyle = "rgba(255, 255, 255, 0.55)";
      scratchCtx.beginPath();
      scratchCtx.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 2.6, 0, Math.PI * 2);
      scratchCtx.fill();
    }
    scratchCtx.restore();

    // Prompt text painted on the foil
    scratchCtx.fillStyle = "rgba(104, 42, 54, 0.85)";
    scratchCtx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    scratchCtx.textAlign = "center";
    scratchCtx.textBaseline = "middle";
    scratchCtx.fillText("✨ GOSOK DI SINI ✨", w / 2, h / 2 - 10);
    scratchCtx.fillStyle = "rgba(104, 42, 54, 0.65)";
    scratchCtx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    scratchCtx.fillText("Ada bonus spesial dari Janpiter 🪙💘", w / 2, h / 2 + 16);

    scratchRevealed = false;
    scratchCanvas.classList.remove("revealed");
    scratchRevealBtn.classList.remove("hidden");
    scratchResetBtn.classList.add("hidden");
    scratchStatus.textContent = "Gosok pelan-pelan ya... 🪙";
  }

  function getScratchPoint(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function scratchAt(pt) {
    if (!scratchCtx || scratchRevealed) return;
    scratchCtx.globalCompositeOperation = "destination-out";
    scratchCtx.lineCap = "round";
    scratchCtx.lineJoin = "round";
    scratchCtx.lineWidth = 42;

    scratchCtx.beginPath();
    if (lastScratchPt) {
      scratchCtx.moveTo(lastScratchPt.x, lastScratchPt.y);
      scratchCtx.lineTo(pt.x, pt.y);
      scratchCtx.stroke();
    } else {
      scratchCtx.arc(pt.x, pt.y, 21, 0, Math.PI * 2);
      scratchCtx.fill();
    }
    lastScratchPt = pt;

    scratchCheckCounter += 1;
    if (scratchCheckCounter % 6 === 0) {
      evaluateScratchProgress();
    }
  }

  function evaluateScratchProgress() {
    if (!scratchCtx || scratchRevealed) return;
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;
    const data = scratchCtx.getImageData(0, 0, w, h).data;
    let cleared = 0;
    let total = 0;
    // Sample every 16th pixel for fast 60fps performance
    for (let i = 3; i < data.length; i += 64) {
      total += 1;
      if (data[i] < 128) cleared += 1;
    }
    const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;
    if (pct >= 48) {
      finishScratchReveal();
    } else if (pct > 5) {
      scratchStatus.textContent = `Lagi digosok (${pct}%)... dikit lagi kebuka! ✨`;
    }
  }

  function finishScratchReveal() {
    if (scratchRevealed) return;
    scratchRevealed = true;
    isScratching = false;
    scratchCanvas.classList.add("revealed");
    scratchRevealBtn.classList.add("hidden");
    scratchResetBtn.classList.remove("hidden");
    scratchStatus.textContent = "Yeay! Bonus rahasia terbuka! 🎉💘";
    ensureAudio();
    SFX.celebrate();
    const rect = scratchBox.getBoundingClientRect();
    launchFireworkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 56);
    showToast("Bonus spesial berhasil digosok & dibuka! 🪙✨");
  }

  scratchCanvas.addEventListener("mousedown", (e) => {
    if (scratchRevealed) return;
    isScratching = true;
    lastScratchPt = null;
    scratchAt(getScratchPoint(e));
  });

  window.addEventListener("mousemove", (e) => {
    if (!isScratching) return;
    scratchAt(getScratchPoint(e));
  });

  window.addEventListener("mouseup", () => {
    if (!isScratching) return;
    isScratching = false;
    lastScratchPt = null;
    evaluateScratchProgress();
  });

  scratchCanvas.addEventListener(
    "touchstart",
    (e) => {
      if (scratchRevealed) return;
      e.preventDefault();
      isScratching = true;
      lastScratchPt = null;
      scratchAt(getScratchPoint(e));
    },
    { passive: false }
  );

  scratchCanvas.addEventListener(
    "touchmove",
    (e) => {
      if (!isScratching) return;
      e.preventDefault();
      scratchAt(getScratchPoint(e));
    },
    { passive: false }
  );

  scratchCanvas.addEventListener("touchend", () => {
    if (!isScratching) return;
    isScratching = false;
    lastScratchPt = null;
    evaluateScratchProgress();
  });

  scratchRevealBtn.addEventListener("click", finishScratchReveal);
  scratchResetBtn.addEventListener("click", () => {
    ensureAudio();
    SFX.pop();
    initScratchCard(true);
  });

  /* ---------------------------------------------------------
     8E. CUTE KAWAII PUPPY ORNAMENTS IN EVERY SECTION
     --------------------------------------------------------- */
  function createKawaiiPuppySvg({
    fur = "#f5cfa0",
    ear = "#c68b59",
    belly = "#fff4e4",
    accessory = "party",
    peeking = false,
  }) {
    const accSvg = {
      party: `
        <polygon points="50,6 37,29 63,29" fill="#ff7aa2" stroke="#d8384a" stroke-width="1.5" stroke-linejoin="round"/>
        <line x1="43" y1="19" x2="58" y2="19" stroke="#fff3c4" stroke-width="2.5"/>
        <circle cx="50" cy="6" r="4.5" fill="#ffd166"/>`,
      cupid: `
        <path d="M18,56 C4,44 6,30 22,38 C16,44 17,52 24,56 Z" fill="#ffffff" stroke="#f2b5c8" stroke-width="1.5"/>
        <path d="M82,56 C96,44 94,30 78,38 C84,44 83,52 76,56 Z" fill="#ffffff" stroke="#f2b5c8" stroke-width="1.5"/>
        <path d="M50,15 C46,9 39,12 42,18 C44,21 50,25 50,25 C50,25 56,21 58,18 C61,12 54,9 50,15 Z" fill="#ff5d8f"/>`,
      letter: `
        <g transform="translate(36, 61) rotate(-6)">
          <rect x="0" y="0" width="28" height="19" rx="3" fill="#fff" stroke="#ee5273" stroke-width="1.8"/>
          <path d="M1,2 L14,11 L27,2" fill="none" stroke="#ee5273" stroke-width="1.6"/>
          <circle cx="14" cy="11" r="2.6" fill="#ff4d7e"/>
        </g>`,
      cheer: `
        <circle cx="50" cy="18" r="7" fill="#ffd166" stroke="#f59e0b" stroke-width="1.4"/>
        <text x="50" y="21.5" text-anchor="middle" font-size="9">✨</text>`,
      cozy: `
        <path d="M38,24 C32,16 44,14 48,22 C52,14 64,16 58,24 Z" fill="#ff8fab" stroke="#d8384a" stroke-width="1.2"/>
        <circle cx="48" cy="22" r="3.2" fill="#d8384a"/>`,
      dig: `
        <circle cx="50" cy="17" r="7.5" fill="#ffd166" stroke="#b45309" stroke-width="1.4"/>
        <text x="50" y="21" text-anchor="middle" font-size="9" font-weight="700" fill="#92400e">★</text>`,
      gift: `
        <path d="M40,24 C32,14 46,12 50,22 C54,12 68,14 60,24 Z" fill="#e53e56"/>
        <circle cx="50" cy="22" r="3.5" fill="#ffd166"/>`,
      none: "",
    }[accessory] || "";

    if (peeking) {
      return `
        <svg viewBox="0 0 120 74" width="102" height="63" aria-hidden="true">
          ${accSvg.replaceAll("50", "60")}
          <!-- Floppy Ears -->
          <ellipse class="puppy-ear-left" cx="31" cy="42" rx="13" ry="20" transform="rotate(18 31 42)" fill="${ear}"/>
          <ellipse class="puppy-ear-right" cx="89" cy="42" rx="13" ry="20" transform="rotate(-18 89 42)" fill="${ear}"/>
          <!-- Round Chubby Head -->
          <ellipse cx="60" cy="46" rx="31" ry="25" fill="${fur}"/>
          <!-- Cute Snout Patch -->
          <ellipse cx="60" cy="54" rx="14" ry="10" fill="${belly}"/>
          <!-- Glossy Kawaii Eyes -->
          <circle cx="47" cy="43" r="4.3" fill="#3a2328"/>
          <circle cx="45.6" cy="41.5" r="1.5" fill="#ffffff"/>
          <circle cx="73" cy="43" r="4.3" fill="#3a2328"/>
          <circle cx="71.6" cy="41.5" r="1.5" fill="#ffffff"/>
          <!-- Rosy Cheeks -->
          <ellipse cx="38" cy="50" rx="5.2" ry="3" fill="#ff8fab" opacity="0.65"/>
          <ellipse cx="82" cy="50" rx="5.2" ry="3" fill="#ff8fab" opacity="0.65"/>
          <!-- Nose & Happy Smile -->
          <ellipse cx="60" cy="50" rx="4.2" ry="3" fill="#4a282e"/>
          <path d="M54 55 Q57 59 60 55 Q63 59 66 55" fill="none" stroke="#4a282e" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="60" cy="59.5" rx="3" ry="2.4" fill="#ff7aa2"/>
          <!-- Paws resting on card top edge -->
          <ellipse cx="35" cy="67" rx="10" ry="6.5" fill="${belly}" stroke="${ear}" stroke-width="1.6"/>
          <ellipse cx="85" cy="67" rx="10" ry="6.5" fill="${belly}" stroke="${ear}" stroke-width="1.6"/>
        </svg>`;
    }

    return `
      <svg viewBox="0 0 100 96" width="76" height="73" aria-hidden="true">
        <!-- Wagging Tail -->
        <path class="puppy-tail" d="M74 72 Q90 62 84 48" fill="none" stroke="${ear}" stroke-width="7.5" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="50" cy="72" rx="23" ry="18" fill="${fur}"/>
        <ellipse cx="50" cy="75" rx="13" ry="11" fill="${belly}"/>
        <!-- Cute Collar -->
        <path d="M32 61 Q50 68 68 61" fill="none" stroke="#ee5273" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="50" cy="66" r="3.5" fill="#ffd166"/>
        <!-- Floppy Ears -->
        <ellipse class="puppy-ear-left" cx="24" cy="44" rx="11" ry="17" transform="rotate(16 24 44)" fill="${ear}"/>
        <ellipse class="puppy-ear-right" cx="76" cy="44" rx="11" ry="17" transform="rotate(-16 76 44)" fill="${ear}"/>
        <!-- Head -->
        <ellipse cx="50" cy="44" rx="26" ry="22" fill="${fur}"/>
        <!-- Snout -->
        <ellipse cx="50" cy="51" rx="12" ry="8.5" fill="${belly}"/>
        <!-- Eyes -->
        <circle cx="39" cy="41" r="3.8" fill="#3a2328"/>
        <circle cx="37.8" cy="39.8" r="1.3" fill="#ffffff"/>
        <circle cx="61" cy="41" r="3.8" fill="#3a2328"/>
        <circle cx="59.8" cy="39.8" r="1.3" fill="#ffffff"/>
        <!-- Cheeks -->
        <ellipse cx="32" cy="47" rx="4.5" ry="2.6" fill="#ff8fab" opacity="0.65"/>
        <ellipse cx="68" cy="47" rx="4.5" ry="2.6" fill="#ff8fab" opacity="0.65"/>
        <!-- Nose & Smile -->
        <ellipse cx="50" cy="47.5" rx="3.8" ry="2.7" fill="#4a282e"/>
        <path d="M45 52 Q47.5 55.5 50 52 Q52.5 55.5 55 52" fill="none" stroke="#4a282e" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="50" cy="55.5" rx="2.6" ry="2.2" fill="#ff7aa2"/>
        <!-- Little Paws -->
        <ellipse cx="38" cy="86" rx="7.5" ry="5" fill="${belly}" stroke="${ear}" stroke-width="1.3"/>
        <ellipse cx="62" cy="86" rx="7.5" ry="5" fill="${belly}" stroke="${ear}" stroke-width="1.3"/>
        <!-- Accessory -->
        ${accSvg}
      </svg>`;
  }

  function mountPuppyOrnament(selector, { className, svgOpts, barks }) {
    const host = document.querySelector(selector);
    if (!host) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `puppy-ornament ${className}`;
    btn.setAttribute("aria-label", "Ornamen anjing lucu — klik untuk menyapa!");
    btn.innerHTML = createKawaiiPuppySvg(svgOpts);

    let barkIdx = 0;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ensureAudio();
      SFX.puppyYip();
      btn.classList.remove("barking");
      void btn.offsetWidth;
      btn.classList.add("barking");

      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top;
      const msg = barks[barkIdx % barks.length];
      barkIdx += 1;

      const bubble = document.createElement("div");
      bubble.className = "puppy-bubble";
      bubble.style.left = `${Math.max(96, Math.min(window.innerWidth - 96, cx))}px`;
      bubble.style.top = `${Math.max(44, cy)}px`;
      bubble.textContent = msg;
      document.body.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1480);

      spawnTapSpark(cx - 14, cy + 6, "🐾", "#c68b59");
      spawnTapSpark(cx + 14, cy + 6, "💘", "#ee5273");
    });

    host.appendChild(btn);
  }

  function initPuppyOrnaments() {
    // 1. Scene 1: Intro Cupid Puppy
    mountPuppyOrnament("#scene-intro", {
      className: "puppy-intro",
      svgOpts: { fur: "#f6d3a5", ear: "#c68854", accessory: "cupid" },
      barks: ["Guk! Tarik panahnya yuk! 🏹🐾", "Woof! Bidik hatinya ya! 💘🐶"],
    });

    // 2. Scene 2: Crimson Cinema Reveal Party Puppy
    const revealStage = document.querySelector("#scene-reveal");
    if (revealStage) {
      const div = document.createElement("div");
      div.className = "puppy-reveal";
      div.innerHTML = createKawaiiPuppySvg({ fur: "#ffe5c2", ear: "#d49764", accessory: "party" });
      revealStage.appendChild(div);
    }

    // 3. Scene 3: Hero Card Birthday-Hat Puppy
    mountPuppyOrnament(".hero-copy", {
      className: "puppy-hero",
      svgOpts: { fur: "#f7d4a6", ear: "#be7f4c", accessory: "party" },
      barks: ["Guk guk! Happy Birthday Debby! 🎂🐾", "Woof! Sehat jiwa & raga ya! 🐶✨"],
    });

    // 4. Scene 4: Memories Card Peeking Puppy
    mountPuppyOrnament(".memories-card", {
      className: "puppy-memories-peek",
      svgOpts: { fur: "#f4cca0", ear: "#b57746", accessory: "none", peeking: true },
      barks: ["Guk! Fotonya lucu-lucu banget! 📸🐾", "Woof! Yang filter puppy paling gemes! 🐶💘"],
    });

    // 5. Scene 5a: Sealed Envelope Postman Puppy
    mountPuppyOrnament("#envelope-stage", {
      className: "puppy-envelope",
      svgOpts: { fur: "#fbe0bc", ear: "#cc915e", accessory: "letter" },
      barks: ["Guk! Ada surat dari Janpiter nih! 💌🐾", "Woof! Klik amplopnya dong Debby! 🐶✨"],
    });

    // 5b. Scene 5b: Opened Letter Card Puppy
    mountPuppyOrnament("#letter-card", {
      className: "puppy-letter",
      svgOpts: { fur: "#f6cfa3", ear: "#be7e4c", accessory: "letter" },
      barks: ["Guk! Dirahmati Tuhan selalu ya! 🕊️🐾", "Woof! Manis banget pesannya 💘🐶"],
    });

    // 6. Rezeki Mini-Game Cheerleader Puppy
    mountPuppyOrnament("#rezeki-card", {
      className: "puppy-rezeki",
      svgOpts: { fur: "#f8d8ad", ear: "#c98b55", accessory: "cheer" },
      barks: ["Guk! Ayo tap buat traktiran! 🍰🐾", "Woof! Semoga rezeki Janpiter lancar! 💸🐶"],
    });

    // 7. Kapsul Pesan Manis Cozy Puppy
    mountPuppyOrnament("#capsule-card", {
      className: "puppy-capsule",
      svgOpts: { fur: "#f2c69c", ear: "#a96e40", accessory: "cozy" },
      barks: ["Guk! Kumpulin 8 kapsulnya yuk! 🥠🐾", "Woof! Penuh doa baik buat Debby 🐶🌷"],
    });

    // 8. Scratch Card Digging Puppy
    mountPuppyOrnament("#scratch-card-wrap", {
      className: "puppy-scratch",
      svgOpts: { fur: "#fadcb7", ear: "#c78954", accessory: "dig" },
      barks: ["Guk! Gosok-gosok pakai paw! 🪙🐾", "Woof! Penasaran isinya apa ya? 🐶✨"],
    });

    // 9. Gift Modal Ribbon Puppy
    mountPuppyOrnament(".gift-modal-card", {
      className: "puppy-modal",
      svgOpts: { fur: "#f7d4a8", ear: "#bf804d", accessory: "gift" },
      barks: ["Guk! Jangan tolak traktirannya! 🎁🐾", "Woof! Klik tombol merahnya ya! 🐶❤️"],
    });

    // 9b. WhatsApp Reply Card Puppy
    mountPuppyOrnament("#wa-reply-card", {
      className: "puppy-wa",
      svgOpts: { fur: "#f9dcb8", ear: "#c78b58", accessory: "letter" },
      barks: ["Guk! Pilih menu traktirannya ya! 🧋🐾", "Woof! Kirim balasan ke Janpiter yuk! 💬🐶"],
    });

    // 10. Footer Cute Puppy & Paw Trail
    const footer = document.querySelector(".site-footer");
    if (footer) {
      const wrap = document.createElement("div");
      wrap.className = "puppy-footer-wrap";
      wrap.innerHTML = `<span class="paw-accent" aria-hidden="true">🐾 🐾</span>`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "puppy-ornament puppy-footer-btn";
      btn.setAttribute("aria-label", "Ornamen anjing lucu di footer");
      btn.innerHTML = createKawaiiPuppySvg({ fur: "#f6d3a5", ear: "#c48552", accessory: "cozy" });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        ensureAudio();
        SFX.puppyYip();
        btn.classList.remove("barking");
        void btn.offsetWidth;
        btn.classList.add("barking");
        const rect = btn.getBoundingClientRect();
        const bubble = document.createElement("div");
        bubble.className = "puppy-bubble";
        bubble.style.left = `${rect.left + rect.width / 2}px`;
        bubble.style.top = `${rect.top}px`;
        bubble.textContent = "Guk guk! Sampai ketemu lagi ya, Debby! 🐾💘";
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1480);
      });
      wrap.appendChild(btn);
      const rightPaws = document.createElement("span");
      rightPaws.className = "paw-accent";
      rightPaws.setAttribute("aria-hidden", "true");
      rightPaws.textContent = "🐾 🐾";
      wrap.appendChild(rightPaws);
      footer.prepend(wrap);
    }
  }

  initPuppyOrnaments();

  /* ---------------------------------------------------------
     8F. DOWNLOAD OFFICIAL BIRTHDAY VOUCHER AS PNG
     --------------------------------------------------------- */
  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(/\s+/);
    let line = "";
    let curY = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = words[i];
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, curY);
    return curY;
  }

  function downloadBirthdayVoucherPng() {
    const c = document.createElement("canvas");
    const w = 1080;
    const h = 600;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");

    // Soft pastel outer background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#fff5f8");
    bg.addColorStop(0.5, "#fff8ec");
    bg.addColorStop(1, "#ffe5ee");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative hearts on backdrop
    const deco = [
      [85, 85, 22], [995, 92, 24], [96, 518, 20], [988, 512, 22],
      [540, 34, 16], [540, 566, 16],
    ];
    deco.forEach(([hx, hy, hs]) => drawMiniHeart(ctx, hx, hy, hs, 0, "#ff9ebb", 0.55));

    // Main rounded ticket body
    const tx = 58;
    const ty = 56;
    const tw = w - 116;
    const th = h - 112;
    ctx.save();
    ctx.shadowColor = "rgba(176, 62, 86, 0.16)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#fffdfb";
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 32);
    ctx.fill();
    ctx.restore();

    // Ticket notches (left & right semicircle cutouts)
    ctx.fillStyle = "#ffeff4";
    ctx.beginPath();
    ctx.arc(tx, h / 2, 24, 0, Math.PI * 2);
    ctx.arc(tx + tw, h / 2, 24, 0, Math.PI * 2);
    ctx.fill();

    // Rose dashed inner border
    ctx.save();
    ctx.strokeStyle = "rgba(216, 56, 74, 0.35)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.roundRect(tx + 18, ty + 18, tw - 36, th - 36, 22);
    ctx.stroke();
    ctx.restore();

    // Right stub divider line
    const stubX = tx + tw - 250;
    ctx.save();
    ctx.strokeStyle = "rgba(216, 56, 74, 0.22)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(stubX, ty + 28);
    ctx.lineTo(stubX, ty + th - 28);
    ctx.stroke();
    ctx.restore();

    // Left main ticket content
    const mainCx = tx + (stubX - tx) / 2;

    // Top pill badge
    ctx.fillStyle = "#ffe6ee";
    ctx.beginPath();
    ctx.roundRect(mainCx - 170, ty + 42, 340, 38, 19);
    ctx.fill();
    ctx.fillStyle = "#d8384a";
    ctx.font = '700 17px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VOUCHER TRAKTIRAN RESMI", mainCx, ty + 62);

    // Recipient title
    ctx.fillStyle = "#d8384a";
    ctx.font = 'italic 700 42px "Playfair Display", Georgia, serif';
    ctx.fillText(config.recipient, mainCx, ty + 132);

    // Voucher details box
    const liveVoucher =
      document.getElementById("gift-voucher-desc")?.textContent?.trim() || config.voucher;
    ctx.fillStyle = "#fff5f7";
    ctx.beginPath();
    ctx.roundRect(tx + 48, ty + 174, stubX - tx - 96, 152, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(216, 56, 74, 0.16)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#4b2932";
    ctx.font = '600 22px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    wrapCanvasText(ctx, liveVoucher, mainCx, ty + 226, stubX - tx - 144, 34);

    // Bonus note & signature
    ctx.fillStyle = "#8a5f68";
    ctx.font = 'italic 500 18px "Playfair Display", Georgia, serif';
    ctx.fillText("Bonus: Bebas foto bareng & ngobrol seru pas ketemu lagi!", mainCx, ty + 372);

    ctx.fillStyle = "#d8384a";
    ctx.font = '700 21px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText(`Dari: ${config.sender}`, mainCx, ty + 422);

    // Right stub: cute drawn puppy stamp + validity
    const stubCx = stubX + 125;
    ctx.fillStyle = "#fff1f5";
    ctx.beginPath();
    ctx.arc(stubCx, ty + 175, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f29ab2";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cute mini vector puppy inside stamp
    ctx.fillStyle = "#c68854";
    ctx.beginPath();
    ctx.ellipse(stubCx - 30, ty + 174, 13, 22, 0.25, 0, Math.PI * 2);
    ctx.ellipse(stubCx + 30, ty + 174, 13, 22, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7d4a6";
    ctx.beginPath();
    ctx.ellipse(stubCx, ty + 176, 32, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff4e4";
    ctx.beginPath();
    ctx.ellipse(stubCx, ty + 185, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2328";
    ctx.beginPath();
    ctx.arc(stubCx - 12, ty + 171, 4.2, 0, Math.PI * 2);
    ctx.arc(stubCx + 12, ty + 171, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8fab";
    ctx.beginPath();
    ctx.ellipse(stubCx - 21, ty + 179, 5.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(stubCx + 21, ty + 179, 5.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a282e";
    ctx.beginPath();
    ctx.ellipse(stubCx, ty + 181, 4.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stamp text
    ctx.fillStyle = "#d8384a";
    ctx.font = '800 16px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText(config.badge || "HAPPY BIRTHDAY", stubCx, ty + 290);

    ctx.fillStyle = "#7a5961";
    ctx.font = '600 15px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText("BERLAKU SELAMANYA", stubCx, ty + 324);
    ctx.fillText("TANPA KADALUARSA", stubCx, ty + 348);

    ctx.fillStyle = "#16a34a";
    ctx.font = '800 15px "Plus Jakarta Sans", "Segoe UI", sans-serif';
    ctx.fillText("VERIFIED BY JANPITER", stubCx, ty + 408);

    // Trigger PNG download
    const link = document.createElement("a");
    link.download = "voucher-traktiran-debby.png";
    link.href = c.toDataURL("image/png");
    link.click();
    SFX.celebrate();
    showToast("Voucher traktiran berhasil disimpan ke galeri! 🎟️📥");
  }

  document.getElementById("download-voucher-btn").addEventListener("click", () => {
    ensureAudio();
    downloadBirthdayVoucherPng();
  });

  /* ---------------------------------------------------------
     8G. WHATSAPP REPLY & TREAT SELECTOR
     --------------------------------------------------------- */
  const treatChips = document.querySelectorAll(".treat-chip");
  const waReplyInput = document.getElementById("wa-reply-input");
  const waSendBtn = document.getElementById("wa-send-btn");
  let selectedTreat = "Boba / Minuman Manis 🧋";

  treatChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      ensureAudio();
      SFX.pop();
      treatChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedTreat = chip.dataset.treat || chip.textContent.trim();
    });
  });

  function formatWaNumber(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return "62" + digits.slice(1);
    return digits;
  }

  waSendBtn.addEventListener("click", () => {
    ensureAudio();
    SFX.celebrate();
    const note = waReplyInput.value.trim();
    const levelLabel = document.getElementById("rezeki-tier-label")?.textContent?.trim() || "Level 1: Traktiran Tipis-Tipis 🧋";
    const lines = [
      `Halo ${config.sender}! 💘`,
      `Aku baru aja buka website ulang tahun lucunya — makasih banyak yaa! 🎂🐾`,
      `Request traktiranku nanti: *${selectedTreat}*`,
      `Status mini-game doa rezeki: ${levelLabel} (${rezekiTaps}x doa! 🙏💸)`,
    ];
    if (note) {
      lines.push(`Pesan balasan dariku: "${note}"`);
    }
    lines.push("Sampai ketemu lagi ya! ✨");

    const encoded = encodeURIComponent(lines.join("\n"));
    const phone = formatWaNumber(config.whatsapp);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    showToast(phone ? "Membuka chat WhatsApp Janpiter... 💬" : "Membuka WhatsApp — tinggal pilih kontak Janpiter! 💬");
  });

  /* ---------------------------------------------------------
     9. MUSIC TOGGLE, REPLAY & SCROLL OBSERVER
     --------------------------------------------------------- */
  document.getElementById("music-toggle-btn").addEventListener("click", () => toggleMusic());

  // Replay intro Cupid Bow & Arrow
  document.getElementById("replay-intro-btn").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    heartPierced = false;
    arrowInFlight = false;
    missCount = 0;
    nockedArrow.style.opacity = "1";
    flyingArrow.style.opacity = "0";
    targetHeart.classList.remove("pierced", "excited");
    heartSpeech.textContent = "panah aku lagi dong! 💘";
    quickShootBtn.classList.add("hidden");

    sceneMain.classList.remove("visible");
    sceneMain.classList.add("hidden");
    envelopeStage.classList.remove("hidden", "opening");
    letterCard.classList.add("hidden");
    letterCard.classList.remove("pop-open");
    sceneIntro.classList.remove("hidden", "leaving");
    document.body.classList.add("locked");
    layoutBow();
    animateIntroFx();
  });

  // Scroll-reveal observer for Memories & Letter cards
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.14 }
  );
  document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));

  // Keyboard shortcuts for Lightbox & Modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      giftModal.classList.add("hidden");
    } else if (!lightboxModal.classList.contains("hidden")) {
      if (e.key === "ArrowLeft") openLightbox(activePhotoIdx - 1);
      if (e.key === "ArrowRight") openLightbox(activePhotoIdx + 1);
    }
  });

  window.addEventListener("resize", () => {
    layoutBow();
    resizeFireworks();
    if (treeStarted) {
      buildHeartTree();
      if (!scratchRevealed) initScratchCard(false);
    }
  });

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  renderContent();
  layoutBow();
  resizeFireworks();
  animateIntroFx();
})();
