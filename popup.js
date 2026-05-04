const CAT_PERSONALITIES = [
  { name: "Mochi",   emoji: "😸",   unlockAt: 0,  personalityLabel: "Playful"   },
  { name: "Biscuit", emoji: "🐈‍⬛",  unlockAt: 15, personalityLabel: "Dignified" },
  { name: "Noodle",  emoji: "😴",   unlockAt: 30, personalityLabel: "Sleepy"    },
];

const CAT_PUNS = [
  "You've got to be kitten me right meow!",
  "I'm not fur-ling well today… just paws-ing.",
  "That was a cat-astrophic pun. Sorry, not sorry.",
  "I'm feline good about this break, Ro!",
  "You're purrfectly capable. Don't fur-get it.",
  "This break is non-negotiable. I'm not lion.",
  "Stay paw-sitive, Ro! You got this.",
  "What's a cat's favorite color? Purr-ple! Wait… sage green now.",
  "I'm on a strict diet: fish, naps, and judging hooman.",
  "Why did the cat sit on the computer? To keep an eye on the mouse!",
  "Meow is the time to take a break!",
  "I whisker you a very relaxing break.",
  "You're looking a little ruff— wait, wrong animal.",
  "Have a mice day, Ro! Get it? No? I'll go.",
  "My cat therapist said I should be more paws-itive.",
  "I'm a pro-cat-stinator and I'm proud of it.",
  "What do cats eat for breakfast? Mice Krispies!",
  "That's a purr-etty good stretch you just did.",
  "I tried being serious once. It was a cat-astrophe.",
  "Water you doing?! Drink some H2-Meow!",
  "Don't stress meowt. Everything is fine.",
  "Are you kitten me?! You haven't taken a break yet?",
  "Let's paw-nder life's big questions… after this nap.",
  "The cat's out of the bag: you need to rest!",
  "I'm the cat's meow and I say HYDRATE.",
  "Why was the cat bad at poker? He always showed his paws.",
  "I've got a feline you're working too hard, Ro.",
  "Take this break fur real. No cat-ting corners.",
  "You're one in a meow-lion, Ro!",
  "Cats rule, stress drools. Take your break!",
];

const HAPPINESS_STATES = [
  { max: 20,  emoji: "😾", label: "Grumpy",   color: "linear-gradient(90deg,#e05555,#f97070)" },
  { max: 40,  emoji: "😿", label: "Sad",      color: "linear-gradient(90deg,#e07840,#fb9a60)" },
  { max: 60,  emoji: "😺", label: "Content",  color: "linear-gradient(90deg,#c0a030,#f0c842)" },
  { max: 80,  emoji: "😸", label: "Happy",    color: "linear-gradient(90deg,#60b840,#86efac)" },
  { max: 100, emoji: "😻", label: "Ecstatic", color: "linear-gradient(90deg,#3d7a4a,#5ca86a)" },
];

document.addEventListener("DOMContentLoaded", () => {
  loadStatus();
  renderPun();
  loadHydration();

  document.getElementById("test-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "testCat" }, () => {
      if (chrome.runtime.lastError) return;
      window.close();
    });
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resetAlarm" }, () => {
      if (chrome.runtime.lastError) return;
      loadStatus();
      const btn = document.getElementById("reset-btn");
      btn.textContent = "✓ Reset!";
      setTimeout(() => { btn.textContent = "↺ Reset Timer"; }, 1500);
    });
  });

  document.getElementById("hydration-btn").addEventListener("click", () => {
    addWaterGlass();
  });

});

function loadStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (data) => {
    if (chrome.runtime.lastError || !data) return;
    renderAll(data);
  });
}

function renderAll(data) {
  const happiness      = data.happiness      ?? 50;
  const streak         = data.streak         || 0;
  const maxStreak      = data.maxStreak      || 0;
  const totalCompleted = data.totalCompleted || 0;

  renderHappiness(happiness);
  renderStats(streak, maxStreak, totalCompleted);
  renderNextBreak(data.nextBreak);
  renderActiveCat(totalCompleted);
}

function renderHappiness(happiness) {
  const state = HAPPINESS_STATES.find(s => happiness <= s.max) || HAPPINESS_STATES[4];

  document.getElementById("mood-emoji").textContent      = state.emoji;
  document.getElementById("happiness-label").textContent = state.label;
  document.getElementById("happiness-pct").textContent   = `${happiness}%`;

  const fill = document.getElementById("happiness-fill");
  fill.style.width      = `${happiness}%`;
  fill.style.background = state.color;
}

