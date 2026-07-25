import { BOOKS, classifyQuestion, chooseAnswer, formatSavedTime } from "./logic.mjs";

const STORAGE_KEY = "ai-book-of-answers:saved:v1";
const PREFS_KEY = "ai-book-of-answers:prefs:v1";
const urlParams = new URLSearchParams(window.location.search);
const fastMode = urlParams.has("fast");
const previewPhase = urlParams.get("preview");
const timeScale = fastMode ? 0.03 : 1;
const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds * timeScale));

const MESSAGES = {
  zh: {
    pageTitle: "答案回响",
    metaDescription: "答案回响——问出心中的问题，翻开一本书，获得一句答案。",
    homeAria: "答案回响首页",
    navAria: "主导航",
    languageAria: "语言选择",
    languageZh: "中",
    brandTitle: "答案回响",
    brandSubtitle: "AI ORACLE OF ANSWERS",
    coverTitle: "答案回响",
    coverSubtitle: "AI ORACLE OF ANSWERS",
    savedNav: "我的收藏",
    aboutNav: "关于",
    heroTitle: "向未知，<em>轻声问一句</em>",
    heroDescription: "把困惑交给此刻，让一本书替你翻到答案所在的那一页。",
    questionHeading: "写下你此刻的问题",
    questionHint: "答案，往往在你问出口时就已经靠近。",
    inputLabel: "输入你想问的问题",
    inputPlaceholder: "例如：我应该勇敢地开始吗？",
    openAnswer: "开启答案",
    suggestionsAria: "问题示例",
    suggestionLead: "不知道问什么？",
    suggestionOne: "我应该坚持吗？",
    suggestionTwo: "机会会出现吗？",
    suggestionThree: "该相信这段关系吗？",
    stepsAria: "体验步骤",
    stepOne: "写下问题",
    stepTwo: "寻找对应之书",
    stepThree: "翻开你的答案",
    ritualBookAria: "正在打开答案之书",
    analysisUnderstand: "理解问题",
    analysisChoose: "选择之书",
    analysisFind: "寻找答案",
    readingTitle: "正在阅读你的问题",
    listeningStatus: "正在聆听问题背后的声音...",
    matchingTitle: "对应之书正在靠近",
    matchingStatus: "已匹配「{book}」，等待它抵达中央...",
    bookSelected: "已找到与你最接近的「{book}」",
    searchTitle: "正在寻找适合你的答案",
    openingStatus: "书页正在缓缓打开...",
    flippingStatus: "正在翻阅属于你的那一页...",
    answerFoundTitle: "答案已找到",
    foundStatus: "请带着第一直觉，读下这句话。",
    answerLabel: "给此刻的你",
    answerFootnote: "有些答案，只在你愿意相信时出现。",
    saveAnswer: "收藏答案",
    savedAnswer: "已收藏",
    askAgain: "再问一次",
    youAsked: "你问：『{question}』",
    footerLine: "答案不替你决定，它只是照亮你已经知道的方向。",
    savedTitle: "我的答案收藏",
    closeSaved: "关闭收藏",
    savedEmptyTitle: "还没有被收藏的答案",
    savedEmptyText: "当某句话触动你时，把它留在这里。",
    closeAbout: "关闭关于",
    aboutTitle: "不是预言，是一次与内心的相遇。",
    aboutText: "答案回响从爱情、财富、事业、成长、选择与命运六个方向，找到与你此刻最接近的一句话。它不解释，也不替你决定；只留下一束足够继续前行的微光。",
    bookTypesAria: "六类答案之书",
    typeLove: "♡ 爱情",
    typeWealth: "◉ 财富",
    typeCareer: "↗ 事业",
    typeGrowth: "⌁ 成长",
    typeChoice: "⌖ 选择",
    typeDestiny: "☾ 命运",
    savedToast: "答案已收藏",
    removedToast: "已移出收藏",
    removeSavedAria: "删除这条收藏",
    inputError: "请先写下一个你真正想问的问题。",
    soundOffAria: "关闭音效",
    soundOnAria: "开启音效",
    soundStateOn: "音效：开",
    soundStateOff: "音效：关"
  },
  en: {
    pageTitle: "The Sacred Oracle",
    metaDescription: "Ask what is on your mind, open the Sacred Oracle, and receive one concise answer.",
    homeAria: "The Sacred Oracle home",
    navAria: "Main navigation",
    languageAria: "Choose language",
    languageZh: "ZH",
    brandTitle: "THE SACRED ORACLE",
    brandSubtitle: "BOOK OF ANSWERS",
    coverTitle: "THE SACRED ORACLE",
    coverSubtitle: "BOOK OF ANSWERS",
    savedNav: "Saved",
    aboutNav: "About",
    heroTitle: "Ask the unknown, <em>softly</em>",
    heroDescription: "Give this moment your uncertainty, and let a book find the page meant for you.",
    questionHeading: "Write the question on your mind",
    questionHint: "Sometimes the answer draws near the moment you ask.",
    inputLabel: "Enter the question you want to ask",
    inputPlaceholder: "For example: Should I be brave enough to begin?",
    openAnswer: "Open the answer",
    suggestionsAria: "Question suggestions",
    suggestionLead: "Not sure what to ask?",
    suggestionOne: "Should I keep going?",
    suggestionTwo: "Will an opportunity appear?",
    suggestionThree: "Should I trust this relationship?",
    stepsAria: "Experience steps",
    stepOne: "Ask a question",
    stepTwo: "Find your book",
    stepThree: "Open the answer",
    ritualBookAria: "Opening the Book of Answers",
    analysisUnderstand: "Understand",
    analysisChoose: "Choose a book",
    analysisFind: "Find the answer",
    readingTitle: "Reading your question",
    listeningStatus: "Listening to the voice behind your words...",
    matchingTitle: "Your book is approaching",
    matchingStatus: "Matched with {book}. Waiting for it to reach the center...",
    bookSelected: "The closest match is {book}",
    searchTitle: "Finding the answer meant for you",
    openingStatus: "The book is slowly opening...",
    flippingStatus: "Turning toward the page meant for you...",
    answerFoundTitle: "Your answer is found",
    foundStatus: "Read these words with your first instinct.",
    answerLabel: "For this moment",
    answerFootnote: "Some answers appear only when you are willing to believe.",
    saveAnswer: "Save answer",
    savedAnswer: "Saved",
    askAgain: "Ask again",
    youAsked: "You asked: “{question}”",
    footerLine: "The answer does not decide for you. It illuminates the direction you already know.",
    savedTitle: "My saved answers",
    closeSaved: "Close saved answers",
    savedEmptyTitle: "No answers saved yet",
    savedEmptyText: "When a line moves you, keep it here.",
    closeAbout: "Close about dialog",
    aboutTitle: "Not a prophecy, but a meeting with your inner voice.",
    aboutText: "The Sacred Oracle listens through six lenses—love, wealth, career, growth, choice, and destiny—to find one line closest to this moment. It does not explain or decide. It simply leaves enough light for your next step.",
    bookTypesAria: "Six books of answers",
    typeLove: "♡ Love",
    typeWealth: "◉ Wealth",
    typeCareer: "↗ Career",
    typeGrowth: "⌁ Growth",
    typeChoice: "⌖ Choice",
    typeDestiny: "☾ Destiny",
    savedToast: "Answer saved",
    removedToast: "Removed from saved answers",
    removeSavedAria: "Remove this saved answer",
    inputError: "Write down a question you truly want to ask.",
    soundOffAria: "Turn sound off",
    soundOnAria: "Turn sound on",
    soundStateOn: "Sound: on",
    soundStateOff: "Sound: off"
  }
};

