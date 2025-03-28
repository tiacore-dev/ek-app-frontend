import React, { useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button } from "antd";
import { fetchManifestById } from "../../../api/shiftsApi";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";

interface ManifestDetail {
  id: string;
  number: string;
  sender?: string;
  pieces_count?: number;
  parcels_count?: number;
  weight?: number;
  volume?: number;
}

export const ManifestDetailPage: React.FC = () => {
  const { shift_id, manifest_id } = useParams<{
    shift_id: string;
    manifest_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useQuery<ManifestDetail>({
    queryKey: ["manifest", manifest_id],
    queryFn: () => fetchManifestById(manifest_id!),
  });

  const breadcrumbs = useMemo(
    () => [
      { label: "...", to: "/home" },
      { label: "Рейсы", to: "/shifts" },
      { label: `Рейс`, to: `/shifts/${shift_id}` },
      {
        label: `Манифест ${data?.number}`,
        to: `/shifts/${shift_id}/${data?.id}`,
      },
    ],
    [data?.number, data?.id, shift_id]
  );

  useEffect(() => {
    if (data) {
      dispatch(setBreadcrumbs(breadcrumbs));
    }
  }, [data, dispatch, breadcrumbs]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const renderContent = useMemo(() => {
    if (isLoading) return <Spin size="large" />;

    if (isError) {
      return (
        <Card>
          <Typography.Text type="danger">
            Ошибка загрузки данных
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={handleGoBack}>
              Назад
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card title={`Детали манифеста ${data?.number}`}>
        <Typography.Paragraph>
          <Typography.Text strong>Отправитель: </Typography.Text>
          {data?.sender || "—"}
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>Мест: </Typography.Text>
          {data?.pieces_count || "—"}
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>Накладных: </Typography.Text>
          {data?.parcels_count || "—"}
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>Вес: </Typography.Text>
          {data?.weight || "—"} кг
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>Объем: </Typography.Text>
          {data?.volume || "—"} м³
        </Typography.Paragraph>
      </Card>
    );
  }, [data, isLoading, isError, handleGoBack]);

  return <div style={{ padding: "20px" }}>{renderContent}</div>;
};
