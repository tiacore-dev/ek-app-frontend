// src/api/shiftApi.ts
import { axiosInstance } from "../axiosConfig";

export interface IExtraPayment {
  description: string;
  summ: number;
}

export interface IListManifest {
  id: string;
  sender: string;
  recipient: string;
  date: number;
  number: string;
  parcels_count: number;
  pieces_count: number;
  weight: number;
  volume: number;
}

export interface IShiftResponse {
  auto: string;
  date: number;
  card: string;
  date_start: number;
  date_finish: number;
  city_start: string;
  city_finish: string;
  name: string;
  comment: string;
  payment: number;
  extra_payments: IExtraPayment[];
  manifests: IListManifest[];
}

export const fetchShiftById = async (
  shiftId: string
): Promise<IShiftResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Токен не найден в localStorage");
  }

  const response = await axiosInstance.get(`${url}/shift/${shiftId}/get`, {
    headers: {
      token: token,
    },
  });

  // Логирование данных, полученных от сервера
  console.log("[Server Response Data]", response.data);

  return response.data;
};
