import type { TableColumnsType } from "antd";
import { IListManifest } from "../../../../types/shifts";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Typography } from "antd";
import { useMemo } from "react";
import { ManifestActions } from "./manifestActions";

const getStatusColor = (status?: string, type?: string) => {
  switch (status) {
    case "Готов к загрузке":
      return type === "sender" ? "#dbac66" : "#60c760";
    case "Манифест в пути":
      return type === "sender" ? "#60c760" : "#dbac66";
    case "Манифест выгружен":
      return type === "sender" ? "#b6b6b6" : "#60c760";
    default:
      return "#b6b6b6";
  }
};

export const useManifestsColumns = (
  shift_id: string,
  type?: "sender" | "recipient"
): TableColumnsType<IListManifest> => {
  return useMemo(() => {
    const baseColumns: TableColumnsType<IListManifest> = [
      {
        title: "Номер",
        dataIndex: "number",
        key: "number",
        render: (number: string, record: IListManifest) => (
          <Link to={`/shifts/${shift_id}/${record.id}`}>
            <Typography.Text strong style={{ color: "#2444b5" }}>
              {number}
            </Typography.Text>
          </Link>
        ),
        width: 80,
      },
      {
        title: "Дата",
        dataIndex: "date",
        key: "date",
        width: 80,
        render: (date: number) => {
          if (!date || isNaN(date)) return "-";
          return dayjs(date).format("DD.MM.YYYY");
        },
      },
      {
        title: "Мест",
        dataIndex: "pieces_count",
        key: "pieces_count",
        width: 30,
      },
      {
        title: "Накладных",
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
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (status: string) => (
          <Typography.Text
            style={{ color: getStatusColor(status, type), fontSize: 12 }}
          >
            {status || "Нет статуса"}
          </Typography.Text>
        ),
      },
      {
        title: " ",
        key: "actions",
        width: 120,
        render: (_: any, record: IListManifest) => (
          <ManifestActions
            type={type!}
            status={record.status}
            manifestId={record.id}
          />
        ),
      },
    ];

    // Создаем копию базовых колонок для модификации
    const columns = [...baseColumns];

    // Вставляем колонку получателя на вторую позицию для отправлений
    if (type === "sender") {
      columns.splice(1, 0, {
        title: "Получатель",
        dataIndex: "recipient",
        key: "recipient",
        width: 150,
      });
    }
    // Вставляем колонку отправителя на вторую позицию для поступлений
    else if (type === "recipient") {
      columns.splice(1, 0, {
        title: "Отправитель",
        dataIndex: "sender",
        key: "sender",
        width: 150,
      });
    }
    // По умолчанию вставляем обе колонки на вторую и третью позиции
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
  }, [shift_id, type]);
};
