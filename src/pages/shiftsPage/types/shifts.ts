// src/types/shifts.ts
import { Dayjs } from "dayjs";

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

export interface IShiftsQueryParams {
  limit: number;
  offset: number;
  date_from?: number;
  date_to?: number;
}

export type DateRangeType = null | [Dayjs | null, Dayjs | null];
