import { IListManifest } from "../../../../types/shifts";

interface GroupedManifest {
  city: string;
  asSender: IListManifest[];
  asRecipient: IListManifest[];
}

export const groupManifestsByCity = (
  manifests: IListManifest[]
): GroupedManifest[] => {
  // Используем Map для более эффективного хранения и доступа
  const cityMap = new Map<
    string,
    { asSender: IListManifest[]; asRecipient: IListManifest[] }
  >();

  manifests.forEach((manifest) => {
    // Обрабатываем отправителя
    if (manifest.sender) {
      if (!cityMap.has(manifest.sender)) {
        cityMap.set(manifest.sender, { asSender: [], asRecipient: [] });
      }
      cityMap.get(manifest.sender)!.asSender.push(manifest);
    }

    // Обрабатываем получателя
    if (manifest.recipient) {
      if (!cityMap.has(manifest.recipient)) {
        cityMap.set(manifest.recipient, { asSender: [], asRecipient: [] });
      }
      cityMap.get(manifest.recipient)!.asRecipient.push(manifest);
    }
  });

  // Преобразуем Map в массив объектов
  return Array.from(cityMap.entries()).map(([city, groups]) => ({
    city,
    asSender: groups.asSender,
    asRecipient: groups.asRecipient,
  }));
};
