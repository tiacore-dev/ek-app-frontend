import type { IListParcels } from "../../types/shifts";
import type { ScannedParcels } from "../shiftsPage/manifests/manifestStorage";

const AMBIGUOUS_CODE =
  "Штрихкод соответствует нескольким местам. Проверьте манифест в 1С.";

export function resolveManifestScan(value: string, parcels: IListParcels[]) {
  const barcode = value.trim();
  if (!barcode || barcode.length > 100) {
    throw new Error("Введите штрихкод длиной до 100 символов.");
  }

  let matches = parcels.flatMap((parcel) => {
    const codes = parcel.barcodes ?? [];
    const index = codes.indexOf(barcode);
    if (index === -1) return [];
    if (codes.lastIndexOf(barcode) !== index) throw new Error(AMBIGUOUS_CODE);
    return [{ parcel, place: index + 1 }];
  });

  if (matches.length === 0) {
    const separator = barcode.lastIndexOf("%");
    const number = barcode.slice(0, separator);
    const suffix = barcode.slice(separator + 1);
    const place =
      separator > 0 && /^[0-9]{1,9}$/.test(suffix) ? Number(suffix) : 0;

    matches = parcels.flatMap((parcel) => {
      if (parcel.count === 1 && parcel.number === barcode) {
        return [{ parcel, place: 1 }];
      }
      if (place > 0 && place <= parcel.count && parcel.number === number) {
        return [{ parcel, place }];
      }
      return [];
    });
  }

  const [match, conflictingMatch] = matches;
  if (conflictingMatch) throw new Error(AMBIGUOUS_CODE);
  if (!match) throw new Error("Код не соответствует месту из манифеста.");
  if (match.place > match.parcel.count) {
    throw new Error(
      "Штрихкод относится к месту за пределами указанного количества."
    );
  }
  return { ...match, barcode };
}

export function restoreManifestScans(
  savedItems: ScannedParcels,
  parcels: IListParcels[]
): ScannedParcels {
  const parcelsById = new Map(parcels.map((parcel) => [parcel.id, parcel]));
  const parcelsByNumber = new Map<string, IListParcels | undefined>();
  for (const parcel of parcels) {
    // Старый черновик хранит только номер. Переносим его при однозначном совпадении.
    parcelsByNumber.set(
      parcel.number,
      parcelsByNumber.has(parcel.number) ? undefined : parcel
    );
  }

  const restoredItems: ScannedParcels = {};
  for (const [key, items] of Object.entries(savedItems)) {
    for (const item of items) {
      const parcel = item.parcelId
        ? parcelsById.get(item.parcelId)
        : parcelsByNumber.get(key);
      if (
        !parcel ||
        !Number.isInteger(item.place) ||
        item.place < 1 ||
        item.place > parcel.count
      ) {
        continue;
      }

      if (item.barcode !== undefined) {
        try {
          if (resolveManifestScan(item.barcode, [parcel]).place !== item.place) {
            continue;
          }
        } catch {
          continue;
        }
      }

      const parcelItems = restoredItems[parcel.id] ?? [];
      if (parcelItems.some(({ place }) => place === item.place)) continue;

      parcelItems.push({ ...item, parcelId: parcel.id });
      restoredItems[parcel.id] = parcelItems;
    }
  }
  return restoredItems;
}

export const formatMissingPlaces = (missingPlaces: number[], total: number) => {
  if (missingPlaces.length === 0) return "";

  return `${missingPlaces.join(", ")}`;
};
