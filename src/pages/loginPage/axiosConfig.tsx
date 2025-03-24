import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: false, // если нужно отправлять куки
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login"; // принудительный редирект
    }

    return Promise.reject(error);
  }
);
