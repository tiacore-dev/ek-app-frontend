import React from "react";
import { List, Card, Typography } from "antd";
import dayjs from "dayjs";
import { IListShiftResponse } from "../types/shifts";
import { Link } from "react-router-dom";
import "../../../components/cards/card.css";

interface MobileShiftsListProps {
  data: IListShiftResponse[];
  isLoading: boolean;
  pagination: any;
}

export const MobileShiftsList: React.FC<MobileShiftsListProps> = ({
  data,
  isLoading,
  pagination,
}) => {
  return (
    <List
      dataSource={data}
      loading={isLoading}
      renderItem={(item) => (
        <Link to={`/shifts/${item.id}`} style={{ display: "block" }}>
          <Card
            className="clickable-card"
            size="small"
            title={
              <Typography.Text>
                {dayjs(item.date).format("DD.MM.YYYY")}
              </Typography.Text>
            }
            // style={{ marginBottom: 16 }}
          >
            <Typography.Text strong>Автомобиль: </Typography.Text>
            <Typography.Text>{item.auto || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Маршрут: </Typography.Text>
            <Typography.Text>{item.name || "—"}</Typography.Text>
            <br />
            <Typography.Text strong>Комментарий: </Typography.Text>
            <Typography.Text>{item.comment || "—"}</Typography.Text>
          </Card>
        </Link>
      )}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
    />
  );
};
