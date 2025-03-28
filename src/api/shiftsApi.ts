// src/api/shiftsApi.ts
import { axiosInstance } from "../axiosConfig";
import {
  IShiftResponse,
  IListShiftResponse,
  IPaginateResponse,
  IListManifest,
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

export const fetchManifestById = async (
  manifestId: string
): Promise<IListManifest> => {
  const url = process.env.REACT_APP_API_URL;

  const response = await axiosInstance.get(
    `${url}/manifest/${manifestId}/get`,
    {
      headers: getAuthHeaders(),
    }
  );
  console.log("[Server Response Data]", response.data);
  return response.data;
};

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
