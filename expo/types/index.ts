export interface Profile {
  id: string;
  username: string;
  auth_method: 'email' | 'apple' | 'google';
  reports_count: number;
  level: string;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  authMethod: 'email' | 'apple' | 'google';
  reportsCount: number;
  joinDate: string;
  level: string;
}

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
  reportedByUserId?: string;
  phone?: string;
  website?: string;
}

export interface DbPlace {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  accepted: boolean;
  reports_accepted: number;
  reports_refused: number;
  last_report_date: string;
  reported_by: string;
  reported_by_user_id: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  placeId: string;
  userId: string;
  accepted: boolean;
  comment: string;
  date: string;
}

export interface DbReport {
  id: string;
  place_id: string;
  user_id: string;
  accepted: boolean;
  comment: string;
  created_at: string;
}

export interface DbFavourite {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
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

export function dbPlaceToPlace(db: DbPlace): Place {
  return {
    id: db.id,
    name: db.name,
    address: db.address,
    category: db.category as PlaceCategory,
    latitude: db.latitude,
    longitude: db.longitude,
    accepted: db.accepted,
    reportsAccepted: db.reports_accepted,
    reportsRefused: db.reports_refused,
    lastReportDate: db.last_report_date,
    reportedBy: db.reported_by,
    reportedByUserId: db.reported_by_user_id ?? undefined,
    phone: db.phone ?? undefined,
    website: db.website ?? undefined,
  };
}

export function profileToUser(profile: Profile, email: string): User {
  return {
    id: profile.id,
    email,
    username: profile.username,
    authMethod: profile.auth_method,
    reportsCount: profile.reports_count,
    joinDate: profile.join_date,
    level: profile.level,
  };
}
