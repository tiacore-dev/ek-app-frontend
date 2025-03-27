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

// Функция для проверки корректности даты
const isValidDate = (timestamp?: number): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

// Функция для форматирования даты с проверкой
const formatDateSafe = (timestamp?: number): string => {
  return isValidDate(timestamp) ? dayjs(timestamp).format("DD.MM.YYYY") : "—";
};

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
            label: `Рейс`,
            to: `/shifts/${shift_id}`,
          },
        ])
      );
    }
  }, [data, dispatch, shift_id]);

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && <Spin size="large" />}

      {!isError && !isLoading && (
        <div>
          <Divider orientation="left" style={{ marginTop: "-8px" }}>
            Детали
          </Divider>

          <Typography.Paragraph>
            <strong>Даты:</strong> {formatDateSafe(data?.date_start)}
            {data?.date_finish && isValidDate(data.date_finish)
              ? ` - ${formatDateSafe(data.date_finish)}`
              : ""}
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
          {data?.extra_payments?.length ? (
            <List
              dataSource={data.extra_payments}
              renderItem={(payment) => (
                <List.Item>
                  <Typography.Text strong>
                    {payment.description}
                  </Typography.Text>{" "}
                  {payment.summ} руб.
                </List.Item>
              )}
            />
          ) : (
            <Typography.Paragraph>—</Typography.Paragraph>
          )}

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
        </div>
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
