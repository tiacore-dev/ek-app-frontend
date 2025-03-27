// src/hooks/useShiftQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchShiftById } from "../../api/shiftsApi";

export const useShiftQuery = (shiftId: string) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["shift", shiftId],
    queryFn: async () => {
      try {
        return await fetchShiftById(shiftId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Токен не найден в localStorage"
        ) {
          navigate("/login");
        }
        throw error;
      }
    },
  });
};
