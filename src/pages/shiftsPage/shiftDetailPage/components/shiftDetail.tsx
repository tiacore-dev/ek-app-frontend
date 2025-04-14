import React, { useEffect, useState } from "react";
import {
  Typography,
  Divider,
  List,
  Spin,
  Tag,
  Button,
  message,
  Card,
} from "antd";
import {
  IShiftResponse,
  IListShiftResponse,
  IGetAutoStatusResponse,
} from "../../../../types/shifts";
import {
  fetchAutoStatus,
  postShiftStart,
  postShiftEnd,
} from "../../../../api/shiftsApi";
import dayjs from "dayjs";
import { CaretRightOutlined, DoubleRightOutlined } from "@ant-design/icons";

const isValidDate = (timestamp?: number): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

const formatDateSafe = (timestamp?: number): string => {
  return isValidDate(timestamp) ? dayjs(timestamp).format("DD.MM.YYYY") : "—";
};

const formatAutoStatus = (status: string | undefined): string => {
  switch (status) {
    case "in_use":
      return "В использовании";
    case "available":
      return "Доступен";
    case "not_available":
      return "Не доступен";
    default:
      return "Неизвестно";
  }
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case "in_use":
      return "orange";
    case "available":
      return "green";
    case "not_available":
      return "grey";
    default:
      return "default";
  }
};

interface ShiftDetailsProps {
  shift: IShiftResponse | IListShiftResponse;
  showManifests?: boolean;
  children?: React.ReactNode;
  showFullDetails?: boolean;
  detailsTitle?: string;
  onDetailsTitleClick?: () => void;
  shiftId: string;
}

export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  showManifests = true,
  children,
  showFullDetails = true,
  detailsTitle = "",
  onDetailsTitleClick,
  shiftId = "",
}) => {
  const [autoStatus, setAutoStatus] = useState<IGetAutoStatusResponse | null>(
    null
  );
  const [loadingAutoStatus, setLoadingAutoStatus] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const loadAutoStatus = async () => {
      if (!("auto_id" in shift) || !shift.auto_id) return;

      try {
        setLoadingAutoStatus(true);
        const status = await fetchAutoStatus(shift.auto_id);
        setAutoStatus(status);
      } catch (error) {
        console.error("Failed to fetch auto status:", error);
      } finally {
        setLoadingAutoStatus(false);
      }
    };

    loadAutoStatus();
  }, [shift]);

  const handleStartShift = async () => {
    try {
      setProcessingAction(true);
      await postShiftStart(shiftId);
      message.success("Смена успешно начата");
      const status = await fetchAutoStatus(shift.auto_id);
      setAutoStatus(status);
    } catch (error) {
      message.error("Ошибка при начале смены");
      console.error("Failed to start shift:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEndShift = async () => {
    try {
      setProcessingAction(true);
      await postShiftEnd(shiftId);
      message.success("Смена успешно завершена");
      const status = await fetchAutoStatus(shift.auto_id);
      setAutoStatus(status);
    } catch (error) {
      message.error("Ошибка при завершении смены");
      console.error("Failed to end shift:", error);
    } finally {
      setProcessingAction(false);
    }
  };

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
          <Typography.Paragraph style={{ marginBottom: 4 }}>
            <strong>Даты:</strong> {dateRangeText}
          </Typography.Paragraph>

          {loadingAutoStatus ? (
            <Spin size="small" />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Typography.Paragraph
                  style={{ marginBottom: 0, marginRight: 8 }}
                >
                  <strong>Авто:</strong> {shift.auto || "—"}
                </Typography.Paragraph>
                {autoStatus && (
                  <Tag color={getStatusColor(autoStatus.auto_status)}>
                    {formatAutoStatus(autoStatus.auto_status)}
                  </Tag>
                )}
              </div>
              {autoStatus && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 4,
                    gap: 8, // Добавляем отступ между элементами
                  }}
                >
                  {(shift as IShiftResponse).get_auto && (
                    <>
                      <Card size="small" style={{ marginBottom: 0 }}>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          <strong>Пробег:</strong>{" "}
                          {(shift as IShiftResponse).get_auto?.auto_odo || "—"}{" "}
                          км
                        </Typography.Paragraph>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          <strong>Топливо:</strong>{" "}
                          {(shift as IShiftResponse).get_auto?.auto_fuel?.join(
                            ", "
                          ) || "—"}
                        </Typography.Paragraph>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          <strong>Дата выдачи:</strong>{" "}
                          {formatDateSafe(
                            (shift as IShiftResponse).get_auto?.auto_status_date
                          )}
                        </Typography.Paragraph>
                      </Card>

                      {/* Добавляем иконку стрелки между карточками */}
                      {(shift as IShiftResponse).return_auto && (
                        <DoubleRightOutlined
                          style={{
                            fontSize: 16,
                            color: "#2444b5",
                            margin: "0px",
                          }}
                        />
                      )}
                    </>
                  )}

                  {(shift as IShiftResponse).return_auto && (
                    <Card size="small" style={{ marginBottom: 0 }}>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        <strong>Пробег:</strong>{" "}
                        {(shift as IShiftResponse).return_auto?.auto_odo || "—"}{" "}
                        км
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        <strong>Топливо:</strong>{" "}
                        {(shift as IShiftResponse).return_auto?.auto_fuel?.join(
                          ", "
                        ) || "—"}
                      </Typography.Paragraph>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        <strong>Дата возврата:</strong>{" "}
                        {formatDateSafe(
                          (shift as IShiftResponse).return_auto
                            ?.auto_status_date
                        )}
                      </Typography.Paragraph>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          <Typography.Paragraph style={{ marginBottom: 4 }}>
            <strong>Маршрут:</strong> {shift.name || "—"}
          </Typography.Paragraph>
          {shift.card && (
            <Typography.Paragraph style={{ marginBottom: 4 }}>
              <strong>Карта:</strong> {shift.card || "—"}
            </Typography.Paragraph>
          )}
          {isFullShift && (
            <>
              <Typography.Paragraph style={{ marginBottom: 4 }}>
                <strong>Основная оплата:</strong> {shift.payment || "—"} руб.
              </Typography.Paragraph>

              {shift.comment && (
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  <strong>Комментарий:</strong> {shift.comment}
                </Typography.Paragraph>
              )}

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
          {!loadingAutoStatus && autoStatus && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              {/* Кнопка "Начать смену" - только когда авто доступно и смена не начата */}
              {autoStatus.auto_status === "available" &&
                shift.get_auto === null &&
                shift.return_auto === null && (
                  <>
                    <Button
                      type="primary"
                      onClick={handleStartShift}
                      loading={processingAction}
                      style={{ width: 300 }}
                    >
                      Получить авто и начать смену
                    </Button>
                  </>
                )}

              {/* Кнопка "Закончить смену" - только когда смена начата, но не закончена */}
              {autoStatus.auto_status === "in_use" &&
                shift.get_auto !== null &&
                shift.return_auto === null && (
                  <>
                    {console.log(
                      "Rendering End Shift button. Shift data:",
                      shift
                    )}
                    <Button
                      type="primary"
                      onClick={handleEndShift}
                      loading={processingAction}
                      style={{ width: 300 }}
                    >
                      Сдать авто и закончить смену
                    </Button>
                  </>
                )}

              {/* Если оба поля заполнены - кнопки не показываем */}
              {shift.get_auto !== null && shift.return_auto !== null && (
                <Typography.Text type="secondary">
                  Смена завершена
                </Typography.Text>
              )}
            </div>
          )}
        </>
      )}

      {showManifests && (
        <>
          <Divider orientation="right">
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
