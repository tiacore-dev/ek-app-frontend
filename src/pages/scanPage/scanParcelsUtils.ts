export const formatMissingPlaces = (missingPlaces: number[], total: number) => {
  if (missingPlaces.length === 0) return "";
  //   if (missingPlaces.length === total) return "все места";

  // Для диапазонов (если места идут подряд)
  //   if (missingPlaces.length > 1) {
  //     const sorted = [...missingPlaces].sort((a, b) => a - b);
  //     let isSequential = true;
  //     for (let i = 1; i < sorted.length; i++) {
  //       if (sorted[i] !== sorted[i - 1] + 1) {
  //         isSequential = false;
  //         break;
  //       }
  //     }
  //     if (isSequential) {
  //       return `места ${sorted[0]}-${sorted[sorted.length - 1]}`;
  //     }
  //   }

  return `${missingPlaces.join(", ")}`;
};
