// src/hooks/useShiftsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  IPaginateResponse,
  IListShiftResponse,
  IShiftsQueryParams,
} from "../../pages/shiftsPage/types/shifts";

export const useShiftsQuery = (queryParams: IShiftsQueryParams) => {
  const navigate = useNavigate();

  return useQuery<IPaginateResponse<IListShiftResponse>, Error>({
    queryKey: ["shifts", queryParams],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }

      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/shifts/get`,
        {
          headers: {
            token: token,
          },
          params: queryParams,
        }
      );
      return response.data;
    },
  });
};
