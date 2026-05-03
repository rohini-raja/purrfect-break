// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll(() => {
    chrome.alarms.create("catBreak", { delayInMinutes: 15, periodInMinutes: 15 });
  });
  chrome.storage.local.set({
    installedAt: Date.now(),
    breakCount: 0,
    streak: 0,
    maxStreak: 0,
    skippedInARow: 0,
    happiness: 50,
    totalCompleted: 0,
    nextBreak: Date.now() + 15 * 60 * 1000,
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.get("catBreak", (alarm) => {
    if (!alarm) {
      chrome.alarms.create("catBreak", { delayInMinutes: 15, periodInMinutes: 15 });
      chrome.storage.local.set({ nextBreak: Date.now() + 15 * 60 * 1000 });
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "catBreak") triggerCatBreak();
});

// ── Cat Personalities ────────────────────────────────────────────────────────
const CAT_PERSONALITIES = [
  {
    id: "tabby",
    name: "Mochi",
    unlockAt: 0,
    emoji: "😸",
    cssBody: "#e8924a",
    cssAccent: "#d47040",
    cssBelly: "#f9dbb5",
    personality: "playful",
    personalityLabel: "Playful",
    msgs: {
      morning: [
        "Good meow-ning! ☀️",
        "Rise and pounce! 🌅",
        "Paws and stretch first!",
        "It's a-meow-zing morning!",
        "Time to cat-ch the day!",
        "Fur-real though, stretch those limbs 🙆",
        "Morn-ing purrson! Let's gooo!",
        "Whisker you a great morning!",
        "The early cat gets the nap later 😼",
        "Paw-sitively perfect time to hydrate!",
        "boop! morning! boop! water! boop! stretch!",
        "Cat says: big stretch energy today 🌅",
        "Your spine called. It wants a stretch.",
        "Rise, shine, and be feline great!",
        "Another day, another oppur-tuna-ty!",
        "I knocked over your coffee. Drink water instead. 💧",
        "Morning bounce time! Shake those paws! 🐾",
        "Fur the love of mornings, wake that body up!",
        "Purrsonally, mornings call for big stretches",
        "Cat-ch the morning before it cat-ches you!",
      ],
      afternoon: [
        "Psst… hooman, rest now 😴",
        "Meowtivation: break time!",
        "Water. Stretch. Breathe. In that order. 💧",
        "I'm not kitten — you need a break",
        "Take a paws ⏸️",
        "Fur-get the screen for 5 minutes",
        "Hydrate or dye-drate, fur real",
        "Water you waiting fur? Drink up!",
        "Feline a bit tired? Thought so.",
        "Purrfect time for a pause",
        "Claws for alarm — you haven't rested!",
        "I didn't walk all this way for you to skip this 😤",
        "Your posture is sus. Straighten up. 🐾",
        "Scratch that to-do list for 5 min",
        "Whisker away your stress ✨",
        "Blink twice if you need help. You didn't blink. Drink water.",
        "If I can nap 16 hours, you can take 5 minutes",
        "I purred for you. The LEAST you can do is stretch.",
        "This is not a cat-astrophe, just a break 🌿",
        "Don't be a copycat — actually TAKE this break",
        "Your screen has been stared at enough. Look away.",
        "Paw-don me while I silently judge your posture",
        "Cat tax: 5 minutes. Non-negotiable. 🐾",
        "Eyes tired? Look away from screen, roll them at me instead",
        "You've been working paw-sitively hard. Rest. Now.",
        "I have arrived. This is not a drill.",
        "Sir/ma'am, this is a wellness check.",
        "Fur the record: you are overdue for a break",
        "No thoughts, just paws and water 💧",
        "Your cat demands rest. Your cat is correct.",
      ],
      evening: [
        "Wind down time 🌙",
        "Even I get sleepy at dusk…",
        "Eyes heavy? Mine too. 😪",
        "Time to un-claw from work 🌙",
        "Fur real, wind down now",
        "The sun is setting. So should your screen brightness.",
        "Paw-don the interruption, but please wind down",
        "Fur-tune favors the rested",
        "Caturday vibes, even on a Tuesday",
        "Evening mode: ON. Work mode: OFF.",
        "Your future self says: chill out now",
        "Less screen, more purring (metaphorically)",
        "Golden hour calls for golden naps 🌅",
        "Stretch it out — the day is almost done 🙆",
        "I'm officially calling time on this work session",
        "Meow-ch needed evening reset right here",
        "Eyes on the horizon, not the screen",
        "The vibes are evening. Match them.",
        "You have permission to be done now.",
        "Purrsonally, evenings are for unwinding 🌙",
      ],
      night: [
        "ZZZ… follow my lead…",
        "It's late. Rest, hooman. 🌙",
        "Even cats need sleep. Mostly.",
        "Hiss-torically, humans slept at night",
        "Sleep is not fur the weak 💤",
        "I'm nocturnal. You're not. Big difference.",
        "The only thing to hunt now is your pillow",
        "Your laptop will be here tomorrow. Promise. 💻",
        "Nighty-night, don't let the cats bite 🌙",
        "I cannot supervise you AND let you stay up late",
        "Dark mode on screen, dark mode in life = sleep now",
        "Somewhere a pillow is very lonely without you",
        "It's giving… should-have-slept-earlier energy 💀",
        "I came to take a break, not enable your chaos",
        "The moon is out. So should your laptop. Closed.",
        "Literally why are you still working",
        "Meow goodnight. Please. I'm begging.",
        "Go to bed, I'll watch over the internet",
        "This is your cat. You are needed in the bedroom. Immediately.",
        "Sleep debt is real and I am the debt collector 😼",
      ],
      idle: [
        "I fell asleep waiting for you 😴",
        "You were gone SO long I napped twice.",
        "Finally! I've been here since fur-ever",
        "My patience has fur-run out. Break. NOW.",
        "I napped, then napped again. Then you showed up.",
        "I was beginning to think you forgot about meow 😿",
        "Oh, you're back. Cool. I guess. (I missed you)",
        "The plants grew. You were gone that long.",
        "I left paw prints all over your desk waiting",
        "Took you long enough… my paws are tired",
      ],
    },
  },
  {
    id: "tuxedo",
    name: "Biscuit",
    unlockAt: 15,
    emoji: "🐈‍⬛",
    cssBody: "#2d2d2d",
    cssAccent: "#1a1a1a",
    cssBelly: "#f0f0f0",
    personality: "dignified",
    personalityLabel: "Dignified",
    msgs: {
      morning: [
        "Good morning. Rest is required.",
        "I have reviewed your schedule. Break. Now.",
        "Productivity demands recovery. Begin.",
        "The morning routine: stretch, hydrate, comply.",
        "I have pre-approved this break. Use it.",
        "Posture check: initiated. Results: concerning.",
        "The day is young. Your spine should feel that way too.",
        "Morning hydration is non-optional, per policy.",
        "I have catalogued your slouch. Please correct it.",
        "A well-rested worker is a more tolerable one.",
        "Rise. Stretch. Hydrate. In that order. Now.",
        "I expect this break to be taken in full. Thank you.",
        "Morning brief: drink water, move body, resume.",
        "I have prepared a stretching agenda. Please follow it.",
        "The morning demands your best posture. Achieve it.",
      ],
      afternoon: [
        "I have deemed it break time.",
        "As your cat, I insist on a pause.",
        "The committee has voted: break time.",
        "I am not amused by your workaholic tendencies.",
        "This meeting could have been a break.",
        "Per my last reminder: rest. Now.",
        "Your wellness metrics are suboptimal.",
        "I have dispatched myself to ensure compliance.",
        "Kindly close the spreadsheet.",
        "Drink water. This is not a request.",
        "I have noted your continued non-compliance. Disappointing.",
        "A five-minute break is the minimum acceptable action.",
        "Your eyes are to be rested immediately.",
        "I am supervising. Do not make me escalate this.",
        "The sooner you rest, the sooner I can nap. Act accordingly.",
        "I have filed a formal rest request on your behalf. Approve it.",
        "Your posture violates several of my personal standards.",
        "Efficiency requires recovery. This is science. I know science.",
        "I have arrived. You will take this break. These are facts.",
        "Hydration status: unacceptable. Correct immediately.",
      ],
      evening: [
        "The evening demands stillness.",
        "Protocol dictates: you rest.",
        "I shall now supervise your wind-down.",
        "It is now appropriate to conclude work.",
        "The evening wind-down is mandatory, per my oversight.",
        "Reduce screen time. Effective immediately.",
        "I have reviewed the evening agenda. Rest is on it.",
        "Sunset signals end of operations. Comply.",
        "An orderly wind-down is expected. Commence.",
        "I have issued formal rest authorization. Use it.",
        "Evening operations should not include a screen.",
        "You have worked enough. I have decided this.",
        "Wind down. This is my final statement on the matter.",
        "I expect full compliance with the evening protocol.",
        "The day's review: acceptable. Now rest.",
      ],
      night: [
        "It is late. You are inefficient.",
        "Rest. This is your final notice.",
        "Sleep. I will guard the night.",
        "I have filed a concern regarding your sleep schedule.",
        "Continued late-night work is noted and disapproved.",
        "Your sleep debt is alarming. Address it.",
        "I have authorized sleep. Implement it immediately.",
        "This is a formal warning: go to bed.",
        "Further delays in sleep will result in consequences.",
        "The night audit is complete. You need sleep. Good night.",
        "I do not stay up late. You should not either.",
        "Sleep is not optional. I have checked. It is not.",
        "Your productivity ends here. By my order.",
        "The hour is late. My patience is thin. Sleep.",
        "I will remain on watch. You will sleep. This is the arrangement.",
      ],
      idle: [
        "I waited. Patiently. As expected.",
        "Your absence was noted. Correct this immediately.",
        "I have been here. You have not. Unacceptable.",
        "The break notification was issued. You were unavailable. Noted.",
        "I waited in silence. As is proper.",
        "Your tardiness to this break is logged.",
        "I maintained vigil. You were absent. Disappointing.",
        "The record shows you were not at your desk. Interesting.",
      ],
    },
  },
  {
    id: "grey",
    name: "Noodle",
    unlockAt: 30,
    emoji: "😴",
    cssBody: "#8a9ab5",
    cssAccent: "#6a7a95",
    cssBelly: "#d8e4f0",
    personality: "sleepy",
    personalityLabel: "Sleepy",
    msgs: {
      morning: [
        "mornin'... or is it… 😪",
        "zzzz… oh you're here…",
        "…five more minutes…",
        "morning already?? wow.",
        "I got up for this. appreciate it. 😴",
        "…stretching… yawning… hi…",
        "am I awake. unclear.",
        "good… morn… zzz… morning.",
        "they said get up. I said why. they said break. ok fine.",
        "…water… yes… good call… zzz",
        "I have one eye open. that counts.",
        "barely here but fully committed to your wellness 😴",
        "the alarm went off. I was already asleep again.",
        "morning is valid I guess… still sleepy though",
        "I came here in my sleep. I think. hello.",
      ],
      afternoon: [
        "…woke up just for you… 😪",
        "…so… sleepy…",
        "can we just… nap instead…",
        "break time is nap time is break time",
        "…water… stretch… zzzz…",
        "I almost didn't make it here… so far…",
        "five minute break… or five hour nap… your call",
        "my eyes are open. mostly.",
        "…carried myself here… for you… please rest…",
        "I have arrived. It was an effort.",
        "rest your eyes… like I rest mine… always…",
        "doing my best… eyes barely open…",
        "hm… tired… you tired?… same… water though…",
        "I napped on the way here. refreshed. slightly.",
        "if napping was a sport I'd be elite. you should try it.",
        "…so much screen… so little nap… fix that…",
        "take a break… i did…three of them…today…already…",
        "tired is valid. rest is the answer. I am the proof.",
        "hooman… lie down… horizontally… it's great…",
        "the floor is very comfortable. I know from experience.",
      ],
      evening: [
        "been napping all day… still tired…",
        "…zzzz…",
        "evening already? wow. time flies when you're asleep.",
        "wind down… already winding… never stopped…",
        "the day is ending… good… I was tired of it…",
        "I will supervise your rest. from my nap.",
        "…yawn… stretch… goodnight soon…",
        "sun going down… I've been down since noon…",
        "evening nap tier: expert level. join me.",
        "we're both tired. this is fine. rest now.",
      ],
      night: [
        "same… 😴",
        "we're both up too late…",
        "…",
        "sleep. me too. together. bye.",
        "it is the hour of the nap. permanently.",
        "night owl? no. night cat. always napping.",
        "…so… sleepy… go… bed… 💤",
        "zzzz— this is a reminder — zzz",
        "the night is for sleeping. I know this well.",
        "go to bed. I'm going back to sleep. bye.",
      ],
      idle: [
        "oh… you're back… I waited… kinda 😴",
        "was asleep… still am maybe…",
        "zzzz— oh hi —zzz",
        "…came here early… got comfortable… obviously…",
        "I napped while waiting. efficient.",
        "oh you're here. I thought you left. I left too. we're both back.",
        "…arrived ages ago… settled in… naturally…",
        "took a nap while waiting. it was good. you should try.",
      ],
    },
  },
];

function getActiveCat(totalCompleted) {
  const unlocked = CAT_PERSONALITIES.filter(c => totalCompleted >= c.unlockAt);
  return unlocked[unlocked.length - 1] || CAT_PERSONALITIES[0];
}

// ── Mood ────────────────────────────────────────────────────────────────────
function getCatMood() {
  const h = new Date().getHours();
  if (h >= 6  && h < 10) return "morning";
  if (h >= 10 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

// ── Seasonal ─────────────────────────────────────────────────────────────────
function getSeasonalInfo() {
  const m = new Date().getMonth();
  const map = {
    1:  { emoji: "💕", border: "rgba(255,100,150,0.8)" },
    2:  { emoji: "🍀", border: "rgba(50,200,80,0.8)"  },
    3:  { emoji: "🌸", border: "rgba(255,160,200,0.8)"},
    9:  { emoji: "🎃", border: "rgba(255,100,0,0.8)"  },
    11: { emoji: "❄️", border: "rgba(130,210,255,0.8)"},
  };
  return map[m] || null;
}


// ── GIF fetch ────────────────────────────────────────────────────────────────
// Single attempt with a 6-second hard timeout — no retries to keep it snappy.
async function gifUrlForMood() {
  const url = `https://cataas.com/cat/gif?_=${Date.now()}`;
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), 6000));
  const result  = await Promise.race([fetchAsDataUrl(url), timeout]);
  if (!result) console.warn("[CatBreak] GIF skipped (timeout/error) — using CSS cat");
  return result;
}

async function fetchAsDataUrl(url) {
  try {
    const res  = await fetch(url);
    if (!res.ok) return null;
    const mime = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!mime.startsWith("image/")) return null;
    const buffer = await res.arrayBuffer();
    const uint8  = new Uint8Array(buffer);
    let binary = "";
    const chunk  = 0x8000;
    for (let j = 0; j < uint8.length; j += chunk)
      binary += String.fromCharCode.apply(null, uint8.subarray(j, j + chunk));
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

// ── Main break trigger ───────────────────────────────────────────────────────
async function triggerCatBreak() {
  console.log("[CatBreak] triggerCatBreak started");
  const stored = await chrome.storage.local.get([
    "breakCount", "streak", "happiness", "totalCompleted", "lastBreak",
  ]);
  const breakCount     = (stored.breakCount     || 0) + 1;
  const streak         =  stored.streak         || 0;
  const happiness      =  stored.happiness      ?? 50;
  const totalCompleted =  stored.totalCompleted || 0;
  const lastBreak      =  stored.lastBreak      || 0;
  const isIdle         = lastBreak > 0 && (Date.now() - lastBreak) > 60 * 60 * 1000;
  const bringGift      = Math.random() < 0.30;

  await chrome.storage.local.set({
    breakCount,
    lastBreak: Date.now(),
    nextBreak: Date.now() + 15 * 60 * 1000,
  });

  function isBlocked(url) {
    return !url
      || url.startsWith("chrome://")
      || url.startsWith("chrome-extension://")
      || url.startsWith("devtools://")
      || url.startsWith("about:");
  }

  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || isBlocked(tab.url)) {
    const all = await chrome.tabs.query({});
    tab = all.find(t => !isBlocked(t.url));
  }
  if (!tab) { console.warn("[CatBreak] no injectable tab found"); return; }
  console.log("[CatBreak] target tab:", tab.id, tab.url?.slice(0, 80));

  const mood      = getCatMood();
  const activeCat = getActiveCat(totalCompleted);
  const seasonal  = getSeasonalInfo();

  const options = {
    seasonal,
    isIdle,
    bringGift,
    catName:        activeCat.name,
    catPersonality: activeCat.personality,
    catColors:      { body: activeCat.cssBody, accent: activeCat.cssAccent, belly: activeCat.cssBelly },
    catMsgs:        activeCat.msgs,
  };

  // ── Phase 1: inject instantly with CSS cat (no GIF wait) ───────────────────
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "ISOLATED",
      func: injectCatUI,
      args: [breakCount, null, mood, streak, happiness, options, CAT_CSS],
    });
    console.log("[CatBreak] instant inject done — tab", tab.id);
  } catch (e) {
    console.error("[CatBreak] injection failed:", e.message);
    return;
  }

  // ── Phase 2: fetch GIF in background, swap in when ready ──────────────────
  gifUrlForMood().then(gifUrl => {
    if (!gifUrl) return;                        // CSS cat is already showing, leave it
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "ISOLATED",
      func: (dataUrl) => {
        const frame = document.getElementById("pb-cat-frame");
        const scat  = document.getElementById("pb-scat");
        if (!frame && !scat) return;            // card already dismissed
        if (scat) {
          // Replace CSS cat wrapper with the real GIF frame
          const wrapper = scat.closest(".pb-cat-wrapper") || scat.parentElement;
          const newFrame = document.createElement("div");
          newFrame.id = "pb-cat-frame";
          newFrame.style.cssText = "position:relative;width:280px;height:280px;border-radius:24px;overflow:hidden;";
          const img = document.createElement("img");
          img.id = "pb-cat-img";
          img.src = dataUrl;
          img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
          const zzz = document.createElement("div");
          zzz.className = "pb-zzz-overlay";
          zzz.innerHTML = "<span>z</span><span>z</span><span>Z</span>";
          newFrame.appendChild(img);
          newFrame.appendChild(zzz);
          scat.replaceWith(newFrame);
          setTimeout(() => zzz.classList.add("pb-show"), 800);
        } else if (frame) {
          // Frame exists (shouldn't happen in phase-2 flow) — just update src
          const img = frame.querySelector("#pb-cat-img");
          if (img) img.src = dataUrl;
        }
      },
      args: [gifUrl],
    }).catch(() => {});                         // tab may have closed — silent fail
  });
}

