import { Dayjs } from "dayjs";

export interface IShiftResponse {
  auto: string;
  auto_id: string;
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
  get_auto?: IShiftAuto;
  return_auto?: IShiftAuto;
}
export interface IListParcels {
  id: string;
  customer: string;
  sendCity: string;
  recCity: string;
  count: number;
  weight: number;
  volume: number;
  number: string;
}

export interface IManifestLoadingResponse {
  success: boolean;
  message?: string;
  updatedManifest?: IListManifest;
}

export interface IManifestResponse {
  auto: string;
  id: string;
  sender: string;
  recipient: string;
  date: number;
  number: string;
  parcels_count: number;
  pieces_count: number;
  weight: number;
  volume: number;
  status: string;
  parcels: IListParcels[];
}
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
  status?: string;
}

export interface IListShiftResponse {
  shift_id: string;
  auto_id: string;
  auto: string;
  card: string;
  date_start: number;
  date_finish: number;
  city_start: string;
  city_finish: string;
  name: string;
  comment: string;
  date: number;
  get_auto?: IShiftAuto;
  return_auto?: IShiftAuto;
}

export interface IShiftResponse extends IListShiftResponse {
  payment: number;
  extra_payments: IExtraPayment[];
  manifests: IListManifest[];
}
export interface IExtraPayment {
  description: string;
  summ: number;
}
export interface IManifestLoadingRequest {
  comment?: string;
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
  status?: string;
  get_auto: IShiftAuto;
  return_auto: IShiftAuto;
}

interface IShiftAuto {
  auto_odo: number;
  auto_fuel: [];
  auto_status_date: number; // timestamp
}

export interface ManifestsComponentProps {
  data: IListManifest[];
  shiftId: string;
  isLoading?: boolean;
  rowKey?: string;
}

export interface ParcelsComponentProps {
  data: IListParcels[];
  manifestId: string;
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

export interface IGetAutoStatusResponse extends IShiftAuto {
  auto_status: "in_use" | "available" | "not_available";
}

export interface IListShiftResponse extends IShiftBase {
  date: number;
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
