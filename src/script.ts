const gifStages: string[] = [
    "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif",
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAd/chiikawa-hachiware.gif",
    "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif",
    "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif",
    "https://media1.tenor.com/m/WGfra-Y_Ke0AAAAd/chiikawa-sad.gif",
    "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif",
    "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif",
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAC/chiikawa-hachiware.gif"
]

const noMessages: string[] = [
    "Нет",
    "Ты уверена? 🤔",
    "Ну пожалуйста... 🥺",
    "Если скажешь нет, мне будет очень грустно...",
    "Очень-очень грустно... 😢",
    "Пожалуйста??? 💔",
    "Не поступай так со мной...",
    "Последний шанс! 😭",
    "Всё равно не поймаешь 😜"
]

const yesTeasePokes: string[] = [
    "сначала попробуй нажать «Нет»... вдруг там что-то случится 😏",
    "ну же, нажми «Нет» хотя бы раз 👀",
    "ты пропускаешь самое интересное 😀",
    "нажми «Нет», если осмелишься 😏"
]

let yesTeasedCount = 0
let noClickCount = 0
let runawayEnabled = false
let musicPlaying = true
let teaseTimer: number | undefined
let runawayAnimationFrame: number | undefined
let runawayStarted = false
let runawayX = 0
let runawayY = 0
let lastRunawayAt = 0

const catGif = getElement<HTMLImageElement>("cat-gif")
const yesBtn = getElement<HTMLButtonElement>("yes-btn")
const noBtn = getElement<HTMLButtonElement>("no-btn")
const music = getElement<HTMLAudioElement>("bg-music")

music.muted = true
music.volume = 0.3
music.play()
    .then(() => {
        music.muted = false
    })
    .catch(() => {
        document.addEventListener("click", () => {
            music.muted = false
            void music.play().catch(() => {})
        }, { once: true })
    })

function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id)

    if (!element) {
        throw new Error(`Element #${id} was not found`)
    }

    return element as T
}

function toggleMusic(): void {
    const toggle = getElement<HTMLButtonElement>("music-toggle")

    if (musicPlaying) {
        music.pause()
        musicPlaying = false
        toggle.textContent = "🔇"
        toggle.setAttribute("aria-label", "Включить музыку")
        return
    }

    music.muted = false
    void music.play()
    musicPlaying = true
    toggle.textContent = "🔊"
    toggle.setAttribute("aria-label", "Выключить музыку")
}

function handleYesClick(): void {
    if (!runawayEnabled) {
        const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)]
        yesTeasedCount++
        showTeaseMessage(msg)
        return
    }

    window.location.href = "yes.html"
}

function showTeaseMessage(msg: string): void {
    const toast = getElement<HTMLDivElement>("tease-toast")

    toast.textContent = msg
    toast.classList.add("show")

    if (teaseTimer) {
        window.clearTimeout(teaseTimer)
    }

    teaseTimer = window.setTimeout(() => toast.classList.remove("show"), 2500)
}

function handleNoClick(): void {
    noClickCount++

    const msgIndex = Math.min(noClickCount, noMessages.length - 1)
    noBtn.textContent = noMessages[msgIndex]

    const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize)
    const maxYesFontSize = window.innerWidth < 520 ? 44 : 72
    yesBtn.style.fontSize = `${Math.min(currentSize * 1.22, maxYesFontSize)}px`

    const padY = Math.min(18 + noClickCount * 5, 60)
    const padX = Math.min(45 + noClickCount * 8, 100)
    yesBtn.style.padding = `${padY}px ${padX}px`

    if (noClickCount >= 2) {
        const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize)
        noBtn.style.fontSize = `${Math.max(noSize * 0.85, 10)}px`
    }

    const gifIndex = Math.min(noClickCount, gifStages.length - 1)
    swapGif(gifStages[gifIndex])

    if (noClickCount >= 5 && !runawayEnabled) {
        enableRunaway()
        runawayEnabled = true
    }
}

function swapGif(src: string): void {
    catGif.style.opacity = "0"

    window.setTimeout(() => {
        catGif.src = src
        catGif.style.opacity = "1"
    }, 200)
}

