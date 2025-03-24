import React, { useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useDispatch } from "react-redux";
import { Button, Typography, Spin } from "antd";

export const HomePage: React.FC = () => {
  return (
    <div className="main-container">
      <Typography.Title level={1}>Вы успешно авторизовались!</Typography.Title>
    </div>
  );
};
