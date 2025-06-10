import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  notification,
  List,
  Typography,
  Space,
  Progress,
  Radio,
  Modal,
  FloatButton,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
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
  const soundUtilsRef = useRef<SoundUtils>(new SoundUtils());
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [showScrollToBottom, setShowScrollToTop] = useState(false);
  const [showScrollToTop, setShowScrollToBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [storageError, setStorageError] = useState(false);

  const {
    data: manifestData,
    isLoading,
    refetch: refetchManifest,
    isRefetching,
  } = useManifestQuery(manifestId || "");

  const mutation = useManifestMutation({
    type: "sender",
    manifestId: manifestId || "",
  });

  // Инициализация данных
  useEffect(() => {
    if (!manifestId) return;

    const loadData = async () => {
      try {
        const savedItems = ManifestStorage.getScannedItems(manifestId);
        if (savedItems) {
          setScannedItems(savedItems);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setStorageError(true);
        setErrorMessage(
          "Ошибка загрузки сохраненных данных. Пожалуйста, обновите страницу."
        );
        setErrorModalVisible(true);
      }
    };

    loadData();
    dispatch(setBreadcrumbs([{ label: "", to: "/home" }]));

    // Синхронизация при возврате на страницу
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ManifestStorage.syncStorages(manifestId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [manifestId, dispatch]);

  // Прокрутка
  useEffect(() => {
    const checkScrollPosition = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 50);
        setShowScrollToTop(scrollTop > 50);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  // Обновление данных при изменении манифеста
  useEffect(() => {
    if (manifestData && manifestId && isInitialized) {
      try {
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
      } catch (error) {
        console.error("Ошибка обновления данных:", error);
      }
    }
  }, [manifestData, manifestId, isInitialized]);

  const handleScanResult = (result: string) => {
    if (!manifestId || !isInitialized) return;

    notification.destroy();
    const [parcelNumber, placeStr] = result.includes("%")
      ? result.split("%")
      : [result, "1"];
    const place = parseInt(placeStr);

    // Проверка наличия в манифесте
    if (!manifestData?.parcels?.some((p) => p.number === parcelNumber)) {
      setErrorMessage(`Накладная ${parcelNumber} не найдена`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error");
      return;
    }

    // Проверка дубликатов
    if (scannedItems[parcelNumber]?.some((item) => item.place === place)) {
      setErrorMessage(`Место ${parcelNumber}%${place} уже отсканировано`);
      setErrorModalVisible(true);
      soundUtilsRef.current.playBeepSound("error");
      return;
    }

    const newItems = {
      ...scannedItems,
      [parcelNumber]: [
        ...(scannedItems[parcelNumber] || []),
        { place, date: new Date().toISOString() },
      ],
    };

    setScannedItems(newItems);
    try {
      ManifestStorage.saveScannedItems(manifestId, newItems);
      soundUtilsRef.current.playBeepSound("success");
      api.success({
        message: `Место ${parcelNumber}%${place} отсканировано`,
        placement: "topRight",
        duration: 2,
      });
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setStorageError(true);
      soundUtilsRef.current.playBeepSound("error");
      setErrorMessage("Ошибка сохранения данных");
      setErrorModalVisible(true);
    }
  };

  const allRequiredItemsCount =
    manifestData?.parcels?.reduce((sum, p) => sum + p.count, 0) || 0;
  const scannedItemsCount = Object.values(scannedItems).reduce(
    (sum, items) => sum + items.length,
    0
  );
  const scanProgress =
    allRequiredItemsCount > 0
      ? Math.round((scannedItemsCount / allRequiredItemsCount) * 100)
      : 0;
  const allItemsScanned =
    manifestData?.parcels?.every(
      (p) => (scannedItems[p.number]?.length || 0) === p.count
    ) || false;

  const handleSubmit = () => {
    if (!allItemsScanned) {
      setConfirmModalVisible(true);
    } else {
      submitManifest();
    }
  };

  const submitManifest = () => {
    const scannedItemsArray = Object.entries(scannedItems).flatMap(
      ([num, items]) =>
        items.map((item) => ({
          parcelNumber: num,
          place: item.place,
          scanTime: item.date,
        }))
    );

    mutation.mutate(
      {
        comment: allItemsScanned
          ? "Все места отсканированы"
          : `Отсканировано ${scannedItemsCount} из ${allRequiredItemsCount}`,
        scannedItems: scannedItemsArray,
      },
      {
        onSuccess: () => navigate(-1),
        onError: () => {
          notification.error({
            message: "Ошибка отправки",
            description: "Попробуйте еще раз",
          });
        },
      }
    );
    setConfirmModalVisible(false);
  };

  const clearResult = () => {
    setScannedItems({});
    try {
      ManifestStorage.clearScannedItems(manifestId!);
      notification.success({ message: "Данные очищены" });
    } catch (error) {
      console.error("Ошибка очистки:", error);
      notification.error({ message: "Ошибка очистки данных" });
    }
  };

  const handleRefresh = () => refetchManifest();
  const handleGoBack = () => navigate(-1);
  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  if (!isInitialized || !manifestId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (storageError) {
    return (
      <div style={{ padding: 16 }}>
        <Typography.Title level={4} style={{ color: "#ff4d4f" }}>
          Ошибка загрузки данных
        </Typography.Title>
        <Typography.Paragraph>
          Не удалось загрузить сохраненные данные сканирования.
        </Typography.Paragraph>
        <Button type="primary" onClick={() => window.location.reload()}>
          Обновить страницу
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        paddingBottom: 60,
      }}
    >
      {contextHolder}
      <div ref={topRef} />

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            style={{ marginBottom: 16 }}
          >
            Назад
          </Button>
          <Button
            icon={<SyncOutlined spin={isRefetching} />}
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            Обновить
          </Button>
        </div>

        <Radio.Group
          value={scanMethod}
          onChange={(e) => setScanMethod(e.target.value)}
          buttonStyle="solid"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Radio.Button value="zebra" style={{ textAlign: "center", flex: 1 }}>
            ТСД
          </Radio.Button>
          <Radio.Button
            value="barcode"
            style={{ textAlign: "center", flex: 1 }}
          >
            Штрих-код
          </Radio.Button>
          <Radio.Button value="camera" style={{ textAlign: "center", flex: 1 }}>
            Камера
          </Radio.Button>
        </Radio.Group>

        {scanMethod === "camera" && (
          <Button
            type="primary"
            block
            size="large"
            onClick={() => setIsCameraModalVisible(true)}
            style={{ marginBottom: 16 }}
          >
            Запустить сканирование
          </Button>
        )}

        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>
            Прогресс: {scannedItemsCount} / {allRequiredItemsCount}
          </Typography.Text>
          <Progress
            percent={scanProgress}
            status={allItemsScanned ? "success" : "active"}
            showInfo={false}
          />
        </div>

        <List
          bordered
          dataSource={manifestData?.parcels || []}
          renderItem={(parcel) => {
            const scannedCount = scannedItems[parcel.number]?.length || 0;
            return (
              <List.Item
                style={{
                  backgroundColor:
                    scannedCount === parcel.count ? "#f6ffed" : "#fff2f0",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text strong>{parcel.number}</Typography.Text>
                    <Typography.Text>
                      {scannedCount} / {parcel.count}
                    </Typography.Text>
                  </div>
                  <Progress
                    percent={Math.round((scannedCount / parcel.count) * 100)}
                    status={
                      scannedCount === parcel.count ? "success" : "active"
                    }
                    showInfo={false}
                  />
                </div>
              </List.Item>
            );
          }}
        />

        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleSubmit}
            loading={mutation.isPending}
            style={{ marginBottom: 8 }}
          >
            Подтвердить
          </Button>
          <Button block size="large" onClick={clearResult}>
            Сбросить
          </Button>
        </div>
      </div>

      <div ref={bottomRef} />

      {showScrollToBottom && (
        <FloatButton
          icon={<ArrowDownOutlined />}
          onClick={scrollToBottom}
          style={{ right: 24, bottom: 80 }}
          tooltip="Вниз"
        />
      )}
      {showScrollToTop && (
        <FloatButton
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
          style={{ right: 24, top: 80 }}
          tooltip="Вверх"
        />
      )}

      <CameraScanner
        isOpen={isCameraModalVisible}
        onClose={() => setIsCameraModalVisible(false)}
        onScan={handleScanResult}
      />

      <Modal
        title="Подтверждение"
        open={confirmModalVisible}
        onOk={submitManifest}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Подтвердить"
        cancelText="Отмена"
      >
        <Typography.Paragraph>
          Не все места отсканированы. Вы уверены, что хотите продолжить?
        </Typography.Paragraph>
      </Modal>

      <Modal
        open={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Typography.Text>{errorMessage}</Typography.Text>
      </Modal>
    </div>
  );
};
