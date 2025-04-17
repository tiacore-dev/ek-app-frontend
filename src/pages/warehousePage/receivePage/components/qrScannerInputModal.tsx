import React, { useEffect, useRef } from "react";
import { Modal, Button, message } from "antd";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  isMobile?: boolean;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  open,
  onClose,
  onScanSuccess,
  onScanError,
  isMobile = false,
}) => {
  const containerId = "qr-reader-container";
  const qrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = async () => {
    try {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        await qrCodeRef.current.stop();
      }
    } catch (err) {
      console.error("Ошибка остановки сканера:", err);
    } finally {
      onClose();
    }
  };

  const startScanner = async () => {
    try {
      if (!qrCodeRef.current) {
        qrCodeRef.current = new Html5Qrcode(containerId);
      }

      await new Promise((res) => setTimeout(res, 100));

      if (qrCodeRef.current && !qrCodeRef.current.isScanning) {
        await qrCodeRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanError || (() => {})
        );
      }
    } catch (err) {
      console.error("Ошибка запуска сканера:", err);
      message.error("Не удалось запустить сканер");
      onClose();
    }
  };

  useEffect(() => {
    if (open) startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="Сканирование QR-кода"
      open={open}
      onCancel={stopScanner}
      footer={[
        <Button key="stop" danger onClick={stopScanner}>
          Остановить сканирование
        </Button>,
      ]}
      width={isMobile ? "90%" : "50%"}
      centered
      destroyOnClose
    >
      <div
        id={containerId}
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
