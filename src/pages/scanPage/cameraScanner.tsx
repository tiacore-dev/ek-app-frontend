import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Modal, Button } from "antd";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  onScanStatusChange?: (isScanning: boolean) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  onScanStatusChange,
}) => {
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrContainerId = "qr-reader-container";

  const startScanner = async () => {
    try {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode(qrContainerId);
      }

      if (qrCodeRef.current && !qrCodeRef.current.isScanning) {
        await qrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 1,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            onScanStatusChange?.(false);
            stopScanner();
          },
          (errorMessage) => {
            console.log(errorMessage);
          }
        );
        onScanStatusChange?.(true);
      }
    } catch (err) {
      console.error("Ошибка запуска сканера:", err);
      onClose();
    }
  };

  const stopScanner = async () => {
    try {
      if (qrCodeRef.current?.isScanning) {
        await qrCodeRef.current.stop();
      }
    } catch (err) {
      console.error("Ошибка остановки сканера:", err);
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner();
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      if (qrCodeRef.current?.isScanning) {
        stopScanner();
      }
    };
  }, [isOpen]);

  return (
    <Modal
      title="Сканирование через камеру"
      open={isOpen}
      onCancel={stopScanner}
      footer={[
        <Button key="stop" danger onClick={stopScanner}>
          Остановить сканирование
        </Button>,
      ]}
      width="90%"
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
  );
};
