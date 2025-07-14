/**
 * Утилиты для работы с датами в локальном часовом поясе
 */

/**
 * Получает текущее время в локальном часовом поясе в формате ISO с информацией о часовом поясе
 */
export const getCurrentLocalDateTime = (): string => {
  const now = new Date();

  // Получаем смещение часового пояса в минутах
  const timezoneOffset = now.getTimezoneOffset();

  // Создаем локальное время с учетом смещ��ния
  const localTime = new Date(now.getTime() - timezoneOffset * 60000);

  // Получаем название часового пояса
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Возвращаем в формате ISO с информацией о часовом поясе
  return `${localTime
    .toISOString()
    .slice(0, -1)}${getTimezoneString()}|${timezoneName}`;
};

/**
 * Получает строку смещения часового пояса в формате +03:00 или -05:00
 */
const getTimezoneString = (): string => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? "+" : "-";

  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Получает локальное время в формате, понятном для сервера
 * Возвращает время в формате: 2024-01-15T14:30:45.123+03:00
 */
export const getLocalDateTimeForServer = (): string => {
  const now = new Date();

  // Форматируем в локальном часовом поясе
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

  // Получаем смещение часового пояса
  const timezoneOffset = getTimezoneString();

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezoneOffset}`;
};

/**
 * Преобразует timestamp в локальное время для сервера
 */
export const timestampToLocalDateTimeForServer = (
  timestamp: number
): string => {
  const date = new Date(timestamp);

  // Форматируем в локальном часовом поясе
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  // Получаем смещение часового пояса
  const timezoneOffset = getTimezoneString();

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezoneOffset}`;
};

/**
 * Преобразует дату в локальный формат для отображения
 */
export const formatLocalDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Получает информацию о текущем часовом поясе
 */
export const getTimezoneInfo = () => {
  const now = new Date();
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = getTimezoneString();

  return {
    name: timezoneName,
    offset: timezoneOffset,
    offsetMinutes: now.getTimezoneOffset(),
  };
};
