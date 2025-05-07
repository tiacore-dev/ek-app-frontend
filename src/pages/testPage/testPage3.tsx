import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../redux/slices/breadcrumbsSlice";
import { Button, notification } from "antd";

export const TestPage3: React.FC = () => {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Главная страница", to: "/home" },
        { label: "Сканирование", to: "/test3" },
      ])
    );
  }, [dispatch]);

  return <div>Сканирование...</div>;
};