const dom = {
  screens: [...document.querySelectorAll(".screen")],
  home: document.querySelector("#homeScreen"),
  reading: document.querySelector("#readingScreen"),
  result: document.querySelector("#resultScreen"),
  form: document.querySelector("#questionForm"),
  input: document.querySelector("#questionInput"),
  counter: document.querySelector("#questionCounter"),
  inputError: document.querySelector("#inputError"),
  questionEcho: document.querySelector("#questionEcho"),
  readingTitle: document.querySelector("#readingTitle"),
  readingStatus: document.querySelector("#readingStatus"),
  readingVisual: document.querySelector(".reading-visual"),
  homeBookLoop: document.querySelector("#homeBookLoop"),
  homeLoopTrack: document.querySelector("#homeLoopTrack"),
  bookUniverse: document.querySelector("#bookUniverse"),
  bookFieldCamera: document.querySelector("#bookFieldCamera"),
  bookField: document.querySelector("#bookField"),
  ritualBook: document.querySelector("#ritualBook"),
  ritualBookTitle: document.querySelector("#ritualBookTitle"),
  ritualBookEn: document.querySelector("#ritualBookEn"),
  analysisSteps: [...document.querySelectorAll(".analysis-step")],
  selectedBookIcon: document.querySelector("#selectedBookIcon"),
  selectedBookName: document.querySelector("#selectedBookName"),
  selectedBookEnglish: document.querySelector("#selectedBookEnglish"),
  answerText: document.querySelector("#answerText"),
  answerTranslation: document.querySelector("#answerTranslation"),
  resultQuestion: document.querySelector("#resultQuestion"),
  saveAnswer: document.querySelector("#saveAnswer"),
  savedCount: document.querySelector("#savedCount"),
  openSaved: document.querySelector("#openSaved"),
  drawer: document.querySelector("#savedDrawer"),
  savedList: document.querySelector("#savedList"),
  emptySaved: document.querySelector("#emptySaved"),
  openAbout: document.querySelector("#openAbout"),
  about: document.querySelector("#aboutModal"),
  overlay: document.querySelector("#overlay"),
  toast: document.querySelector("#toast"),
  soundToggle: document.querySelector("#soundToggle"),
  languageOptions: [...document.querySelectorAll("[data-language]")]
};

