import React from "react";
import { Space, DatePicker, Button, Typography } from "antd";
import dayjs from "dayjs";
import { DateRangeType } from "../types/shifts";

interface ShiftsFiltersProps {
  onDateChange: (dates: DateRangeType, dateStrings: [string, string]) => void;
  onResetDates: () => void;
  isLoading: boolean;
  dateFrom?: number;
  dateTo?: number;
}

export const ShiftsFilters: React.FC<ShiftsFiltersProps> = ({
  onDateChange,
  onResetDates,
  isLoading,
  dateFrom,
  dateTo,
}) => (
  <Space size="large" wrap>
    <Space direction="vertical">
      <Typography.Text strong>Период</Typography.Text>
      <DatePicker.RangePicker
        onChange={onDateChange}
        disabled={isLoading}
        style={{ width: 250 }}
        value={
          dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : undefined
        }
      />
    </Space>

    <Button
      onClick={onResetDates}
      disabled={isLoading || (!dateFrom && !dateTo)}
    >
      Сбросить даты
    </Button>
  </Space>
);
