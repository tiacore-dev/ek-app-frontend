import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { Switch, Input, message, Button } from "antd";
import { useMobileDetection } from "../../../hooks/useMobileDetection";

export const WarehouseReceivePage: React.FC = () => {
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();
  const [inputMode, setInputMode] = useState<boolean>(false);
  const [qrResult, setQrResult] = useState<string>("");
  const [storageZone, setStorageZone] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Склад" },
        { label: "Принять на склад", to: "/warehouse/receive" },
      ])
    );
  }, [dispatch]);

  const handleSwitchChange = async (checked: boolean) => {
    setInputMode(checked);
    setQrResult("");

    if (!checked) {
      await initQrScanner();
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }
    }
  };

  const initQrScanner = async () => {
    try {
      const QrScanner = (await import("qr-scanner")).default;

      if (videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result: any) => {
            const text = result.data;
            handleQrResult(text);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            preferredCamera: isMobile ? "environment" : "user",
          }
        );
        await scannerRef.current.start();
      }
    } catch (error) {
      console.error("Ошибка при инициализации QR-сканера:", error);
      message.error("Не удалось инициализировать QR-сканер");
    }
  };

  const handleQrResult = (text: string) => {
    const zoneMatch = text.match(/^(0000-0000-)(\d+)$/);

    if (zoneMatch) {
      const zoneCode = zoneMatch[2];
      setStorageZone(zoneCode);
      setQrResult("");
      message.success(`Зона хранения установлена: ${zoneCode}`);
    } else {
      if (storageZone) {
        setQrResult(`${storageZone}(${text})`);
      } else {
        setQrResult(text);
      }
      message.success("QR-код успешно отсканирован!");
    }
  };

  const resetStorageZone = () => {
    setStorageZone(null);
    message.info("Зона хранения сброшена");
  };

  useEffect(() => {
    if (!inputMode) {
      initQrScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
      }
    };
  }, [inputMode, isMobile]);

  // Стили для мобильных устройств
  const mobileStyles = {
    container: {
      padding: "10px",
    },
    title: {
      fontSize: "1.4rem",
      marginBottom: "20px",
      textAlign: "center" as const,
    },
    video: {
      width: "100%",
      maxWidth: "none",
      border: "2px solid #fa8c16",
      borderRadius: "8px",
      height: "auto",
    },
    input: {
      width: "100%",
      marginBottom: "10px",
    },
    button: {
      marginLeft: "10px",
    },
  };

  const desktopStyles = {
    container: {
      padding: "20px",
    },
    title: {
      fontSize: "1.8rem",
      marginBottom: "30px",
    },
    video: {
      width: "100%",
      maxWidth: "500px",
      border: "2px solid #fa8c16",
      borderRadius: "8px",
    },
    input: {
      width: "300px",
      marginBottom: "10px",
    },
    button: {
      marginLeft: "10px",
    },
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{inputMode ? "Ручной ввод" : "QR-сканер"}</h1>

      <div style={{ marginBottom: "20px" }}>
        <Switch
          checkedChildren=""
          unCheckedChildren=""
          checked={inputMode}
          onChange={handleSwitchChange}
          style={{
            backgroundColor: inputMode ? undefined : "#fa8c16",
          }}
        />
      </div>

      {inputMode ? (
        <>
          <Input
            placeholder="Введите данные вручную"
            style={styles.input}
            value={qrResult}
            onChange={(e) => setQrResult(e.target.value)}
          />
          {storageZone && (
            <div style={{ marginBottom: "10px" }}>
              <span>Зона хранения: {storageZone}</span>
              <Button
                onClick={resetStorageZone}
                style={styles.button}
                size={isMobile ? "middle" : "small"}
              >
                Сбросить
              </Button>
            </div>
          )}
        </>
      ) : (
        <div>
          <video ref={videoRef} style={styles.video}></video>

          {storageZone && (
            <div style={{ margin: "10px 0" }}>
              <span>Текущая зона хранения: {storageZone}</span>
              <Button
                onClick={resetStorageZone}
                style={styles.button}
                size={isMobile ? "middle" : "small"}
              >
                Сбросить
              </Button>
            </div>
          )}

          {qrResult && (
            <div style={{ marginTop: "20px" }}>
              <h3>Результат сканирования:</h3>
              <p>{qrResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