function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ language: currentLanguage, soundEnabled }));
  } catch {
    // The experience still works if storage is unavailable.
  }
}

const initialPrefs = getPrefs();
const requestedLanguage = urlParams.get("lang");
let currentLanguage = ["zh", "en"].includes(requestedLanguage)
  ? requestedLanguage
  : (["zh", "en"].includes(initialPrefs.language)
      ? initialPrefs.language
      : (navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en"));
let soundEnabled = initialPrefs.soundEnabled !== false;
let currentReading = null;
let ritualBook = null;
let ritualPhase = "idle";
let ritualRun = 0;
let toastTimer;
let bookLoopStartedAt = 0;

const BOOK_STYLE = {
  love: { color: "#c96975", ink: "#fff9ed", ry: "-5deg", rz: "1.2deg" },
  wealth: { color: "#d6aa33", ink: "#252015", ry: "-3deg", rz: "-1deg" },
  career: { color: "#3971a9", ink: "#fff9e7", ry: "-6deg", rz: ".6deg" },
  growth: { color: "#658a62", ink: "#fff9e8", ry: "-4deg", rz: "-1.4deg" },
  choice: { color: "#755d9d", ink: "#fff9ed", ry: "-7deg", rz: ".8deg" },
  destiny: { color: "#24273d", ink: "#f4df9e", ry: "-5deg", rz: "-1deg" }
};

const LOOP_STEP_X = 242;
const LOOP_STEP_Y = -116;
const LOOP_CYCLE_X = LOOP_STEP_X * 6;
const LOOP_CYCLE_Y = LOOP_STEP_Y * 6;
const LOOP_DURATION_MS = 3100;

function t(key, values = {}) {
  let message = MESSAGES[currentLanguage][key] ?? MESSAGES.zh[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, value);
  }
  return message;
}

function localizedBook(book) {
  return currentLanguage === "zh"
    ? { primary: book.name, secondary: book.english }
    : { primary: book.english, secondary: `${book.english.replace(" BOOK", "")} EDITION` };
}

function createVolume(book, index, className) {
  const style = BOOK_STYLE[book.id];
  const volume = document.createElement("article");
  volume.className = className;
  volume.dataset.bookId = book.id;
  volume.style.setProperty("--book-ry", style.ry);
  volume.style.setProperty("--book-rz", style.rz);
  volume.style.setProperty("--book-color", style.color);
  volume.style.setProperty("--book-ink", style.ink);
  volume.style.setProperty("--delay", `${(index % 6) * 54}ms`);

  const volumeBook = document.createElement("div");
  volumeBook.className = "volume-book";
  const cover = document.createElement("div");
  cover.className = "volume-cover";
  const title = document.createElement("strong");
  title.className = "volume-title";
  const subtitle = document.createElement("small");
  subtitle.className = "volume-subtitle";
  const accent = document.createElement("span");
  accent.className = "volume-accent";
  const number = document.createElement("span");
  number.className = "volume-index";
  number.textContent = String((index % 6) + 1).padStart(2, "0");
  cover.append(title, subtitle, accent, number);
  volumeBook.appendChild(cover);
  volume.appendChild(volumeBook);
  return volume;
}

function buildBookUniverse() {
  dom.bookField.replaceChildren();
  const books = Object.values(BOOKS);
  [-1, 0, 1].forEach((cycle) => {
    books.forEach((book, index) => {
      const volume = createVolume(book, index, "category-volume");
      const slot = index - 2.5;
      volume.dataset.cycle = String(cycle);
      volume.dataset.primary = String(cycle === 0);
      volume.style.setProperty("--x", `${slot * LOOP_STEP_X + cycle * LOOP_CYCLE_X - 89}px`);
      volume.style.setProperty("--y", `${slot * LOOP_STEP_Y + cycle * LOOP_CYCLE_Y - 125}px`);
      volume.style.setProperty("--z", `${(index % 3) * 18 - 18}px`);
      dom.bookField.appendChild(volume);
    });
  });
  updateBookUniverseCopy();
}

function buildHomeBookLoop() {
  dom.homeLoopTrack.replaceChildren();
  const books = Object.values(BOOKS);
  [-1, 0, 1].forEach((cycle) => {
    books.forEach((book, index) => {
      const volume = createVolume(book, index, "home-loop-volume");
      const slot = index - 2.5;
      volume.dataset.cycle = String(cycle);
      volume.dataset.slot = String(index);
      volume.style.setProperty("--home-x", `${slot * 218 + cycle * 1308 - 80}px`);
      volume.style.setProperty("--home-y", `${slot * -103 + cycle * -618 - 112}px`);
      volume.style.setProperty("--home-scale", `${0.92 + (index % 3) * 0.035}`);
      dom.homeLoopTrack.appendChild(volume);
    });
  });
  updateBookUniverseCopy();
}

function updateBookUniverseCopy() {
  document.querySelectorAll(".category-volume, .home-loop-volume").forEach((volume) => {
    const book = BOOKS[volume.dataset.bookId];
    const names = localizedBook(book);
    volume.querySelector(".volume-title").textContent = names.primary;
    volume.querySelector(".volume-subtitle").textContent = names.secondary;
  });
}

function resetBookUniverse() {
  dom.bookUniverse.classList.remove("is-visible", "has-selection", "is-morphing");
  dom.bookField.querySelectorAll(".category-volume").forEach((volume) => {
    volume.classList.remove("is-selected", "is-matched", "is-clicked", "is-expanding");
    volume.style.removeProperty("--select-x");
    volume.style.removeProperty("--select-y");
  });
  dom.bookField.style.removeProperty("animation");
  dom.bookField.style.removeProperty("animation-delay");
  dom.bookField.style.removeProperty("transform");
  dom.bookFieldCamera.style.setProperty("--field-rx", "0deg");
  dom.bookFieldCamera.style.setProperty("--field-ry", "0deg");
  dom.bookFieldCamera.style.setProperty("--field-x", "0px");
  dom.bookFieldCamera.style.setProperty("--field-y", "0px");
}

function loopPhaseForBook(book) {
  const index = Object.values(BOOKS).findIndex((candidate) => candidate.id === book.id);
  const slot = index - 2.5;
  return ((slot % 6) + 6) % 6 / 6;
}

function revealBookUniverse(book) {
  resetBookUniverse();
  const loopDelay = -loopPhaseForBook(book) * LOOP_DURATION_MS;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bookLoopStartedAt = performance.now();
    dom.bookField.style.animation = `diagonal-book-cycle ${LOOP_DURATION_MS}ms linear ${loopDelay}ms infinite`;
    dom.bookUniverse.classList.add("is-visible");
  }));
}

