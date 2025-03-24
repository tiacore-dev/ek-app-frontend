import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../axiosConfig";
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
import type { TableColumnsType } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

interface IListShiftResponse {
  auto: string;
  date: number;
  card: string;
  date_start: number;
  date_finish: number;
  city_start: string;
  city_finish: string;
  name: string;
  comment: string;
  id: string;
}

interface IPaginateResponse<R> {
  limit: number;
  offset: number;
  total: number;
  data: R[];
}

interface IShiftsQueryParams {
  limit?: number;
  offset?: number;
  date_from?: number;
  date_to?: number;
}

export const ShiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const [queryParams, setQueryParams] = React.useState<IShiftsQueryParams>({
    limit: 10,
    offset: 0,
  });

  const { data, isLoading, isError, error } = useQuery<
    IPaginateResponse<IListShiftResponse>,
    Error
  >({
    queryKey: ["shifts", queryParams],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }

      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/shifts/get`,
        {
          headers: {
            token: token,
          },
          params: queryParams,
        }
      );
      return response.data;
    },
  });

  const columns: TableColumnsType<IListShiftResponse> = [
    {
      title: "Автомобиль",
      dataIndex: "auto",
      key: "auto",
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD.MM.YYYY"),
    },
    {
      title: "Карта",
      dataIndex: "card",
      key: "card",
    },
    {
      title: "Начало смены",
      dataIndex: "date_start",
      key: "date_start",
      render: (date) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Окончание смены",
      dataIndex: "date_finish",
      key: "date_finish",
      render: (date) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Город отправления",
      dataIndex: "city_start",
      key: "city_start",
    },
    {
      title: "Город назначения",
      dataIndex: "city_finish",
      key: "city_finish",
    },
    {
      title: "Водитель",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
    },
  ];

  const handleDateChange = (
    dates: null | [Dayjs | null, Dayjs | null],
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

  if (isError) {
    return (
      <Row justify="center" style={{ marginTop: 20 }}>
        <Col span={24}>
          <Typography.Text type="danger">{error.message}</Typography.Text>
        </Col>
      </Row>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Typography.Title level={2}>Смены</Typography.Title>

      <Card style={{ marginBottom: 20 }}>
        <Space size="large">
          <Space direction="vertical">
            <Typography.Text strong>Период</Typography.Text>
            <DatePicker.RangePicker
              onChange={handleDateChange}
              disabled={isLoading}
            />
          </Space>

          <Space direction="vertical">
            <Typography.Text strong>Количество на странице</Typography.Text>
            <InputNumber
              min={1}
              max={100}
              defaultValue={queryParams.limit}
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
            <Statistic title="Всего смен" value={data.total} />
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
          }}
          scroll={{ x: true }}
        />
      </Spin>
    </div>
  );
};

// export default ShiftsPage;
