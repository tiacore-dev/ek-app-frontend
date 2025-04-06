import React from "react";
import { List, Card } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { ParcelCard } from "./parcelsCard";
import { ParcelsComponentProps } from "../../../../types/shifts";

export const MobileParcelsList: React.FC<ParcelsComponentProps> = ({
  data,
  isLoading,
  manifestId,
}) => {
  return (
    <div style={{ padding: "0" }}>
      <List
        dataSource={data || []}
        loading={isLoading}
        renderItem={(item) => (
          <Card
            key={`manifest-${item.id}`}
            size="small"
            style={{
              borderRadius: 6,
              border: "1px solid #f0f0f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              // margin: "0 0 8px 0",
            }}
            bodyStyle={{
              padding: "8px 10px",
            }}
          >
            <div
              style={
                {
                  // marginLeft: 2
                }
              }
            >
              <ParcelCard parcel={item} manifestId={manifestId} />
            </div>
          </Card>
        )}
      />
    </div>
  );
};