function markMatchedBook(book) {
  dom.bookField.querySelectorAll(".category-volume").forEach((volume) => {
    volume.classList.toggle("is-matched", volume.dataset.bookId === book.id);
  });
}

function closestVolumeToCenter(book) {
  const universeRect = dom.bookUniverse.getBoundingClientRect();
  const centerX = universeRect.left + universeRect.width / 2;
  const centerY = universeRect.top + universeRect.height / 2;
  let closest = null;

  dom.bookField.querySelectorAll(`[data-book-id="${book.id}"]`).forEach((volume) => {
    const rect = volume.getBoundingClientRect();
    const distance = Math.hypot(rect.left + rect.width / 2 - centerX, rect.top + rect.height / 2 - centerY);
    if (!closest || distance < closest.distance) closest = { volume, distance };
  });

  return closest;
}

function waitForBookAtCenter(book, runId) {
  if (fastMode || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve(closestVolumeToCenter(book)?.volume || null);
  }

  return new Promise((resolve) => {
    const checkPosition = () => {
      if (runId !== ritualRun) {
        resolve(null);
        return;
      }

      const closest = closestVolumeToCenter(book);
      const loopElapsed = performance.now() - bookLoopStartedAt;
      const completedFullLoop = loopElapsed >= LOOP_DURATION_MS;
      if (closest && completedFullLoop && (closest.distance <= 20 || loopElapsed >= LOOP_DURATION_MS + 900)) {
        resolve(closest.volume);
        return;
      }
      window.requestAnimationFrame(checkPosition);
    };
    window.requestAnimationFrame(checkPosition);
  });
}

