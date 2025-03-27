import React from "react";
import { Table, Typography, Collapse } from "antd";
import { ManifestsComponentProps } from "../../../../types/shifts";
import { getManifestsColumns } from "./manifestsColumns";
import { groupManifestsByCity } from "./manifestGrouping";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import {
  setActiveCity,
  setActiveGroup,
} from "../../../../redux/slices/shiftGroupsSlice";

const { Panel } = Collapse;

export const DesktopManifestsTable: React.FC<ManifestsComponentProps> = ({
  data,
  rowKey = "id",
  shiftId,
}) => {
  const dispatch = useDispatch();
  const groupState = useSelector(
    (state: RootState) =>
      state.shiftGroups[shiftId] || {
        activeCity: null,
        activeGroups: {},
      }
  );

  const groupedManifests = groupManifestsByCity(data || []);

  const handleCityChange = (keys: string | string[]) => {
    const activeKeys = Array.isArray(keys) ? keys : [keys];
    const city =
      activeKeys.length > 0 ? activeKeys[0].replace("city-", "") : null;
    dispatch(setActiveCity({ shiftId, city }));
  };

  const handleGroupChange = (city: string, keys: string | string[]) => {
    const activeKeys = Array.isArray(keys) ? keys : [keys];
    const groupType =
      activeKeys.length > 0
        ? activeKeys[0].replace(`${city}-`, "").split("-")[0]
        : null;
    dispatch(setActiveGroup({ shiftId, city, groupType }));
  };

  return (
    <Collapse
      activeKey={groupState.activeCity ? [`city-${groupState.activeCity}`] : []}
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
            activeKey={
              groupState.activeGroups[group.city]
                ? [`${group.city}-${groupState.activeGroups[group.city]}`]
                : []
            }
            onChange={(keys) => handleGroupChange(group.city, keys)}
          >
            {group.asSender.length > 0 && (
              <Panel
                header={`Отправления из ${group.city} (${group.asSender.length})`}
                key={`${group.city}-sender`}
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
                key={`${group.city}-recipient`}
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
