export interface Place {
  id: string;
  name: string;
  address: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  accepted: boolean;
  reportsAccepted: number;
  reportsRefused: number;
  lastReportDate: string;
  reportedBy: string;
}

export interface Report {
  id: string;
  placeId: string;
  userId: string;
  accepted: boolean;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  username: string;
  reportsCount: number;
  joinDate: string;
  level: string;
}

export type AuthMethod = 'google' | 'apple' | 'email';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  authMethod: AuthMethod;
  password?: string;
  createdAt: string;
  reportsCount: number;
  level: string;
}

export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'shop'
  | 'hotel'
  | 'gas_station'
  | 'grocery'
  | 'entertainment'
  | 'health'
  | 'transport'
  | 'other';

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar & Lounge',
  shop: 'Shopping',
  hotel: 'Hôtel',
  gas_station: 'Station-service',
  grocery: 'Épicerie',
  entertainment: 'Loisirs',
  health: 'Santé',
  transport: 'Transport',
  other: 'Autre',
};
