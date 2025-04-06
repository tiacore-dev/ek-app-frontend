import React from "react";
import { Typography, Divider, List } from "antd";
import { IShiftResponse, IListShiftResponse } from "../../../../types/shifts";
import dayjs from "dayjs";
import { CaretRightOutlined } from "@ant-design/icons";

const isValidDate = (timestamp?: number): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

const formatDateSafe = (timestamp?: number): string => {
  return isValidDate(timestamp) ? dayjs(timestamp).format("DD.MM.YYYY") : "—";
};

interface ShiftDetailsProps {
  shift: IShiftResponse | IListShiftResponse;
  showManifests?: boolean;
  children?: React.ReactNode;
  showFullDetails?: boolean;
  detailsTitle?: string;
  onDetailsTitleClick?: () => void;
}

export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  showManifests = true,
  children,
  showFullDetails = true,
  detailsTitle = "",
  onDetailsTitleClick,
}) => {
  const isFullShift = "payment" in shift;
  const hasExtraPayments =
    isFullShift && (shift as IShiftResponse).extra_payments?.length > 0;
  const hasManifests =
    isFullShift && (shift as IShiftResponse).manifests?.length > 0;

  const dateRangeText = `${formatDateSafe(shift.date_start)}${
    shift.date_finish && isValidDate(shift.date_finish)
      ? ` - ${formatDateSafe(shift.date_finish)}`
      : ""
  }`;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ cursor: onDetailsTitleClick ? "pointer" : "default" }}
        onClick={onDetailsTitleClick}
      >
        <Divider
          orientation="left"
          style={{
            marginTop: "-8px",
            marginLeft: "-24px",
            pointerEvents: "none",
          }}
        >
          {onDetailsTitleClick && (
            <CaretRightOutlined
              style={{
                // marginRight: 8,
                transform: showFullDetails ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                color: "#2444b5",
              }}
            />
          )}
          {detailsTitle}
        </Divider>
      </div>

      {showFullDetails && (
        <>
          <Typography.Paragraph>
            <strong>Даты:</strong> {dateRangeText}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Авто:</strong> {shift.auto || "—"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Маршрут:</strong> {shift.name || "—"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Карта:</strong> {shift.card || "—"}
          </Typography.Paragraph>

          {isFullShift && (
            <>
              <Typography.Paragraph>
                <strong>Основная оплата:</strong> {shift.payment || "—"} руб.
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>Комментарий:</strong> {shift.comment || "—"}
              </Typography.Paragraph>

              {hasExtraPayments && (
                <>
                  <Divider orientation="left">Дополнительные платежи</Divider>
                  <List
                    dataSource={(shift as IShiftResponse).extra_payments}
                    renderItem={(payment) => (
                      <List.Item>
                        <Typography.Text strong>
                          {payment.description}
                        </Typography.Text>{" "}
                        {payment.summ} руб.
                      </List.Item>
                    )}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      {showManifests && (
        <>
          <Divider
            orientation="right"
            style={
              {
                // marginTop: "-12px",
              }
            }
          >
            {hasManifests ? "Манифесты" : "Манифесты (отсутствуют)"}
          </Divider>
          {hasManifests ? (
            children
          ) : (
            <Typography.Paragraph
              style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.45)" }}
            >
              Нет манифестов для отображения
            </Typography.Paragraph>
          )}
        </>
      )}
    </div>
  );
};
