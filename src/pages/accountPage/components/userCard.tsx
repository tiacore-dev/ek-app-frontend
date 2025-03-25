// src/components/UserCard/UserCard.tsx
import React from "react";
import { Card, Space, List, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { LogoutButton } from "../../../components/logoutButton";
import { ILoginRespone } from "../../loginPage/loginPage";

interface UserCardProps {
  user: ILoginRespone;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <Card
      title={
        <Space>
          <Avatar
            size="large"
            icon={<UserOutlined style={{ color: "#ef7e1a" }} />}
            style={{ backgroundColor: "#f8f8f8" }} // Фон можно тоже изменить
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Мой аккаунт
          </Typography.Title>
        </Space>
      }
      extra={<LogoutButton />}
    >
      <List
        itemLayout="horizontal"
        dataSource={[
          {
            label: "Полное имя",
            value: user.fullName,
          },
          {
            label: "Логин",
            value: user.username,
          },
          {
            label: "Права доступа",
            value: user.permissions.join(", "),
          },
        ]}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Typography.Text strong>{item.label}</Typography.Text>}
              description={
                <Typography.Text>{item.value || "Не указано"}</Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
