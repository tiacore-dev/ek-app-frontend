import React from "react";
import { Row, Col, Statistic } from "antd";
import { IPaginateResponse } from "../types/shifts";

interface ShiftsStatsProps {
  data?: IPaginateResponse<any>;
}

export const ShiftsStats: React.FC<ShiftsStatsProps> = ({ data }) => (
  <Row gutter={16} style={{ marginBottom: 20 }}>
    <Col span={8}>
      <Statistic title="Всего рейсов" value={data?.total || 0} />
    </Col>
    <Col span={8}>
      <Statistic
        title="Показано"
        value={`${(data?.offset || 0) + 1}-${Math.min(
          (data?.offset || 0) + (data?.limit || 0),
          data?.total || 0
        )}`}
      />
    </Col>
  </Row>
);
