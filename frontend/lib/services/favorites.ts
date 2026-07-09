import { api } from "../api-client";
import type { Favorite } from "../types";

export const favoritesService = {
  findMine(): Promise<Favorite[]> {
    return api.get<Favorite[]>("/favorites");
  },

  add(spaceId: number): Promise<Favorite> {
    return api.post<Favorite>("/favorites", { spaceId });
  },

  remove(spaceId: number): Promise<Favorite> {
    return api.delete<Favorite>(`/favorites/${spaceId}`);
  },
};
