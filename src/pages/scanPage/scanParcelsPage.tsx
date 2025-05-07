import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  notification,
  List,
  Typography,
  Space,
  Progress,
  Radio,
  Modal,
} from "antd";
import { useManifestQuery } from "../../hooks/shifts/useManifestQuery";
import { useManifestMutation } from "../../hooks/shifts/useManifestMutation";
import { SoundUtils } from "../../components/soundUtils";
import { ZebraScanner } from "./zebraScanner";
import { BarcodeScanner } from "./barcodeScanner";
import { CameraScanner } from "./cameraScanner";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";

type ScanMethod = "zebra" | "barcode" | "camera";

export const ScanParcelItemsPage: React.FC = () => {
  const { manifest_id: manifestId } = useParams<{ manifest_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [scanMethod, setScanMethod] = useState<ScanMethod>("camera");
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const soundUtilsRef = React.useRef<SoundUtils>(new SoundUtils());
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const location = useLocation();
  const { data: manifestData, isLoading } = useManifestQuery(manifestId || "");
  const mutation = useManifestMutation({
    type: "sender",
    manifestId: manifestId || "",
  });

  useEffect(() => {
    if (!manifestData) return;

    const isFromHome = location.pathname.startsWith("/home");
    const isFromShifts = location.pathname.startsWith("/shifts");

    const breadcrumbs = isFromHome
      ? [
          { label: "Главная страница", to: "/home" },
          { label: `Манифест ${manifestData.number}`, to: "" },
        ]
      : isFromShifts
      ? [
          { label: "Главная страница", to: "/home" },
          { label: "Рейсы", to: "/shifts" },
          {
            label: `Рейс`,
            to: `/shifts/${getShiftIdFromPath(location.pathname)}`,
          },
          { label: `Манифест ${manifestData.number}`, to: "" },
        ]
      : [
          { label: "Главная страница", to: "/home" },
          { label: `Манифест ${manifestData.number}`, to: "" },
        ];

    dispatch(setBreadcrumbs(breadcrumbs));
  }, [manifestData, dispatch, location.pathname]);

  // Функция для извлечения ID рейса из пути
  const getShiftIdFromPath = (path: string) => {
    const parts = path.split("/");
    const shiftIndex = parts.indexOf("shifts") + 1;
    return shiftIndex > 0 && shiftIndex < parts.length ? parts[shiftIndex] : "";
  };

  // Создаем массив всех необходимых к сканированию items
  const allRequiredItems =
    manifestData?.parcels?.flatMap((parcel) =>
      Array.from(
        { length: parcel.count },
        (_, i) => `${parcel.number}%${i + 1}`
      )
    ) || [];

  // Проверяем, все ли места отсканированы
  const allItemsScanned = allRequiredItems.every((item) =>
    scannedItems.includes(item)
  );

  // Вычисляем прогресс сканирования
  const scanProgress =
    allRequiredItems.length > 0
      ? Math.round((scannedItems.length / allRequiredItems.length) * 100)
      : 0;

  // Обработка результатов сканирования
  const handleScanResult = (result: string) => {
    notification.destroy();

    const parcelNumber = result.includes("%") ? result.split("%")[0] : result;

    const isParcelInManifest = manifestData?.parcels?.some(
      (parcel) => parcel.number === parcelNumber
    );

    if (!isParcelInManifest) {
      setErrorMessage(`Накладная ${parcelNumber} не найдена в манифесте`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error"); // Звук ошибки
      return;
    }

    const itemNumber = result.includes("%") ? result.split("%")[1] || "1" : "1";
    const formattedCode = `${parcelNumber}%${itemNumber}`;

    const targetParcel = manifestData?.parcels?.find(
      (parcel) => parcel.number === parcelNumber
    );

    if (targetParcel && parseInt(itemNumber) > targetParcel.count) {
      setErrorMessage(
        `Ошибка: у накладной ${parcelNumber} только ${targetParcel.count} мест`
      );
      setErrorDescription(`Сканирование места ${itemNumber} невозможно`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error"); // Звук ошибки
      return;
    }

    if (!allRequiredItems.includes(formattedCode)) {
      setErrorMessage(`Место ${formattedCode} не найдено в манифесте`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error"); // Звук ошибки
      return;
    }

    if (!scannedItems.includes(formattedCode)) {
      setScannedItems((prev) => [...prev, formattedCode]);
      soundUtilsRef.current.playBeepSound("success"); // Звук успеха
      api.success({
        message: `Место ${formattedCode} отсканировано`,
        placement: "topRight",
        duration: 2,
      });
    } else {
      setErrorMessage(`Место ${formattedCode} уже было отсканировано`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error"); // Звук ошибки
    }
  };

  const handleSubmit = () => {
    if (!allItemsScanned) {
      setConfirmModalVisible(true);
    } else {
      submitManifest();
    }
  };

  const submitManifest = () => {
    mutation.mutate(
      {
        comment:
          scannedItems.length === allRequiredItems.length
            ? "Все места накладных отсканированы"
            : `Отсканировано ${scannedItems.length} из ${allRequiredItems.length} мест`,
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      }
    );
    setConfirmModalVisible(false);
  };

  const clearResult = () => {
    setScannedItems([]);
  };

  if (!manifestId) {
    return null;
  }

  return (
    <div>
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Выбор метода сканирования */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: 16,
            height: 20,
          }}
        >
          <Radio.Group
            value={scanMethod}
            onChange={(e) => setScanMethod(e.target.value)}
            buttonStyle="solid"
            style={{ display: "flex", width: "100%", maxWidth: 400 }}
          >
            <Radio.Button
              value="zebra"
              style={{ flex: 1, textAlign: "center", fontSize: 16 }}
            >
              ТДС
            </Radio.Button>
            <Radio.Button
              value="barcode"
              style={{ flex: 1, textAlign: "center", fontSize: 16 }}
            >
              Штрих-код
            </Radio.Button>
            <Radio.Button
              value="camera"
              style={{ flex: 1, textAlign: "center", fontSize: 16 }}
            >
              Камера
            </Radio.Button>
          </Radio.Group>
        </div>
        {/* Активный сканер */}
        {scanMethod === "zebra" && <ZebraScanner onScan={handleScanResult} />}

        {scanMethod === "barcode" && (
          <BarcodeScanner onScan={handleScanResult} />
        )}

        <CameraScanner
          isOpen={isCameraModalVisible}
          onClose={() => setIsCameraModalVisible(false)}
          onScan={handleScanResult}
        />

        {/* Статус сканирования */}
        <Typography.Text style={{ fontSize: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {scanMethod === "zebra" && "Наведите сканер на QR-код"}
            {scanMethod === "barcode" && "Наведите сканер  на штрих-код"}
            {scanMethod === "camera" && (
              <Button
                onClick={() => setIsCameraModalVisible(true)}
                style={{ fontSize: 16 }}
              >
                Запустить камеру
              </Button>
            )}
          </div>
        </Typography.Text>

        {/* Прогресс и список накладных */}
        <div>
          <Typography.Text strong style={{ marginLeft: 16, fontSize: 16 }}>
            Прогресс сканирования: {scannedItems.length} из{" "}
            {allRequiredItems.length} мест
          </Typography.Text>
          <div style={{ margin: 16, marginTop: 0 }}>
            <Progress
              percent={scanProgress}
              status={allItemsScanned ? "success" : "active"}
            />
          </div>
          <List
            style={{ marginLeft: 4, marginRight: 4 }}
            bordered
            dataSource={manifestData?.parcels || []}
            renderItem={(parcel) => {
              const parcelItems = Array.from(
                { length: parcel.count },
                (_, i) => `${parcel.number}%${i + 1}`
              );
              const scannedCount = parcelItems.filter((item) =>
                scannedItems.includes(item)
              ).length;

              return (
                <List.Item
                  style={{
                    backgroundColor:
                      scannedCount === parcel.count ? "#f6ffed" : "#fff2f0",
                  }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {parcel.number}
                      </Typography.Text>
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {scannedCount} из {parcel.count} мест
                      </Typography.Text>
                    </div>

                    <Progress
                      percent={Math.round((scannedCount / parcel.count) * 100)}
                      style={{ width: "100%" }}
                      status={
                        scannedCount === parcel.count ? "success" : "active"
                      }
                    />
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>
        <div style={{ margin: 16, marginTop: 0 }}>
          <Button
            size="large"
            type="primary"
            onClick={handleSubmit}
            loading={mutation.isPending}
            block
            style={{ marginBottom: 8, fontSize: 16 }}
          >
            Подтвердить загрузку манифеста
          </Button>

          <Button
            size="large"
            onClick={clearResult}
            block
            style={{ fontSize: 16 }}
          >
            Сбросить сканер
          </Button>
        </div>
      </Space>
      <Modal
        title="Не все накладные отсканированы!"
        open={confirmModalVisible}
        onOk={submitManifest}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Подтвердить"
        cancelText="Отмена"
        width={600}
      >
        <Typography.Paragraph>
          Вы уверены, что хотите подтвердить загрузку?
        </Typography.Paragraph>
        {manifestData?.parcels && (
          <div style={{ marginTop: 16 }}>
            <Typography.Text strong>
              Неотсканированные накладные:
            </Typography.Text>
            <List
              size="small"
              bordered
              dataSource={manifestData.parcels.filter((parcel) => {
                const parcelItems = Array.from(
                  { length: parcel.count },
                  (_, i) => `${parcel.number}%${i + 1}`
                );
                return !parcelItems.every((item) =>
                  scannedItems.includes(item)
                );
              })}
              renderItem={(parcel) => (
                <List.Item>
                  <Typography.Text>
                    {parcel.number} - {parcel.count} мест
                  </Typography.Text>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
      <Modal
        open={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        cancelButtonProps={{ style: { display: "none" } }}
        width={600}
      >
        <div style={{ marginBottom: 24 }}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            {errorMessage}
          </Typography.Text>
        </div>
        <Typography.Paragraph>{errorDescription}</Typography.Paragraph>
      </Modal>
    </div>
  );
};
