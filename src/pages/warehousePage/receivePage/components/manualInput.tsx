// src/components/WarehouseReceive/ManualInput.tsx
import React from "react";
import { Input, Button, Space } from "antd";

interface ManualInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isMobile: boolean;
}

export const ManualInput: React.FC<ManualInputProps> = ({
  value,
  onChange,
  onSubmit,
  isMobile,
}) => {
  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        placeholder={isMobile ? "Введите данные" : "Введите данные вручную"}
        value={value}
        onChange={onChange}
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
