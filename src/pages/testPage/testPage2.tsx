import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button, notification } from "antd";

export const TestPage2: React.FC = () => {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование штрихкодов", to: "/test2" },
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
      message: <span>Отсканировано: {result}</span>,
      description: (
        <Button
          type="link"
          size="small"
          onClick={() => {
            navigator.clipboard.writeText(result);
            api.info({ message: "Текст скопирован в буфер обмена" });
          }}
          style={{ padding: 0 }}
        >
          Копировать
        </Button>
      ),
      duration: 8,
      placement: "topRight",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();

      if (value) {
        showScanResult(value);
        setIsScanning(false);

        // Очищаем поле после обработки
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } else {
      setIsScanning(true);

      // Сбрасываем таймаут при новом вводе
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // Устанавливаем таймаут для автосброса, если Enter не пришел
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }, 1000);
    }
  };

  const clearResult = () => {
    setIsScanning(false);
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
        Сканер штрих-кодов (Netum)
      </h1>

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

      <div
        style={{
          margin: "20px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
          Наведите сканер на штрих-код
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
