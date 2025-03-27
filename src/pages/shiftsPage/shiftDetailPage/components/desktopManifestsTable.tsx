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
  const [expandedCities, setExpandedCities] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<
    Record<string, string[]>
  >({});

  const groupedManifests = groupManifestsByCity(data || []);

  const handleCityChange = (keys: string | string[]) => {
    setExpandedCities(Array.isArray(keys) ? keys : [keys]);
  };

  const handleGroupChange = (city: string, keys: string | string[]) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [city]: Array.isArray(keys) ? keys : [keys],
    }));
  };

  return (
    <Collapse
      activeKey={expandedCities}
      onChange={handleCityChange}
      ghost
      style={{ background: "none" }}
    >
      {groupedManifests.map((group) => (
        <Panel
          header={<Typography.Text strong>{group.city}</Typography.Text>}
          key={`city-${group.city}`}
        >
          <Collapse
            ghost
            activeKey={expandedGroups[group.city] || []}
            onChange={(keys) => handleGroupChange(group.city, keys)}
          >
            {group.asSender.length > 0 && (
              <Panel header={`Отправления`} key={`${group.city}-sender`}>
                <Table
                  columns={getManifestsColumns(shiftId, "sender")} // Передаем тип
                  dataSource={group.asSender}
                  rowKey={rowKey}
                  pagination={false}
                  size="small"
                />
              </Panel>
            )}

            {group.asRecipient.length > 0 && (
              <Panel header={`Поступления`} key={`${group.city}-recipient`}>
                <Table
                  columns={getManifestsColumns(shiftId, "recipient")} // Передаем тип
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
