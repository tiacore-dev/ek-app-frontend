import { IListManifest } from "../../../../types/shifts";

export const groupManifestsByCity = (manifests: IListManifest[]) => {
  const cities = new Set<string>();

  manifests.forEach((manifest) => {
    if (manifest.sender) cities.add(manifest.sender);
    if (manifest.recipient) cities.add(manifest.recipient);
  });

  return Array.from(cities).map((city) => ({
    city,
    asSender: manifests.filter((m) => m.sender === city),
    asRecipient: manifests.filter((m) => m.recipient === city),
  }));
};
