export const formatMissingPlaces = (missingPlaces: number[], total: number) => {
  if (missingPlaces.length === 0) return "";

  return `${missingPlaces.join(", ")}`;
};

// Функция для удаления ведущих нулей и нормализации номера
export const normalizeParcelNumber = (scannedNumber: string): string => {
  // Удаляем все ведущие нули
  return scannedNumber.replace(/^0+/, "");
};
