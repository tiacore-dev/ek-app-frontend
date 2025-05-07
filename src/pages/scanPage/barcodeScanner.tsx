import React, { useEffect, useRef } from "react";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onScanStatusChange?: (isScanning: boolean) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onScanStatusChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();

      if (value) {
        onScan(value);
        onScanStatusChange?.(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } else {
      onScanStatusChange?.(true);

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      scanTimeoutRef.current = setTimeout(() => {
        onScanStatusChange?.(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }, 1000);
    }
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
      onKeyDown={handleKeyDown}
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
