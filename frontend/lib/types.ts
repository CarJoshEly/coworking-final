// Tipos que reflejan los modelos de Prisma del backend (coworking API)
// y los DTOs de entrada/salida de cada endpoint.

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SpaceType = "SALA" | "ESCRITORIO" | "AUDITORIO";

export interface Space {
  id: number;
  name: string;
  description: string | null;
  location: string;
  capacity: number;
  type: SpaceType;
  imageUrl: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Reservation {
  id: number;
  userId: number;
  spaceId: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  space?: Space;
  user?: Pick<User, "id" | "name" | "email" | "role">;
}

// ---- DTOs de request ----

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface CreateReservationDto {
  spaceId: number;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface UpdateReservationStatusDto {
  status: "CONFIRMED" | "CANCELLED";
}

export interface CreateSpaceDto {
  name: string;
  description?: string;
  location: string;
  capacity: number;
  type: SpaceType;
  imageUrl?: string;
}

// ---- Tipos para funcionalidades nuevas (aún no existen en la API, fase 2) ----

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface Review {
  id: number;
  spaceId: number;
  userId: number;
  user: Pick<User, "id" | "name">;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

// Franja ocupada de un espacio, tal como la devuelve
// GET /spaces/:id/reservations?date=YYYY-MM-DD (sin datos del usuario).
export interface ReservationSlot {
  startTime: string;
  endTime: string;
}

export interface Favorite {
  id: number;
  userId: number;
  spaceId: number;
  space?: Space;
}

export type NotificationType =
  | "RESERVATION_CONFIRMED"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_REMINDER"
  | "REVIEW_REQUEST";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}
