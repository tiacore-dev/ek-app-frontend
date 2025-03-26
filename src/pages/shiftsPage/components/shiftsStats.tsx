import React from "react";
import { Row, Col, Statistic, Typography } from "antd";
import { IPaginateResponse } from "../types/shifts";

interface ShiftsStatsProps {
  data?: IPaginateResponse<any>;
}

export const ShiftsStats: React.FC<ShiftsStatsProps> = ({ data }) => (
  <Row>
    <Typography.Paragraph>
      <strong>Всего рейсов:</strong> {data?.total || 0}
    </Typography.Paragraph>
  </Row>
);
