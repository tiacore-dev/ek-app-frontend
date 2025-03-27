// src/components/manifests/mobileManifestsList.tsx
import React from "react";
import { List, Card, Typography } from "antd";
import dayjs from "dayjs";
import { IListManifest } from "../../types/manifests";
import { Link } from "react-router-dom";
import "../../../../components/cards/card.css";

interface MobileManifestsListProps {
  data: IListManifest[];
  isLoading: boolean;
  shiftId: string;
}

export const MobileManifestsList: React.FC<MobileManifestsListProps> = ({
  data,
  isLoading,
  shiftId,
}) => {
  return (
    <List
      dataSource={data}
      loading={isLoading}
      style={{ margin: 0 }}
      renderItem={(item) => (
        <Link to={`/shifts/${shiftId}/${item.id}`} style={{ display: "block" }}>
          <Card
            className="clickable-card"
            size="small"
            style={{ marginBottom: "6px" }}
            title={
              <Typography.Text>
                Манифест №{item.number} от {item.date}
              </Typography.Text>
            }
          >
            <Typography.Text strong>Отправитель: </Typography.Text>
            <Typography.Text>{item.sender || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Получатель: </Typography.Text>
            <Typography.Text>{item.recipient || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Мест: </Typography.Text>
            <Typography.Text>{item.pieces_count || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Посылок: </Typography.Text>
            <Typography.Text>{item.parcels_count || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Вес: </Typography.Text>
            <Typography.Text>{item.weight || "—"} кг</Typography.Text>
            <br />
            <Typography.Text strong>Объем: </Typography.Text>
            <Typography.Text>{item.volume || "—"} м³</Typography.Text>
          </Card>
        </Link>
      )}
    />
  );
};
