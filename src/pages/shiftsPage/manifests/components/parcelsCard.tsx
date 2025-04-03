import React, { useCallback } from "react";
import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { IListParcels } from "../../../../types/shifts";
import dayjs from "dayjs";
import "../../../../components/cards/card.css";

interface ParcelCardProps {
  parcel: IListParcels;
  manifestId: string;
  // type: "sender" | "recipient";
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "—";
  return dayjs(timestamp).format("DD.MM.YYYY");
};

export const ParcelCard: React.FC<ParcelCardProps> = React.memo(
  ({ parcel, manifestId }) => {
    // const renderCounterparty = useCallback(
    //   () => (
    //     <>
    //       <Typography.Text strong style={{ color: "#2444b5" }}>
    //         {type === "sender" ? "Получатель: " : "Отправитель: "}
    //       </Typography.Text>
    //       <Typography.Text>
    //         {type === "sender" ? parcel.recCity || "—" : parcel.sendCity || "—"}
    //       </Typography.Text>
    //     </>
    //   ),
    //   [type, parcel.recCity, parcel.sendCity]
    // );

    const renderDetails = useCallback(
      () => (
        <>
          <Typography.Text strong style={{ color: "#2444b5" }}>
            Заказчик:{" "}
          </Typography.Text>
          <Typography.Text>{parcel.customer}</Typography.Text>
          <Typography.Text strong style={{ color: "#2444b5" }}>
            {" "}
            Мест:{" "}
          </Typography.Text>
          <Typography.Text>{parcel.count || "—"}</Typography.Text>
          <Typography.Text strong style={{ color: "#2444b5" }}>
            {" "}
            Вес:{" "}
          </Typography.Text>
          <Typography.Text>{parcel.weight || "—"}</Typography.Text>кг
          <Typography.Text strong style={{ color: "#2444b5" }}>
            {" "}
            Объем:{" "}
          </Typography.Text>
          <Typography.Text>{parcel.volume || "—"}</Typography.Text>м³
        </>
      ),
      [parcel.customer, parcel.count, parcel.weight, parcel.volume]
    );

    return (
      <Card
        className="clickable-card"
        size="small"
        title={parcel.customer}
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* {renderCounterparty()} */}
        <br />
        {renderDetails()}
      </Card>
    );
  }
);
