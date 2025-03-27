// src/pages/shifts/manifestDetailPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button } from "antd";
import dayjs from "dayjs";
import { fetchManifestById } from "../../../api/shiftsApi";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";

export const ManifestDetailPage: React.FC = () => {
  const { shift_id, manifest_id } = useParams<{
    shift_id: string;
    manifest_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["manifest", manifest_id],
    queryFn: () => fetchManifestById(manifest_id!),
  });

  useEffect(() => {
    if (data) {
      dispatch(
        setBreadcrumbs([
          { label: "...", to: "/home" },
          { label: "Рейсы", to: "/shifts" },
          {
            label: `Рейс`,
            to: `/shifts/${shift_id}`,
          },
          {
            label: `Манифест ${data.number}`,
            to: `/shifts/${shift_id}/${data.id}`,
          },
        ])
      );
    }
  }, [data, dispatch, shift_id]);

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && <Spin size="large" />}

      {!isError && !isLoading && (
        <Card title={`Детали манифеста ${data?.number}`}>
          <Typography.Text strong>
            Отправитель: {data?.sender || "—"}
          </Typography.Text>
          <br />
          <Typography.Text strong>
            Мест:
            {data?.pieces_count || "—"}
          </Typography.Text>
          <br />
          <Typography.Text strong>
            Накладных:
            {data?.parcels_count || "—"}
          </Typography.Text>
          <br />
          <Typography.Text strong>
            Вес:
            {data?.weight || "—"} кг
          </Typography.Text>
          <br />
          <Typography.Text strong>
            Объем:
            {data?.volume || "—"} м³
          </Typography.Text>
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
