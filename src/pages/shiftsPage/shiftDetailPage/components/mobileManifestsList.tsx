import { ManifestsComponentProps } from "../../../../types/shifts";
import React, { useEffect } from "react";
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

  const groupedManifests = groupManifestsByCity(data || []);

  const toggleCity = (city: string) => {
    const newActiveCity = groupState.activeCity === city ? null : city;
    dispatch(setActiveCity({ shiftId, city: newActiveCity }));
  };

  const toggleGroup = (city: string, groupType: string) => {
    const newActiveGroup =
      groupState.activeGroups[city] === groupType ? null : groupType;
    dispatch(
      setActiveGroup({
        shiftId,
        city,
        groupType: newActiveGroup,
      })
    );
  };

  return (
    <div style={{ padding: "0" }}>
      {groupedManifests.map((group) => (
        <Card
          key={`city-${group.city}`}
          size="small"
          style={{
            borderRadius: 6,
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
                whiteSpace: "normal", // Добавляем перенос текста
                wordBreak: "break-word", // Переносим длинные слова
              }}
            >
              <CaretRightOutlined
                style={{
                  marginRight: 8,
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
              </Typography.Text>
            </div>
          }
        >
          {groupState.activeCity === group.city && (
            <div style={{ marginLeft: 6 }}>
              {group.asSender.length > 0 && (
                <div>
                  <div
                    onClick={() => toggleGroup(group.city, "sender")}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CaretRightOutlined
                      style={{
                        marginRight: 6,
                        transform:
                          groupState.activeGroups[group.city] === "sender"
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                        color: "#ef7e1a",
                      }}
                    />
                    <Typography.Text strong style={{ fontSize: "14px" }}>
                      Отправления из {group.city} ({group.asSender.length})
                    </Typography.Text>
                  </div>

                  {groupState.activeGroups[group.city] === "sender" && (
                    <List
                      dataSource={group.asSender}
                      style={{ margin: 0, padding: 0 }}
                      renderItem={(item) => (
                        <div style={{ padding: "2px 0" }}>
                          <ManifestCard
                            manifest={item}
                            shiftId={shiftId}
                            type="sender"
                          />
                        </div>
                      )}
                    />
                  )}
                </div>
              )}

              {group.asRecipient.length > 0 && (
                <div>
                  <div
                    onClick={() => toggleGroup(group.city, "recipient")}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CaretRightOutlined
                      style={{
                        marginRight: 6,
                        transform:
                          groupState.activeGroups[group.city] === "recipient"
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                        color: "#ef7e1a",
                      }}
                    />
                    <Typography.Text strong style={{ fontSize: "14px" }}>
                      Поступления в {group.city} ({group.asRecipient.length})
                    </Typography.Text>
                  </div>

                  {groupState.activeGroups[group.city] === "recipient" && (
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
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
