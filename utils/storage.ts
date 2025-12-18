
import { InventoryState } from '../types';

const STORAGE_KEY = 'waxpro_manager_data';

export const saveState = (state: InventoryState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): InventoryState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse storage", e);
    }
  }
  return {
    materials: [],
    finishedProducts: []
  };
};
