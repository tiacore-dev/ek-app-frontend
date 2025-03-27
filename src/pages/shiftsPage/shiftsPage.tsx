import React, { useEffect } from "react";
import { Typography, Card, Spin, Row, Col, Button } from "antd";
import dayjs from "dayjs";
import { IShiftsQueryParams } from "../../types/shifts";
import { useShiftsQuery } from "../../hooks/shifts/useShiftsQuery";
import { MobileShiftsList } from "./components/mobileShiftsList";
import { DesktopShiftsTable } from "./components/desktopShiftsTable";
import { ShiftsFilters } from "./components/shiftsFilters";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { useDispatch } from "react-redux";

export const ShiftsPage: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Рейсы", to: "/shifts" },
      ])
    );
  }, [dispatch]);

  const [queryParams, setQueryParams] = React.useState<IShiftsQueryParams>({
    limit: 10,
    offset: 0,
  });

  const isMobile = useMobileDetection();
  const { data, isLoading, isError, error } = useShiftsQuery(queryParams);

  const handleDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    if (dates && dates[0] && dates[1]) {
      setQueryParams({
        ...queryParams,
        date_from: dates[0].valueOf(),
        date_to: dates[1].valueOf(),
      });
    } else {
      const { date_from, date_to, ...rest } = queryParams;
      setQueryParams(rest);
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setQueryParams({
      ...queryParams,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  };

  const handleResetDateFilters = () => {
    setQueryParams({
      ...queryParams,
      date_from: undefined,
      date_to: undefined,
    });
  };

  const paginationConfig = {
    current: queryParams.offset
      ? queryParams.offset / queryParams.limit! + 1
      : 1,
    pageSize: queryParams.limit,
    total: data?.total,
    onChange: handlePaginationChange,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  };

  return (
    <div style={{ padding: "10px 20px 20px 20px" }}>
      {!isError && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <ShiftsFilters
              onDateChange={handleDateChange}
              onResetDates={handleResetDateFilters}
              isLoading={isLoading}
              dateFrom={queryParams.date_from}
              dateTo={queryParams.date_to}
              totalShifts={data?.total}
            />
          </div>

          <Spin spinning={isLoading}>
            {isMobile ? (
              <MobileShiftsList
                data={data?.data || []}
                isLoading={isLoading}
                pagination={paginationConfig}
              />
            ) : (
              <DesktopShiftsTable
                data={data?.data || []}
                rowKey="id"
                pagination={paginationConfig}
              />
            )}
          </Spin>
        </div>
      )}
      {isError && (
        <Row justify="center" style={{ marginTop: "20%" }}>
          <Col span={24}>
            <Typography.Text type="danger">{error.message}</Typography.Text>
          </Col>
        </Row>
      )}
    </div>
  );
};
