// src/hooks/useManualInput.ts
import { useState } from "react";

export const useManualInput = (onSubmitCallback: (value: string) => void) => {
  const [manualInput, setManualInput] = useState<string>("");

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInput(e.target.value);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onSubmitCallback(manualInput);
      setManualInput("");
    }
  };

  return {
    manualInput,
    handleManualInputChange,
    handleManualSubmit,
  };
};
