import React, { useEffect, useRef } from "react";

interface ZebraScannerProps {
  onScan: (result: string) => void;
  onScanStatusChange?: (isScanning: boolean) => void;
}

export const ZebraScanner: React.FC<ZebraScannerProps> = ({
  onScan,
  onScanStatusChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDataRef = useRef<string>("");

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const newData = input.value;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    accumulatedDataRef.current = newData;
    onScanStatusChange?.(true);

    scanTimeoutRef.current = setTimeout(() => {
      if (accumulatedDataRef.current) {
        onScan(accumulatedDataRef.current);
        onScanStatusChange?.(false);
        accumulatedDataRef.current = "";
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }, 300);
  };

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
    }

    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      onInput={handleInput}
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
      }}
    />
  );
};