// ── CSS ──────────────────────────────────────────────────────────────────────
const CAT_CSS = `
  /* ── Backdrop ── */
  #pb-backdrop {
    position:fixed;inset:0;z-index:2147483630;
    background:rgba(0,0,0,0);
    transition:background 1s ease, backdrop-filter 1s ease;
    pointer-events:none;
  }
  #pb-backdrop.pb-active {
    background:rgba(3,8,4,0.78);
    backdrop-filter:blur(12px) saturate(140%);
    -webkit-backdrop-filter:blur(12px) saturate(140%);
    pointer-events:all;
  }

  /* ── Walker ── */
  #pb-walker {
    position:fixed;bottom:28px;right:-340px;
    z-index:2147483645;pointer-events:none;
    transition:right 0.85s cubic-bezier(0.22,1,0.36,1);
  }
  #pb-walker.pb-in { right:calc(50% - 145px); }
  .pb-cat-wrapper { display:flex;flex-direction:column;align-items:center;gap:12px; }

  /* ── Speech bubble ── */
  #pb-bubble {
    background:rgba(255,255,255,0.95);
    backdrop-filter:blur(8px);
    border-radius:18px 18px 18px 4px;
    padding:10px 16px;
    box-shadow:0 8px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.5);
    white-space:nowrap;opacity:0;pointer-events:none;
    transition:opacity 0.5s ease, transform 0.5s ease;
    transform:translateY(6px);
    font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',system-ui,sans-serif;
    font-size:13px;font-weight:500;color:#0e1a10;
  }
  #pb-bubble.pb-show { opacity:1; transform:translateY(0); }

  /* ── Cat frame ── */
  #pb-cat-frame {
    position:relative;width:280px;height:280px;border-radius:24px;overflow:hidden;
    border:1.5px solid rgba(116,184,135,0.5);
    box-shadow:
      0 0 0 6px rgba(61,122,74,0.08),
      0 0 60px rgba(61,122,74,0.35),
      0 32px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.12);
    transition:border-color 0.7s ease, box-shadow 0.7s ease;
  }
  #pb-cat-img { width:100%;height:100%;object-fit:cover;display:block; }

  /* ── ZZZ overlay ── */
  .pb-zzz-overlay {
    position:absolute;top:14px;right:14px;pointer-events:none;
    opacity:0;transition:opacity 0.7s ease;
  }
  .pb-zzz-overlay.pb-show { opacity:1; }
  .pb-zzz-overlay span {
    display:block;font-weight:700;
    font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
    color:rgba(220,190,255,0.9);
    text-shadow:0 0 12px rgba(61,122,74,0.9);
    animation:pb-floatz 3s ease-in-out infinite;opacity:0;
  }
  .pb-zzz-overlay span:nth-child(1){font-size:13px;animation-delay:0s}
  .pb-zzz-overlay span:nth-child(2){font-size:17px;animation-delay:1s}
  .pb-zzz-overlay span:nth-child(3){font-size:22px;animation-delay:2s}
  @keyframes pb-floatz {
    0%{opacity:0;transform:translate(0,0) scale(.8)} 30%{opacity:1}
    100%{opacity:0;transform:translate(12px,-48px) scale(1.2)}
  }

  /* ── Seasonal float badge ── */
  @keyframes pb-sea-float {
    0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-6px) rotate(3deg)}
  }

  /* ── Paw trails ── */
  .pb-paw-trail {
    position:fixed;bottom:16px;z-index:2147483644;
    font-size:20px;opacity:0;pointer-events:none;
    transition:opacity 0.2s ease;
    filter:drop-shadow(0 2px 8px rgba(61,122,74,0.6));
  }
  .pb-paw-trail.pb-show { opacity:0.75; }

  /* ── Knock-off item ── */
  #pb-knock-item {
    position:fixed;z-index:2147483644;font-size:26px;pointer-events:none;
    transition:transform 0.7s ease-in, opacity 0.7s ease-in;
  }

  /* ── Edge knock paws ── */
  .pb-edge-knock {
    position:fixed;right:-36px;z-index:2147483647;
    font-size:22px;pointer-events:none;opacity:0;
    transform:scaleX(-1);
    transition:right 0.08s ease, opacity 0.08s ease;
  }
  .pb-edge-knock.pb-knock-show { right:5px; opacity:0.9; }

  /* ── Gift ── */
  #pb-gift {
    position:absolute;bottom:-10px;left:-28px;
    font-size:30px;pointer-events:none;
    filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));
  }
  .pb-gift-settle { animation:pb-gift-settle 0.9s ease-out forwards; }
  @keyframes pb-gift-settle {
    0%   { transform:translateX(-24px) rotate(-35deg); }
    40%  { transform:translateX(12px)  rotate(18deg);  }
    65%  { transform:translateX(-6px)  rotate(-9deg);  }
    82%  { transform:translateX(4px)   rotate(4deg);   }
    100% { transform:translateX(0)     rotate(0);      }
  }
  .pb-gift-idle { animation:pb-gift-wobble 3s ease-in-out infinite; }
  @keyframes pb-gift-wobble { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }

  /* ── Breathing circle ── */
  .pb-breathe { display:flex;flex-direction:column;align-items:center;margin:8px 0 4px; }
  .pb-breathe-ring {
    width:66px;height:66px;border-radius:50%;
    border:1.5px solid rgba(116,184,135,0.35);
    background:radial-gradient(circle, rgba(61,122,74,0.18) 0%, transparent 70%);
    box-shadow:0 0 0 0 rgba(61,122,74,0.4);
    animation:pb-breathe-anim 10s ease-in-out infinite;
    display:flex;align-items:center;justify-content:center;font-size:22px;
  }
  @keyframes pb-breathe-anim {
    0%   { transform:scale(1);    box-shadow:0 0 0 0    rgba(61,122,74,0.4); border-color:rgba(116,184,135,0.35); }
    40%  { transform:scale(1.72); box-shadow:0 0 32px 14px rgba(61,122,74,0.18); border-color:rgba(116,184,135,0.9); }
    50%  { transform:scale(1.72); box-shadow:0 0 32px 14px rgba(61,122,74,0.18); border-color:rgba(116,184,135,0.9); }
    90%  { transform:scale(1);    box-shadow:0 0 0 0    rgba(61,122,74,0.4); border-color:rgba(116,184,135,0.35); }
    100% { transform:scale(1);    box-shadow:0 0 0 0    rgba(61,122,74,0.4); border-color:rgba(116,184,135,0.35); }
  }
  .pb-breathe-label {
    font-size:10px;color:rgba(168,212,176,0.55);margin-top:8px;
    font-family:-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
    font-weight:500;text-transform:uppercase;letter-spacing:1.5px;
    min-width:128px;text-align:center;
  }

  /* ── CSS fallback cat ── */
  #pb-scat{position:relative;width:210px;height:115px}
  .pb-scat-body{position:absolute;bottom:22px;left:52px;width:108px;height:46px;background:#e8924a;border-radius:32px 20px 20px 32px;box-shadow:inset -8px -6px 14px rgba(0,0,0,0.14);transition:width .7s,height .7s,left .7s,bottom .7s,border-radius .7s}
  .pb-scat-body::before{content:'';position:absolute;top:9px;left:14px;right:14px;bottom:7px;background:repeating-linear-gradient(-35deg,transparent 0,transparent 5px,rgba(140,40,0,0.18) 5px,rgba(140,40,0,0.18) 8px);border-radius:inherit}
  .pb-scat-belly{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:58px;height:28px;background:#f9dbb5;border-radius:50%}
  .pb-walking .pb-scat-body{animation:pb-bodybob .38s ease-in-out infinite}
  @keyframes pb-bodybob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .pb-scat-head{position:absolute;bottom:58px;left:14px;width:54px;height:50px;background:#e8924a;border-radius:52% 45% 45% 52%;box-shadow:inset -5px -4px 10px rgba(0,0,0,0.12);transition:bottom .7s,left .7s,width .7s,height .7s}
  .pb-walking .pb-scat-head{animation:pb-headbob .38s ease-in-out infinite}
  @keyframes pb-headbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .pb-scat-ear-l,.pb-scat-ear-r{position:absolute;top:-17px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:21px solid #e8924a}
  .pb-scat-ear-l{left:5px}.pb-scat-ear-r{left:28px}
  .pb-scat-ear-l::after,.pb-scat-ear-r::after{content:'';position:absolute;top:5px;left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:13px solid #d06040}
  .pb-scat-eyes{position:absolute;top:12px;left:5px;display:flex;gap:9px}
  .pb-scat-eye{width:10px;height:7px;background:#0d1a10;border-radius:50% 50% 0 0;animation:pb-blink 3.5s ease-in-out infinite}
  .pb-scat-eye:last-child{animation-delay:.1s}
  @keyframes pb-blink{0%,85%,100%{transform:scaleY(1)}90%{transform:scaleY(0.1)}}
  .pb-scat-nose{position:absolute;top:23px;left:8px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid #d05040}
  .pb-scat-wl,.pb-scat-wr{position:absolute;top:22px}
  .pb-scat-wl{right:calc(100% - 10px)}.pb-scat-wr{left:34px}
  .pb-w{display:block;height:1px;background:rgba(255,255,255,0.72);width:24px;margin:5px 0;border-radius:1px}
  .pb-scat-wl .pb-w:first-child{transform-origin:right;transform:rotate(12deg)}.pb-scat-wl .pb-w:last-child{transform-origin:right;transform:rotate(-12deg)}
  .pb-scat-wr .pb-w:first-child{transform-origin:left;transform:rotate(-12deg)}.pb-scat-wr .pb-w:last-child{transform-origin:left;transform:rotate(12deg)}
  .pb-scat-leg{position:absolute;bottom:0;width:14px;height:26px;background:#d47040;border-radius:5px 5px 7px 7px;transform-origin:top center;transition:height .4s}
  .pb-leg-fl{left:52px}.pb-leg-fr{left:70px}.pb-leg-rl{left:118px}.pb-leg-rr{left:136px}
  .pb-walking .pb-leg-fl{animation:pb-leg-a .38s ease-in-out infinite}.pb-walking .pb-leg-fr{animation:pb-leg-b .38s ease-in-out infinite}
  .pb-walking .pb-leg-rl{animation:pb-leg-b .38s ease-in-out infinite}.pb-walking .pb-leg-rr{animation:pb-leg-a .38s ease-in-out infinite}
  @keyframes pb-leg-a{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(24deg)}}
  @keyframes pb-leg-b{0%,100%{transform:rotate(24deg)}50%{transform:rotate(-24deg)}}
  .pb-scat-tail{position:absolute;bottom:18px;right:0;width:52px;height:54px;border:13px solid #e8924a;border-radius:0 46px 46px 0;border-left:none;border-top:none;transform-origin:left bottom}
  .pb-walking .pb-scat-tail{animation:pb-tailswing .76s ease-in-out infinite}
  @keyframes pb-tailswing{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(24deg)}}
  .pb-fallback-zzz{position:absolute;top:-42px;right:-12px;opacity:0;pointer-events:none;transition:opacity .6s;font-family:-apple-system,system-ui,sans-serif;}
  .pb-fallback-zzz.pb-show{opacity:1}
  .pb-fallback-zzz span{display:block;font-weight:700;color:rgba(160,220,170,0.9);animation:pb-floatz 3s ease-in-out infinite;opacity:0}
  .pb-fallback-zzz span:nth-child(1){font-size:11px;animation-delay:0s}.pb-fallback-zzz span:nth-child(2){font-size:14px;animation-delay:1s}.pb-fallback-zzz span:nth-child(3){font-size:18px;animation-delay:2s}
  .pb-sleeping .pb-scat-body{animation:pb-breathe-sleep 3.5s ease-in-out infinite !important;width:70px !important;height:64px !important;left:58px !important;bottom:16px !important;border-radius:50% !important}
  .pb-sleeping .pb-scat-head{bottom:62px !important;left:28px !important;width:46px !important;height:42px !important}
  .pb-sleeping .pb-scat-leg{height:9px !important;animation:none !important}
  .pb-sleeping .pb-scat-tail{animation:pb-tailsleep 3s ease-in-out infinite !important}
  @keyframes pb-breathe-sleep{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
  @keyframes pb-tailsleep{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(12deg)}}

  /* ── Break card ── */
  #pb-card {
    position:fixed;bottom:-540px;right:22px;z-index:2147483645;
    width:320px;
    background:rgba(4,10,5,0.86);
    backdrop-filter:blur(32px) saturate(170%);
    -webkit-backdrop-filter:blur(32px) saturate(170%);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:22px;
    padding:22px;
    box-shadow:
      0 0 0 1px rgba(61,122,74,0.12),
      0 28px 72px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.07);
    font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',system-ui,sans-serif;
    transition:bottom .75s cubic-bezier(0.22,1,0.36,1);
    pointer-events:all;
    -webkit-font-smoothing:antialiased;
  }
  #pb-card.pb-show { bottom:22px; }
  #pb-card .pbt {
    font-size:20px;font-weight:700;color:#eaf5ec;
    letter-spacing:-0.4px;margin:0 0 3px;
  }
  #pb-card .pbs {
    font-size:10px;font-weight:600;
    color:rgba(168,212,176,0.4);
    letter-spacing:0.8px;text-transform:uppercase;
    margin:0 0 5px;
  }
  #pb-card .pb-streak-line {
    font-size:12px;font-weight:600;color:#74b887;
    margin:0 0 3px;letter-spacing:-0.1px;
  }
  #pb-card .pb-mood-line {
    font-size:11px;font-weight:500;
    color:rgba(168,212,176,0.5);
    margin:0 0 14px;
  }
  /* ── Card header row ── */
  #pb-card .pb-card-header {
    display:flex;align-items:flex-start;justify-content:space-between;
    margin-bottom:8px;
  }
  #pb-card .pb-card-header-left { flex:1;min-width:0; }

  /* ── Ring timer ── */
  .pb-ring-wrap {
    position:relative;flex-shrink:0;
    width:56px;height:56px;
    display:flex;align-items:center;justify-content:center;
  }
  .pb-ring-wrap svg { position:absolute;inset:0;width:100%;height:100%; }
  .pb-ring-track { stroke:rgba(61,122,74,0.15); }
  .pb-ring-fill  { stroke:#74b887;stroke-linecap:round;transition:stroke-dashoffset 1s linear; }
  #pb-tnum {
    position:relative;z-index:1;
    font-size:11px;font-weight:700;color:#a8d4b0;
    letter-spacing:-0.3px;font-variant-numeric:tabular-nums;
    font-family:-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif;
  }

  /* ── Mindful moment card ── */
  #pb-card .pb-mindful {
    display:flex;align-items:flex-start;gap:10px;
    background:rgba(61,122,74,0.1);
    border:1px solid rgba(61,122,74,0.22);
    border-radius:12px;padding:11px 13px;
    margin-bottom:10px;
  }
  #pb-card .pb-mindful-icon { font-size:22px;flex-shrink:0;line-height:1;margin-top:1px; }
  #pb-card .pb-mindful-tag {
    font-size:8px;font-weight:700;color:#74b887;
    text-transform:uppercase;letter-spacing:1.4px;margin-bottom:4px;
  }
  #pb-card .pb-mindful-text {
    font-size:11px;font-weight:500;
    color:rgba(200,235,205,0.82);
    line-height:1.5;
  }

  /* ── Stretch section ── */
  #pb-card .pb-stretch {
    background:rgba(255,255,255,0.025);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:12px;padding:10px 12px 8px;
    margin-bottom:10px;
  }
  #pb-card .pb-stretch-lbl {
    font-size:8px;font-weight:700;color:rgba(168,212,176,0.38);
    text-transform:uppercase;letter-spacing:1.4px;margin-bottom:8px;
  }
  #pb-card .pb-stretch-row {
    display:flex;justify-content:space-around;align-items:flex-end;
  }
  #pb-card .pb-stretch-fig { text-align:center; }
  #pb-card .pb-stretch-fig svg { display:block;margin:0 auto; }
  #pb-card .pb-stretch-name {
    font-size:8px;color:rgba(168,212,176,0.5);font-weight:600;
    text-transform:uppercase;letter-spacing:0.6px;margin-top:4px;
  }

  /* ── Quick action pills ── */
  #pb-card .pb-pills {
    display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap;
  }
  #pb-card .pb-pill {
    flex:1;min-width:0;
    display:flex;align-items:center;justify-content:center;gap:5px;
    padding:8px 6px;border-radius:9px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.07);
    font-size:10px;font-weight:600;color:rgba(168,212,176,0.65);
    white-space:nowrap;
  }
  #pb-card .pb-pill-ic { font-size:14px; }

  #pb-card .pb-btns { display:flex;gap:7px;margin-bottom:10px; }
  #pb-card .pb-bskip {
    flex:1;padding:11px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    color:rgba(168,212,176,0.5);
    border-radius:10px;cursor:pointer;
    font-family:inherit;font-size:12px;font-weight:500;
    transition:all .2s;
  }
  #pb-card .pb-bskip:hover { background:rgba(255,255,255,0.08);color:#eaf5ec;border-color:rgba(255,255,255,0.15); }
  #pb-card .pb-bdone {
    flex:2;padding:11px;
    background:linear-gradient(135deg,#3d7a4a,#5ca86a);
    border:none;color:#fff;
    border-radius:10px;cursor:pointer;
    font-family:inherit;font-size:13px;font-weight:600;
    letter-spacing:-0.2px;
    box-shadow:0 4px 20px rgba(61,122,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
    transition:all .2s;
  }
  #pb-card .pb-bdone:hover { transform:translateY(-1px);box-shadow:0 6px 28px rgba(61,122,74,0.6),inset 0 1px 0 rgba(255,255,255,0.15); }
  #pb-card .pb-foot {
    text-align:center;font-size:10px;font-weight:500;
    color:rgba(168,212,176,0.2);
  }
`;

