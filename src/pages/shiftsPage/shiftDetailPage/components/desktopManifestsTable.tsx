import React, { useState } from "react";
import { Table, Typography, Collapse } from "antd";
import { ManifestsComponentProps } from "../../../../types/shifts";
import { getManifestsColumns } from "./manifestsColumns";
import { groupManifestsByCity } from "./manifestGrouping";

const { Panel } = Collapse;

export const DesktopManifestsTable: React.FC<ManifestsComponentProps> = ({
  data,
  rowKey = "id",
  shiftId,
}) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const groupedManifests = groupManifestsByCity(data || []);

  const handleChange = (keys: string | string[]) => {
    setActiveKeys(Array.isArray(keys) ? keys : [keys]);
  };

  return (
    <Collapse
      activeKey={activeKeys}
      onChange={handleChange}
      ghost
      style={{ background: "none" }}
    >
      {groupedManifests.map((group) => (
        <Panel
          header={<Typography.Text strong>{group.city}</Typography.Text>}
          key={`city-${group.city}`}
        >
          <Collapse ghost>
            {group.asSender.length > 0 && (
              <Panel
                header={`Отправления из ${group.city} (${group.asSender.length})`}
                key={`sender-${group.city}`}
              >
                <Table
                  columns={getManifestsColumns(shiftId)}
                  dataSource={group.asSender}
                  rowKey={rowKey}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {group.asRecipient.length > 0 && (
              <Panel
                header={`Поступления в ${group.city} (${group.asRecipient.length})`}
                key={`recipient-${group.city}`}
              >
                <Table
                  columns={getManifestsColumns(shiftId)}
                  dataSource={group.asRecipient}
                  rowKey={rowKey}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}
          </Collapse>
        </Panel>
      ))}
    </Collapse>
  );
};
