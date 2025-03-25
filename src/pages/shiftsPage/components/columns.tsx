import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { IListShiftResponse } from "../types/shifts";
import { Link } from "react-router-dom";

export const getShiftsColumns = (): TableColumnsType<IListShiftResponse> => [
  {
    title: "Автомобиль",
    dataIndex: "auto",
    key: "auto",
    width: 120,
    render: (text: string, record: IListShiftResponse) => (
      <Link to={`/shifts/${record.id}`}>{text}</Link>
    ),
  },
  {
    title: "Дата",
    dataIndex: "date",
    key: "date",
    render: (date: number) => dayjs(date).format("DD.MM.YYYY"),
    width: 120,
  },
  {
    title: "Карта",
    dataIndex: "card",
    key: "card",
    width: 100,
  },
  {
    title: "Маршрут",
    dataIndex: "name",
    key: "name",
    width: 150,
  },
  {
    title: "Комментарий",
    dataIndex: "comment",
    key: "comment",
    width: 200,
  },
];
