import React from "react";
import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { IListManifest } from "../../../../types/shifts";

interface ManifestCardProps {
  manifest: IListManifest;
  shiftId: string;
  type: "sender" | "recipient";
}

export const ManifestCard: React.FC<ManifestCardProps> = ({
  manifest,
  shiftId,
  type,
}) => (
  <Link to={`/shifts/${shiftId}/${manifest.id}`} style={{ display: "block" }}>
    <Card className="clickable-card" size="small">
      <Typography.Text strong style={{ color: "#2444b5" }}>
        {type === "sender" ? "Отправитель: " : "Получатель: "}
      </Typography.Text>
      <Typography.Text>
        {type === "sender" ? manifest.sender || "—" : manifest.recipient || "—"}
      </Typography.Text>
      <br />
      <Typography.Text strong style={{ color: "#2444b5" }}>
        Мест:{" "}
      </Typography.Text>
      <Typography.Text>{manifest.pieces_count || "—"}</Typography.Text>
      <Typography.Text strong style={{ color: "#2444b5" }}>
        {" "}
        Посылок:{" "}
      </Typography.Text>
      <Typography.Text>{manifest.parcels_count || "—"}</Typography.Text>
    </Card>
  </Link>
);
