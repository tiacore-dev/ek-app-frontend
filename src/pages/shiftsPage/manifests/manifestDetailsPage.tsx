import React, { useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin, Card, Typography, Button } from "antd";
import { fetchManifestById } from "../../../api/shiftsApi";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";
import { IListParcels } from "../../../types/shifts";
import { useMobileDetection } from "../../../hooks/useMobileDetection";
import { MobileParcelsList } from "./components/mobileParcelsList";
import { DesktopParcelsTable } from "./components/desktopParcelsTable";

interface ManifestDetail {
  // id: string;
  // number: string;
  // sender?: string;
  // pieces_count?: number;
  // parcels_count?: number;
  // weight?: number;
  // volume?: number;
  auto: string;
  id: string;
  sender?: string;
  recipient?: string;
  date: number;
  number: string;
  parcels_count?: number;
  pieces_count?: number;
  weight?: number;
  volume?: number;
  status?: string;
  parcels?: IListParcels[];
}

export const ManifestDetailPage: React.FC = () => {
  const { shift_id, manifest_id } = useParams<{
    shift_id: string;
    manifest_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();

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

  const parcelsTable = useMemo(
    () =>
      isMobile ? (
        <MobileParcelsList
          data={data?.parcels || []}
          isLoading={false}
          manifestId={manifest_id!}
        />
      ) : (
        <DesktopParcelsTable
          data={data?.parcels || []}
          rowKey="id"
          manifestId={manifest_id!}
        />
      ),
    [isMobile, data?.parcels, manifest_id]
  );

  return (
    <div style={{ padding: "20px" }}>
      {isLoading && <Spin size="large" />}
      {!isError && !isLoading && (
        <div>
          <Card title={`Детали манифеста ${data?.number}`}>
            <Typography.Paragraph>
              <Typography.Text strong>Автомобиль: </Typography.Text>
              {data?.auto || "—"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Отправитель: </Typography.Text>
              {data?.sender || "—"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Получатель: </Typography.Text>
              {data?.recipient || "—"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Накладных: </Typography.Text>
              {data?.parcels_count || "—"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Мест: </Typography.Text>
              {data?.pieces_count || "—"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Вес: </Typography.Text>
              {data?.weight || "—"} кг
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Объем: </Typography.Text>
              {data?.volume || "—"} м³
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Статус: </Typography.Text>
              {data?.status || "—"}
            </Typography.Paragraph>
          </Card>

          <div style={{ margin: "0 -20px" }}>{parcelsTable}</div>
        </div>
      )}
      {isError && (
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
      )}
    </div>
  );
};
