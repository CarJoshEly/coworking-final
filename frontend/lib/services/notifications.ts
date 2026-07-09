import { api } from "../api-client";
import type { Notification } from "../types";

export const notificationsService = {
  findMine(): Promise<Notification[]> {
    return api.get<Notification[]>("/notifications");
  },

  markRead(id: number): Promise<Notification> {
    return api.patch<Notification>(`/notifications/${id}/read`);
  },

  markAllRead(): Promise<Notification[]> {
    return api.patch<Notification[]>("/notifications/read-all");
  },
};
