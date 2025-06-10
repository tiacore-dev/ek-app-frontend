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
import ManifestStorage from "../shiftsPage/manifests/manifestStorage";

type ScanMethod = "zebra" | "barcode" | "camera";

interface ScannedItem {
  place: number;
  date: string;
}

type ScannedParcels = Record<string, ScannedItem[]>;

export const ScanParcelItemsPage: React.FC = () => {
  const { manifest_id: manifestId } = useParams<{ manifest_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [scannedItems, setScannedItems] = useState<ScannedParcels>({});
  const [scanMethod, setScanMethod] = useState<ScanMethod>("camera");
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

    const breadcrumbs =
      // isFromHome
      //   ?
      [
        // { label: "Главная страница", to: "/home" },

        { label: " ", to: "/home" },
        // { label: `Манифест ${manifestData.number}`, to: "" },
      ];
    // : isFromShifts
    // ? [
    //     { label: "Главная страница", to: "/home" },
    //     { label: "Рейсы", to: "/shifts" },
    //     {
    //       label: `Рейс`,
    //       to: `/shifts/${getShiftIdFromPath(location.pathname)}`,
    //     },
    //     { label: `Манифест ${manifestData.number}`, to: "" },
    //   ]
    // : [
    //     { label: "Главная страница", to: "/home" },
    //     { label: `Манифест ${manifestData.number}`, to: "" },
    //   ];

    dispatch(setBreadcrumbs(breadcrumbs));
  }, []);

  // Загрузка сохраненных данных при монтировании
  useEffect(() => {
    if (manifestId) {
      const savedItems = ManifestStorage.getScannedItems(manifestId);
      setScannedItems(savedItems);
    }
  }, [manifestId]);

  // Обновляем данные при изменении manifestData
  useEffect(() => {
    if (manifestData && manifestId) {
      const savedItems = ManifestStorage.getScannedItems(manifestId);

      const filteredItems = Object.keys(savedItems).reduce(
        (acc, parcelNumber) => {
          if (manifestData.parcels?.some((p) => p.number === parcelNumber)) {
            acc[parcelNumber] = savedItems[parcelNumber];
          }
          return acc;
        },
        {} as ScannedParcels
      );

      setScannedItems(filteredItems);
      ManifestStorage.saveScannedItems(manifestId, filteredItems);
    }
  }, [manifestData, manifestId]);

  const getShiftIdFromPath = (path: string) => {
    const parts = path.split("/");
    const shiftIndex = parts.indexOf("shifts") + 1;
    return shiftIndex > 0 && shiftIndex < parts.length ? parts[shiftIndex] : "";
  };

  const allRequiredItemsCount =
    manifestData?.parcels?.reduce((sum, parcel) => sum + parcel.count, 0) || 0;

  const scannedItemsCount = Object.values(scannedItems).reduce(
    (sum, items) => sum + items.length,
    0
  );

  const allItemsScanned =
    manifestData?.parcels?.every((parcel) => {
      const scannedPlaces = scannedItems[parcel.number] || [];
      return scannedPlaces.length === parcel.count;
    }) || false;

  const scanProgress =
    allRequiredItemsCount > 0
      ? Math.round((scannedItemsCount / allRequiredItemsCount) * 100)
      : 0;

  const handleScanResult = (result: string) => {
    notification.destroy();

    const [parcelNumber, placeStr] = result.includes("%")
      ? result.split("%")
      : [result, "1"];
    const place = parseInt(placeStr);

    const isParcelInManifest = manifestData?.parcels?.some(
      (parcel) => parcel.number === parcelNumber
    );

    if (!isParcelInManifest) {
      setErrorMessage(`Накладная ${parcelNumber} не найдена в манифесте`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error");
      return;
    }

    const targetParcel = manifestData?.parcels?.find(
      (parcel) => parcel.number === parcelNumber
    );

    if (targetParcel && place > targetParcel.count) {
      setErrorMessage(
        `Ошибка: у накладной ${parcelNumber} только ${targetParcel.count} мест`
      );
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error");
      return;
    }

    const alreadyScanned = scannedItems[parcelNumber]?.some(
      (item) => item.place === place
    );

    if (!alreadyScanned) {
      const newItems = {
        ...scannedItems,
        [parcelNumber]: [
          ...(scannedItems[parcelNumber] || []),
          {
            place,
            date: new Date().toISOString(),
          },
        ],
      };

      setScannedItems(newItems);
      ManifestStorage.saveScannedItems(manifestId!, newItems);
      soundUtilsRef.current.playBeepSound("success");
      api.success({
        message: `Место ${parcelNumber}%${place} отсканировано`,
        placement: "topRight",
        duration: 2,
      });
    } else {
      setErrorMessage(`Место ${parcelNumber}%${place} уже было отсканировано`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error");
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
    const scannedItemsArray = Object.entries(scannedItems).flatMap(
      ([parcelNumber, items]) =>
        items.map((item) => ({
          parcelNumber,
          place: item.place,
          scanTime: item.date,
        }))
    );

    mutation.mutate(
      {
        comment: allItemsScanned
          ? "Все места накладных отсканированы"
          : `Отсканировано ${scannedItemsCount} из ${allRequiredItemsCount} мест`,
        scannedItems: scannedItemsArray,
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
    setScannedItems({});
    ManifestStorage.clearScannedItems(manifestId!);
  };

  if (!manifestId) {
    return null;
  }

  return (
    <div>
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
              ТСД
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

        {scanMethod === "zebra" && (
          <ZebraScanner key={scannedItemsCount} onScan={handleScanResult} />
        )}

        {scanMethod === "barcode" && (
          <BarcodeScanner key={scannedItemsCount} onScan={handleScanResult} />
        )}

        <CameraScanner
          isOpen={isCameraModalVisible}
          onClose={() => setIsCameraModalVisible(false)}
          onScan={handleScanResult}
        />

        <Typography.Text style={{ fontSize: 16 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {scanMethod === "zebra" && "Наведите сканер на QR-код"}
            {scanMethod === "barcode" && "Наведите сканер на штрих-код"}
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

        <div>
          <Typography.Text strong style={{ marginLeft: 16, fontSize: 16 }}>
            Прогресс сканирования: {scannedItemsCount} из{" "}
            {allRequiredItemsCount} мест
          </Typography.Text>
          <div style={{ margin: 16, marginTop: 0 }}>
            <Progress
              percent={scanProgress}
              status={allItemsScanned ? "success" : "active"}
              showInfo={false}
            />
          </div>
          <List
            style={{ marginLeft: 4, marginRight: 4 }}
            bordered
            dataSource={manifestData?.parcels || []}
            renderItem={(parcel) => {
              const scannedPlaces = scannedItems[parcel.number] || [];
              const scannedCount = scannedPlaces.length;

              return (
                <List.Item
                  key={parcel.number}
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
                      showInfo={false}
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
        title="Вы уверены, что хотите подтвердить загрузку?"
        open={confirmModalVisible}
        onOk={submitManifest}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Подтвердить"
        cancelText="Отмена"
        width={600}
      >
        {manifestData?.parcels && (
          <div style={{ marginTop: 16 }}>
            <Typography.Text strong style={{ fontSize: 16 }}>
              Неотсканированные накладные:
            </Typography.Text>
            <List
              size="small"
              bordered
              dataSource={manifestData.parcels.filter((parcel) => {
                const scannedPlaces = scannedItems[parcel.number] || [];
                return scannedPlaces.length < parcel.count;
              })}
              renderItem={(parcel) => (
                <List.Item>
                  <Typography.Text style={{ fontSize: 16 }}>
                    {parcel.number} -{" "}
                    {parcel.count - (scannedItems[parcel.number]?.length || 0)}{" "}
                    из {parcel.count} мест
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
      </Modal>
    </div>
  );
};
