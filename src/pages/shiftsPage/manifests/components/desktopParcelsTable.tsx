import React from "react";
import { Table, Typography } from "antd";
import { ParcelsComponentProps } from "../../../../types/shifts";
import { useParcelsColumns } from "./parcelsColumns";

export const DesktopParcelsTable: React.FC<ParcelsComponentProps> = React.memo(
  ({ data, rowKey = "id", manifestId }) => {
    // Get columns configuration
    const columns = useParcelsColumns(manifestId);

    return (
      <div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={rowKey}
          pagination={false}
          size="small"
          style={{ margin: "8px 16px" }}
        />
      </div>
    );
  }
);
