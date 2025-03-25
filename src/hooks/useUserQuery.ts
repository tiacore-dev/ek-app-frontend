// src/hooks/useUserQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ILoginRespone } from "../pages/loginPage/loginPage";

export const useUserQuery = () => {
  const navigate = useNavigate();

  // Получаем данные пользователя из localStorage
  const getUserData = (): ILoginRespone | null => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    if (!token || !userData) return null;
    return JSON.parse(userData) as ILoginRespone;
  };

  return useQuery({
    queryKey: ["userData"],
    queryFn: () => {
      const userData = getUserData();
      if (!userData) {
        navigate("/login");
        throw new Error("Пользователь не авторизован");
      }
      return userData;
    },
    initialData: getUserData(),
  });
};
