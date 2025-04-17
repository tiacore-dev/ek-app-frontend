// src/components/common/AudioFeedback.tsx
import { useEffect, useRef } from "react";

export const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      speechSynthesisRef.current?.cancel();
    };
  }, []);

  const playBeepSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.type = "triangle";
      oscillator.frequency.value = 750;
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    } catch (error) {
      console.error("Ошибка воспроизведения звука:", error);
    }
  };

  const speakNumbers = (numbers: string) => {
    if (!speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `Зона хранения ${numbers.split("").join(" ")}`;
    utterance.lang = "ru-RU";
    utterance.rate = 0.8;

    speechSynthesisRef.current.speak(utterance);
  };

  const closeAudio = async () => {
    if (audioContextRef.current?.state !== "closed") {
      await audioContextRef.current?.close();
    }
  };

  return { playBeepSound, speakNumbers, closeAudio };
};
