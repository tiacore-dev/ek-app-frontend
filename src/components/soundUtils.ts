//soundUtils.ts
export class SoundUtils {
  private audioContext: AudioContext | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  public playBeepSound(type: "success" | "error" = "success") {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = "triangle";

      if (type === "success") {
        // Высокий короткий звук для успеха
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
      } else {
        // Низкий долгий звук для ошибки
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.7);
      }
    } catch (error) {
      console.error("Ошибка воспроизведения звука:", error);
    }
  }

  public speakNumbers(numbers: string, lang = "ru-RU") {
    if (!this.speechSynthesis) return;

    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `Зона хранения ${numbers.split("").join(" ")}`;
    utterance.lang = lang;
    utterance.rate = 0.8;

    this.speechSynthesis.speak(utterance);
  }

  public cleanup() {
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
}
