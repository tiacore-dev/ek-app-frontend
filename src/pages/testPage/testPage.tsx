import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button } from "antd";

export const TestPage: React.FC = () => {
  const dispatch = useDispatch();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDataRef = useRef<string>("");

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование QR", to: "/test" },
      ])
    );
  }, [dispatch]);

  // Фокус на поле ввода при загрузке и очистка при размонтировании
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

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const newChar = input.value.slice(-1); // Получаем последний введенный символ

    // Очищаем предыдущий таймаут
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Добавляем новый символ к накопленным данным
    accumulatedDataRef.current += newChar;
    setIsScanning(true);

    // Устанавливаем новый таймаут
    scanTimeoutRef.current = setTimeout(() => {
      if (accumulatedDataRef.current) {
        setScanResult(accumulatedDataRef.current);
        setIsScanning(false);
        accumulatedDataRef.current = "";
      }
    }, 300);

    // Сбрасываем значение input, чтобы принимать новые символы
    input.value = "";
  };

  const clearResult = () => {
    setScanResult(null);
    setIsScanning(false);
    accumulatedDataRef.current = "";
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "30px" }}>
        Сканер QR-кодов (Zebra)
      </h1>

      {/* Скрытое поле ввода */}
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

      <div
        style={{
          margin: "20px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
          Наведите сканер на QR-код
          {isScanning && (
            <span style={{ color: "green", marginLeft: "10px" }}>
              Сканирование...
            </span>
          )}
        </p>
        <Button onClick={clearResult} size="large">
          Очистить результат
        </Button>
      </div>

      {scanResult && (
        <div
          style={{
            margin: "20px 0",
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            wordBreak: "break-word",
          }}
        >
          <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
            Результат сканирования:
          </h3>
          <pre
            style={{
              fontSize: "16px",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {scanResult}
          </pre>
        </div>
      )}
    </div>
  );
};
