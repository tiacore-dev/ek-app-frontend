// src/components/ShiftsTable/columns.ts
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { IListShiftResponse } from "../types/shifts";

export const getShiftsColumns = (): TableColumnsType<IListShiftResponse> => [
  {
    title: "Автомобиль",
    dataIndex: "auto",
    key: "auto",
    width: 120,
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
    title: "Начало рейса",
    dataIndex: "date_start",
    key: "date_start",
    render: (date: number) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    width: 150,
  },
  {
    title: "Окончание рейса",
    dataIndex: "date_finish",
    key: "date_finish",
    render: (date: number) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    width: 150,
  },
  {
    title: "Город отправления",
    dataIndex: "city_start",
    key: "city_start",
    width: 150,
  },
  {
    title: "Город назначения",
    dataIndex: "city_finish",
    key: "city_finish",
    width: 150,
  },
  {
    title: "Водитель",
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
