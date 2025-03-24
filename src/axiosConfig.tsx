import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Логируем заголовки и параметры запроса перед отправкой
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Запрос отправляется:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data, // для POST/PUT-запросов
    });
    return config;
  },
  (error) => {
    console.error("Ошибка в interceptor.request:", error);
    return Promise.reject(error);
  }
);

// Обработка ответов (у вас уже есть)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
