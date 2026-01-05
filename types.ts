
export type View = 'HOME' | 'CALCULATOR' | 'PRODUCTION_COST' | 'FINISHED_PRODUCTS' | 'SETTINGS' | 'PRODUCT_STATS' | 'WAREHOUSE_REPORT' | 'RECOVERY';

export type TransactionType = 'SALE' | 'RESTOCK' | 'RETURN';

export type MaterialType = 'WAX' | 'FRAGRANCE' | 'WICK' | 'CONTAINER' | 'PACKAGING' | 'DYE';

export type Language = 'it' | 'en' | 'fr' | 'de' | 'es' | 'ar' | 'zh';
export type Currency = 'EUR' | 'USD';

export interface UserProfile {
  id: string;
  email: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  timestamp: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  type: MaterialType;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface FinishedProduct {
  id: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  costPerUnit: number;
  sellingPrice: number;
  containerSize: number;
  fragrancePercentage: number;
  createdAt: number;
  history: Transaction[];
}

export interface InventoryState {
  finishedProducts: FinishedProduct[];
  rawMaterials: RawMaterial[];
  settings?: {
    language: Language;
    currency: Currency;
  };
  lastSynced?: number;
}
