const CAT_PERSONALITIES = [
  { name: "Mochi",   emoji: "😸",   unlockAt: 0,  personalityLabel: "Playful"   },
  { name: "Biscuit", emoji: "🐈‍⬛",  unlockAt: 15, personalityLabel: "Dignified" },
  { name: "Noodle",  emoji: "😴",   unlockAt: 30, personalityLabel: "Sleepy"    },
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