function focusBookInUniverse(book, selectedVolume = null) {
  const computedTransform = window.getComputedStyle(dom.bookField).transform;
  const matrix = computedTransform === "none" ? { m41: 0, m42: 0 } : new DOMMatrixReadOnly(computedTransform);
  dom.bookField.style.animation = "none";
  dom.bookField.style.transform = `translate3d(${matrix.m41}px, ${matrix.m42}px, 0)`;
  dom.bookField.querySelectorAll(".category-volume").forEach((volume) => volume.classList.remove("is-matched"));
  dom.bookUniverse.classList.add("has-selection");
  const selected = selectedVolume || dom.bookField.querySelector(`[data-book-id="${book.id}"][data-primary="true"]`);
  if (selected) {
    selected.style.setProperty("--select-x", `${-matrix.m41 - selected.offsetWidth / 2}px`);
    selected.style.setProperty("--select-y", `${-matrix.m42 - selected.offsetHeight / 2}px`);
    selected.classList.add("is-selected");
  }
}

function getAnswerPair(reading) {
  if (reading?.answer && typeof reading.answer === "object") {
    return { zh: reading.answer.zh || "", en: reading.answer.en || "" };
  }

  const book = BOOKS[reading?.bookId] || BOOKS.destiny;
  const legacyAnswer = String(reading?.answer || "");
  const index = book.answers.indexOf(legacyAnswer);
  return {
    zh: legacyAnswer,
    en: index >= 0 ? book.answersEn[index] : ""
  };
}

class SoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = soundEnabled;
  }

  ensure() {
    if (this.context) return this.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled ? 0.72 : 0;
    this.master.connect(this.context.destination);
    return this.context;
  }

  unlock() {
    const context = this.ensure();
    if (context?.state === "suspended") context.resume().catch(() => {});
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    const context = this.ensure();
    if (!context || !this.master) return;
    const now = context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(enabled ? 0.72 : 0, now, 0.015);
    if (enabled) this.unlock();
  }

  tone(startFrequency, endFrequency, duration, delay = 0, volume = 0.045, type = "sine") {
    if (!this.enabled) return;
    const context = this.ensure();
    if (!context || !this.master) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.04, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  noise(duration, delay = 0, frequency = 1600, volume = 0.025) {
    if (!this.enabled) return;
    const context = this.ensure();
    if (!context || !this.master) return;
    const start = context.currentTime + delay;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) {
      const envelope = Math.sin((Math.PI * i) / channel.length);
      channel[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + duration * 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(start);
  }

  play(cue) {
    if (!this.enabled) return;
    this.unlock();
    if (cue === "click") {
      this.tone(430, 510, 0.07, 0, 0.024, "sine");
    } else if (cue === "listen") {
      this.tone(330, 392, 0.42, 0, 0.035, "sine");
      this.tone(495, 587, 0.55, 0.12, 0.022, "sine");
    } else if (cue === "select") {
      this.tone(392, 523, 0.36, 0, 0.035, "triangle");
      this.tone(659, 784, 0.5, 0.12, 0.021, "sine");
    } else if (cue === "open") {
      this.noise(0.85, 0, 780, 0.035);
      this.tone(120, 220, 0.95, 0, 0.03, "sine");
      this.tone(440, 523, 0.7, 0.25, 0.018, "sine");
    } else if (cue === "flip") {
      [0, 0.25, 0.5, 0.76, 1.02].forEach((delay, index) => {
        this.noise(0.18, delay, 1200 + index * 170, 0.027);
        this.tone(180 + index * 12, 145, 0.14, delay, 0.012, "triangle");
      });
    } else if (cue === "reveal") {
      this.tone(523, 523, 1.15, 0, 0.038, "sine");
      this.tone(659, 659, 1.15, 0.16, 0.034, "sine");
      this.tone(784, 784, 1.4, 0.34, 0.03, "sine");
    } else if (cue === "save") {
      this.tone(587, 659, 0.22, 0, 0.03, "sine");
      this.tone(784, 880, 0.36, 0.11, 0.025, "sine");
    }
  }
}

const sound = new SoundEngine();

function generateStars() {
  const container = document.querySelector("#stars");
  const fragment = document.createDocumentFragment();
  const count = window.innerWidth < 640 ? 48 : 90;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("i");
    star.className = "star-dot";
    star.style.left = `${(i * 47.17) % 100}%`;
    star.style.top = `${(i * i * 13.73 + i * 19) % 100}%`;
    star.style.setProperty("--size", `${1 + (i % 3) * 0.55}px`);
    star.style.setProperty("--alpha", `${0.2 + (i % 7) * 0.08}`);
    star.style.setProperty("--duration", `${2.2 + (i % 5) * 0.8}s`);
    star.style.setProperty("--delay", `${-(i % 9) * 0.53}s`);
    fragment.appendChild(star);
  }
  container.appendChild(fragment);
}

