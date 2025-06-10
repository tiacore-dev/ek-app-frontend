interface ScannedItem {
  place: number;
  date: string;
}

type ScannedParcels = Record<string, ScannedItem[]>;

class ManifestStorage {
  private static STORAGE_KEY = "manifest_scans";

  static saveScannedItems(manifestId: string, items: ScannedParcels): void {
    const allData = this.getAllScans();
    allData[manifestId] = items;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
  }

  static getScannedItems(manifestId: string): ScannedParcels {
    const allData = this.getAllScans();
    return allData[manifestId] || {};
  }

  static clearScannedItems(manifestId: string): void {
    const allData = this.getAllScans();
    delete allData[manifestId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
  }

  static cleanupOldData(daysToKeep = 7): void {
    const allData = this.getAllScans();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const cleanedData = Object.keys(allData).reduce((acc, manifestId) => {
      const manifestData = allData[manifestId];
      const filteredData = Object.keys(manifestData).reduce(
        (parcelAcc, parcelNumber) => {
          const items = manifestData[parcelNumber].filter((item) => {
            return new Date(item.date) > cutoffDate;
          });

          if (items.length > 0) {
            parcelAcc[parcelNumber] = items;
          }
          return parcelAcc;
        },
        {} as ScannedParcels
      );

      if (Object.keys(filteredData).length > 0) {
        acc[manifestId] = filteredData;
      }
      return acc;
    }, {} as Record<string, ScannedParcels>);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedData));
  }

  private static getAllScans(): Record<string, ScannedParcels> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }
}

// Очищаем старые данные при инициализации
ManifestStorage.cleanupOldData();

export default ManifestStorage;
