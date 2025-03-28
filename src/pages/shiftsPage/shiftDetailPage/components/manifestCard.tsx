import React from "react";
import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { IListManifest } from "../../../../types/shifts";
import dayjs from "dayjs";
import "../../../../components/cards/card.css";

interface ManifestCardProps {
  manifest: IListManifest;
  shiftId: string;
  type: "sender" | "recipient";
}

export const ManifestCard: React.FC<ManifestCardProps> = ({
  manifest,
  shiftId,
  type,
}) => {
  // Функция для форматирования даты из timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "—";
    return dayjs(timestamp).format("DD.MM.YYYY");
  };

  return (
    <Link
      to={`/shifts/${shiftId}/${manifest.id}`}
      style={{
        display: "block",
        borderRadius: "6px",
      }}
    >
      <Card
        className="clickable-card"
        size="small"
        title={`${manifest.number}`}
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box", // Важно!
        }}
      >
        <Typography.Text strong style={{ color: "#2444b5" }}>
          {type === "sender" ? "Получатель: " : "Отправитель: "}
        </Typography.Text>
        <Typography.Text>
          {type === "sender"
            ? manifest.recipient || "—"
            : manifest.sender || "—"}
        </Typography.Text>
        <br />
        <Typography.Text strong style={{ color: "#2444b5" }}>
          Дата:{" "}
        </Typography.Text>
        <Typography.Text>{formatDate(manifest.date)}</Typography.Text>
        {/* <br /> */}
        <Typography.Text strong style={{ color: "#2444b5" }}>
          {" "}
          Мест:{" "}
        </Typography.Text>
        <Typography.Text>{manifest.pieces_count || "—"}</Typography.Text>
        <Typography.Text strong style={{ color: "#2444b5" }}>
          {" "}
          Накладных:{" "}
        </Typography.Text>
        <Typography.Text>{manifest.parcels_count || "—"}</Typography.Text>
      </Card>
    </Link>
  );
};
