import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../axiosConfig";
import {
  Button,
  Form,
  Input,
  Typography,
  Spin,
  Row,
  Col,
  notification,
} from "antd";

interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginRespone {
  fullName: string;
  username: string;
  token: string;
  permissions: string[];
}

type ApiError = {
  response?: {
    data: {
      message: string;
    };
  };
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation<ILoginRespone, Error, ILoginRequest>({
    mutationFn: async (data) => {
      const url = process.env.REACT_APP_API_URL;
      if (!url) {
        throw new Error("REACT_APP_API_URL is not defined");
      }

      try {
        const response = await axiosInstance.post<ILoginRespone>(
          `${url}/auth/login`,
          data
        );
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data));
      navigate("/home");
    },
    onError: (error) => {
      notification.error({
        message: "Ошибка",
        description: error.message,
        placement: "topRight",
      });
    },
  });

  const onFinish = (values: ILoginRequest) => {
    loginMutation.mutate(values);
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}
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
      </Col>
    </Row>
  );
};
