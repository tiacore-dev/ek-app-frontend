import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button, notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

export const TestPage: React.FC = () => {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
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

  const showScanResult = (result: string) => {
    api.success({
      message: "QR-код успешно отсканирован",
      description: (
        <div style={{ marginTop: 16 }}>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              backgroundColor: "#f6f6f6",
              padding: 12,
              borderRadius: 4,
              margin: 0,
            }}
          >
            {result}
          </pre>
          <Button
            type="link"
            size="small"
            onClick={() => navigator.clipboard.writeText(result)}
            style={{ marginTop: 8 }}
          >
            Копировать
          </Button>
        </div>
      ),
      duration: 8,
      placement: "topRight",
    });
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const newData = input.value;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    accumulatedDataRef.current = newData;
    setIsScanning(true);

    scanTimeoutRef.current = setTimeout(() => {
      if (accumulatedDataRef.current) {
        showScanResult(accumulatedDataRef.current);
        setIsScanning(false);
        accumulatedDataRef.current = "";
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }, 300);
  };

  const clearResult = () => {
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
      {contextHolder}

      <h1 style={{ fontSize: "1.8rem", marginBottom: "30px" }}>
        Сканер QR-кодов (Zebra)
      </h1>

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
          Сбросить сканер
        </Button>
      </div>

      {/* Индикатор состояния для мобильных устройств */}
      <div
        style={{
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
        }}
      >
        {isScanning ? "Сканирование..." : "Готов к сканированию"}
      </div>
    </div>
  );
};
