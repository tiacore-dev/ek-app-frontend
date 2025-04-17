import React from "react";
import { Input, Button, Space } from "antd";

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isMobile?: boolean;
}

export const ManualInput: React.FC<ManualInputProps> = ({
  value,
  onChange,
  onSubmit,
  isMobile = false,
}) => {
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        placeholder={isMobile ? "Введите данные" : "Введите данные вручную"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onSubmit}
        size={isMobile ? "small" : "middle"}
      />
      <Button
        type="primary"
        onClick={onSubmit}
        size={isMobile ? "small" : "middle"}
      >
        {isMobile ? "OK" : "Отправить"}
      </Button>
    </Space.Compact>
  );
};
