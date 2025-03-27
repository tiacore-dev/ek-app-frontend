// src/pages/shifts/manifestDetailPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button } from "antd";
import dayjs from "dayjs";
import { fetchShiftById } from "../../../api/shiftApi";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";

export const ManifestDetailPage: React.FC = () => {
  const { shift_id, manifest_id } = useParams<{
    shift_id: string;
    manifest_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: shiftData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shift", shift_id],
    queryFn: () => fetchShiftById(shift_id!),
  });

  useEffect(() => {
    if (shiftData) {
      dispatch(
        setBreadcrumbs([
          { label: "Главная страница", to: "/home" },
          { label: "Рейсы", to: "/shifts" },
          {
            label: `Рейс ${dayjs(shiftData.date_start).format("DD.MM.YYYY")}`,
            to: `/shifts/${shift_id}`,
          },
          {
            label: `Манифест ${manifest_id}`,
            to: `/shifts/${shift_id}/${manifest_id}`,
          },
        ])
      );
    }
  }, [shiftData, dispatch, shift_id, manifest_id]);

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && <Spin size="large" />}

      {!isError && !isLoading && (
        <Card title={`Детали манифеста ${manifest_id}`}>
          <Typography.Paragraph>
            <strong>Принадлежит рейсу:</strong>{" "}
            {dayjs(shiftData?.date_start).format("DD.MM.YYYY")}
          </Typography.Paragraph>
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
