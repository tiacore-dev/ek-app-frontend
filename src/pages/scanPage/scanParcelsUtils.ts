export const formatMissingPlaces = (missingPlaces: number[], total: number) => {
  if (missingPlaces.length === 0) return "";

  return `${missingPlaces.join(", ")}`;
};
