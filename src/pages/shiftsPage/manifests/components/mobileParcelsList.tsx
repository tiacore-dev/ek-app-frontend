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
          <ParcelCard parcel={item} manifestId={manifestId} />
        )}
      />
    </div>
  );
};
