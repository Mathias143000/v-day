"use strict";
let successMusicPlaying = false;
window.addEventListener("load", () => {
    launchConfetti();
    const music = getSuccessElement("bg-music");
    music.volume = 0.3;
    void music.play().catch(() => { });
    successMusicPlaying = true;
    const toggle = getSuccessElement("music-toggle");
    toggle.textContent = "🔊";
    toggle.setAttribute("aria-label", "Выключить музыку");
});
function getSuccessElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element #${id} was not found`);
    }
    return element;
}
function launchConfetti() {
    const colors = ["#ff69b4", "#ff1493", "#ff85a2", "#ffb3c1", "#ff0000", "#ff6347", "#fff", "#ffdf00"];
    const duration = 6000;
    const end = Date.now() + duration;
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors
    });
    const interval = window.setInterval(() => {
        if (Date.now() > end) {
            window.clearInterval(interval);
            return;
        }
        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors
        });
        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors
        });
    }, 300);
}
function toggleSuccessMusic() {
    const music = getSuccessElement("bg-music");
    const toggle = getSuccessElement("music-toggle");
    if (successMusicPlaying) {
        music.pause();
        successMusicPlaying = false;
        toggle.textContent = "🔇";
        toggle.setAttribute("aria-label", "Включить музыку");
        return;
    }
    void music.play();
    successMusicPlaying = true;
    toggle.textContent = "🔊";
    toggle.setAttribute("aria-label", "Выключить музыку");
}
window.toggleMusic = toggleSuccessMusic;
