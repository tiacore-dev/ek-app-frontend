// src/components/WarehouseReceive/QrScanner.tsx
import React, { useEffect } from "react";
import { Button, Modal } from "antd";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  isModalVisible: boolean;
  onCancel: () => void;
  onScanSuccess: (decodedText: string) => Promise<void>;
  onScanError: (errorMessage: string) => void;
  isMobile: boolean;
  qrContainerId: string;
  startScanner: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({
  isModalVisible,
  onCancel,
  onScanSuccess,
  onScanError,
  isMobile,
  qrContainerId,
  startScanner,
}) => {
  const qrCodeRef = React.useRef<Html5Qrcode | null>(null);

  const getScannerConfig = () => ({
    fps: 1,
    qrbox: {
      width: isMobile ? 250 : 300,
      height: isMobile ? 250 : 300,
    },
    supportedScanTypes: [],
  });

  const initScanner = async () => {
    try {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode(qrContainerId);
      }

      if (qrCodeRef.current && !qrCodeRef.current.isScanning) {
        await qrCodeRef.current.start(
          { facingMode: "environment" },
          getScannerConfig(),
          onScanSuccess,
          onScanError
        );
      }
    } catch (err) {
      console.error("Ошибка запуска сканера:", err);
    }
  };

  const stopScanner = async () => {
    try {
      if (qrCodeRef.current?.isScanning) {
        await qrCodeRef.current.stop();
      }
    } catch (err) {
      console.error("Ошибка остановки сканера:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          onClick={startScanner}
          size={isMobile ? "small" : "middle"}
        >
          Начать сканирование
        </Button>
      </div>

      <Modal
        title="Сканирование QR-кода"
        open={isModalVisible}
        onCancel={onCancel}
        afterOpenChange={(open) => {
          if (open) {
            setTimeout(initScanner, 100);
          }
        }}
        footer={[
          <Button key="stop" danger onClick={onCancel}>
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
    </>
  );
};
