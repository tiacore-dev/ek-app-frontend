import { Dayjs } from "dayjs";

export interface IShiftBase {
  id: string;
  auto: string;
  card: string;
  date_start: number;
  date_finish: number;
  city_start: string;
  city_finish: string;
  name: string;
  comment: string;
}

export interface IListShiftResponse extends IShiftBase {
  date: number; // Только для списка
}

export interface IPaginateResponse<T> {
  limit: number;
  offset: number;
  total: number;
  data: T[];
}

export interface IShiftsQueryParams {
  limit: number;
  offset: number;
  date_from?: number;
  date_to?: number;
}

export type DateRangeType = null | [Dayjs | null, Dayjs | null];
