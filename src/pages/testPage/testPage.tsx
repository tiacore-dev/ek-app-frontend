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
  const lastCharTimeRef = useRef<number>(0);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование QR", to: "/test" },
      ])
    );
  }, [dispatch]);

  // Фокус на поле ввода при загрузке
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      // Очистка таймера при размонтировании компонента
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик ввода данных
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    // Если есть предыдущий таймаут - очищаем его
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Если ввод начался, но флаг еще не установлен
    if (value && !isScanning) {
      setIsScanning(true);
    }

    // Запоминаем время последнего ввода
    lastCharTimeRef.current = Date.now();

    // Устанавливаем таймаут для завершения сканирования
    scanTimeoutRef.current = setTimeout(() => {
      if (isScanning && value) {
        setScanResult(value);
        setIsScanning(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }, 300); // Таймаут 300мс после последнего ввода
  };

  const clearResult = () => {
    setScanResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    setIsScanning(false);
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

      {/* {scanResult && ( */}
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
      {/* )} */}
    </div>
  );
};