function updateSoundControl() {
  dom.soundToggle.classList.toggle("is-muted", !soundEnabled);
  dom.soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  dom.soundToggle.setAttribute("aria-label", soundEnabled ? t("soundOffAria") : t("soundOnAria"));
  dom.soundToggle.title = soundEnabled ? t("soundStateOn") : t("soundStateOff");
}

function updateReadingCopy() {
  const bookNames = ritualBook ? localizedBook(ritualBook) : null;
  if (bookNames) {
    dom.ritualBookTitle.textContent = bookNames.primary;
    dom.ritualBookEn.textContent = bookNames.secondary;
  } else {
    dom.ritualBookTitle.textContent = t("brandTitle");
    dom.ritualBookEn.textContent = t("brandSubtitle");
  }

  if (ritualPhase === "matching") {
    dom.readingTitle.textContent = t("matchingTitle");
    dom.readingStatus.textContent = t("matchingStatus", { book: bookNames?.primary || "" });
  } else if (ritualPhase === "selected") {
    dom.readingTitle.textContent = t("readingTitle");
    dom.readingStatus.textContent = t("bookSelected", { book: bookNames?.primary || "" });
  } else if (ritualPhase === "opening") {
    dom.readingTitle.textContent = t("searchTitle");
    dom.readingStatus.textContent = t("openingStatus");
  } else if (ritualPhase === "flipping") {
    dom.readingTitle.textContent = t("searchTitle");
    dom.readingStatus.textContent = t("flippingStatus");
  } else if (ritualPhase === "found") {
    dom.readingTitle.textContent = t("answerFoundTitle");
    dom.readingStatus.textContent = t("foundStatus");
  } else {
    dom.readingTitle.textContent = t("readingTitle");
    dom.readingStatus.textContent = t("listeningStatus");
  }
}

function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.body.dataset.language = language;
  document.title = t("pageTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("metaDescription"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });
  dom.languageOptions.forEach((button) => {
    const selected = button.dataset.language === language;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  updateSoundControl();
  updateBookUniverseCopy();
  updateReadingCopy();
  renderSaved();
  if (currentReading && dom.result.classList.contains("is-active")) renderResult(currentReading, false);
  else updateSaveButton(currentReading ? getSaved().some((item) => item.id === currentReading.id) : false);
  savePrefs();
}

function showScreen(screen) {
  dom.screens.forEach((item) => item.classList.toggle("is-active", item === screen));
  document.body.classList.toggle("is-ritual-active", screen === dom.reading);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function setTheme(book) {
  document.body.dataset.theme = book.id;
}

function resetAnalysisTrack() {
  dom.analysisSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === 0);
    step.classList.remove("is-done");
  });
}

function advanceAnalysis(index) {
  dom.analysisSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
    step.classList.toggle("is-done", stepIndex < index);
  });
}

function resetRitualVisual() {
  ritualBook = null;
  ritualPhase = "listening";
  dom.ritualBook.classList.remove("is-revealed", "is-opening", "is-flipping");
  resetBookUniverse();
  resetAnalysisTrack();
  updateReadingCopy();
}

async function beginRitual(question) {
  const runId = ++ritualRun;
  const { book } = classifyQuestion(question);
  const answer = chooseAnswer(book, question);
  currentReading = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    question,
    bookId: book.id,
    answer,
    createdAt: new Date().toISOString()
  };

  sound.unlock();
  sound.play("listen");
  resetRitualVisual();
  dom.questionEcho.textContent = question;
  showScreen(dom.reading);
  revealBookUniverse(book);
  if (previewPhase === "gallery") return;

  await wait(650);
  if (runId !== ritualRun) return;
  ritualBook = book;
  ritualPhase = "matching";
  setTheme(book);
  markMatchedBook(book);
  updateReadingCopy();
  advanceAnalysis(1);
  if (previewPhase === "matching") return;

  const arrivingVolume = await waitForBookAtCenter(book, runId);
  if (runId !== ritualRun || !arrivingVolume) return;
  ritualPhase = "selected";
  focusBookInUniverse(book, arrivingVolume);
  updateReadingCopy();
  if (previewPhase === "selected") return;

  await wait(680);
  if (runId !== ritualRun) return;
  arrivingVolume.classList.add("is-clicked");
  sound.play("select");
  await wait(520);
  if (runId !== ritualRun) return;
  arrivingVolume.classList.remove("is-clicked");
  arrivingVolume.classList.add("is-expanding");
  ritualPhase = "opening";
  updateReadingCopy();
  await wait(640);
  if (runId !== ritualRun) return;
  dom.bookUniverse.classList.add("is-morphing");
  dom.ritualBook.classList.add("is-revealed");
  await wait(240);
  if (runId !== ritualRun) return;
  dom.ritualBook.classList.add("is-opening");
  sound.play("open");
  if (previewPhase === "opening") return;

  await wait(1240);
  if (runId !== ritualRun) return;
  ritualPhase = "flipping";
  advanceAnalysis(2);
  updateReadingCopy();
  dom.ritualBook.classList.add("is-flipping");
  sound.play("flip");
  if (previewPhase === "flipping") return;

  await wait(1900);
  if (runId !== ritualRun) return;
  ritualPhase = "found";
  updateReadingCopy();
  dom.ritualBook.classList.remove("is-flipping");
  dom.analysisSteps.forEach((step) => {
    step.classList.remove("is-active");
    step.classList.add("is-done");
  });
  sound.play("reveal");

  await wait(650);
  if (runId !== ritualRun) return;
  renderResult(currentReading);
}

