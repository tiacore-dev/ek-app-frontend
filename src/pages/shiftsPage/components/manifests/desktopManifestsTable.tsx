// src/components/manifests/desktopManifestsTable.tsx
import React from "react";
import { Table } from "antd";
import { IListManifest } from "../../types/manifests";
import { getManifestsColumns } from "./manifestsColumns";

interface DesktopManifestsTableProps {
  data: IListManifest[];
  rowKey: string;
}

export const DesktopManifestsTable: React.FC<DesktopManifestsTableProps> = ({
  data,
  rowKey,
}) => (
  <Table
    columns={getManifestsColumns()}
    dataSource={data}
    rowKey={rowKey}
    pagination={false}
    scroll={{ x: "max-content" }}
    bordered
    size="middle"
  />
);
