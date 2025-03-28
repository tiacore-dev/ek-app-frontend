// src/hooks/useShiftsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchShifts } from "../../api/shiftsApi";
import { IShiftsQueryParams } from "../../types/shifts";

export const useShiftsQuery = (queryParams: IShiftsQueryParams) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["shifts", queryParams],
    queryFn: async () => {
      try {
        return await fetchShifts(queryParams);
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
