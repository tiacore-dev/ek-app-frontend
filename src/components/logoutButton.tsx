// src/components/LogoutButton/LogoutButton.tsx
import React from "react";
import { Button, notification } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface LogoutButtonProps {
  onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    notification.success({
      message: "Выход выполнен",
      description: "Вы успешно вышли из системы",
    });
    onLogout?.();
    navigate("/login");
  };

  return (
    <Button
      type="primary"
      danger
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      Выйти
    </Button>
  );
};
