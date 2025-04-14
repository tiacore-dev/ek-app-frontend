import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button } from "antd";

export const TestPage: React.FC = () => {
  const dispatch = useDispatch();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannedDataRef = useRef("");

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование QR", to: "/test" },
      ])
    );
  }, [dispatch]);

  // Обработчик для Zebra сканера (Keystroke output)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // Сохраняем результат сканирования при нажатии Enter
        if (scannedDataRef.current) {
          setScanResult(scannedDataRef.current);
          scannedDataRef.current = "";
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Накапливаем символы (игнорируем управляющие клавиши)
        scannedDataRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const clearResult = () => {
    setScanResult(null);
    scannedDataRef.current = "";
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

      <div
        style={{
          margin: "20px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
          Нажмите кнопку сканера на устройстве
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
