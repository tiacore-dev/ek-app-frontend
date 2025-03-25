import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button, List, Divider } from "antd";
import dayjs from "dayjs";
import { fetchShiftById } from "../../api/shiftApi";

export const ShiftDetailPage: React.FC = () => {
  const { shift_id } = useParams<{ shift_id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shift", shift_id],
    queryFn: () => fetchShiftById(shift_id!),
  });

  return (
    <div style={{ padding: "20px" }}>
      <Button
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
        type="primary"
      >
        Назад к списку
      </Button>
      {isLoading && <Spin size="large" />}

      {!isError && !isLoading && (
        <Card title={`Детали рейса: ${data?.auto}`}>
          <Typography.Paragraph>
            <strong>Дата:</strong> {dayjs(data?.date).format("DD.MM.YYYY")}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Маршрут:</strong> {data?.name}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Карта:</strong> {data?.card}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Основная оплата:</strong> {data?.payment} руб.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Комментарий:</strong> {data?.comment || "—"}
          </Typography.Paragraph>

          <Divider orientation="left">Дополнительные платежи</Divider>
          <List
            dataSource={data?.extra_payments}
            renderItem={(payment) => (
              <List.Item>
                <Typography.Text strong>{payment.description}:</Typography.Text>{" "}
                {payment.summ} руб.
              </List.Item>
            )}
            locale={{ emptyText: "Нет дополнительных платежей" }}
          />

          <Divider orientation="left">Манифесты</Divider>
          <List
            dataSource={data?.manifests}
            renderItem={(manifest) => (
              <List.Item>
                <Typography.Text strong>№ {manifest.number}</Typography.Text>
                <div>Отправитель: {manifest.sender}</div>
                <div>Получатель: {manifest.recipient}</div>
                <div>Дата: {dayjs(manifest.date).format("DD.MM.YYYY")}</div>
                <div>Мест: {manifest.pieces_count}</div>
                <div>Посылок: {manifest.parcels_count}</div>
                <div>Вес: {manifest.weight} кг</div>
                <div>Объем: {manifest.volume} м³</div>
              </List.Item>
            )}
            locale={{ emptyText: "Нет манифестов" }}
          />
        </Card>
      )}
      {isError && <div>Ошибка загрузки данных</div>}
    </div>
  );
};
