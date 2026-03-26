export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface PropertyImage {
  id: number;
  imageUrl: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  pricePerNight: number;
  propertyType: string;
  ownerId: number;
  ownerName: string;
  categoryId?: number;
  categoryName?: string;
  rating: number;
  ratingCount: number;
  isAvailable: boolean;
  images: PropertyImage[];
  features: string[];
}

export interface CreateProperty {
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  pricePerNight: number;
  propertyType: string;
  categoryId?: number;
  features: string[];
}

export interface UpdateProperty {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  pricePerNight?: number;
  propertyType?: string;
  categoryId?: number;
  isAvailable?: boolean;
  features?: string[];
}

export interface PropertySearch {
  city?: string;
  country?: string;
  propertyType?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  sortBy?: string;
  sortDescending?: boolean;
}

export interface Reservation {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyCity: string;
  userId: number;
  userName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export interface CreateReservation {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  propertyId?: number;
  propertyTitle?: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface SendMessage {
  receiverId: number;
  propertyId?: number;
  content: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  propertyCount: number;
}
