import { Dayjs } from "dayjs";
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

export interface ManifestsComponentProps {
  data: IListManifest[];
  shiftId: string;
  isLoading?: boolean;
  rowKey?: string;
}

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

export interface IListShiftResponse extends IShiftBase {
  date: number; // Только для списка
}

export interface IPaginateResponse<R> {
  limit: number;
  offset: number;
  total: number;
  data: R[];
}
// export interface IPaginateResponse<T> {
//   limit: number;
//   offset: number;
//   total: number;
//   data: T[];
// }

export interface IShiftsQueryParams {
  limit: number;
  offset: number;
  date_from?: number;
  date_to?: number;
}

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

export type DateRangeType = null | [Dayjs | null, Dayjs | null];
