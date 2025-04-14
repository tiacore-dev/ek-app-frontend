import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button, Alert } from "antd";

export const TestPage: React.FC = () => {
  const dispatch = useDispatch();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannedDataRef = useRef("");
  const scanTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование QR", to: "/test" },
      ])
    );
  }, [dispatch]);

  // Обработчик для Zebra сканера без Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем управляющие клавиши
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Сбрасываем таймер при новом вводе
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // Если это печатный символ
      if (e.key.length === 1) {
        if (!isScanning) setIsScanning(true);
        scannedDataRef.current += e.key;
      }

      // Запускаем таймер для определения конца ввода
      scanTimeoutRef.current = window.setTimeout(() => {
        if (scannedDataRef.current) {
          setScanResult(scannedDataRef.current);
          scannedDataRef.current = "";
          setIsScanning(false);
        }
      }, 200); // Таймаут 200мс между символами
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [isScanning]);

  const clearResult = () => {
    setScanResult(null);
    scannedDataRef.current = "";
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>
        Сканер QR-кодов (Zebra)
      </h1>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        {isScanning ? (
          <Alert message="Сканирование..." type="info" showIcon />
        ) : (
          <Alert message="Готов к сканированию" type="success" showIcon />
        )}
      </div>

      <Button
        onClick={clearResult}
        size="large"
        style={{ margin: "0 auto 24px", display: "block" }}
      >
        Очистить результат
      </Button>

      {scanResult && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>Результат сканирования:</h3>
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "4px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowX: "auto",
            }}
          >
            {scanResult}
          </div>
        </div>
      )}
    </div>
  );
};
