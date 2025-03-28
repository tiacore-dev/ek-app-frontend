import React from "react";
import { Table, Typography, Collapse, Divider } from "antd";
import { ManifestsComponentProps } from "../../../../types/shifts";
import { getManifestsColumns } from "./manifestsColumns";
import { groupManifestsByCity } from "./manifestGrouping";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { setActiveCity } from "../../../../redux/slices/shiftGroupsSlice";

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

  return (
    <Collapse
      activeKey={groupState.activeCity ? [`city-${groupState.activeCity}`] : []}
      onChange={handleCityChange}
      ghost
      style={{ background: "none" }}
      accordion
    >
      {groupedManifests.map((group) => (
        <Panel
          header={
            <Typography.Text strong>
              {group.city}
              <Typography.Text style={{ marginLeft: 4 }}>
                ({group.asSender.length + group.asRecipient.length})
              </Typography.Text>
            </Typography.Text>
          }
          key={`city-${group.city}`}
          style={{
            padding: "8px 0",
          }}
        >
          {/* Группа отправлений */}
          {group.asSender.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {" "}
              <Divider
                orientation="left"
                style={{
                  margin: "4px 0",
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
              >
                Отправления ({group.asSender.length})
                {/* Отгрузить ({group.asSender.length}) */}
              </Divider>
              <Table
                columns={getManifestsColumns(shiftId, "sender")}
                dataSource={group.asSender}
                rowKey={rowKey}
                pagination={false}
                size="small"
                style={{ marginBottom: 8 }}
              />
            </div>
          )}

          {/* Группа поступлений */}
          {group.asRecipient.length > 0 && (
            <div>
              <Divider
                orientation="left"
                style={{
                  margin: "4px 0", // Уменьшен отступ
                  fontSize: 14, // Можно уменьшить размер шрифта
                  lineHeight: 1.2, // Уменьшаем межстрочный интервал
                }}
              >
                Поступления ({group.asRecipient.length})
              </Divider>
              <Table
                columns={getManifestsColumns(shiftId, "recipient")}
                dataSource={group.asRecipient}
                rowKey={rowKey}
                pagination={false}
                size="small"
              />
            </div>
          )}
        </Panel>
      ))}
    </Collapse>
  );
};
