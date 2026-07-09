// Datos de ejemplo para funcionalidades que TODAVIA NO EXISTEN en la API
// (favoritos, notificaciones, reseñas). Se usan solo para maquetar la UI.
// Cuando se agreguen los modelos/endpoints correspondientes en Nest+Prisma,
// estos mocks se reemplazan por llamadas reales via lib/services/*.

import type { Notification } from "./types";

// ---- Datos temporales para Space: la API todavía no expone "comodidades"
// ni "precio por hora" (el modelo Prisma solo tiene name/description/
// location/capacity/type/imageUrl). Se derivan de forma DETERMINISTA por
// id para que Explorar sea funcional mientras se agregan esos campos reales
// en el backend (ver nota al final de app/explorar/page.tsx).

export type AmenityKey = "wifi" | "proyector" | "cafe";

export const AMENITY_LABELS: Record<AmenityKey, string> = {
  wifi: "Wifi",
  proyector: "Proyector",
  cafe: "Café",
};

const ALL_AMENITIES: AmenityKey[] = ["wifi", "proyector", "cafe"];

export function getSpaceAmenities(spaceId: number): AmenityKey[] {
  // Subconjunto estable por id (no cambia entre renders ni recargas).
  return ALL_AMENITIES.filter((_, i) => (spaceId + i) % 3 !== 0);
}

export function getSpacePricePerHour(spaceId: number): number {
  // Precio estable derivado del id, en el rango L 80–220/hora.
  return 80 + ((spaceId * 37) % 15) * 10;
}


export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: "RESERVATION_CONFIRMED",
    message: "Sala Ada Lovelace confirmó tu reserva del 10 de agosto.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    type: "RESERVATION_REMINDER",
    message: "Tu reserva en Auditorio Margaret Hamilton empieza en 1 hora.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    type: "RESERVATION_CANCELLED",
    message: "Se canceló tu reserva en Sala Alan Turing del 3 de agosto.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
