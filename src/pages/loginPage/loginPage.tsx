import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "./axiosConfig";
import { Button, Form, Input, Typography, Spin } from "antd";
// import "./loginPage.css";
import toast from "react-hot-toast";

type FormData = {
  username: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
};

type ApiError = {
  response?: {
    data: {
      message: string;
    };
  };
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation<AuthResponse, Error, FormData>({
    mutationFn: async (data) => {
      const url = process.env.REACT_APP_API_URL;
      if (!url) {
        throw new Error("REACT_APP_API_URL is not defined");
      }

      try {
        const response = await axiosInstance.post<AuthResponse>(
          `${url}/login`,
          data
        );
        // const response = await axiosInstance.post<AuthResponse>(
        //   "/http/hs/api/login", // Относительный URL
        //   data
        // );
        return response.data;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        if (apiError.response) {
          const errorMessage =
            apiError.response.data.message || "Ошибка при авторизации";
          throw new Error(errorMessage);
        } else {
          throw new Error("Неизвестная ошибка");
        }
      }
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onFinish = (values: FormData) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="login_container">
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <Typography.Title level={2} style={{ textAlign: "center" }}>
          Вход
        </Typography.Title>

        <Form.Item
          label="Логин"
          name="username"
          rules={[{ required: true, message: "Логин обязателен" }]}
        >
          <Input
            placeholder="Введите логин"
            disabled={loginMutation.isPending}
          />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: "Пароль обязателен" }]}
        >
          <Input.Password
            placeholder="Введите пароль"
            disabled={loginMutation.isPending}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={loginMutation.isPending}
            block
          >
            {loginMutation.isPending ? (
              <Spin size="small" className="center-spin" />
            ) : (
              "Войти"
            )}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
