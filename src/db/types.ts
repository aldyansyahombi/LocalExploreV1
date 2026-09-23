export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  preferences: string[];
  createdAt: string;
}

export interface Place {
  id?: number;

  name: string;

  categoryId: number;

  latitude: number;

  longitude: number;

  address: string;

  country?: string;

  countryCode?: string;

  state?: string;

  city?: string;

  description?: string;

  image?: string;

  rating?: number;

  source: "geoapify" | "local";

  sourceId?: string;

  createdAt: string;

  updatedAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  icon: string;
  description?: string;
}

export interface Favorite {
  id?: number;
  userId: number;
  placeId: number;
  createdAt: string;
}

export interface VisitHistory {
  id?: number;
  userId: number;
  placeId: number;
  visitedAt: string;
}