import React from "react";
import { Space, DatePicker, Button, Typography, ConfigProvider } from "antd";
import dayjs from "dayjs";
import { DateRangeType } from "../../../types/shifts";
import { useMobileDetection } from "../../../hooks/useMobileDetection";
import "./shiftsFilters.css";

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
}) => {
  const isMobile = useMobileDetection();

  return (
    <ConfigProvider
      theme={{
        components: {
          DatePicker: {
            cellHeight: isMobile ? 32 : 32,
            cellWidth: isMobile ? 48 : 32,
          },
        },
      }}
    >
      <Space size="small" wrap>
        <Space direction="vertical">
          <DatePicker.RangePicker
            onChange={onDateChange}
            disabled={isLoading}
            className="responsive-date-picker"
            value={
              dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : undefined
            }
            format="DD.MM.YYYY"
            popupClassName={
              isMobile ? "vertical-date-picker mobile" : "vertical-date-picker"
            }
            allowClear={false}
            inputReadOnly={isMobile} // Добавьте эту строку
          />
        </Space>

        <Button
          onClick={onResetDates}
          disabled={isLoading || (!dateFrom && !dateTo)}
        >
          Сбросить
        </Button>

        {totalShifts !== undefined && (
          <div
            style={{ display: "flex", alignItems: "center", marginLeft: 16 }}
          >
            <Typography.Text style={{ marginRight: 8 }}>
              Всего рейсов:
            </Typography.Text>
            <Typography.Text strong style={{ color: "#002091" }}>
              {totalShifts}
            </Typography.Text>
          </div>
        )}
      </Space>
    </ConfigProvider>
  );
};
