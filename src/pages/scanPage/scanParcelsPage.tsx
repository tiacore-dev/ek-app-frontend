"use client";

import React, { useEffect, useState, useRef } from "react";
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
import ManifestStorage from "../shiftsPage/manifests/manifestStorage";
import { formatMissingPlaces } from "./scanParcelsUtils";

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
  const location = useLocation();
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
  const [lastScannedItem, setLastScannedItem] = useState<string>("");

  // Загрузка сохраненных данных при монтировании
  useEffect(() => {
    if (manifestId) {
      try {
        const savedItems = ManifestStorage.getScannedItems(manifestId);
        if (Object.keys(savedItems).length > 0) {
          setScannedItems(savedItems);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        notification.error({
          message: "Ошибка загрузки сохраненных данных",
          description: "Попробуйте обновить страницу",
        });
      }
    }
  }, [manifestId]);

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

  // Обновляем данные при изменении manifestData
  useEffect(() => {
    if (manifestData && manifestId) {
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
    const place = Number.parseInt(placeStr);

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
      try {
        ManifestStorage.saveScannedItems(manifestId!, newItems);
        soundUtilsRef.current.playBeepSound("success");
        api.success({
          message: `Место ${parcelNumber}%${place} отсканировано`,
          placement: "topRight",
          duration: 2,
        });
        setLastScannedItem(`${parcelNumber}%${place}`);

        // Прокрутка к накладной в списке
        setTimeout(() => {
          const element = document.getElementById(`parcel-${parcelNumber}`);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        soundUtilsRef.current.playBeepSound("error");
        setErrorMessage("Ошибка сохранения данных. Попробуйте еще раз.");
        setErrorModalVisible(true);
      }
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

  const clearResult = () => {
    setScannedItems({});
    try {
      ManifestStorage.clearScannedItems(manifestId!);
      notification.success({
        message: "Данные сканирования очищены",
      });
    } catch (error) {
      console.error("Ошибка очистки данных:", error);
      notification.error({
        message: "Ошибка очистки данных",
      });
    }
  };

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
            dataSource={manifestData?.parcels || []}
            renderItem={(parcel) => {
              const scannedPlaces = scannedItems[parcel.number] || [];
              const scannedCount = scannedPlaces.length;

              return (
                <List.Item
                  key={parcel.number}
                  id={`parcel-${parcel.number}`}
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
        {manifestData?.parcels && (
          <div style={{ marginTop: 16 }}>
            <Typography.Text
              strong
              style={{ fontSize: 15, marginBottom: 16, display: "block" }}
            >
              Не отсканировано ({allRequiredItemsCount - scannedItemsCount} из{" "}
              {allRequiredItemsCount} мест):
            </Typography.Text>
            <List
              // size="small"
              // bordered
              style={{
                backgroundColor: "#fad7bf38",
                paddingLeft: 16,
                paddingRight: 8,
              }}
              dataSource={manifestData.parcels
                .filter((parcel) => {
                  const scannedPlaces = scannedItems[parcel.number] || [];
                  return scannedPlaces.length < parcel.count;
                })
                .sort((a, b) => a.number.localeCompare(b.number))} // Сортируем по номеру накладной
              renderItem={(parcel) => {
                const scannedPlaces = scannedItems[parcel.number] || [];
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
