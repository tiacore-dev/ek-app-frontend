import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Button, Card, Typography, Divider } from "antd";
import { useShiftQuery } from "../../../hooks/shifts/useShiftQuery";
import { setBreadcrumbs } from "../../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";
import { useMobileDetection } from "../../../hooks/useMobileDetection";
import { DesktopManifestsTable } from "./components/desktopManifestsTable";
import { MobileManifestsList } from "./components/mobileManifestsList";
import { ShiftDetails } from "./components/shiftDetail";

export const ShiftDetailPage: React.FC = () => {
  const { shift_id } = useParams<{ shift_id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();

  const { data, isLoading, isError } = useShiftQuery(shift_id!);

  const breadcrumbs = useMemo(
    () => [
      { label: "Главная страница", to: "/home" },
      { label: "Рейсы", to: "/shifts" },
      { label: `Рейс`, to: `/shifts/${shift_id}` },
    ],
    [shift_id]
  );

  useEffect(() => {
    if (data) {
      dispatch(setBreadcrumbs(breadcrumbs));
    }
  }, [data, dispatch, breadcrumbs]);

  const manifestsTable = useMemo(
    () =>
      isMobile ? (
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
      ),
    [isMobile, data?.manifests, shift_id]
  );

  if (isLoading) return <Spin size="large" />;

  if (isError)
    return (
      <Card>
        <Typography.Text type="danger">Ошибка загрузки данных</Typography.Text>
        <div
          style={
            {
              // marginTop: 16
            }
          }
        >
          <Button type="primary" onClick={() => navigate(-1)}>
            Назад
          </Button>
        </div>
      </Card>
    );

  return (
    <>
      {data && (
        <ShiftDetails shift={data} shiftId={shift_id!}>
          {data.manifests?.length ? <>{manifestsTable}</> : null}
        </ShiftDetails>
      )}
    </>
  );
};
