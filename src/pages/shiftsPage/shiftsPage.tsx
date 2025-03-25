// src/pages/shiftsPage/shiftsPage.tsx
import React from "react";
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
                />
              </Space>

              <Space direction="vertical">
                <Typography.Text strong>На странице</Typography.Text>
                <InputNumber
                  min={1}
                  max={100}
                  value={queryParams.limit}
                  onChange={(value) =>
                    setQueryParams({ ...queryParams, limit: value || 10 })
                  }
                  disabled={isLoading}
                />
              </Space>

              <Button
                onClick={() => setQueryParams({ limit: 10, offset: 0 })}
                disabled={isLoading}
              >
                Сбросить фильтры
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
