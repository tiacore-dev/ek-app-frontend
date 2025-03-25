// src/pages/shiftsPage/shiftsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Row,
  Col,
  Space,
  DatePicker,
  InputNumber,
  Button,
  Spin,
  Card,
  Statistic,
  List,
} from "antd";
import dayjs from "dayjs";
import { IShiftsQueryParams, DateRangeType } from "./types/shifts";
import { useShiftsQuery } from "../../hooks/useShiftsQuery";
import { getShiftsColumns } from "./components/columns";

export const ShiftsPage: React.FC = () => {
  const [queryParams, setQueryParams] = React.useState<IShiftsQueryParams>({
    limit: 10,
    offset: 0,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data, isLoading, isError, error } = useShiftsQuery(queryParams);
  const columns = getShiftsColumns();

  const handleDateChange = (
    dates: DateRangeType,
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

  const renderMobileList = () => (
    <List
      dataSource={data?.data}
      loading={isLoading}
      renderItem={(item) => (
        <Card
          title={`Рейс: ${item.auto}`}
          style={{ marginBottom: 16 }}
          size="small"
        >
          <Typography.Text strong>Дата: </Typography.Text>
          <Typography.Text>
            {dayjs(item.date).format("DD.MM.YYYY")}
          </Typography.Text>
          <br />
          <Typography.Text strong>Начало: </Typography.Text>
          <Typography.Text>
            {dayjs(item.date_start).format("DD.MM.YYYY HH:mm")}
          </Typography.Text>
          <br />
          <Typography.Text strong>Окончание: </Typography.Text>
          <Typography.Text>
            {dayjs(item.date_finish).format("DD.MM.YYYY HH:mm")}
          </Typography.Text>
          <br />
          <Typography.Text strong>Города: </Typography.Text>
          <Typography.Text>
            {item.city_start} → {item.city_finish}
          </Typography.Text>
          <br />
          <Typography.Text strong>Водитель: </Typography.Text>
          <Typography.Text>{item.name}</Typography.Text>
          <br />
          <Typography.Text strong>Комментарий: </Typography.Text>
          <Typography.Text>{item.comment || "—"}</Typography.Text>
        </Card>
      )}
      pagination={{
        current: queryParams.offset
          ? queryParams.offset / queryParams.limit! + 1
          : 1,
        pageSize: queryParams.limit,
        total: data?.total,
        onChange: handlePaginationChange,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
    />
  );

  const renderDesktopTable = () => (
    <Table
      columns={columns}
      dataSource={data?.data}
      rowKey="id"
      pagination={{
        current: queryParams.offset
          ? queryParams.offset / queryParams.limit! + 1
          : 1,
        pageSize: queryParams.limit,
        total: data?.total,
        onChange: handlePaginationChange,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      scroll={{ x: "max-content" }}
      bordered
      size="middle"
    />
  );

  return (
    <div style={{ padding: "20px" }}>
      {!isError && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <Space size="large" wrap>
              <Space direction="vertical">
                <Typography.Text strong>Период</Typography.Text>
                <DatePicker.RangePicker
                  onChange={handleDateChange}
                  disabled={isLoading}
                  style={{ width: 250 }}
                  value={
                    queryParams.date_from && queryParams.date_to
                      ? [
                          dayjs(queryParams.date_from),
                          dayjs(queryParams.date_to),
                        ]
                      : undefined
                  }
                />
              </Space>

              <Button
                onClick={handleResetDateFilters}
                disabled={
                  isLoading || (!queryParams.date_from && !queryParams.date_to)
                }
              >
                Сбросить даты
              </Button>
            </Space>
          </Card>

          {data?.total !== undefined && (
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Statistic title="Всего рейсов" value={data.total} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Показано"
                  value={`${data.offset + 1}-${Math.min(
                    data.offset + data.limit,
                    data.total
                  )}`}
                />
              </Col>
            </Row>
          )}

          <Spin spinning={isLoading}>
            {isMobile ? renderMobileList() : renderDesktopTable()}
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
