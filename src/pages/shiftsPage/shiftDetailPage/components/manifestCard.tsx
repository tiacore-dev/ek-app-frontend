import React, { useCallback } from "react";
import { Card, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { IListManifest } from "../../../../types/shifts";
import dayjs from "dayjs";
import "../../../../components/cards/card.css";
import { ManifestActions } from "./manifestActions";

interface ManifestCardProps {
  manifest: IListManifest;
  shiftId: string;
  type: "sender" | "recipient";
  labelColor: string; // Новый пропс для цвета меток
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "—";
  return dayjs(timestamp).format("DD.MM.YYYY");
};

const getStatusColor = (status?: string, type?: string) => {
  switch (status) {
    case "Готов к загрузке":
      return type === "sender" ? "#dbac66" : "#60c760";
    case "Манифест в пути":
      return type === "sender" ? "#60c760" : "#dbac66";
    case "Манифест выгружен":
      return type === "sender" ? "#b6b6b6" : "#60c760";
    default:
      return "#b6b6b6";
  }
};

const hasActiveButton = (status?: string, type?: string) => {
  const canLoad = !status || status === "Готов к загрузке";
  const canUnload = !status || status === "Манифест в пути";

  return (type === "sender" && canLoad) || (type === "recipient" && canUnload);
};

export const ManifestCard: React.FC<ManifestCardProps> = React.memo(
  ({ manifest, shiftId, type, labelColor }) => {
    const isActive = hasActiveButton(manifest.status, type);

    const renderCounterparty = useCallback(
      () => (
        <>
          <Typography.Text strong style={{ color: labelColor }}>
            {type === "sender" ? "Получатель: " : "Отправитель: "}
          </Typography.Text>
          <Typography.Text>
            {type === "sender"
              ? manifest.recipient || "—"
              : manifest.sender || "—"}
          </Typography.Text>
        </>
      ),
      [type, manifest.recipient, manifest.sender, labelColor]
    );

    const renderDetails = useCallback(
      () => (
        <>
          <Typography.Text strong style={{ color: labelColor }}>
            Дата:{" "}
          </Typography.Text>
          <Typography.Text>{formatDate(manifest.date)}</Typography.Text>
          <Typography.Text strong style={{ color: labelColor }}>
            {" "}
            Мест:{" "}
          </Typography.Text>
          <Typography.Text>{manifest.pieces_count || "—"}</Typography.Text>
          <Typography.Text strong style={{ color: labelColor }}>
            {" "}
            Накладных:{" "}
          </Typography.Text>
          <Typography.Text>{manifest.parcels_count || "—"}</Typography.Text>
        </>
      ),
      [manifest.date, manifest.pieces_count, manifest.parcels_count, labelColor]
    );

    return (
      <Link
        to={`/shifts/${shiftId}/${manifest.id}`}
        style={{
          display: "block",
          borderRadius: "6px",
        }}
      >
        <Card
          className={`clickable-card ${!isActive ? "inactive-card" : ""}`}
          size="small"
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography.Text strong>{manifest.number}</Typography.Text>

              <div>
                {manifest.status ? (
                  <Typography.Text
                    style={{
                      color: getStatusColor(manifest.status, type),
                      fontSize: 12,
                    }}
                  >
                    {manifest.status}
                  </Typography.Text>
                ) : (
                  <Typography.Text
                    style={{
                      color: getStatusColor(manifest.status, type),
                      fontSize: 12,
                    }}
                  >
                    Нет статуса{" "}
                  </Typography.Text>
                )}
              </div>
            </div>
          }
          style={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {renderCounterparty()}
              <br />
              {renderDetails()}
            </div>
            <Space
              style={
                {
                  //  marginTop: 8, marginLeft: 16
                }
              }
            >
              <div onClick={(e) => e.stopPropagation()}>
                <ManifestActions
                  type={type}
                  status={manifest.status}
                  manifestId={manifest.id}
                />
              </div>
            </Space>
          </div>
        </Card>
      </Link>
    );
  }
);
