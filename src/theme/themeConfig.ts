// src/theme/themeConfig.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#2444b5", // Основной цвет (кнопки, выделения и т.д.)
    colorLink: "#2444b5", // Цвет ссылок
    colorLinkHover: "#1a3490", // Цвет ссылок при наведении
    colorLinkActive: "#12276d", // Цвет активных ссылок
    borderRadius: 4, // Опционально: скругление углов
  },
  components: {
    Button: {
      colorPrimary: "#ef7e1a",
      colorPrimaryHover: "#1a3490",
      colorPrimaryActive: "#12276d",
    },
    Menu: {
      itemSelectedColor: "#2444b5",
      itemSelectedBg: "rgba(36, 68, 181, 0.1)",
    },
    Table: {
      rowSelectedBg: "rgba(36, 68, 181, 0.1)",
      rowSelectedHoverBg: "rgba(36, 68, 181, 0.2)",
    },
    // Добавьте другие компоненты по необходимости
  },
};

export default theme;
