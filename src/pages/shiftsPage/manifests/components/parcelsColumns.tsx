import type { TableColumnsType } from "antd";
import { IListParcels } from "../../../../types/shifts";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Typography } from "antd";
import { useMemo } from "react";

export const useParcelsColumns = (
  manifest_id: string,
  type?: "sender" | "recipient"
): TableColumnsType<IListParcels> => {
  // return useMemo(() => {
  const columns: TableColumnsType<IListParcels> = [
    {
      title: "Заказчик",
      dataIndex: "customer",
      key: "customer",
      width: 80,
    },
    {
      title: "Отправитель",
      dataIndex: "sendCity",
      key: "sendCity",
      width: 80,
    },
    {
      title: "Получатель",
      dataIndex: "recCity",
      key: "recCity",
      width: 80,
    },
    {
      title: "Количество",
      dataIndex: "count",
      key: "count",
      width: 30,
    },
    {
      title: "Вес (кг)",
      dataIndex: "weight",
      key: "weight",
      width: 30,
    },
    {
      title: "Объем (м³)",
      dataIndex: "volume",
      key: "volume",
      width: 30,
    },
  ];

  // // Создаем копию базовых колонок для модификации
  // const columns = [...baseColumns];

  // // Вставляем колонку получателя на вторую позицию для отправлений
  // if (type === "sender") {
  //   columns.splice(1, 0, {
  //     title: "Получатель",
  //     dataIndex: "recipient",
  //     key: "recipient",
  //     width: 150,
  //   });
  // }
  // // Вставляем колонку отправителя на вторую позицию для поступлений
  // else if (type === "recipient") {
  //   columns.splice(1, 0, {
  //     title: "Отправитель",
  //     dataIndex: "sender",
  //     key: "sender",
  //     width: 150,
  //   });
  // }
  // // По умолчанию вставляем обе колонки на вторую и третью позиции
  // else {
  //   columns.splice(
  //     1,
  //     0,
  //     {
  //       title: "Отправитель",
  //       dataIndex: "sender",
  //       key: "sender",
  //       width: 150,
  //     },
  //     {
  //       title: "Получатель",
  //       dataIndex: "recipient",
  //       key: "recipient",
  //       width: 150,
  //     }
  //   );
  // }

  return columns;
};
