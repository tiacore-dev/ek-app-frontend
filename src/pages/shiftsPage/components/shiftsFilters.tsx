import React, { useMemo } from "react";
import { Space, DatePicker, Button, Typography, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
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

export const ShiftsFilters: React.FC<ShiftsFiltersProps> = React.memo(
  ({
    onDateChange,
    onResetDates,
    isLoading,
    dateFrom,
    dateTo,
    totalShifts,
  }) => {
    const isMobile = useMobileDetection();

    const datePickerValue = useMemo((): [Dayjs, Dayjs] | null => {
      return dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null;
    }, [dateFrom, dateTo]);

    const configProviderTheme = useMemo(
      () => ({
        components: {
          DatePicker: {
            cellHeight: isMobile ? 32 : 32,
            cellWidth: isMobile ? 48 : 32,
          },
        },
      }),
      [isMobile]
    );

    const totalShiftsComponent = useMemo(() => {
      if (totalShifts === undefined) return null;

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            // marginLeft: 16
          }}
        >
          <Typography.Text
            style={
              {
                // marginRight: 8
              }
            }
          >
            Всего рейсов:
          </Typography.Text>
          <Typography.Text strong style={{ color: "#002091" }}>
            {totalShifts}
          </Typography.Text>
        </div>
      );
    }, [totalShifts]);

    return (
      <Space size="small" wrap>
        <Space direction="vertical">
          <DatePicker.RangePicker
            onChange={onDateChange}
            disabled={isLoading}
            className="responsive-date-picker"
            value={datePickerValue}
            format="DD.MM.YYYY"
            popupClassName={
              isMobile ? "vertical-date-picker mobile" : "vertical-date-picker"
            }
            allowClear={false}
            inputReadOnly={isMobile}
          />
        </Space>

        <Button
          onClick={onResetDates}
          disabled={isLoading || (!dateFrom && !dateTo)}
        >
          Сбросить
        </Button>

        {totalShiftsComponent}
      </Space>
    );
  }
);
