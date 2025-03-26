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

export interface IPaginateManifestResponse {
  limit: number;
  offset: number;
  total: number;
  data: IListManifest[];
}
