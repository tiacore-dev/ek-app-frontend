import React from "react";
import { List, Card, Typography } from "antd";
import dayjs from "dayjs";
import { IListShiftResponse } from "../types/shifts";
import { Link } from "react-router-dom";

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
        <Card
          title={
            <Link to={`/shifts/${item.id}`} style={{ color: "inherit" }}>
              Автомобиль: {item.auto}
            </Link>
          }
          style={{ marginBottom: 16 }}
          size="small"
        >
          <Typography.Text strong>Дата: </Typography.Text>
          <Typography.Text>
            {dayjs(item.date).format("DD.MM.YYYY")}
          </Typography.Text>
          <br />
          <br />
          <Typography.Text strong>Маршрут: </Typography.Text>
          <Typography.Text>{item.name}</Typography.Text>
          <br />
          <Typography.Text strong>Комментарий: </Typography.Text>
          <Typography.Text>{item.comment || "—"}</Typography.Text>
        </Card>
      )}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
    />
  );
};
