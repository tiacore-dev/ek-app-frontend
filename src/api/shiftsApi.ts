// src/api/shiftsApi.ts
import { axiosInstance } from "../axiosConfig";
import {
  IShiftResponse,
  IListShiftResponse,
  IPaginateResponse,
  IManifestResponse,
  IManifestLoadingRequest,
  IGetAutoStatusResponse,
  // IManifestLoadingResponse,
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
): Promise<IManifestResponse> => {
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

export const postManifestLoading = async (
  manifestId: string,
  data: IManifestLoadingRequest
): Promise<void> => {
  const url = process.env.REACT_APP_API_URL;
  const response = await axiosInstance.post(
    `${url}/manifest-loading/${manifestId}/post`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );
  console.log("[Server Response Data]", response.data);
  return response.data;
};

export const postManifestUploading = async (
  manifestId: string,
  data: IManifestLoadingRequest
): Promise<void> => {
  const url = process.env.REACT_APP_API_URL;
  const response = await axiosInstance.post(
    `${url}/manifest-uploading/${manifestId}/post`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );
  console.log("[Server Response Data]", response.data);

  return response.data;
};

export const fetchAutoStatus = async (
  autoId: string
): Promise<IGetAutoStatusResponse> => {
  const url = process.env.REACT_APP_API_URL;

  const response = await axiosInstance.get(`${url}/auto-status/${autoId}/get`, {
    headers: getAuthHeaders(),
  });
  console.log("[Server Response Data - Auto Status]", response.data);
  return response.data;
};

export const postShiftEnd = async (shiftId: string): Promise<void> => {
  const url = process.env.REACT_APP_API_URL;
  const response = await axiosInstance.post(
    `${url}/shift-end/${shiftId}/post`,
    {}, // Пустое тело запроса
    {
      headers: getAuthHeaders(),
    }
  );
  console.log("[Server Response Data - Shift End]", response.data);
};

export const postShiftStart = async (shiftId: string): Promise<void> => {
  const url = process.env.REACT_APP_API_URL;
  const response = await axiosInstance.post(
    `${url}/shift-start/${shiftId}/post`,
    {}, // Пустое тело запроса
    {
      headers: getAuthHeaders(),
    }
  );
  console.log("[Server Response Data - Shift Start]", response.data);
};
