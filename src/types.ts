export type CleaningType = 'standard' | 'deep' | 'move' | 'airbnb';

export interface CleaningTypeOption {
  id: CleaningType;
  name: string;
  tagline: string;
  description: string;
  multiplier: number;
  perSqFtRate: number;
}

export type RoomType = 'kitchen' | 'bathrooms' | 'bedrooms' | 'living';

export interface TaskSelection {
  id: string;
  name: string;
  description: string;
  baseWeightLevel: number; // impact index
  selected: boolean;
  estimatedMinutesPerUnit: number;
}

export interface PropertyDetails {
  sqFt: number;
  bedroomsCount: number;
  bathroomsCount: number;
  hasPets: boolean;
  lastCleanInterval: 'less-than-1' | '1-3-months' | '3-6-months' | '6-plus';
}

export interface EstimateResult {
  hours: number;
  teamSize: number;
  complexityScore: 'A' | 'B' | 'C';
  complexityScoreNumeric: number;
  priceRangeMin: number;
  priceRangeMax: number;
  discountedMin: number;
  discountedMax: number;
}

export interface ClientContact {
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
}
