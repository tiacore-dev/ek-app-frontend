import React, { useState } from "react";
import { Menu, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import "./navbar.css";

const menuItems: MenuProps["items"] = [
  { label: "Главная", key: "/home" },
  { label: "Аккаунт", key: "/account" },
  { label: "Рейсы", key: "/shifts" },
];

export const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
    setOpenDrawer(false); // закрыть drawer после выбора
  };

  return (
    <div className="navbar">
      {/* Меню для десктопа */}
      <div className="navbar-menu-desktop">
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
        />
      </div>

      {/* Логотип справа */}
      <div className="navbar-right" onClick={() => navigate("/home")}>
        <img
          src="https://static.tildacdn.com/tild3136-3639-4366-b261-316331313834/png_2.png"
          alt="Логотип"
          className="logo-image"
        />
      </div>

      {/* Меню для мобильных */}
      <div className="navbar-menu-mobile">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpenDrawer(true)}
          className="menu-button"
        />
        <Drawer
          title="Меню"
          placement="right"
          onClose={() => setOpenDrawer(false)}
          open={openDrawer}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={onMenuClick}
          />
        </Drawer>
      </div>
    </div>
  );
};
