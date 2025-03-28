import React, { useCallback, useMemo } from "react";
import { Table, Typography, Collapse, Divider } from "antd";
import { ManifestsComponentProps } from "../../../../types/shifts";
import { useManifestsColumns } from "./manifestsColumns";
import { groupManifestsByCity } from "./manifestGrouping";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { setActiveCity } from "../../../../redux/slices/shiftGroupsSlice";

const { Panel } = Collapse;

export const DesktopManifestsTable: React.FC<ManifestsComponentProps> =
  React.memo(({ data, rowKey = "id", shiftId }) => {
    const dispatch = useDispatch();
    const groupState = useSelector(
      (state: RootState) =>
        state.shiftGroups[shiftId] || {
          activeCity: null,
          activeGroups: {},
        }
    );

    const groupedManifests = useMemo(
      () => groupManifestsByCity(data || []),
      [data]
    );

    // Выносим вызовы хуков на верхний уровень
    const senderColumns = useManifestsColumns(shiftId, "sender");
    const recipientColumns = useManifestsColumns(shiftId, "recipient");

    const handleCityChange = useCallback(
      (keys: string | string[]) => {
        const activeKeys = Array.isArray(keys) ? keys : [keys];
        const city =
          activeKeys.length > 0 ? activeKeys[0].replace("city-", "") : null;
        dispatch(setActiveCity({ shiftId, city }));
      },
      [dispatch, shiftId]
    );

    const renderPanelHeader = useCallback(
      (city: string, count: number) => (
        <Typography.Text strong>
          {city}
          <Typography.Text style={{ marginLeft: 4 }}>({count})</Typography.Text>
        </Typography.Text>
      ),
      []
    );

    const renderTableSection = useCallback(
      (type: "sender" | "recipient", manifests: any[], columns: any) => {
        if (manifests.length === 0) return null;

        const title = type === "sender" ? "Загрузить" : "Выгрузить";
        return (
          <div style={{ marginBottom: type === "sender" ? 8 : 0 }}>
            <Divider
              orientation="left"
              style={{
                margin: "4px 0",
                fontSize: 14,
                lineHeight: 1.2,
              }}
            >
              {title} ({manifests.length})
            </Divider>
            <Table
              columns={columns}
              dataSource={manifests}
              rowKey={rowKey}
              pagination={false}
              size="small"
            />
          </div>
        );
      },
      [rowKey]
    );

    const activeKey = useMemo(
      () => (groupState.activeCity ? [`city-${groupState.activeCity}`] : []),
      [groupState.activeCity]
    );

    return (
      <Collapse
        activeKey={activeKey}
        onChange={handleCityChange}
        ghost
        style={{ background: "none" }}
        accordion
      >
        {groupedManifests.map((group) => (
          <Panel
            header={renderPanelHeader(
              group.city,
              group.asSender.length + group.asRecipient.length
            )}
            key={`city-${group.city}`}
            style={{ padding: "8px 0" }}
          >
            {renderTableSection("sender", group.asSender, senderColumns)}
            {renderTableSection(
              "recipient",
              group.asRecipient,
              recipientColumns
            )}
          </Panel>
        ))}
      </Collapse>
    );
  });
