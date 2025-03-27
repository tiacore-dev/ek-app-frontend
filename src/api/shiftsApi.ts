// src/api/shiftsApi.ts
import { axiosInstance } from "../axiosConfig";
import {
  IShiftResponse,
  IListShiftResponse,
  IPaginateResponse,
} from "../types/shifts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Токен не найден в localStorage");
  }
  return { token };
};

export const fetchShiftById = async (
  shiftId: string
): Promise<IShiftResponse> => {
  const url = process.env.REACT_APP_API_URL;

  const response = await axiosInstance.get(`${url}/shift/${shiftId}/get`, {
    headers: getAuthHeaders(),
  });
  console.log("[Server Response Data]", response.data);
  return response.data;
};

// export const fetchShifts = async (
//   limit: number,
//   offset: number,
//   dateFrom?: number,
//   dateTo?: number
// ): Promise<IPaginateResponse<IListShiftResponse>> => {
//   const url = process.env.REACT_APP_API_URL;

//   const params: Record<string, any> = { limit, offset };
//   if (dateFrom) params.date_from = dateFrom;
//   if (dateTo) params.date_to = dateTo;

//   const response = await axiosInstance.get(`${url}/shifts/get`, {
//     headers: getAuthHeaders(),
//     params,
//   });
//   return response.data;
// };

export const fetchShifts = async (params: {
  limit: number;
  offset: number;
  date_from?: number;
  date_to?: number;
}): Promise<IPaginateResponse<IListShiftResponse>> => {
  const url = process.env.REACT_APP_API_URL;

  const response = await axiosInstance.get(`${url}/shifts/get`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

// Экспортируем функцию для использования в хуке
export const fetchShiftsWithParams = async (
  queryParams: Record<string, any>
): Promise<IPaginateResponse<IListShiftResponse>> => {
  const url = process.env.REACT_APP_API_URL;

  const response = await axiosInstance.get(`${url}/shifts/get`, {
    headers: getAuthHeaders(),
    params: queryParams,
  });
  return response.data;
};
