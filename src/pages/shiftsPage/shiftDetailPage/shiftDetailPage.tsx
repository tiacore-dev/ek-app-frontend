import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button, Divider, List } from "antd";
import dayjs from "dayjs";
import { useShiftQuery } from "../../../hooks/shifts/useShiftQuery";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";
import { useMobileDetection } from "../../../hooks/useMobileDetection";
import { DesktopManifestsTable } from "./components/desktopManifestsTable";
import { MobileManifestsList } from "./components/mobileManifestsList";

export const ShiftDetailPage: React.FC = () => {
  const { shift_id } = useParams<{ shift_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();

  const { data, isLoading, isError } = useShiftQuery(shift_id!);

  useEffect(() => {
    if (data) {
      dispatch(
        setBreadcrumbs([
          { label: "Главная страница", to: "/home" },
          { label: "Рейсы", to: "/shifts" },
          {
            label: `Рейс ${dayjs(data.date_start).format("DD.MM.YYYY")}`,
            to: `/shifts/${shift_id}`,
          },
        ])
      );
    }
  }, [data, dispatch, shift_id]);

  const manifestsPagination = {
    pageSize: 5,
    showSizeChanger: false,
    hideOnSinglePage: true,
  };

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && <Spin size="large" />}

      {!isError && !isLoading && (
        <Card title={`Детали рейса:`}>
          <Typography.Paragraph>
            <strong>Даты:</strong>{" "}
            {dayjs(data?.date_start).format("DD.MM.YYYY")}-
            {dayjs(data?.date_finish).format("DD.MM.YYYY")}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Авто:</strong> {data?.auto || "—"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Маршрут:</strong> {data?.name || "—"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Карта:</strong> {data?.card || "—"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Основная оплата:</strong> {data?.payment || "—"} руб.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Комментарий:</strong> {data?.comment || "—"}
          </Typography.Paragraph>

          <Divider orientation="left">Дополнительные платежи</Divider>
          <List
            dataSource={data?.extra_payments}
            renderItem={(payment) => (
              <List.Item>
                <Typography.Text strong>{payment.description}</Typography.Text>{" "}
                {payment.summ} руб.
              </List.Item>
            )}
            locale={{ emptyText: "Нет дополнительных платежей" }}
          />

          <Divider orientation="left">Манифесты</Divider>
          <div style={{ margin: "0 -24px" }}>
            {isMobile ? (
              <MobileManifestsList
                data={data?.manifests || []}
                isLoading={false}
                shiftId={shift_id!}
              />
            ) : (
              <DesktopManifestsTable
                data={data?.manifests || []}
                rowKey="id"
                shiftId={shift_id!}
              />
            )}
          </div>
        </Card>
      )}
      {isError && (
        <Card>
          <Typography.Text type="danger">
            Ошибка загрузки данных
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