function enableRunaway(): void {
    noBtn.addEventListener("mouseover", runAway)
    noBtn.addEventListener("pointerenter", runAway)
    noBtn.addEventListener("touchstart", runAway, { passive: true })
    document.addEventListener("pointermove", runAwayFromPointer)
}

function runAwayFromPointer(event: PointerEvent): void {
    if (!runawayEnabled) {
        return
    }

    const rect = noBtn.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY)
    const dangerRadius = Math.max(130, Math.min(220, rect.width * 1.35))

    if (distance < dangerRadius) {
        runAway(event)
    }
}

function runAway(event?: MouseEvent | PointerEvent | TouchEvent): void {
    const now = performance.now()

    if (now - lastRunawayAt < 90) {
        return
    }

    lastRunawayAt = now

    const margin = 20
    const btnW = noBtn.offsetWidth
    const btnH = noBtn.offsetHeight
    const maxX = Math.max(window.innerWidth - btnW - margin, margin)
    const maxY = Math.max(window.innerHeight - btnH - margin, margin)

    if (!runawayStarted) {
        const rect = noBtn.getBoundingClientRect()
        runawayX = rect.left
        runawayY = rect.top
        noBtn.style.position = "fixed"
        noBtn.style.left = "0"
        noBtn.style.top = "0"
        noBtn.style.zIndex = "50"
        noBtn.style.transform = `translate3d(${runawayX}px, ${runawayY}px, 0)`
        runawayStarted = true
    }

    const pointer = getPointerPosition(event)
    const target = pickRunawayTarget(pointer, maxX, maxY, margin)
    const distance = Math.hypot(target.x - runawayX, target.y - runawayY)
    const duration = Math.max(260, Math.min(520, distance * 1.25))

    animateRunaway(target.x, target.y, duration)
}

function getPointerPosition(event?: MouseEvent | PointerEvent | TouchEvent): { x: number, y: number } | undefined {
    if (!event) {
        return undefined
    }

    if ("touches" in event && event.touches.length > 0) {
        return {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        }
    }

    if ("clientX" in event) {
        return {
            x: event.clientX,
            y: event.clientY
        }
    }

    return undefined
}

function pickRunawayTarget(
    pointer: { x: number, y: number } | undefined,
    maxX: number,
    maxY: number,
    margin: number
): { x: number, y: number } {
    const minX = margin / 2
    const minY = margin / 2
    const candidates = Array.from({ length: 10 }, () => ({
        x: Math.random() * maxX + minX,
        y: Math.random() * maxY + minY
    }))

    if (!pointer) {
        return candidates[0]
    }

    return candidates.reduce((best, candidate) => {
        const bestDistance = Math.hypot(best.x - pointer.x, best.y - pointer.y)
        const candidateDistance = Math.hypot(candidate.x - pointer.x, candidate.y - pointer.y)

        return candidateDistance > bestDistance ? candidate : best
    })
}

function animateRunaway(targetX: number, targetY: number, duration: number): void {
    if (runawayAnimationFrame) {
        window.cancelAnimationFrame(runawayAnimationFrame)
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        moveRunawayButton(targetX, targetY)
        return
    }

    const startX = runawayX
    const startY = runawayY
    const startedAt = performance.now()

    const step = (timestamp: number): void => {
        const progress = Math.min((timestamp - startedAt) / duration, 1)
        const easedProgress = easeInOutCubic(progress)
        const nextX = startX + (targetX - startX) * easedProgress
        const nextY = startY + (targetY - startY) * easedProgress

        moveRunawayButton(nextX, nextY)

        if (progress < 1) {
            runawayAnimationFrame = window.requestAnimationFrame(step)
        }
    }

    runawayAnimationFrame = window.requestAnimationFrame(step)
}

function moveRunawayButton(x: number, y: number): void {
    runawayX = x
    runawayY = y
    noBtn.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

function easeInOutCubic(progress: number): number {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

window.toggleMusic = toggleMusic
window.handleYesClick = handleYesClick
window.handleNoClick = handleNoClick
