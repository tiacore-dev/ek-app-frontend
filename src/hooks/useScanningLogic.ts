// src/hooks/useScanningLogic.ts
import { useRef, useState } from "react";
import { SoundUtils } from "../components/soundUtils";

export const useScanningLogic = () => {
  const [scanResult, setScanResult] = useState<string>("");
  const [storageZone, setStorageZone] = useState<string>("");
  const soundUtilsRef = useRef<SoundUtils>(new SoundUtils());

  const handleScanResult = async (decodedText: string) => {
    const zoneRegex = /^[0]{4}-[0]{4}-([0-9]{3})$/;
    const isZone = zoneRegex.test(decodedText);

    if (isZone) {
      const zoneMatch = decodedText.match(zoneRegex);
      if (zoneMatch && zoneMatch[1]) {
        setStorageZone(zoneMatch[1]);
        setScanResult("");
        soundUtilsRef.current?.speakNumbers(zoneMatch[1]);
        return true; // indicates zone was set
      }
    } else {
      const result = storageZone
        ? `${storageZone}(${decodedText})`
        : decodedText;
      setScanResult((prev) => (prev ? `${prev}\n${result}` : result));
      soundUtilsRef.current?.playBeepSound();
    }
    return false;
  };

  const handleScanError = (errorMessage: string) => {
    console.log(errorMessage);
  };

  const resetStorageZone = () => {
    setStorageZone("");
  };

  return {
    scanResult,
    storageZone,
    handleScanResult,
    handleScanError,
    resetStorageZone,
    setScanResult,
    setStorageZone,
  };
};