function renderStats(streak, maxStreak, totalCompleted) {
  document.getElementById("streak-val").textContent = streak;
  document.getElementById("best-val").textContent   = maxStreak;
  document.getElementById("done-val").textContent   = totalCompleted;
}

function renderNextBreak(nextBreak) {
  const el = document.getElementById("next-break-text");
  if (!el) return;

  if (!nextBreak) {
    el.innerHTML = `Cat is warming up… 🐾`;
    return;
  }

  const msLeft = nextBreak - Date.now();
  if (msLeft <= 0) {
    el.innerHTML = `Cat is on the way… 🐾`;
    return;
  }

  const m = Math.floor(msLeft / 60000);
  const s = Math.floor((msLeft % 60000) / 1000);
  el.innerHTML = `Next cat visit in <span>${m}m ${s}s</span> 🐱`;
}

function renderActiveCat(totalCompleted) {
  const unlocked = CAT_PERSONALITIES.filter(c => totalCompleted >= c.unlockAt);
  const active   = unlocked[unlocked.length - 1] || CAT_PERSONALITIES[0];

  const rosterEl = document.getElementById("cat-roster");
  if (!rosterEl) return;

  rosterEl.innerHTML = CAT_PERSONALITIES.map(cat => {
    const isUnlocked = totalCompleted >= cat.unlockAt;
    const isActive   = cat.name === active.name;
    const cls = isActive   ? "cat-slot active"
              : isUnlocked ? "cat-slot unlocked"
              : "cat-slot locked";

    let tag;
    if (isActive)        tag = "active ✓";
    else if (isUnlocked) tag = cat.personalityLabel;
    else                 tag = `🔒 ${cat.unlockAt} breaks`;

    return `<div class="${cls}">
      <span class="cat-slot-emoji">${cat.emoji}</span>
      <span class="cat-slot-name">${cat.name}</span>
      <span class="cat-slot-tag">${tag}</span>
    </div>`;
  }).join("");
}

// ── Cat Pun of the Day ─────────────────────────────────────────────────────
function renderPun() {
  const el = document.getElementById("pun-text");
  if (!el) return;
  // One pun per day — based on day-of-year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const pun = CAT_PUNS[dayOfYear % CAT_PUNS.length];
  el.textContent = pun;
}

// ── Hydration Tracker ──────────────────────────────────────────────────────
const HYDRATION_GOAL = 8;

function getTodayKey() {
  const d = new Date();
  return `hydration_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

function loadHydration() {
  const key = getTodayKey();
  chrome.storage.local.get([key], (data) => {
    const count = data[key] || 0;
    renderHydrationGlasses(count);
  });
}

function addWaterGlass() {
  const key = getTodayKey();
  chrome.storage.local.get([key], (data) => {
    let count = data[key] || 0;
    if (count >= HYDRATION_GOAL) return; // already full
    count++;
    chrome.storage.local.set({ [key]: count }, () => {
      renderHydrationGlasses(count);
    });
  });
}

function renderHydrationGlasses(count) {
  const container = document.getElementById("hydration-glasses");
  const sub = document.getElementById("hydration-sub");
  const btn = document.getElementById("hydration-btn");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < HYDRATION_GOAL; i++) {
    const glass = document.createElement("div");
    glass.className = "hydration-glass" + (i < count ? " filled" : "");
    glass.addEventListener("click", () => {
      // Clicking a glass toggles fill up to that point
      const newCount = i < count ? i : i + 1;
      chrome.storage.local.set({ [getTodayKey()]: newCount }, () => {
        renderHydrationGlasses(newCount);
      });
    });
    container.appendChild(glass);
  }

  if (sub) {
    if (count >= HYDRATION_GOAL) {
      sub.textContent = "🎉 Goal reached! Great job, Ro!";
      sub.style.color = "rgba(116,184,135,0.65)";
    } else {
      sub.textContent = `${count} / ${HYDRATION_GOAL} glasses`;
      sub.style.color = "";
    }
  }
  if (btn) {
    btn.textContent = count >= HYDRATION_GOAL ? "✓ Done!" : "+ Sip";
    btn.disabled = count >= HYDRATION_GOAL;
    btn.style.opacity = count >= HYDRATION_GOAL ? "0.4" : "1";
  }
}
