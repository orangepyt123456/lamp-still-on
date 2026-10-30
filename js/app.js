import { chapters, edges, nodes } from "./data.js";
import { createCourier } from "./courier.js";
import { mountGraph } from "./graph.js";

const intro = document.querySelector("#intro");
const app = document.querySelector("#app");
const stage = document.querySelector("#stage");
const seal = document.querySelector("#seal");
const place = document.querySelector("#place");
const chapterTitle = document.querySelector("#chapter-title");
const readingBody = document.querySelector("#reading-body");
const sourceEl = document.querySelector("#source");
const subKicker = document.querySelector("#sub-kicker");
const subText = document.querySelector("#sub-text");
const voiceNote = document.querySelector("#voice-note");
const listenBtn = document.querySelector("#listen");
const muteBtn = document.querySelector("#mute");

const state = {
  chapter: "wall",
  pass: "sealed",
  lampOn: true,
  muted: false,
  activeNode: null
};

let courier = null;
let graph = null;
let speechToken = 0;
let chosenVoice = null;

function pickVoice() {
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  chosenVoice = voices.find((voice) => /zh[-_]?CN/i.test(voice.lang))
    || voices.find((voice) => /^zh/i.test(voice.lang))
    || null;
  voiceNote.hidden = Boolean(chosenVoice);
}

if (window.speechSynthesis) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
} else {
  voiceNote.hidden = false;
}

const vitrine = document.querySelector(".vitrine");

function setTalking(on) {
  if (!courier) return;
  courier.setSpeaking(on);
  vitrine.classList.toggle("is-speaking", on);
}

