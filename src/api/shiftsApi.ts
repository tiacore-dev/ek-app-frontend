import { axiosInstance } from "../axiosConfig";

export interface IListShiftResponse {
  auto: string;
  date: number;
  card: string;
  date_start: number;
  date_finish: number;
  city_start: string;
  city_finish: string;
  name: string;
  comment: string;
  id: string;
}

export interface IPaginateResponse<R> {
  limit: number;
  offset: number;
  total: number;
  data: R[];
}

export const fetchShifts = async (
  limit: number,
  offset: number,
  dateFrom?: number,
  dateTo?: number
): Promise<IPaginateResponse<IListShiftResponse>> => {
  const token = localStorage.getItem("token");
  const url = process.env.REACT_APP_API_URL;

  if (!token) {
    throw new Error("Токен не найден в localStorage");
  }

  const params: Record<string, any> = { limit, offset };

  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const response = await axiosInstance.get(`${url}/shifts/get`, {
    headers: {
      token: token,
      // "Content-Type": "application/json",
    },
    params,
  });

  return response.data;
};
