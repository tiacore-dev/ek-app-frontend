"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  useParams, 
  useNavigate, 
  // useLocation 
} from "react-router-dom";
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
import ManifestStorage, {
  type ScannedParcels,
} from "../shiftsPage/manifests/manifestStorage";
import {
  formatMissingPlaces,
  resolveManifestScan,
  restoreManifestScans,
} from "./scanParcelsUtils";
import dayjs from "dayjs";

type ScanMethod = "zebra" | "barcode" | "camera";

export const ScanParcelItemsPage: React.FC = () => {
  const { manifest_id: manifestId } = useParams<{ manifest_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [scannedItems, setScannedItems] = useState<ScannedParcels>({});
  const scannedItemsRef = useRef<ScannedParcels>({});
  const [scanMethod, setScanMethod] = useState<ScanMethod>("barcode");
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const soundUtilsRef = React.useRef<SoundUtils>(new SoundUtils());
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // const location = useLocation();
  const {
    data: manifestData,
    // isLoading,
    refetch: refetchManifest,
    isRefetching,
  } = useManifestQuery(manifestId || "");
  const parcels = manifestData?.parcels;
  const mutation = useManifestMutation({
    type: "sender",
    manifestId: manifestId || "",
  });
  const [lastScannedItem, setLastScannedItem] = useState<string>("");

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: "", to: "/home" }]));
  }, [dispatch]);

  useEffect(() => {
    const checkScrollPosition = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
        const isAtTop = scrollTop <= 50;

        setShowScrollToBottom(!isAtBottom);
        setShowScrollToTop(!isAtTop && scrollTop > 0);
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

  // Сверяем черновик с составом манифеста при открытии и обновлении.
  useEffect(() => {
    if (!manifestId || !parcels) {
      scannedItemsRef.current = {};
      setScannedItems(scannedItemsRef.current);
      return;
    }

    const savedItems = ManifestStorage.getScannedItems(manifestId);
    const restoredItems = restoreManifestScans(savedItems, parcels);
    scannedItemsRef.current = restoredItems;
    setScannedItems(restoredItems);

    if (Object.keys(savedItems).length > 0) {
      try {
        ManifestStorage.saveScannedItems(manifestId, restoredItems);
      } catch (error) {
        console.error("Ошибка обновления данных:", error);
      }
    }
  }, [manifestId, parcels]);

  // const getShiftIdFromPath = (path: string) => {
  //   const parts = path.split("/");
  //   const shiftIndex = parts.indexOf("shifts") + 1;
  //   return shiftIndex > 0 && shiftIndex < parts.length ? parts[shiftIndex] : "";
  // };

  const allRequiredItemsCount =
    parcels?.reduce((sum, parcel) => sum + parcel.count, 0) || 0;

  const scannedItemsCount = Object.values(scannedItems).reduce(
    (sum, items) => sum + items.length,
    0
  );

  const allItemsScanned =
    parcels?.every((parcel) => {
      const scannedPlaces = scannedItems[parcel.id] ?? [];
      return scannedPlaces.length === parcel.count;
    }) || false;

  const scanProgress =
    allRequiredItemsCount > 0
      ? Math.round((scannedItemsCount / allRequiredItemsCount) * 100)
      : 0;

  const showScanError = (message: string) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
    soundUtilsRef.current.playBeepSound("error");
  };

  const handleScanResult = (result: string) => {
    if (!manifestId || !parcels || mutation.isPending) return;
    notification.destroy();

    let scan: ReturnType<typeof resolveManifestScan>;
    try {
      scan = resolveManifestScan(result, parcels);
    } catch (error) {
      showScanError(
        error instanceof Error ? error.message : "Не удалось распознать код."
      );
      return;
    }

    const { parcel, place, barcode } = scan;
    const currentItems = scannedItemsRef.current;
    const parcelItems = currentItems[parcel.id] ?? [];
    const placeLabel = `${parcel.number}%${place}`;
    if (parcelItems.some((item) => item.place === place)) {
      showScanError(`Место ${placeLabel} уже было отсканировано`);
      return;
    }

    const newItems = {
      ...currentItems,
      [parcel.id]: [
        ...parcelItems,
        {
          parcelId: parcel.id,
          place,
          barcode,
          date: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        },
      ],
    };

    try {
      ManifestStorage.saveScannedItems(manifestId, newItems);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      showScanError("Ошибка сохранения данных. Попробуйте еще раз.");
      return;
    }

    scannedItemsRef.current = newItems;
    setScannedItems(newItems);
    setLastScannedItem(placeLabel);
    soundUtilsRef.current.playBeepSound("success");
    api.success({
      message: `Место ${placeLabel} отсканировано`,
      placement: "topRight",
      duration: 2,
    });

    setTimeout(() => {
      document.getElementById(`parcel-${parcel.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleSubmit = () => {
    if (!allItemsScanned) {
      setConfirmModalVisible(true);
    } else {
      submitManifest();
    }
  };

  const submitManifest = () => {
    if (!parcels || mutation.isPending) return;

    const scannedItemsArray = parcels.flatMap((parcel) =>
      (scannedItems[parcel.id] ?? []).map((item) => ({
        parcelId: parcel.id,
        parcelNumber: parcel.number,
        place: item.place,
        scanTime: item.date,
        barcode: item.barcode,
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
        onError: (error) => {
          console.error("Ошибка отправки данных:", error);
          notification.error({
            message: "Ошибка отправки данных",
            description: "Попробуйте еще раз",
          });
        },
      }
    );
    setConfirmModalVisible(false);
  };

  // const clearResult = () => {
  //   setScannedItems({});
  //   try {
  //     ManifestStorage.clearScannedItems(manifestId!);
  //     notification.success({
  //       message: "Данные сканирования очищены",
  //     });
  //   } catch (error) {
  //     console.error("Ошибка очистки данных:", error);
  //     notification.error({
  //       message: "Ошибка очистки данных",
  //     });
  //   }
  // };

  const handleRefresh = () => {
    refetchManifest();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  const restoreScannerFocus = () => {
    containerRef.current
      ?.querySelector<HTMLInputElement>('input[type="text"]')
      ?.focus();
  };

  if (!manifestId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: `calc(100vh - var(--navbar-height))`,
        overflowY: "auto",
      }}
    >
      {contextHolder}
      <div ref={topRef} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ fontSize: 16 }}
        >
          Назад
        </Button>

        <Button
          type="text"
          icon={<SyncOutlined spin={isRefetching} />}
          onClick={handleRefresh}
          disabled={isRefetching}
          style={{ fontSize: 16 }}
        >
          {isRefetching ? "Обновление..." : "Обновить"}
        </Button>
      </div>

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
            {scanMethod === "zebra" && "Наведите ТСД на код места"}
            {scanMethod === "barcode" && "Наведите сканер на код места"}
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
          {lastScannedItem && (
            <div style={{ margin: 16, marginTop: 0 }}>
              <Typography.Text
                strong
                style={{ fontSize: 16, color: "#52c41a" }}
              >
                Последнее отсканированное: {lastScannedItem}
              </Typography.Text>
            </div>
          )}
          <List
            style={{ marginLeft: 4, marginRight: 4 }}
            bordered
            dataSource={parcels ?? []}
            renderItem={(parcel) => {
              const scannedPlaces = scannedItems[parcel.id] ?? [];
              const scannedCount = scannedPlaces.length;

              return (
                <List.Item
                  key={parcel.id}
                  id={`parcel-${parcel.id}`}
                  style={{
                    backgroundColor:
                      scannedCount === parcel.count ? "#f6ffed" : "#fff2f0",
                    padding: "12px 16px",
                  }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="small"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {parcel.number}
                      </Typography.Text>
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {scannedCount} из {parcel.count} мест
                      </Typography.Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 16px",
                      }}
                    >
                      <Typography.Text style={{ fontSize: 14 }}>
                        <span style={{ color: "#666" }}>Заказчик:</span>{" "}
                        <span style={{ fontWeight: 500 }}>
                          {parcel.customer || "—"}
                        </span>
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 14 }}>
                        <span style={{ color: "#666" }}>Вес:</span>{" "}
                        <span style={{ fontWeight: 500 }}>
                          {parcel.volume || "—"} кг
                        </span>
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 14 }}>
                        <span style={{ color: "#666" }}>Объем:</span>{" "}
                        <span style={{ fontWeight: 500 }}>
                          {parcel.weight || "—"} м³
                        </span>
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
            disabled={!parcels}
            block
            style={{ marginBottom: 8, fontSize: 16 }}
          >
            Подтвердить загрузку манифеста
          </Button>

          {/* <Button
            size="large"
            onClick={clearResult}
            block
            style={{ fontSize: 16 }}
          >
            Сбросить сканер
          </Button> */}
        </div>
      </Space>

      <div ref={bottomRef} style={{ paddingBottom: 24 }} />

      {showScrollToBottom && (
        <FloatButton
          icon={<ArrowDownOutlined />}
          onClick={scrollToBottom}
          style={{ right: 24, bottom: 24 }}
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

      <Modal
        title="Вы уверены, что хотите подтвердить загрузку?"
        open={confirmModalVisible}
        onOk={submitManifest}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Подтвердить"
        cancelText="Отмена"
        width={600}
      >
        {parcels && (
          <div style={{ marginTop: 16 }}>
            <Typography.Text
              strong
              style={{ fontSize: 15, marginBottom: 16, display: "block" }}
            >
              Не отсканировано ({allRequiredItemsCount - scannedItemsCount} из{" "}
              {allRequiredItemsCount} мест):
            </Typography.Text>
            <List
              style={{
                backgroundColor: "#fad7bf38",
                paddingLeft: 16,
                paddingRight: 8,
              }}
              dataSource={parcels
                .filter((parcel) => {
                  const scannedPlaces = scannedItems[parcel.id] ?? [];
                  return scannedPlaces.length < parcel.count;
                })
                .sort((a, b) => a.number.localeCompare(b.number))}
              renderItem={(parcel) => {
                const scannedPlaces = scannedItems[parcel.id] ?? [];
                const allPlaces = Array.from(
                  { length: parcel.count },
                  (_, i) => i + 1
                );
                const missingPlaces = allPlaces.filter(
                  (place) => !scannedPlaces.some((item) => item.place === place)
                );

                return (
                  <List.Item>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        flexWrap: "wrap",
                        marginTop: -8,
                      }}
                    >
                      <Typography.Text
                        strong
                        style={{ fontSize: 16, marginRight: 8 }}
                      >
                        Накладная: {parcel.number}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: 15 }}>
                        {"Места: "}{" "}
                        <span style={{ fontWeight: 600, fontSize: 16 }}>
                          {formatMissingPlaces(missingPlaces, parcel.count)}
                        </span>
                        <span style={{ color: "#888", marginLeft: 8 }}>
                          (всего мест {parcel.count} )
                        </span>
                      </Typography.Text>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={errorModalVisible}
        onOk={handleErrorModalClose}
        onCancel={handleErrorModalClose}
        afterClose={restoreScannerFocus}
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
