import { api } from "../api-client";
import type { Space, CreateSpaceDto } from "../types";

export const spacesService = {
  findAll(): Promise<Space[]> {
    return api.get<Space[]>("/spaces");
  },

  findOne(id: number): Promise<Space> {
    return api.get<Space>(`/spaces/${id}`);
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
