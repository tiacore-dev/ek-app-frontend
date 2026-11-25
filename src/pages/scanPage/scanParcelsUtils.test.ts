import type { IListParcels } from "../../types/shifts";
import { resolveManifestScan, restoreManifestScans } from "./scanParcelsUtils";

const parcel: IListParcels = {
  id: "parcel-a",
  number: "OLD%REF",
  count: 3,
  barcodes: ["000005123456", "OLD%REF%1", "ABC-128"],
  customer: "",
  sendCity: "",
  recCity: "",
  weight: 0,
  volume: 0,
};

it.each<[string, number]>([
  ["000005123456", 1],
  ["OLD%REF%1", 2],
  ["OLD%REF%01", 1],
  ["OLD%REF%03", 3],
])("resolves %s to place %i", (barcode, place) => {
  expect(resolveManifestScan(` ${barcode}\r\n`, [parcel])).toEqual({
    parcel,
    place,
    barcode,
  });
});

it("reads a one-place parcel number from a response without barcodes", () => {
  const singleParcel = { ...parcel, count: 1, barcodes: undefined };
  expect(resolveManifestScan(singleParcel.number, [singleParcel])).toEqual({
    parcel: singleParcel,
    place: 1,
    barcode: singleParcel.number,
  });
});

it.each([
  "5123456",
  "OTHER%1",
  "OLD%REF",
  "OLD%REF%0",
  "OLD%REF%4",
  "OLD%REF%2x",
])("rejects a code without a valid place: %s", (barcode) => {
  expect(() => resolveManifestScan(barcode, [parcel])).toThrow(
    "Код не соответствует месту из манифеста"
  );
});

it("rejects duplicated barcodes within a parcel and across the manifest", () => {
  const barcode = "ABC-128";
  const repeated = { ...parcel, barcodes: [barcode, barcode] };
  const other = { ...parcel, id: "parcel-b", number: "SECOND" };

  expect(() => resolveManifestScan(barcode, [repeated])).toThrow(
    "нескольким местам"
  );
  expect(() => resolveManifestScan(barcode, [parcel, other])).toThrow(
    "нескольким местам"
  );
});

it("keeps valid draft places after the manifest changes", () => {
  const date = "2026-11-25T10:00:00.000Z";
  const validScan = {
    parcelId: parcel.id,
    place: 1,
    barcode: "000005123456",
    date,
  };
  const legacyScan = { place: 2, date };

  expect(
    restoreManifestScans(
      {
        [parcel.id]: [validScan, { ...validScan, place: 3 }],
        [parcel.number]: [legacyScan, { place: 4, date }],
        REMOVED: [{ place: 1, date }],
      },
      [parcel]
    )
  ).toEqual({
    [parcel.id]: [validScan, { ...legacyScan, parcelId: parcel.id }],
  });
});