function speak(text, onend) {
  const synth = window.speechSynthesis;
  if (!synth || state.muted) {
    onend();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.94;
  utterance.pitch = 0.92;
  if (chosenVoice) utterance.voice = chosenVoice;
  utterance.onend = onend;
  utterance.onerror = onend;
  const start = () => synth.speak(utterance);
  if (synth.speaking || synth.pending) {
    synth.cancel();
    window.setTimeout(start, 80);
  } else {
    start();
  }
}

function say(text, kicker, source) {
  const token = ++speechToken;
  subKicker.textContent = kicker || "";
  subText.textContent = text;
  sourceEl.textContent = source || "";
  if (!courier) return;
  if (state.muted || !window.speechSynthesis) {
    setTalking(false);
    return;
  }
  setTalking(true);
  speak(text, () => {
    if (token === speechToken) setTalking(false);
  });
}

function selectNode(id) {
  const node = nodes.find((item) => item.id === id);
  if (!node) return;
  state.activeNode = id;
  graph.setActive(id);
  if (courier) courier.lookAt(node.look || 0);
  stage.querySelectorAll("[data-node]").forEach((el) => {
    el.classList.toggle("lit", el.dataset.node === id);
  });
  say(node.speech, node.label, node.source);
}

function wallMarkup() {
  return `
    <div class="wall">
      <article class="plaque">
        <p class="plaque-place">虎岗 · 留存标语 · 墙面示意</p>
        <button class="glyphs" data-node="slogan" type="button">打通闽粤赣<br>交通路线，<br>革命成功</button>
      </article>
      <article class="plaque faint">
        <p class="plaque-place">高陂锡光堂 · 残字</p>
        <p class="glyphs small">天下太平</p>
        <button class="glyphs gap" data-node="gap" type="button">争取全国<span class="unclear">□□</span></button>
        <p class="plaque-note">方框是报道里没认清的字。释读打开时标红，不补写。</p>
      </article>
    </div>`;
}

function passMarkup() {
  const open = state.pass === "open";
  const refused = state.pass === "refused";
  return `
    <div class="pass-scene">
      <article class="paper ${open ? "open" : ""} ${refused ? "refused" : ""}">
        <p class="paper-kicker">路 条 · 示意</p>
        <h3>不是原件录文</h3>
        <dl>
          <div><dt>持有人</dt><dd><button type="button" data-node="courier" class="${open ? "" : "locked"}">未定</button></dd></div>
          <div><dt>从</dt><dd class="${open ? "" : "locked"}">上一站</dd></div>
          <div><dt>到</dt><dd class="${open ? "" : "locked"}">伯公凹</dd></div>
          <div><dt>信号</dt><dd class="${open ? "" : "locked"}">${open ? "江面无风，要起船了" : "········"}</dd></div>
        </dl>
        <p class="stamp">${open ? "放行" : refused ? "不应答" : "待核"}</p>
      </article>
      <div class="signals">
        <p>选今夜听到的一句</p>
        <button type="button" data-action="safe">江面无风</button>
        <button type="button" data-action="danger">江面起风</button>
      </div>
    </div>`;
}

function lampMarkup() {
  return `
    <div class="temple">
      <button class="lantern" type="button" data-action="toggle-lamp" aria-label="${state.lampOn ? "灯亮着，点击吹灭" : "灯灭了，点击点亮"}">
        <span class="lantern-handle"></span>
        <span class="lantern-glow"></span>
        <span class="flame"></span>
        <span class="lantern-word">${state.lampOn ? "灯亮" : "灯灭"}</span>
      </button>
      <div class="ash">
        <button class="slip" type="button" data-node="ash">灯亮为安全<br>情报藏在香灰下<small>摘自公开记述，不是原信录文</small></button>
        <span class="mound"></span>
      </div>
    </div>`;
}

function render() {
  const chapter = chapters[state.chapter];
  stage.className = `stage chapter-${state.chapter}`;
  if (state.chapter === "lamp") stage.classList.add(state.lampOn ? "lamp-on" : "lamp-off");
  if (state.chapter === "wall") stage.innerHTML = wallMarkup();
  if (state.chapter === "pass") stage.innerHTML = passMarkup();
  if (state.chapter === "lamp") stage.innerHTML = lampMarkup();

  seal.textContent = chapter.seal;
  seal.dataset.kind = chapter.id;
  place.textContent = chapter.place;
  chapterTitle.textContent = chapter.title;
  readingBody.textContent = chapter.body;
  document.querySelectorAll(".tab").forEach((tab) => {
    const on = tab.dataset.chapter === state.chapter;
    tab.classList.toggle("on", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });
  graph.setRelated(chapter.related);
  if (state.activeNode) graph.setActive(state.activeNode);
}

function go(chapter) {
  state.chapter = chapter;
  state.activeNode = null;
  speechToken += 1;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  setTalking(false);
  render();
  subKicker.textContent = chapters[chapter].place;
  subText.textContent = chapters[chapter].hint;
  sourceEl.textContent = "";
}

stage.addEventListener("click", (event) => {
  const node = event.target.closest("[data-node]");
  if (node) {
    selectNode(node.dataset.node);
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "safe") {
    state.pass = "open";
    render();
    say(
      "江面无风，要起船了。这是安全信号，路条打开。这张纸是示意，不是原件录文。持有人仍是未定，因为许多交通员没有留下姓名。",
      "放行",
      "共产党员网，2021-10-29"
    );
  }
  if (action.dataset.action === "danger") {
    state.pass = "refused";
    render();
    say("江面起风了，表示危险。站口不应答，路条不打开。", "不应答", "共产党员网，2021-10-29");
  }
  if (action.dataset.action === "toggle-lamp") {
    state.lampOn = !state.lampOn;
    render();
    if (state.lampOn) {
      say("灯又亮了，表示安全。香灰下那句仍是公开记述里的话，不是一封新编的信。", "灯亮", "共产党员网，2021-10-29");
    } else {
      say("灯灭了，表示危险。纸条收回香灰里。没有出处的信，这里不编。", "灯灭", "共产党员网，2021-10-29");
    }
  }
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => go(tab.dataset.chapter));
});

document.querySelectorAll("[data-layer]").forEach((button) => {
  button.addEventListener("click", () => {
    const on = document.body.classList.toggle(`layer-${button.dataset.layer}`);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
});

listenBtn.addEventListener("click", () => {
  const chapter = chapters[state.chapter];
  say(chapter.speech, chapter.title, chapter.source);
});

muteBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  muteBtn.setAttribute("aria-pressed", state.muted ? "true" : "false");
  muteBtn.textContent = state.muted ? "声音关" : "声音开";
  speechToken += 1;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  setTalking(false);
});

document.addEventListener("keydown", (event) => {
  if (app.hidden) return;
  if (event.key === "1") go("wall");
  if (event.key === "2") go("pass");
  if (event.key === "3") go("lamp");
});

graph = mountGraph(document.querySelector("#graph"), nodes, edges, selectNode);

document.querySelector("#enter").addEventListener("click", () => {
  intro.classList.add("leave");
  app.hidden = false;
  requestAnimationFrame(() => app.classList.add("on"));
  window.setTimeout(() => {
    intro.hidden = true;
  }, 700);
  courier = createCourier(document.querySelector("#courier"));
  if (!courier.ok) document.querySelector(".vitrine").classList.add("no-webgl");
  render();
  requestAnimationFrame(() => courier.resize());
  say("你只知道下一站。先看墙上的字。", "交通员", "页面提示，不是史料引文");
});
