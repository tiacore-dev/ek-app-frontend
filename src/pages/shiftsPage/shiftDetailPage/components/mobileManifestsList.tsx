import { ManifestsComponentProps } from "../../../../types/shifts";
import React, { useCallback, useMemo } from "react";
import { List, Card, Typography } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { ManifestCard } from "./manifestCard";
import { groupManifestsByCity } from "./manifestGrouping";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import {
  setActiveCity,
  setActiveGroup,
} from "../../../../redux/slices/shiftGroupsSlice";

export const MobileManifestsList: React.FC<ManifestsComponentProps> = ({
  data,
  isLoading,
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

  const groupedManifests = useMemo(
    () => groupManifestsByCity(data || []),
    [data]
  );

  const toggleCity = useCallback(
    (city: string) => {
      const newActiveCity = groupState.activeCity === city ? null : city;
      dispatch(setActiveCity({ shiftId, city: newActiveCity }));
    },
    [dispatch, shiftId, groupState.activeCity]
  );

  const toggleGroup = useCallback(
    (city: string, groupType: string) => {
      const newActiveGroup =
        groupState.activeGroups[city] === groupType ? null : groupType;
      dispatch(
        setActiveGroup({
          shiftId,
          city,
          groupType: newActiveGroup,
        })
      );
    },
    [dispatch, shiftId, groupState.activeGroups]
  );

  const renderSenderGroup = useCallback(
    (group: ReturnType<typeof groupManifestsByCity>[0]) => (
      <div>
        <div
          onClick={() => toggleGroup(group.city, "sender")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            paddingBottom: 4,
          }}
        >
          <Typography.Text strong style={{ fontSize: "14px" }}>
            Загрузить{" "}
            <Typography.Text>({group.asSender.length})</Typography.Text>
          </Typography.Text>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              right: "1%",
              height: 1,
              backgroundColor: "#ef7e1a",
            }}
          />
        </div>
        <List
          dataSource={group.asSender}
          style={{ margin: 0, padding: 0 }}
          renderItem={(item) => (
            <div style={{ padding: "2px 0" }}>
              <ManifestCard manifest={item} shiftId={shiftId} type="sender" />
            </div>
          )}
        />
      </div>
    ),
    [toggleGroup, shiftId]
  );

  const renderRecipientGroup = useCallback(
    (group: ReturnType<typeof groupManifestsByCity>[0]) => (
      <div>
        <div
          onClick={() => toggleGroup(group.city, "recipient")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            paddingBottom: 4,
          }}
        >
          <Typography.Text strong style={{ fontSize: "14px" }}>
            Выгрузить{" "}
            <Typography.Text>({group.asRecipient.length})</Typography.Text>
          </Typography.Text>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              right: "1%",
              height: 1,
              backgroundColor: "#ef7e1a",
            }}
          />
        </div>
        <List
          dataSource={group.asRecipient}
          style={{ margin: 0, padding: 0 }}
          renderItem={(item) => (
            <div>
              <ManifestCard
                manifest={item}
                shiftId={shiftId}
                type="recipient"
              />
            </div>
          )}
        />
      </div>
    ),
    [toggleGroup, shiftId]
  );

  const renderCityCard = useCallback(
    (group: ReturnType<typeof groupManifestsByCity>[0]) => (
      <Card
        key={`city-${group.city}`}
        size="small"
        style={{
          borderRadius: 6,
          border: "1px solid #f0f0f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          margin: "0 0 8px 0",
        }}
        bodyStyle={{
          padding: groupState.activeCity === group.city ? "8px 10px" : "0",
        }}
        headStyle={{
          minHeight: 36,
          borderBottom: 0,
        }}
        title={
          <div
            onClick={() => toggleCity(group.city)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <CaretRightOutlined
              style={{
                marginRight: 4,
                transform:
                  groupState.activeCity === group.city
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                transition: "transform 0.2s",
                color: "#ef7e1a",
              }}
            />
            <Typography.Text strong style={{ fontSize: "15px" }}>
              {group.city}
              <Typography.Text style={{ marginLeft: 4 }}>
                ({group.asSender.length + group.asRecipient.length})
              </Typography.Text>
            </Typography.Text>
          </div>
        }
      >
        {groupState.activeCity === group.city && (
          <div style={{ marginLeft: 2 }}>
            {group.asSender.length > 0 && renderSenderGroup(group)}
            {group.asRecipient.length > 0 && renderRecipientGroup(group)}
          </div>
        )}
      </Card>
    ),
    [groupState.activeCity, toggleCity, renderSenderGroup, renderRecipientGroup]
  );

  return (
    <div style={{ padding: "0" }}>{groupedManifests.map(renderCityCard)}</div>
  );
};
