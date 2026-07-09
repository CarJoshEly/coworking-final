import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export const NOTIFICATION_TYPES = [
  'RESERVATION_CONFIRMED',
  'RESERVATION_CANCELLED',
  'RESERVATION_REMINDER',
  'REVIEW_REQUEST',
] as const;

// DTO usado internamente por otros servicios (ej. ReservationsService) para
// generar notificaciones automáticas. No se expone en ningún endpoint público.
export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsIn(NOTIFICATION_TYPES)
  type: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsInt()
  reservationId?: number;
}
