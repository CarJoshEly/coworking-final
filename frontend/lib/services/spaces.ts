import { api } from "../api-client";
import type { Space, CreateSpaceDto, ReservationSlot } from "../types";

export const spacesService = {
  findAll(): Promise<Space[]> {
    return api.get<Space[]>("/spaces");
  },

  findOne(id: number): Promise<Space> {
    return api.get<Space>(`/spaces/${id}`);
  },

  // Público: franjas ya ocupadas (PENDING/CONFIRMED) de un espacio en una
  // fecha dada. Se usa para deshabilitar horarios en el selector de reserva.
  getReservationsForDate(id: number, date: string): Promise<ReservationSlot[]> {
    return api.get<ReservationSlot[]>(`/spaces/${id}/reservations?date=${date}`, {
      auth: false,
    });
  },

  create(dto: CreateSpaceDto): Promise<Space> {
    return api.post<Space>("/spaces", dto);
  },

  update(id: number, dto: Partial<CreateSpaceDto>): Promise<Space> {
    return api.patch<Space>(`/spaces/${id}`, dto);
  },

  remove(id: number): Promise<Space> {
    return api.delete<Space>(`/spaces/${id}`);
  },
};
