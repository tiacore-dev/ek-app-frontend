import React from "react";
import { Typography, Card, Spin, Row, Col, Button } from "antd";
import dayjs from "dayjs";
import { IShiftsQueryParams } from "./types/shifts";
import { useShiftsQuery } from "../../hooks/shifts/useShiftsQuery";
import { MobileShiftsList } from "./components/mobileShiftsList";
import { DesktopShiftsTable } from "./components/desktopShiftsTable";
import { ShiftsFilters } from "./components/shiftsFilters";
import { ShiftsStats } from "./components/shiftsStats";
import { useMobileDetection } from "../../hooks/useMobileDetection";

export const ShiftsPage: React.FC = () => {
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
    <div style={{ padding: "20px" }}>
      {!isError && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <ShiftsFilters
              onDateChange={handleDateChange}
              onResetDates={handleResetDateFilters}
              isLoading={isLoading}
              dateFrom={queryParams.date_from}
              dateTo={queryParams.date_to}
            />
          </Card>

          <ShiftsStats data={data} />

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
        <Row justify="center" style={{ marginTop: 20 }}>
          <Col span={24}>
            <Typography.Text type="danger">{error.message}</Typography.Text>
          </Col>
        </Row>
      )}
    </div>
  );
};