function renderResult(reading, switchScreen = true) {
  const book = BOOKS[reading.bookId] || BOOKS.destiny;
  const names = localizedBook(book);
  const answer = getAnswerPair(reading);
  const primaryAnswer = answer[currentLanguage] || answer.zh || answer.en;
  const secondaryAnswer = currentLanguage === "zh" ? answer.en : "";
  setTheme(book);
  dom.selectedBookIcon.textContent = book.icon;
  dom.selectedBookName.textContent = names.primary;
  dom.selectedBookEnglish.textContent = names.secondary;
  dom.answerText.textContent = primaryAnswer;
  dom.answerText.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  dom.answerTranslation.textContent = secondaryAnswer;
  dom.answerTranslation.lang = "en";
  dom.answerTranslation.hidden = !secondaryAnswer;
  dom.resultQuestion.textContent = t("youAsked", { question: reading.question });
  updateSaveButton(getSaved().some((item) => item.id === reading.id));
  if (switchScreen) showScreen(dom.result);
}

function updateSaveButton(isSaved) {
  dom.saveAnswer.classList.toggle("is-saved", isSaved);
  dom.saveAnswer.querySelector("span").textContent = isSaved ? t("savedAnswer") : t("saveAnswer");
  dom.saveAnswer.disabled = isSaved;
}

function getSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id) : [];
  } catch {
    return [];
  }
}

function setSaved(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Keep the UI functional even when storage is blocked.
  }
  renderSaved();
}

function renderSaved() {
  const items = getSaved();
  dom.savedCount.textContent = String(items.length);
  dom.savedCount.hidden = items.length === 0;
  dom.emptySaved.hidden = items.length > 0;
  dom.savedList.replaceChildren();

  items.forEach((item) => {
    const book = BOOKS[item.bookId] || BOOKS.destiny;
    const names = localizedBook(book);
    const answerPair = getAnswerPair(item);
    const card = document.createElement("article");
    card.className = "saved-card";
    card.style.setProperty("--card-rgb", book.rgb);

    const head = document.createElement("div");
    head.className = "saved-card-head";
    const icon = document.createElement("span");
    icon.textContent = book.icon;
    const name = document.createElement("span");
    name.textContent = names.primary;
    const secondaryName = document.createElement("small");
    secondaryName.textContent = names.secondary;
    const time = document.createElement("time");
    time.dateTime = item.createdAt;
    time.textContent = formatSavedTime(item.createdAt, currentLanguage === "zh" ? "zh-CN" : "en-US");
    head.append(icon, name, secondaryName, time);

    const question = document.createElement("p");
    question.className = "saved-question";
    question.textContent = currentLanguage === "zh" ? `「${item.question}」` : `“${item.question}”`;
    const answer = document.createElement("p");
    answer.className = "saved-answer";
    answer.textContent = answerPair[currentLanguage] || answerPair.zh || answerPair.en;
    const translation = document.createElement("p");
    translation.className = "saved-answer-translation";
    translation.textContent = currentLanguage === "zh" ? (answerPair.en || "") : "";
    translation.hidden = !translation.textContent;

    const remove = document.createElement("button");
    remove.className = "delete-saved";
    remove.type = "button";
    remove.ariaLabel = t("removeSavedAria");
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      sound.play("click");
      setSaved(getSaved().filter((saved) => saved.id !== item.id));
      if (currentReading?.id === item.id) updateSaveButton(false);
      showToast(t("removedToast"));
    });

    card.append(head, question, answer, translation, remove);
    dom.savedList.appendChild(card);
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  dom.toast.querySelector("p").textContent = message;
  dom.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => dom.toast.classList.remove("is-visible"), 2200);
}

function openPanel(panel) {
  sound.play("click");
  closePanels(false);
  dom.overlay.hidden = false;
  requestAnimationFrame(() => dom.overlay.classList.add("is-visible"));
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  panel.querySelector("button")?.focus();
}

