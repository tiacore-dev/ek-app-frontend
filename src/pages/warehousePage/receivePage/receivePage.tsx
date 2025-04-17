import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { Switch, Input, Button, message, Space, Card } from "antd";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useMobileDetection } from "../../../hooks/useMobileDetection";

export const WarehouseReceivePage: React.FC = () => {
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();
  const [inputMode, setInputMode] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>("");
  const [scanResult, setScanResult] = useState<string>("");
  const [storageZone, setStorageZone] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrContainerId = "qr-reader-container";

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Склад" },
        { label: "Принять на склад", to: "/warehouse/receive" },
      ])
    );

    // На мобильных устройствах по умолчанию используем QR-режим
    // if (isMobile) {
    //   setInputMode(false);
    // }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [dispatch, isMobile]);

  useEffect(() => {
    if (!inputMode) {
      initQRScanner();
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    }
  }, [inputMode, isMobile]);

  const getScannerConfig = () => {
    return {
      fps: 10,
      qrbox: isMobile
        ? { width: 200, height: 200 }
        : { width: 250, height: 250 },
      supportedScanTypes: [],
    };
  };

  const initQRScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      qrContainerId,
      getScannerConfig(),
      false
    );

    scanner.render(
      (decodedText) => {
        handleScanResult(decodedText);
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );

    scannerRef.current = scanner;
  };

  const handleScanResult = (decodedText: string) => {
    const zoneRegex = /^[0-9]{4}-[0-9]{4}-([0-9]{3})$/;
    const isZone = zoneRegex.test(decodedText);

    if (isZone) {
      const zoneMatch = decodedText.match(zoneRegex);
      if (zoneMatch && zoneMatch[1]) {
        setStorageZone(zoneMatch[1]);
        setScanResult("");
        message.success(`Установлена зона хранения: ${zoneMatch[1]}`);
      }
    } else {
      const result = storageZone
        ? `${storageZone}(${decodedText})`
        : decodedText;
      setScanResult(result);
      message.success(`Отсканирован товар: ${result}`);
    }
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
    message.info("Зона хранения сброшена");
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
          <div
            id={qrContainerId}
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : "500px",
              margin: "0 auto",
              padding: isMobile ? "0 10px" : "0",
            }}
          />
        )}
      </Space>
    </div>
  );
};
