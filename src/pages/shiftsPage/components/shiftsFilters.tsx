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
  totalShifts?: number;
}

export const ShiftsFilters: React.FC<ShiftsFiltersProps> = ({
  onDateChange,
  onResetDates,
  isLoading,
  dateFrom,
  dateTo,
  totalShifts,
}) => (
  <Space size="small" wrap>
    <Space direction="vertical">
      <DatePicker.RangePicker
        onChange={onDateChange}
        disabled={isLoading}
        style={{ width: 250 }}
        value={
          dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : undefined
        }
        format="DD.MM.YYYY"
      />
    </Space>

    <Button
      onClick={onResetDates}
      disabled={isLoading || (!dateFrom && !dateTo)}
    >
      Сбросить
    </Button>

    {totalShifts !== undefined && (
      <div style={{ display: "flex", alignItems: "center", marginLeft: 16 }}>
        <Typography.Text style={{ marginRight: 8 }}>
          Всего рейсов:
        </Typography.Text>
        <Typography.Text strong style={{ color: "#002091" }}>
          {totalShifts}
        </Typography.Text>
      </div>
    )}
  </Space>
);
