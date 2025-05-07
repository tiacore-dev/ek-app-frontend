//soundUtils.ts
export class SoundUtils {
  private audioContext: AudioContext | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  public playBeepSound() {
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
      oscillator.frequency.value = 750;
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
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
