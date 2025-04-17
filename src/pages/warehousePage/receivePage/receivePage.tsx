import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { Switch, Input, Button, Space, Card, message, Modal } from "antd";
import { Html5Qrcode } from "html5-qrcode";
import { useMobileDetection } from "../../../hooks/useMobileDetection";

export const WarehouseReceivePage: React.FC = () => {
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();
  const [inputMode, setInputMode] = useState<boolean>(true);
  const [manualInput, setManualInput] = useState<string>("");
  const [scanResult, setScanResult] = useState<string>("");
  const [storageZone, setStorageZone] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrContainerId = "qr-reader-container";
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const modalRenderedRef = useRef(false);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Склад" },
        { label: "Принять на склад", to: "/warehouse/receive" },
      ])
    );

    return () => {
      stopScanner();
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const getScannerConfig = () => {
    return {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250,
      },
      supportedScanTypes: [],
    };
  };

  const startScanner = () => {
    setIsModalVisible(true);
  };

  const stopScanner = async () => {
    try {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        await qrCodeRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Ошибка остановки сканера:", err);
    } finally {
      setIsModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    stopScanner();
  };

  const initScanner = async () => {
    try {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode(qrContainerId);
      }

      // Добавляем небольшую задержку для гарантии, что DOM-элемент существует
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (qrCodeRef.current && !qrCodeRef.current.isScanning) {
        await qrCodeRef.current.start(
          { facingMode: "environment" },
          getScannerConfig(),
          handleScanResult,
          handleScanError
        );
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Ошибка запуска сканера:", err);
      message.error("Не удалось запустить сканер");
      setIsModalVisible(false);
    }
  };

  const playBeepSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.type = "triangle";
      oscillator.frequency.value = 750;
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    } catch (error) {
      console.error("Ошибка воспроизведения звука:", error);
    }
  };

  const speakNumbers = (numbers: string) => {
    if (!speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `Зона хранения ${numbers.split("").join(" ")}`;
    utterance.lang = "ru-RU";
    utterance.rate = 0.8;

    speechSynthesisRef.current.speak(utterance);
  };

  const handleScanResult = async (decodedText: string) => {
    const zoneRegex = /^[0]{4}-[0]{4}-([0-9]{3})$/;
    const isZone = zoneRegex.test(decodedText);

    if (isZone) {
      const zoneMatch = decodedText.match(zoneRegex);
      if (zoneMatch && zoneMatch[1]) {
        setStorageZone(zoneMatch[1]);
        setScanResult("");
        await stopScanner();
        speakNumbers(zoneMatch[1]);
      }
    } else {
      const result = storageZone
        ? `${storageZone}(${decodedText})`
        : decodedText;
      setScanResult((prev) => (prev ? `${prev}\n${result}` : result));
      playBeepSound();
      await stopScanner();
    }
  };

  const handleScanError = (errorMessage: string) => {
    console.log(errorMessage);
  };

  const handleSwitchChange = (checked: boolean) => {
    setInputMode(checked);
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInput(e.target.value);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput);
      setManualInput("");
    }
  };

  const resetStorageZone = () => {
    setStorageZone("");
  };

  return (
    <div style={{ padding: isMobile ? "10px" : "20px" }}>
      <h1
        style={{
          fontSize: isMobile ? "1.4rem" : "1.8rem",
          marginBottom: isMobile ? "15px" : "30px",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        {inputMode ? "Ручной ввод" : "Сканирование QR-кода"}
      </h1>

      <div
        style={{
          marginBottom: isMobile ? "15px" : "20px",
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        <Switch
          checkedChildren={isMobile ? "Ручной" : "Ручной ввод"}
          unCheckedChildren="QR"
          checked={inputMode}
          onChange={handleSwitchChange}
          style={{
            backgroundColor: inputMode ? undefined : "#fa8c16",
          }}
        />
      </div>

      <Space
        direction="vertical"
        size={isMobile ? "small" : "middle"}
        style={{ width: "100%" }}
      >
        <Card title="Зона хранения" size="small">
          <Space>
            <Input
              value={storageZone}
              placeholder="Не указана"
              readOnly
              style={{ width: isMobile ? "60%" : "200px" }}
            />
            <Button
              onClick={resetStorageZone}
              danger
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "Сброс" : "Сбросить зону"}
            </Button>
          </Space>
        </Card>

        <Card title="Результат" size="small">
          <Input.TextArea
            value={scanResult}
            readOnly
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ width: "100%" }}
          />
        </Card>

        {inputMode ? (
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder={
                isMobile ? "Введите данные" : "Введите данные вручную"
              }
              value={manualInput}
              onChange={handleManualInputChange}
              onPressEnter={handleManualSubmit}
              size={isMobile ? "small" : "middle"}
            />
            <Button
              type="primary"
              onClick={handleManualSubmit}
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "OK" : "Отправить"}
            </Button>
          </Space.Compact>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              onClick={startScanner}
              size={isMobile ? "small" : "middle"}
            >
              Старт сканирования
            </Button>
          </div>
        )}
      </Space>

      <Modal
        title="Сканирование QR-кода"
        open={isModalVisible}
        onCancel={handleModalCancel}
        afterOpenChange={(open) => {
          if (open) {
            // Убедимся, что модальное окно полностью отрендерилось
            setTimeout(() => {
              initScanner();
            }, 100);
          }
        }}
        footer={[
          <Button key="stop" danger onClick={handleModalCancel}>
            Остановить сканирование
          </Button>,
        ]}
        width={isMobile ? "90%" : "50%"}
        centered
        destroyOnClose
      >
        <div
          id={qrContainerId}
          style={{
            width: "100%",
            minHeight: "300px",
            margin: "0 auto",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />
      </Modal>
    </div>
  );
};
