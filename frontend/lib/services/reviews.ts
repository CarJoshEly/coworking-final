import { api } from "../api-client";
import type { Review, CreateReviewDto } from "../types";

export const reviewsService = {
  // Público: se muestra en el detalle del espacio sin necesidad de sesión.
  findAllForSpace(spaceId: number): Promise<Review[]> {
    return api.get<Review[]>(`/spaces/${spaceId}/reviews`, { auth: false });
  },

  create(spaceId: number, dto: CreateReviewDto): Promise<Review> {
    return api.post<Review>(`/spaces/${spaceId}/reviews`, dto);
  },
};
