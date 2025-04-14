import React, { useEffect, useMemo, useState, useRef } from "react";
import { useUserQuery } from "../../hooks/useUserQuery";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { Button } from "antd";

export const TestPage: React.FC = () => {
  const { data: user, isLoading } = useUserQuery();
  const dispatch = useDispatch();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isZebraScannerActive, setIsZebraScannerActive] = useState(false);
  const isMobile = useMobileDetection();
  const scannedDataRef = useRef("");

  const breadcrumbs = useMemo(
    () => [
      { label: "Главная страница", to: "/home" },
      { label: "Тесты QR", to: "/test" },
    ],
    []
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(breadcrumbs));
  }, [dispatch, breadcrumbs]);

  // Обработчик для Zebra сканера (Keystroke output)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем ввод, если Zebra сканер не активирован
      if (!isZebraScannerActive) return;

      // Обрабатываем только обычные символы и Enter
      if (e.key === "Enter") {
        // Сохраняем результат сканирования
        if (scannedDataRef.current) {
          setScanResult(scannedDataRef.current);
          scannedDataRef.current = "";
        }
      } else if (e.key.length === 1) {
        // Накапливаем символы
        scannedDataRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZebraScannerActive]);

  const startCameraScan = () => {
    if (scanner) {
      scanner.clear().catch((error) => {
        console.error("Ошибка при остановке сканера", error);
      });
    }

    setScanResult(null);
    setIsZebraScannerActive(false);

    const qrboxSize = isMobile
      ? { width: 200, height: 200 }
      : { width: 250, height: 250 };

    const config = {
      fps: 10,
      qrbox: qrboxSize,
      aspectRatio: isMobile ? 1.0 : 1.777778,
      disableFlip: isMobile,
      text: {
        title: "Сканирование QR-кода",
        headerText: "Наведите камеру на QR-код",
        bodyText: {
          scanBody: "Позиционируйте QR-код в пределах рамки",
          scanBodyDisabled: "Камера отключена",
        },
        actions: {
          cameraPermissionTitle: "Требуется доступ к камере",
          cameraPermissionRequesting: "Запрос разрешения...",
          cameraPermissionGranted: "Доступ к камере разрешен",
          cameraPermissionDenied: "Доступ к камере запрещен",
          changeCamera: "Сменить камеру",
          torchOn: "Включить вспышку",
          torchOff: "Выключить вспышку",
          scanButtonActive: "Сканировать",
          scanButtonStop: "Остановить",
          cameraMissing: "Камера не найдена",
          unableToAccess: "Не удается получить доступ к камере",
          scannerPaused: "Сканирование приостановлено",
        },
        feedback: {
          success: {
            displayText: "Успешно!",
            duration: 1000,
          },
          wrongImage: "Это не QR-код",
          unableToParse: "Не удалось распознать QR-код",
          permissionMissing: "Нет доступа к камере",
        },
      },
      rememberLastUsedCamera: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 1,
    };

    const newScanner = new Html5QrcodeScanner("qr-reader", config, false);

    newScanner.render(
      (decodedText) => {
        newScanner.clear();
        setScanResult(decodedText);
      },
      (error) => {
        console.warn("Ошибка сканирования:", error);
      }
    );

    setScanner(newScanner);
  };

  const startZebraScan = () => {
    // Останавливаем камерный сканер если активен
    if (scanner) {
      scanner.clear().catch((error) => {
        console.error("Ошибка при остановке сканера", error);
      });
      setScanner(null);
    }

    setScanResult(null);
    scannedDataRef.current = "";
    setIsZebraScannerActive(true);
  };

  const stopScan = () => {
    if (scanner) {
      scanner.clear().catch((error) => {
        console.error("Ошибка при остановке сканера", error);
      });
      setScanner(null);
    }
    setIsZebraScannerActive(false);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "100%", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>
        Сканер QR-кодов
      </h1>

      <div
        style={{
          margin: "20px 0",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "10px",
        }}
      >
        <Button onClick={startCameraScan}>Сканирование камерой</Button>
        <Button
          onClick={startZebraScan}
          type={isZebraScannerActive ? "primary" : "default"}
        >
          Использовать Zebra сканер
        </Button>
        <Button onClick={stopScan} danger>
          Остановить сканирование
        </Button>
      </div>

      {!isZebraScannerActive && (
        <div
          id="qr-reader"
          style={{
            width: isMobile ? "100%" : "500px",
            margin: "20px 0",
            maxWidth: "100%",
          }}
        ></div>
      )}

      {isZebraScannerActive && (
        <div
          style={{
            margin: "20px 0",
            padding: "15px",
            backgroundColor: "#f0f7ff",
            borderRadius: "4px",
          }}
        >
          <h3 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            Режим Zebra сканера активен
          </h3>
          <p>Нажмите кнопку сканера на устройстве для сканирования QR-кода</p>
        </div>
      )}

      {scanResult && (
        <div
          style={{
            margin: "20px 0",
            wordBreak: "break-word",
            padding: isMobile ? "10px" : "15px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <h3 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            Результат сканирования:
          </h3>
          <p
            style={{
              fontSize: isMobile ? "14px" : "16px",
              whiteSpace: "pre-wrap",
            }}
          >
            {scanResult}
          </p>
        </div>
      )}
    </div>
  );
};
