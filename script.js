"use strict";
const gifStages = [
    "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif",
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAd/chiikawa-hachiware.gif",
    "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif",
    "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif",
    "https://media1.tenor.com/m/WGfra-Y_Ke0AAAAd/chiikawa-sad.gif",
    "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif",
    "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif",
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAC/chiikawa-hachiware.gif"
];
const noMessages = [
    "Нет",
    "Ты уверена? 🤔",
    "Ну пожалуйста... 🥺",
    "Если скажешь нет, мне будет очень грустно...",
    "Очень-очень грустно... 😢",
    "Пожалуйста??? 💔",
    "Не поступай так со мной...",
    "Последний шанс! 😭",
    "Всё равно не поймаешь 😜"
];
const yesTeasePokes = [
    "сначала попробуй нажать «Нет»... вдруг там что-то случится 😏",
    "ну же, нажми «Нет» хотя бы раз 👀",
    "ты пропускаешь самое интересное 😀",
    "нажми «Нет», если осмелишься 😏"
];
let yesTeasedCount = 0;
let noClickCount = 0;
let runawayEnabled = false;
let musicPlaying = true;
let teaseTimer;
let lastRunawayAt = 0;
const catGif = getElement("cat-gif");
const yesBtn = getElement("yes-btn");
const noBtn = getElement("no-btn");
const music = getElement("bg-music");
music.muted = true;
music.volume = 0.3;
music.play()
    .then(() => {
    music.muted = false;
})
    .catch(() => {
    document.addEventListener("click", () => {
        music.muted = false;
        void music.play().catch(() => { });
    }, { once: true });
});
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element #${id} was not found`);
    }
    return element;
}
function toggleMusic() {
    const toggle = getElement("music-toggle");
    if (musicPlaying) {
        music.pause();
        musicPlaying = false;
        toggle.textContent = "🔇";
        toggle.setAttribute("aria-label", "Включить музыку");
        return;
    }
    music.muted = false;
    void music.play();
    musicPlaying = true;
    toggle.textContent = "🔊";
    toggle.setAttribute("aria-label", "Выключить музыку");
}
function handleYesClick() {
    if (!runawayEnabled) {
        const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)];
        yesTeasedCount++;
        showTeaseMessage(msg);
        return;
    }
    window.location.href = "yes.html";
}
function showTeaseMessage(msg) {
    const toast = getElement("tease-toast");
    toast.textContent = msg;
    toast.classList.add("show");
    if (teaseTimer) {
        window.clearTimeout(teaseTimer);
    }
    teaseTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
}
function handleNoClick() {
    noClickCount++;
    const msgIndex = Math.min(noClickCount, noMessages.length - 1);
    noBtn.textContent = noMessages[msgIndex];
    const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize);
    const maxYesFontSize = window.innerWidth < 520 ? 44 : 72;
    yesBtn.style.fontSize = `${Math.min(currentSize * 1.22, maxYesFontSize)}px`;
    const padY = Math.min(18 + noClickCount * 5, 60);
    const padX = Math.min(45 + noClickCount * 8, 100);
    yesBtn.style.padding = `${padY}px ${padX}px`;
    if (noClickCount >= 2) {
        const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize);
        noBtn.style.fontSize = `${Math.max(noSize * 0.85, 10)}px`;
    }
    const gifIndex = Math.min(noClickCount, gifStages.length - 1);
    swapGif(gifStages[gifIndex]);
    if (msgIndex === noMessages.length - 1 && !runawayEnabled) {
        enableRunaway();
        runawayEnabled = true;
        runAway();
    }
}
function swapGif(src) {
    catGif.style.opacity = "0";
    window.setTimeout(() => {
        catGif.src = src;
        catGif.style.opacity = "1";
    }, 200);
}
function enableRunaway() {
    noBtn.addEventListener("mouseover", runAway);
    noBtn.addEventListener("pointermove", runAwayFromPointer);
    document.addEventListener("pointermove", runAwayFromPointer);
    noBtn.addEventListener("touchstart", runAway, { passive: true });
    noBtn.addEventListener("click", blockRunawayClick, true);
}
function blockRunawayClick(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    runAway(event);
}
function runAwayFromPointer(event) {
    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    const dangerRadius = Math.max(180, Math.min(300, rect.width * 1.9));
    if (distance < dangerRadius) {
        runAway(event);
    }
}
function runAway(event) {
    const now = performance.now();
    if (now - lastRunawayAt < 80) {
        return;
    }
    lastRunawayAt = now;
    const margin = 20;
    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;
    const maxX = Math.max(window.innerWidth - btnW - margin, margin);
    const maxY = Math.max(window.innerHeight - btnH - margin, margin);
    if (noBtn.style.position !== "fixed") {
        const currentRect = noBtn.getBoundingClientRect();
        noBtn.style.position = "fixed";
        noBtn.style.left = `${currentRect.left}px`;
        noBtn.style.top = `${currentRect.top}px`;
        noBtn.style.zIndex = "50";
        noBtn.getBoundingClientRect();
    }
    const target = pickRunawayTarget(getPointerPosition(event), maxX, maxY, margin);
    noBtn.style.left = `${target.x}px`;
    noBtn.style.top = `${target.y}px`;
}
function getPointerPosition(event) {
    if (!event) {
        return undefined;
    }
    if ("touches" in event && event.touches.length > 0) {
        return {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    if ("clientX" in event) {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }
    return undefined;
}
function pickRunawayTarget(pointer, maxX, maxY, margin) {
    const minX = margin / 2;
    const minY = margin / 2;
    const candidates = Array.from({ length: 16 }, () => ({
        x: Math.min(Math.random() * maxX + minX, maxX),
        y: Math.min(Math.random() * maxY + minY, maxY)
    }));
    if (!pointer) {
        return candidates[0];
    }
    return candidates.reduce((best, candidate) => {
        const bestDistance = Math.hypot(best.x - pointer.x, best.y - pointer.y);
        const candidateDistance = Math.hypot(candidate.x - pointer.x, candidate.y - pointer.y);
        return candidateDistance > bestDistance ? candidate : best;
    });
}
window.toggleMusic = toggleMusic;
window.handleYesClick = handleYesClick;
window.handleNoClick = handleNoClick;
