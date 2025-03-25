import React from "react";
import { Table } from "antd";
import { IListShiftResponse } from "../types/shifts";
import { getShiftsColumns } from "./columns";

interface DesktopShiftsTableProps {
  data: IListShiftResponse[];
  rowKey: string;
  pagination: any;
}

export const DesktopShiftsTable: React.FC<DesktopShiftsTableProps> = ({
  data,
  rowKey,
  pagination,
}) => (
  <Table
    columns={getShiftsColumns()}
    dataSource={data}
    rowKey={rowKey}
    pagination={pagination}
    scroll={{ x: "max-content" }}
    bordered
    size="middle"
  />
);
