import React, { useMemo } from "react";
import { Table } from "antd";
import { IListShiftResponse } from "../../../types/shifts";
import { useShiftsColumns } from "./columns";

interface DesktopShiftsTableProps {
  data: IListShiftResponse[];
  rowKey?: string;
  pagination?: any;
}

export const DesktopShiftsTable: React.FC<DesktopShiftsTableProps> = React.memo(
  ({ data = [], rowKey = "id", pagination = false }) => {
    // Выносим вызов хука на верхний уровень компонента
    const columns = useShiftsColumns();

    const tableProps = useMemo(
      () => ({
        columns,
        dataSource: data,
        rowKey,
        pagination,
        scroll: { x: "max-content" },
        bordered: true,
        size: "middle" as const,
      }),
      [columns, data, rowKey, pagination]
    );

    return <Table {...tableProps} />;
  }
);
