// src/pages/accountPage/accountPage.tsx
import React from "react";
import { Row, Col, Spin, Typography } from "antd";
import { useUserQuery } from "../../hooks/useUserQuery";
import { UserCard } from "./components/userCard";

export const AccountPage: React.FC = () => {
  const { data: user, isLoading } = useUserQuery();

  return (
    <div style={{ padding: "16px" }}>
      {isLoading && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Spin size="large" />
        </Row>
      )}
      {user && (
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <UserCard user={user} />
          </Col>
        </Row>
      )}
      {!user && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Typography.Text type="danger">
            Данные пользователя не найдены
          </Typography.Text>
        </Row>
      )}
    </div>
  );
};