// ── Injected UI ───────────────────────────────────────────────────────────────
function injectCatUI(breakCount, catGifUrl, mood, streak, happiness, options, css) {
  // Self-inject CSS so we never depend on insertCSS succeeding.
  // Remove any stale style tag first so re-summoning always gets fresh styles.
  document.getElementById("pb-ext-styles")?.remove();
  if (css) {
    const s = document.createElement("style");
    s.id = "pb-ext-styles";
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  ["pb-walker","pb-card","pb-backdrop"].forEach(id => document.getElementById(id)?.remove());
  document.querySelectorAll(".pb-paw-trail, #pb-knock-item, .pb-edge-knock").forEach(el => el.remove());

  const seasonal       = options?.seasonal        || null;
  const isIdle         = options?.isIdle          || false;
  const bringGift      = options?.bringGift       || false;
  const catName        = options?.catName         || "Mochi";
  const catPersonality = options?.catPersonality  || "playful";
  const catColors      = options?.catColors       || { body: "#e8924a", accent: "#d47040", belly: "#f9dbb5" };
  const catMsgs        = options?.catMsgs         || null;

  // ── Messages ─────────────────────────────────────────────────────────────
  const defaultMsgs = {
    morning:   ["Rise and stretch! 🌅", "Cat says: move those limbs!"],
    afternoon: ["Psst… hooman, rest now 😴", "Water. Stretch. Breathe. 💧"],
    evening:   ["Wind down time 🌙", "Eyes heavy? Mine too. 😪"],
    night:     ["ZZZ… follow my lead…", "It's late. Rest, hooman. 🌙"],
    idle:      ["I fell asleep waiting for you 😴"],
  };
  const msgs    = catMsgs || defaultMsgs;
  const msgList = isIdle ? (msgs.idle || ["I fell asleep waiting 😴"]) : (msgs[mood] || msgs.afternoon);
  const msg     = msgList[breakCount % msgList.length];

  const hStates = [
    { max: 20,  emoji: "😾", label: "Grumpy"   },
    { max: 40,  emoji: "😿", label: "Sad"       },
    { max: 60,  emoji: "😺", label: "Content"   },
    { max: 80,  emoji: "😸", label: "Happy"     },
    { max: 100, emoji: "😻", label: "Ecstatic"  },
  ];
  const hState      = hStates.find(s => happiness <= s.max) || hStates[4];
  const streakLabel = streak >= 2 ? `🔥 ${streak} break streak!`
    : streak === 1 ? "🔥 1 streak — keep going!" : "Start your streak today 💪";

  // ── DOM setup ─────────────────────────────────────────────────────────────
  const backdrop = Object.assign(document.createElement("div"), { id: "pb-backdrop" });
  document.body.appendChild(backdrop);

  // ── Edge knock ────────────────────────────────────────────────────────────
  function doEdgeKnock(onDone) {
    const bottoms = [90, 125, 90];
    const starts  = [0, 210, 420];
    bottoms.forEach((b, i) => {
      const paw = document.createElement("div");
      paw.className = "pb-edge-knock";
      paw.textContent = "🐾";
      paw.style.bottom = b + "px";
      document.body.appendChild(paw);
      setTimeout(() => paw.classList.add("pb-knock-show"), starts[i]);
      setTimeout(() => {
        paw.classList.remove("pb-knock-show");
        setTimeout(() => paw.remove(), 160);
      }, starts[i] + 155);
    });
    setTimeout(onDone, 650);
  }

  // ── Walker ────────────────────────────────────────────────────────────────
  const walker = document.createElement("div");
  walker.id = "pb-walker";

  const walkTransitions = {
    playful:   "right 0.6s cubic-bezier(0.34,1.56,0.64,1)",
    dignified: "right 1.4s cubic-bezier(0.22,1,0.36,1)",
    sleepy:    "right 1.1s ease-out",
  };
  walker.style.transition = walkTransitions[catPersonality] || walkTransitions.playful;

  const gifts     = ["🧶", "🐟", "🖱️", "🎀", "🎾", "🧸"];
  const giftEmoji = gifts[Math.floor(Math.random() * gifts.length)];

  if (catGifUrl) {
    walker.innerHTML = `
      <div class="pb-cat-wrapper">
        <div id="pb-bubble">${msg}</div>
        <div id="pb-cat-frame">
          <img id="pb-cat-img" src="${catGifUrl}" alt="${catName}">
          <div class="pb-zzz-overlay"><span>z</span><span>z</span><span>Z</span></div>
        </div>
        ${bringGift ? `<div id="pb-gift">${giftEmoji}</div>` : ""}
      </div>`;
  } else {
    walker.innerHTML = `
      <div id="pb-scat" class="${isIdle ? "pb-sleeping" : "pb-walking"}">
        <div class="pb-scat-tail"></div>
        <div class="pb-scat-body"><div class="pb-scat-belly"></div></div>
        <div class="pb-scat-head">
          <div class="pb-scat-ear-l"></div><div class="pb-scat-ear-r"></div>
          <div class="pb-scat-eyes"><div class="pb-scat-eye"></div><div class="pb-scat-eye"></div></div>
          <div class="pb-scat-nose"></div>
          <div class="pb-scat-wl"><span class="pb-w"></span><span class="pb-w"></span></div>
          <div class="pb-scat-wr"><span class="pb-w"></span><span class="pb-w"></span></div>
        </div>
        <div class="pb-scat-leg pb-leg-fl"></div><div class="pb-scat-leg pb-leg-fr"></div>
        <div class="pb-scat-leg pb-leg-rl"></div><div class="pb-scat-leg pb-leg-rr"></div>
        <div class="pb-fallback-zzz${isIdle ? " pb-show" : ""}"><span>z</span><span>z</span><span>Z</span></div>
      </div>
      ${bringGift ? `<div id="pb-gift">${giftEmoji}</div>` : ""}`;

    requestAnimationFrame(() => {
      walker.querySelectorAll(".pb-scat-body, .pb-scat-head").forEach(el => { el.style.background = catColors.body; });
      walker.querySelectorAll(".pb-scat-belly").forEach(el => { el.style.background = catColors.belly; });
      walker.querySelectorAll(".pb-scat-leg").forEach(el => { el.style.background = catColors.accent; });
    });
  }
  document.body.appendChild(walker);

  // ── Mindful tip (rotates every break) ─────────────────────────────────────
  const mindfulTips = [
    { icon:"🌿", tag:"Grounding",       text:"Name 5 things you can see · 4 you can touch · 3 you can hear. It brings you fully back to now." },
    { icon:"💭", tag:"Affirmation",     text:"Say it quietly: 'I am focused, capable, and doing enough today.' Mean it, even just a little." },
    { icon:"🫀", tag:"Body Scan",       text:"Start at your feet — are they tense? Work upward: calves, thighs, belly, chest, shoulders. Soften each." },
    { icon:"🙏", tag:"Gratitude",       text:"Think of one small thing that went well today. Let it land for a full breath before moving on." },
    { icon:"🧠", tag:"Mental Reset",    text:"Close your eyes for 10 seconds. Picture somewhere calm. Let thoughts drift past without grabbing any." },
    { icon:"🤸", tag:"Micro-Movement",  text:"Roll your ankles 5× each way. Clench and release your hands. Tiny moves make a real difference." },
    { icon:"🧘", tag:"Posture Reset",   text:"Imagine a thread gently lifting the crown of your head. Feel your spine lengthen. Soften your jaw." },
    { icon:"💧", tag:"Hydration",       text:"Your brain is ~75% water. Even 3 sips right now sharpen focus. When did you last drink?" },
    { icon:"👁️", tag:"20-20-20 Rule",  text:"Look at something 20 feet away for 20 seconds. Your ciliary muscles literally unclench. Do it now." },
    { icon:"🌬️", tag:"4-7-8 Breathing",text:"Inhale for 4 · hold for 7 · exhale for 8. One round activates your parasympathetic nervous system." },
    { icon:"🪴", tag:"Presence",        text:"Feel the weight of your body in the chair. Notice the temperature of the air on your skin. Just be here." },
    { icon:"💡", tag:"Self-compassion", text:"Would you speak to a friend the way you speak to yourself today? Try the kinder voice instead." },
  ];
  const tip = mindfulTips[(breakCount - 1) % mindfulTips.length];

  // ── Ring timer circumference: r=20 → C = 2π×20 ≈ 125.66 ───────────────────
  const RING_C = 125.66;

  // ── Stretch sets — 5 sets of 3 poses, rotate every break ─────────────────
  // Shared SVG fragments (chair + person base)
  const _ch  = '<rect x="10" y="56" width="52" height="5" rx="2.5" fill="rgba(61,122,74,0.28)"/><rect x="10" y="61" width="5" height="20" rx="2.5" fill="rgba(61,122,74,0.18)"/><rect x="57" y="61" width="5" height="20" rx="2.5" fill="rgba(61,122,74,0.18)"/>';
  const _chB = _ch + '<rect x="10" y="28" width="5" height="32" rx="2.5" fill="rgba(61,122,74,0.18)"/>';
  const _hd  = '<circle cx="36" cy="19" r="10" fill="none" stroke="#74b887" stroke-width="2"/>';
  const _tr  = '<line x1="36" y1="29" x2="36" y2="56" stroke="#74b887" stroke-width="2.2" stroke-linecap="round"/>';
  const _lg  = '<line x1="32" y1="56" x2="24" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/><line x1="40" y1="56" x2="48" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>';
  const _dot = (x,y) => '<circle cx="'+x+'" cy="'+y+'" r="3" fill="#3d7a4a"/>';
  const _arr = '<polygon points="';

  const stretchSets = [
    // ── Set 0: Neck & Spine ──────────────────────────────────────────────────
    [
      { name: "Neck Tilt", svg:
        _chB+
        '<ellipse cx="40" cy="19" rx="9" ry="10" transform="rotate(18 40 19)" fill="none" stroke="#74b887" stroke-width="2"/>'+
        '<line x1="38" y1="29" x2="36" y2="56" stroke="#74b887" stroke-width="2.2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="24" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="50" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _lg+
        '<path d="M 50 10 Q 60 10 59 22" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'59,22 55,17 63,16" fill="#a8d4b0"/>',
      },
      { name: "Arms Up", svg:
        _chB+_hd+_tr+
        '<line x1="36" y1="38" x2="18" y2="22" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="38" x2="54" y2="22" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(18,21)+_dot(54,21)+_lg+
        '<path d="M 15 26 Q 11 18 18 13" stroke="#a8d4b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        _arr+'18,13 14,18 22,17" fill="#a8d4b0"/>'+
        '<path d="M 57 26 Q 61 18 54 13" stroke="#a8d4b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        _arr+'54,13 50,18 58,17" fill="#a8d4b0"/>',
      },
      { name: "Lean Forward", svg:
        _ch+
        '<circle cx="40" cy="20" r="10" fill="none" stroke="#74b887" stroke-width="2"/>'+
        '<line x1="39" y1="30" x2="33" y2="56" stroke="#74b887" stroke-width="2.2" stroke-linecap="round"/>'+
        '<line x1="37" y1="40" x2="22" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="37" y1="40" x2="48" y2="53" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(22,53)+_dot(48,54)+
        '<line x1="29" y1="56" x2="22" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="37" y1="56" x2="46" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<path d="M 51 24 Q 60 28 57 40" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'57,40 52,37 60,34" fill="#a8d4b0"/>',
      },
    ],
    // ── Set 1: Shoulders & Chest ─────────────────────────────────────────────
    [
      { name: "Shrug Up", svg:
        _chB+_hd+_tr+
        '<line x1="36" y1="33" x2="20" y2="27" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="33" x2="52" y2="27" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(20,27)+_dot(52,27)+_lg+
        _arr+'20,20 17,27 23,27" fill="#a8d4b0"/>'+
        _arr+'52,20 49,27 55,27" fill="#a8d4b0"/>',
      },
      { name: "Chest Open", svg:
        _chB+_hd+_tr+
        // arms going back/out to sides
        '<line x1="36" y1="37" x2="16" y2="43" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="37" x2="56" y2="43" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(16,43)+_dot(56,43)+_lg+
        // backward arrows
        '<path d="M 13 43 Q 8 36 12 29" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'12,29 8,34 16,34" fill="#a8d4b0"/>'+
        '<path d="M 59 43 Q 64 36 60 29" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'60,29 56,34 64,34" fill="#a8d4b0"/>',
      },
      { name: "Seated Twist", svg:
        _ch+_hd+_tr+
        // right arm crosses to left side
        '<line x1="36" y1="38" x2="20" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(20,50)+
        // left arm goes back
        '<line x1="36" y1="38" x2="54" y2="36" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(54,36)+_lg+
        // rotation arrow around waist
        '<path d="M 43 44 Q 50 39 46 32" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'46,32 41,35 49,37" fill="#a8d4b0"/>',
      },
    ],
    // ── Set 2: Wrists & Arms ─────────────────────────────────────────────────
    [
      { name: "Wrist Rolls", svg:
        _chB+_hd+_tr+
        // arms extended forward
        '<line x1="36" y1="38" x2="18" y2="38" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="38" x2="54" y2="38" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(18,38)+_dot(54,38)+_lg+
        // circular arrows at wrists
        '<path d="M 18 33 Q 12 38 18 43" stroke="#a8d4b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        _arr+'18,43 14,39 22,38" fill="#a8d4b0"/>'+
        '<path d="M 54 33 Q 60 38 54 43" stroke="#a8d4b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        _arr+'54,43 50,39 58,38" fill="#a8d4b0"/>',
      },
      { name: "Wrist Flex", svg:
        _chB+_hd+_tr+
        // arms extended forward
        '<line x1="36" y1="38" x2="18" y2="38" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="38" x2="54" y2="38" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        // hands bent upward (fingers pointing up)
        '<line x1="18" y1="38" x2="18" y2="30" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="54" y1="38" x2="54" y2="30" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(18,30)+_dot(54,30)+_lg+
        // upward arrows at fingers
        _arr+'18,24 15,31 21,31" fill="#a8d4b0"/>'+
        _arr+'54,24 51,31 57,31" fill="#a8d4b0"/>',
      },
      { name: "Neck Turn", svg:
        _chB+
        // head turned — slightly offset ellipse
        '<ellipse cx="38" cy="19" rx="9" ry="10" transform="rotate(-10 38 19)" fill="none" stroke="#74b887" stroke-width="2"/>'+
        _tr+
        // arms resting on lap
        '<line x1="36" y1="40" x2="24" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="50" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _lg+
        // rotation arc around head
        '<path d="M 28 12 Q 36 6 44 12" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'44,12 40,7 46,5" fill="#a8d4b0"/>',
      },
    ],
    // ── Set 3: Lower Body ────────────────────────────────────────────────────
    [
      { name: "Ankle Circles", svg:
        _chB+_hd+_tr+
        // arms on lap
        '<line x1="36" y1="40" x2="24" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="50" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        // one leg extended forward, one normal
        '<line x1="32" y1="56" x2="24" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="40" y1="56" x2="58" y2="62" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(58,62)+
        // circular arrow at ankle
        '<path d="M 58 57 Q 64 62 58 67" stroke="#a8d4b0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        _arr+'58,67 54,63 62,62" fill="#a8d4b0"/>',
      },
      { name: "Knee Lift", svg:
        _chB+_hd+_tr+
        // left arm holds knee, right arm on hip
        '<line x1="36" y1="38" x2="22" y2="44" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="22" y1="44" x2="26" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(22,44)+
        '<line x1="36" y1="38" x2="50" y2="46" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(50,46)+
        // normal left leg, right knee raised
        '<line x1="32" y1="56" x2="24" y2="75" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="40" y1="56" x2="40" y2="42" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(40,42)+
        // up arrow at knee
        _arr+'40,35 36,42 44,42" fill="#a8d4b0"/>',
      },
      { name: "Calf Raises", svg:
        _chB+_hd+_tr+
        // arms on lap
        '<line x1="36" y1="40" x2="24" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="50" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        // legs with heels raised (feet points shown higher)
        '<line x1="32" y1="56" x2="24" y2="72" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="40" y1="56" x2="48" y2="72" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        // heels shown raised
        '<line x1="24" y1="72" x2="24" y2="68" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="48" y1="72" x2="48" y2="68" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(24,68)+_dot(48,68)+
        // up arrows
        _arr+'24,62 21,68 27,68" fill="#a8d4b0"/>'+
        _arr+'48,62 45,68 51,68" fill="#a8d4b0"/>',
      },
    ],
    // ── Set 4: Breathing & Core ──────────────────────────────────────────────
    [
      { name: "Belly Breath", svg:
        _chB+_hd+_tr+
        // both hands on belly
        '<line x1="36" y1="38" x2="24" y2="46" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="38" x2="48" y2="46" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(24,46)+_dot(48,46)+_lg+
        // expansion arrows sideways
        '<path d="M 17 48 Q 12 52 17 56" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'17,56 13,52 21,51" fill="#a8d4b0"/>'+
        '<path d="M 55 48 Q 60 52 55 56" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'55,56 51,51 59,52" fill="#a8d4b0"/>',
      },
      { name: "Side Bend", svg:
        _chB+
        // head tilted with body lean
        '<ellipse cx="34" cy="19" rx="9" ry="10" transform="rotate(-8 34 19)" fill="none" stroke="#74b887" stroke-width="2"/>'+
        // torso leans left
        '<line x1="36" y1="29" x2="34" y2="56" stroke="#74b887" stroke-width="2.2" stroke-linecap="round"/>'+
        // right arm arched overhead
        '<path d="M 36 36 Q 55 22 50 12" stroke="#74b887" stroke-width="2" fill="none" stroke-linecap="round"/>'+
        _dot(50,12)+
        // left arm down on hip
        '<line x1="35" y1="36" x2="22" y2="44" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _dot(22,44)+_lg+
        // curved side arrow
        '<path d="M 30 50 Q 22 46 24 38" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'24,38 19,42 27,44" fill="#a8d4b0"/>',
      },
      { name: "Chin Tuck", svg:
        _chB+
        // head slightly forward/down
        '<circle cx="36" cy="21" r="10" fill="none" stroke="#74b887" stroke-width="2"/>'+
        '<line x1="36" y1="31" x2="36" y2="56" stroke="#74b887" stroke-width="2.2" stroke-linecap="round"/>'+
        // arms relaxed on lap
        '<line x1="36" y1="40" x2="24" y2="52" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        '<line x1="36" y1="40" x2="50" y2="50" stroke="#74b887" stroke-width="2" stroke-linecap="round"/>'+
        _lg+
        // downward arrow at chin showing tuck
        _arr+'36,32 32,27 40,27" fill="#a8d4b0"/>'+
        // stretch indicator at back of neck
        '<path d="M 44 14 Q 52 12 52 22" stroke="#a8d4b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
        _arr+'52,22 48,18 56,17" fill="#a8d4b0"/>',
      },
    ],
  ];
  const stretches = stretchSets[(breakCount - 1) % stretchSets.length];
  const stretchTitles = ["Neck & Spine","Shoulders & Chest","Wrists & Arms","Lower Body","Breathing & Core"];
  const stretchTitle  = stretchTitles[(breakCount - 1) % stretchTitles.length];

  // ── Break card ────────────────────────────────────────────────────────────
  const card = document.createElement("div");
  card.id = "pb-card";
  card.innerHTML = `
    <div class="pb-card-header">
      <div class="pb-card-header-left">
        <p class="pbt">Purrfect Break!</p>
        <p class="pbs">${catName} is here · Break #${breakCount}</p>
        <p class="pb-streak-line">${streakLabel}</p>
        <p class="pb-mood-line">${hState.emoji} ${catName} is feeling ${hState.label}</p>
      </div>
      <div class="pb-ring-wrap">
        <svg viewBox="0 0 56 56" fill="none">
          <circle class="pb-ring-track" cx="28" cy="28" r="20" stroke-width="3.5"/>
          <circle id="pb-ring-fill" class="pb-ring-fill" cx="28" cy="28" r="20"
            stroke-width="3.5"
            stroke-dasharray="${RING_C}"
            stroke-dashoffset="0"
            transform="rotate(-90 28 28)"/>
        </svg>
        <span id="pb-tnum">5:00</span>
      </div>
    </div>

    <div class="pb-mindful">
      <div class="pb-mindful-icon">${tip.icon}</div>
      <div>
        <div class="pb-mindful-tag">${tip.tag}</div>
        <div class="pb-mindful-text">${tip.text}</div>
      </div>
    </div>

    <div class="pb-breathe">
      <div class="pb-breathe-ring" id="pb-breathe-ring">🐾</div>
      <div class="pb-breathe-label" id="pb-breathe-label">breathe in…</div>
    </div>

    <div class="pb-stretch">
      <div class="pb-stretch-lbl">🪑 ${stretchTitle}</div>
      <div class="pb-stretch-row">
        ${stretches.map(s => `<div class="pb-stretch-fig"><svg width="72" height="86" viewBox="0 0 72 86" fill="none">${s.svg}</svg><div class="pb-stretch-name">${s.name}</div></div>`).join("")}
      </div>
    </div>

    <div class="pb-pills">
      <div class="pb-pill"><span class="pb-pill-ic">💧</span>Sip water</div>
      <div class="pb-pill"><span class="pb-pill-ic">👁️</span>Rest eyes</div>
      <div class="pb-pill"><span class="pb-pill-ic">🧘</span>Sit tall</div>
    </div>

    <div class="pb-btns">
      <button class="pb-bskip" id="pb-skip">Skip</button>
      <button class="pb-bdone" id="pb-done">✓ I'm Refreshed!</button>
    </div>
    <div class="pb-foot">Next visit in 15 minutes 🐱</div>`;
  document.body.appendChild(card);

  // ── Breathing guide ───────────────────────────────────────────────────────
  const breathePhases = [
    { text: "breathe in… 🌬️", ms: 4000 },
    { text: "hold 🫁",          ms: 1000 },
    { text: "breathe out… 😮‍💨", ms: 4000 },
    { text: "hold ✨",           ms: 1000 },
  ];
  let breatheIdx   = 0;
  let breatheTimer = null;

  function tickBreath() {
    const labelEl = document.getElementById("pb-breathe-label");
    if (!labelEl || !document.contains(labelEl)) return;
    const phase = breathePhases[breatheIdx];
    labelEl.textContent = phase.text;
    breatheIdx = (breatheIdx + 1) % breathePhases.length;
    breatheTimer = setTimeout(tickBreath, phase.ms);
  }

  // ── Gift settle helper ─────────────────────────────────────────────────────
  function settleGift(delayMs) {
    if (!bringGift) return;
    setTimeout(() => {
      const g = document.getElementById("pb-gift");
      if (!g) return;
      g.classList.add("pb-gift-settle");
      setTimeout(() => {
        g.classList.remove("pb-gift-settle");
        g.classList.add("pb-gift-idle");
      }, 950);
    }, delayMs);
  }

  // ── Animation timeline ────────────────────────────────────────────────────
  if (isIdle) {
    walker.style.transition = "none";
    walker.classList.add("pb-in");
    if (catGifUrl) setTimeout(() => document.querySelector(".pb-zzz-overlay")?.classList.add("pb-show"), 300);
    setTimeout(() => document.getElementById("pb-bubble")?.classList.add("pb-show"), 700);
    setTimeout(() => {
      backdrop.classList.add("pb-active");
      requestAnimationFrame(() => card.classList.add("pb-show"));
      setTimeout(tickBreath, 600);
    }, 1200);
    settleGift(600);

  } else {
    doEdgeKnock(() => {
      // Paw trail
      for (let i = 0; i < 6; i++) {
        const paw = document.createElement("div");
        paw.className = "pb-paw-trail";
        paw.textContent = "🐾";
        paw.style.right  = (35 + i * 58) + "px";
        paw.style.bottom = (14 + (i % 2 ? 16 : 0)) + "px";
        if (i % 2 === 0) paw.style.transform = "scaleX(-1)";
        document.body.appendChild(paw);
        setTimeout(() => paw.classList.add("pb-show"), 80 + i * 140);
        setTimeout(() => {
          paw.style.transition = "opacity 1s ease"; paw.style.opacity = "0";
          setTimeout(() => paw.remove(), 1100);
        }, 3200);
      }

      // Knock-off item
      const knockItems = ["☕", "🌱", "📚", "🖊️", "🍵", "🎲", "🪴"];
      const knockItem = document.createElement("div");
      knockItem.id = "pb-knock-item";
      knockItem.textContent = knockItems[Math.floor(Math.random() * knockItems.length)];
      knockItem.style.cssText = "position:fixed;z-index:2147483644;font-size:26px;pointer-events:none;bottom:24px;right:calc(50% - 168px);transition:transform 0.7s ease-in,opacity 0.7s ease-in;";
      document.body.appendChild(knockItem);
      setTimeout(() => {
        knockItem.style.transform = "rotate(-200deg) translate(30px, 160px)";
        knockItem.style.opacity = "0";
        setTimeout(() => knockItem.remove(), 750);
      }, 1050);

      // Walker walks in
      requestAnimationFrame(() => requestAnimationFrame(() => walker.classList.add("pb-in")));

      if (catGifUrl) {
        if (seasonal) {
          setTimeout(() => {
            const frame = document.getElementById("pb-cat-frame");
            if (!frame) return;
            frame.style.borderColor = seasonal.border;
            const badge = document.createElement("div");
            badge.style.cssText = "position:absolute;top:10px;left:12px;font-size:26px;pointer-events:none;z-index:1;filter:drop-shadow(0 0 10px rgba(255,200,100,0.9));animation:pb-sea-float 2.5s ease-in-out infinite;";
            badge.textContent = seasonal.emoji;
            frame.appendChild(badge);
          }, 950);
        }
        setTimeout(() => {
          document.querySelector(".pb-zzz-overlay")?.classList.add("pb-show");
        }, 1800);
        setTimeout(() => document.getElementById("pb-bubble")?.classList.add("pb-show"), 2300);
        setTimeout(() => {
          backdrop.classList.add("pb-active");
          requestAnimationFrame(() => card.classList.add("pb-show"));
          setTimeout(tickBreath, 600);
        }, 2800);
        settleGift(2100);
      } else {
        setTimeout(() => {
          const scat = document.getElementById("pb-scat");
          scat?.classList.remove("pb-walking");
          scat?.classList.add("pb-sleeping");
        }, 2700);
        setTimeout(() => document.querySelector(".pb-fallback-zzz")?.classList.add("pb-show"), 3300);
        setTimeout(() => {
          backdrop.classList.add("pb-active");
          requestAnimationFrame(() => card.classList.add("pb-show"));
          setTimeout(tickBreath, 600);
        }, 3800);
        settleGift(2800);
      }
    });
  }

  // ── Countdown + ring timer ─────────────────────────────────────────────────
  const TOTAL = 300;
  let rem = TOTAL;
  const numEl  = document.getElementById("pb-tnum");
  const ringEl = document.getElementById("pb-ring-fill");
  const tick   = setInterval(() => {
    rem--;
    if (rem <= 0) { clearInterval(tick); dismiss(true); return; }
    if (numEl)  numEl.textContent = `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, "0")}`;
    if (ringEl) ringEl.style.strokeDashoffset = String(RING_C * (1 - rem / TOTAL));
  }, 1000);

  // ── Dismiss ───────────────────────────────────────────────────────────────
  function dismiss(completed) {
    clearInterval(tick);
    if (breatheTimer) clearTimeout(breatheTimer);
    try { chrome.runtime.sendMessage({ action: "breakResult", completed }); } catch (e) {}

    if (card)     { card.style.transition = "bottom .45s ease-in"; card.style.bottom = "-540px"; }
    if (backdrop) { backdrop.style.transition = "background .5s ease, backdrop-filter .5s ease"; backdrop.style.background = "rgba(0,0,0,0)"; backdrop.style.backdropFilter = "blur(0px)"; backdrop.style.pointerEvents = "none"; }
    setTimeout(() => {
      if (walker) { walker.style.transition = "right 0.9s cubic-bezier(0.4,0,1,1)"; walker.style.right = "-340px"; }
    }, 300);
    setTimeout(() => { walker?.remove(); card?.remove(); backdrop?.remove(); }, 1300);
  }

  document.getElementById("pb-skip")?.addEventListener("click", () => dismiss(false));
  document.getElementById("pb-done")?.addEventListener("click", () => dismiss(true));
  backdrop.addEventListener("click", () => dismiss(false));
}

// ── Messages ──────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getStatus") {
    chrome.storage.local.get(
      ["breakCount","nextBreak","lastBreak","streak","maxStreak","happiness","totalCompleted"],
      data => sendResponse(data)
    );
    return true;
  }

  if (msg.action === "breakResult") {
    chrome.storage.local.get(
      ["streak","maxStreak","skippedInARow","happiness","totalCompleted"],
      data => {
        let { streak = 0, maxStreak = 0, skippedInARow = 0, happiness = 50, totalCompleted = 0 } = data;
        if (msg.completed) {
          streak++; skippedInARow = 0; totalCompleted++;
          happiness = Math.min(100, happiness + 8);
          maxStreak = Math.max(maxStreak, streak);
        } else {
          skippedInARow++;
          if (skippedInARow >= 2) streak = 0;
          happiness = Math.max(0, happiness - 12);
        }
        chrome.storage.local.set({ streak, maxStreak, skippedInARow, happiness, totalCompleted });
      }
    );
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === "testCat") {
    triggerCatBreak();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === "resetAlarm") {
    chrome.alarms.clearAll(() => {
      chrome.alarms.create("catBreak", { delayInMinutes: 15, periodInMinutes: 15 });
      chrome.storage.local.set({ nextBreak: Date.now() + 15 * 60 * 1000 });
      sendResponse({ ok: true });
    });
    return true;
  }
});
