import React from "react";
import { Typography, Row, Col } from "antd";

export const HomePage: React.FC = () => {
  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Typography.Title level={1} style={{ textAlign: "center" }}>
          Вы успешно авторизовались!
        </Typography.Title>
      </Col>
    </Row>
  );
};
