import React, { useMemo } from "react";
import { Card, Space, List, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { LogoutButton } from "../../../components/logoutButton";
import { ILoginResponse } from "../../../types/authTypes";

interface UserCardProps {
  user: ILoginResponse;
}

export const UserCard: React.FC<UserCardProps> = React.memo(({ user }) => {
  const userInfoItems = useMemo(
    () => [
      {
        label: "Полное имя",
        value: user.fullName,
      },
      {
        label: "Логин",
        value: user.username || "Не указано",
      },
      {
        label: "Права доступа",
        value: user.permissions?.join(", ") || "Не указано",
      },
    ],
    [user.fullName, user.username, user.permissions]
  );

  const cardTitle = useMemo(
    () => (
      <Space>
        <Avatar
          size="large"
          icon={<UserOutlined style={{ color: "#ef7e1a" }} />}
          style={{ backgroundColor: "#f8f8f8" }}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          Мой аккаунт
        </Typography.Title>
      </Space>
    ),
    []
  );

  return (
    <Card title={cardTitle} extra={<LogoutButton />}>
      <List
        itemLayout="horizontal"
        dataSource={userInfoItems}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Typography.Text strong>{item.label}</Typography.Text>}
              description={<Typography.Text>{item.value}</Typography.Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
});
