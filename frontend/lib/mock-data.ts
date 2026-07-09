// Datos de ejemplo para funcionalidades que TODAVIA NO EXISTEN en la API
// (favoritos, notificaciones, reseñas). Se usan solo para maquetar la UI.
// Cuando se agreguen los modelos/endpoints correspondientes en Nest+Prisma,
// estos mocks se reemplazan por llamadas reales via lib/services/*.

import type { Notification } from "./types";

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
