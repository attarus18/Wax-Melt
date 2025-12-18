
export type View = 'HOME' | 'CALCULATOR' | 'PRODUCTION_COST' | 'RAW_MATERIALS' | 'FINISHED_PRODUCTS' | 'SETTINGS';

export type MaterialType = 'WAX' | 'FRAGRANCE' | 'WICK' | 'CONTAINER' | 'PACKAGING' | 'DYE';

export interface RawMaterial {
  id: string;
  name: string;
  type: MaterialType;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface FinishedProduct {
  id: string;
  name: string;
  quantity: number;
  costPerUnit: number;
  containerSize: number;
  fragrancePercentage: number;
  createdAt: number;
}

export interface InventoryState {
  materials: RawMaterial[];
  finishedProducts: FinishedProduct[];
}
