interface ScannedItem {
  place: number;
  date: string;
}

type ScannedParcels = Record<string, ScannedItem[]>;

class ManifestStorage {
  private static STORAGE_KEY = "manifest_scans";
  private static saveDebounceTimer: number | null = null;

  static saveScannedItems(manifestId: string, items: ScannedParcels): void {
    try {
      // Отменяем предыдущий отложенный вызов, если он есть
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
      }

      // Устанавливаем новый отложенный вызов
      this.saveDebounceTimer = window.setTimeout(() => {
        try {
          const allData = this.getAllScans();
          allData[manifestId] = items;

          // Проверка размера данных перед сохранением
          const dataStr = JSON.stringify(allData);
          if (dataStr.length > 4 * 1024 * 1024) {
            // 4MB
            this.cleanupOldData(1); // Очищаем данные старше 1 дня
          }

          localStorage.setItem(this.STORAGE_KEY, dataStr);
        } catch (error) {
          console.error("Ошибка сохранения в localStorage:", error);
        }
      }, 300); // Задержка 300мс
    } catch (error) {
      console.error("Ошибка при отложенном сохранении:", error);
    }
  }

  static getScannedItems(manifestId: string): ScannedParcels {
    try {
      const allData = this.getAllScans();
      return allData[manifestId] || {};
    } catch (error) {
      console.error("Ошибка чтения из localStorage:", error);
      return {};
    }
  }

  static clearScannedItems(manifestId: string): void {
    try {
      const allData = this.getAllScans();
      delete allData[manifestId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
      console.error("Ошибка очистки localStorage:", error);
    }
  }

  static cleanupOldData(daysToKeep = 7): void {
    try {
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
    } catch (error) {
      console.error("Ошибка очистки старых данных:", error);
    }
  }

  private static getAllScans(): Record<string, ScannedParcels> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Ошибка доступа к localStorage:", error);
      return {};
    }
  }
}

// Очищаем старые данные при инициализации
ManifestStorage.cleanupOldData();

export default ManifestStorage;