function closePanels(hideOverlay = true) {
  dom.drawer.classList.remove("is-open");
  dom.about.classList.remove("is-open");
  dom.drawer.setAttribute("aria-hidden", "true");
  dom.about.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  if (hideOverlay) {
    dom.overlay.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!dom.drawer.classList.contains("is-open") && !dom.about.classList.contains("is-open")) dom.overlay.hidden = true;
    }, 260);
  }
}

function resetExperience() {
  ritualRun += 1;
  currentReading = null;
  ritualBook = null;
  ritualPhase = "idle";
  document.body.removeAttribute("data-theme");
  dom.input.value = "";
  dom.counter.textContent = "0 / 80";
  dom.inputError.textContent = "";
  resetRitualVisual();
  showScreen(dom.home);
  window.setTimeout(() => dom.input.focus(), 500);
}

dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = dom.input.value.trim();
  if (question.length < 2) {
    dom.inputError.textContent = t("inputError");
    dom.input.focus();
    return;
  }
  dom.inputError.textContent = "";
  beginRitual(question);
});

dom.input.addEventListener("input", () => {
  dom.counter.textContent = `${dom.input.value.length} / 80`;
  if (dom.input.value.trim().length >= 2) dom.inputError.textContent = "";
});

dom.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    dom.form.requestSubmit();
  }
});

let fieldMotionFrame = 0;
dom.readingVisual.addEventListener("pointermove", (event) => {
  if (!dom.reading.classList.contains("is-active") || !dom.bookUniverse.classList.contains("is-visible") || dom.bookUniverse.classList.contains("is-morphing")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = dom.readingVisual.getBoundingClientRect();
  const normalizedX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  const normalizedY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  window.cancelAnimationFrame(fieldMotionFrame);
  fieldMotionFrame = window.requestAnimationFrame(() => {
    const focused = dom.bookUniverse.classList.contains("has-selection");
    dom.bookFieldCamera.style.setProperty("--field-ry", `${normalizedX * (focused ? 2.5 : 5)}deg`);
    dom.bookFieldCamera.style.setProperty("--field-rx", `${normalizedY * (focused ? -2 : -4)}deg`);
    dom.bookFieldCamera.style.setProperty("--field-x", `${normalizedX * (focused ? -4 : -10)}px`);
    dom.bookFieldCamera.style.setProperty("--field-y", `${normalizedY * (focused ? -3 : -7)}px`);
  });
});

dom.readingVisual.addEventListener("pointerleave", () => {
  dom.bookFieldCamera.style.setProperty("--field-rx", "0deg");
  dom.bookFieldCamera.style.setProperty("--field-ry", "0deg");
  dom.bookFieldCamera.style.setProperty("--field-x", "0px");
  dom.bookFieldCamera.style.setProperty("--field-y", "0px");
});

document.querySelectorAll("[data-question-zh]").forEach((button) => {
  button.addEventListener("click", () => {
    sound.play("click");
    dom.input.value = currentLanguage === "zh" ? button.dataset.questionZh : button.dataset.questionEn;
    dom.input.dispatchEvent(new Event("input"));
    dom.input.focus();
  });
});

document.querySelectorAll("[data-reset]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    sound.play("click");
    resetExperience();
  });
});

dom.saveAnswer.addEventListener("click", () => {
  if (!currentReading) return;
  const items = getSaved();
  if (items.some((item) => item.id === currentReading.id)) return;
  setSaved([currentReading, ...items].slice(0, 30));
  updateSaveButton(true);
  sound.play("save");
  showToast(t("savedToast"));
});

dom.languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.language === currentLanguage) return;
    sound.play("click");
    applyLanguage(button.dataset.language);
  });
});

dom.soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  sound.setEnabled(soundEnabled);
  updateSoundControl();
  savePrefs();
  if (soundEnabled) sound.play("select");
});

dom.openSaved.addEventListener("click", () => {
  renderSaved();
  openPanel(dom.drawer);
});
dom.openAbout.addEventListener("click", () => openPanel(dom.about));
dom.overlay.addEventListener("click", () => closePanels());
document.querySelectorAll(".close-panel").forEach((button) => button.addEventListener("click", () => {
  sound.play("click");
  closePanels();
}));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanels();
});

generateStars();
buildBookUniverse();
buildHomeBookLoop();
applyLanguage(currentLanguage);

// Preview hook: `?fast&lang=en&question=...` shortens the ritual for visual smoke tests.
const previewQuestion = urlParams.get("question");
if (fastMode && previewQuestion) {
  dom.input.value = previewQuestion.slice(0, 80);
  dom.input.dispatchEvent(new Event("input"));
  window.setTimeout(() => dom.form.requestSubmit(), 30);
}
