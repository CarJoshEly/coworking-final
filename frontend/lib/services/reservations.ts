import { api } from "../api-client";
import type {
  Reservation,
  CreateReservationDto,
  UpdateReservationStatusDto,
} from "../types";

export const reservationsService = {
  create(dto: CreateReservationDto): Promise<Reservation> {
    return api.post<Reservation>("/reservations", dto);
  },

  findMine(): Promise<Reservation[]> {
    return api.get<Reservation[]>("/reservations/me");
  },

  findAll(): Promise<Reservation[]> {
    return api.get<Reservation[]>("/reservations");
  },

  findOne(id: number): Promise<Reservation> {
    return api.get<Reservation>(`/reservations/${id}`);
  },

  updateStatus(id: number, dto: UpdateReservationStatusDto): Promise<Reservation> {
    return api.patch<Reservation>(`/reservations/${id}/status`, dto);
  },

  remove(id: number): Promise<Reservation> {
    return api.delete<Reservation>(`/reservations/${id}`);
  },
};
