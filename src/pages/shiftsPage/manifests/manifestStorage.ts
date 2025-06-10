interface ScannedItem {
  place: number;
  date: string;
}

type ScannedParcels = Record<string, ScannedItem[]>;
type ManifestStorageData = Record<string, ScannedParcels>;

class ManifestStorage {
  private static STORAGE_KEY = "manifest_scans_v3";
  private static TEMP_STORAGE_PREFIX = "manifest_temp_";
  private static DEBOUNCE_TIME = 500;
  private static pendingSaves: Record<string, NodeJS.Timeout> = {};

  /**
   * Сохраняет отсканированные данные с дебаунсом
   */
  static saveScannedItems(manifestId: string, items: ScannedParcels): void {
    try {
      // Сначала сохраняем в sessionStorage для мгновенного доступа
      this.saveToSessionStorage(manifestId, items);

      // Затем ставим в очередь сохранение в localStorage с дебаунсом
      this.debouncedSaveToLocalStorage(manifestId, items);
    } catch (error) {
      console.error("Save operation failed:", error);
      throw new Error("Не удалось сохранить данные сканирования");
    }
  }

  /**
   * Получает сохраненные данные для манифеста
   */
  static getScannedItems(manifestId: string): ScannedParcels {
    try {
      // Сначала проверяем sessionStorage
      const sessionData = this.getFromSessionStorage(manifestId);
      if (sessionData) {
        return sessionData;
      }

      // Если в sessionStorage нет, проверяем localStorage
      const localData = this.getFromLocalStorage(manifestId);
      if (localData) {
        // Обновляем sessionStorage данными из localStorage
        this.saveToSessionStorage(manifestId, localData);
        return localData;
      }

      return {};
    } catch (error) {
      console.error("Load operation failed:", error);
      return {};
    }
  }

  /**
   * Очищает данные для конкретного манифеста
   */
  static clearScannedItems(manifestId: string): void {
    try {
      // Очищаем оба хранилища
      sessionStorage.removeItem(this.getTempStorageKey(manifestId));

      const allData = this.getAllFromLocalStorage();
      delete allData[manifestId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
      console.error("Clear operation failed:", error);
    }
  }

  /**
   * Синхронизирует данные между хранилищами
   */
  static syncStorages(manifestId: string): void {
    try {
      const sessionData = this.getFromSessionStorage(manifestId);
      if (sessionData) {
        this.saveToLocalStorage(manifestId, sessionData);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }

  // ==================== Вспомогательные методы ====================

  private static debouncedSaveToLocalStorage(
    manifestId: string,
    items: ScannedParcels
  ): void {
    // Отменяем предыдущий отложенный вызов для этого манифеста
    if (this.pendingSaves[manifestId]) {
      clearTimeout(this.pendingSaves[manifestId]);
    }

    // Устанавливаем новый таймер
    this.pendingSaves[manifestId] = setTimeout(() => {
      try {
        this.saveToLocalStorage(manifestId, items);
        delete this.pendingSaves[manifestId];
      } catch (error) {
        console.error("Debounced save failed:", error);
      }
    }, this.DEBOUNCE_TIME);
  }

  private static saveToLocalStorage(
    manifestId: string,
    items: ScannedParcels
  ): void {
    const allData = this.getAllFromLocalStorage();
    allData[manifestId] = items;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
  }

  private static saveToSessionStorage(
    manifestId: string,
    items: ScannedParcels
  ): void {
    sessionStorage.setItem(
      this.getTempStorageKey(manifestId),
      JSON.stringify(items)
    );
  }

  private static getFromLocalStorage(
    manifestId: string
  ): ScannedParcels | null {
    const allData = this.getAllFromLocalStorage();
    return allData[manifestId] || null;
  }

  private static getFromSessionStorage(
    manifestId: string
  ): ScannedParcels | null {
    const data = sessionStorage.getItem(this.getTempStorageKey(manifestId));
    return data ? JSON.parse(data) : null;
  }

  private static getAllFromLocalStorage(): ManifestStorageData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static getTempStorageKey(manifestId: string): string {
    return `${this.TEMP_STORAGE_PREFIX}${manifestId}`;
  }

  /**
   * Очищает старые данные (старше 7 дней)
   */
  static cleanupOldData(daysToKeep = 7): void {
    try {
      const allData = this.getAllFromLocalStorage();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const cleanedData = Object.keys(allData).reduce((acc, manifestId) => {
        const manifestData = allData[manifestId];
        const filteredData = Object.keys(manifestData).reduce(
          (pAcc, parcelNumber) => {
            const items = manifestData[parcelNumber].filter(
              (item) => new Date(item.date) > cutoffDate
            );
            if (items.length > 0) {
              pAcc[parcelNumber] = items;
            }
            return pAcc;
          },
          {} as ScannedParcels
        );

        if (Object.keys(filteredData).length > 0) {
          acc[manifestId] = filteredData;
        }
        return acc;
      }, {} as ManifestStorageData);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedData));
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }
}

// Очищаем старые данные при первой загрузке
ManifestStorage.cleanupOldData();

export default ManifestStorage;
