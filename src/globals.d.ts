export {}

declare global {
    interface Window {
        handleNoClick: () => void
        handleYesClick: () => void
        toggleMusic: () => void
    }
}
