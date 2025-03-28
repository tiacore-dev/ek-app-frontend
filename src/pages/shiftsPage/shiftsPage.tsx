import React, { useEffect, useCallback, useMemo } from "react";
import { Typography, Card, Spin, Row, Col } from "antd";
import dayjs from "dayjs";
import { IShiftsQueryParams } from "../../types/shifts";
import { useShiftsQuery } from "../../hooks/shifts/useShiftsQuery";
import { MobileShiftsList } from "./components/mobileShiftsList";
import { DesktopShiftsTable } from "./components/desktopShiftsTable";
import { ShiftsFilters } from "./components/shiftsFilters";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  setShiftsDateFilter,
  resetShiftsDateFilter,
  setShiftsPagination,
} from "../../redux/slices/dataFiltersSlice";
import { RootState } from "../../redux/store";

export const ShiftsPage: React.FC = () => {
  const dispatch = useDispatch();
  const isMobile = useMobileDetection();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Рейсы", to: "/shifts" },
      ])
    );
  }, [dispatch]);

  const { dateFrom, dateTo, currentPage, pageSize } = useSelector(
    (state: RootState) => state.datafilters.shifts
  );

  const [queryParams, setQueryParams] = React.useState<IShiftsQueryParams>({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    date_from: dateFrom,
    date_to: dateTo,
  });

  useEffect(() => {
    setQueryParams({
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }, [dateFrom, dateTo, currentPage, pageSize]);

  const { data, isLoading, isError, error } = useShiftsQuery(queryParams);

  const handleDateChange = useCallback(
    (
      dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
      dateStrings: [string, string]
    ) => {
      if (dates && dates[0] && dates[1]) {
        dispatch(
          setShiftsDateFilter({
            dateFrom: dates[0].valueOf(),
            dateTo: dates[1].valueOf(),
          })
        );
        dispatch(setShiftsPagination({ currentPage: 1, pageSize }));
      } else {
        dispatch(resetShiftsDateFilter());
        dispatch(setShiftsPagination({ currentPage: 1, pageSize }));
      }
    },
    [dispatch, pageSize]
  );

  const handleResetDateFilters = useCallback(() => {
    dispatch(resetShiftsDateFilter());
    dispatch(setShiftsPagination({ currentPage: 1, pageSize }));
  }, [dispatch, pageSize]);

  const handlePaginationChange = useCallback(
    (page: number, newPageSize: number) => {
      dispatch(
        setShiftsPagination({ currentPage: page, pageSize: newPageSize })
      );
    },
    [dispatch]
  );

  const paginationConfig = useMemo(
    () => ({
      current: currentPage,
      pageSize: pageSize,
      total: data?.total,
      onChange: handlePaginationChange,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    }),
    [currentPage, pageSize, data?.total, handlePaginationChange]
  );

  return (
    <div style={{ padding: "10px 20px 20px 20px" }}>
      {!isError && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <ShiftsFilters
              onDateChange={handleDateChange}
              onResetDates={handleResetDateFilters}
              isLoading={isLoading}
              dateFrom={dateFrom}
              dateTo={dateTo}
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
