// src/components/manifests/manifestsColumns.tsx
import type { TableColumnsType } from "antd";
import { IListManifest } from "../../../../types/shifts";
import { Link } from "react-router-dom";

export const getManifestsColumns = (
  shift_id: string
): TableColumnsType<IListManifest> => [
  {
    title: "Номер",
    dataIndex: "number",
    key: "number",
    render: (number: string, record: IListManifest) => (
      <Link to={`/shifts/${shift_id}/${record.id}`}>{number}</Link>
    ),
    width: 80,
  },
  {
    title: "Дата",
    dataIndex: "date",
    key: "date",
    width: 80,
  },
  {
    title: "Отправитель",
    dataIndex: "sender",
    key: "sender",
    width: 150,
  },
  {
    title: "Получатель",
    dataIndex: "recipient",
    key: "recipient",
    width: 150,
  },
  {
    title: "Мест",
    dataIndex: "pieces_count",
    key: "pieces_count",
    width: 30,
  },
  {
    title: "Посылок",
    dataIndex: "parcels_count",
    key: "parcels_count",
    width: 30,
  },
  {
    title: "Вес (кг)",
    dataIndex: "weight",
    key: "weight",
    width: 80,
  },
  {
    title: "Объем (м³)",
    dataIndex: "volume",
    key: "volume",
    width: 80,
  },
];
