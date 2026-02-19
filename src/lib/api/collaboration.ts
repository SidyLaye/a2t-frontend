import apiClient from "./client";
import { PaginatedResponse } from "@/types/api";

export interface Comment {
  id: string;
  body: string;
  author: {
    id: string;
    email: string;
    full_name: string;
  };
  created_at: string;
  is_internal: boolean;
}

export interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const collaborationApi = {
  listComments: (params: { content_type?: number; model_label?: string; object_id: string; is_internal?: boolean }) =>
    apiClient.get<PaginatedResponse<Comment>>("/api/v1/comments/", { params }).then((r) => r.data),

  createComment: (data: { content_type?: number; model_label?: string; object_id: string; body: string; is_internal?: boolean }) =>
    apiClient.post<Comment>("/api/v1/comments/", data).then((r) => r.data),

  listNotifications: () =>
    apiClient.get<PaginatedResponse<Notification>>("/api/v1/notifications/").then((r) => r.data),

  markRead: (id: string) =>
    apiClient.post(`/api/v1/notifications/${id}/read/`, {}),

  markAllRead: () =>
    apiClient.post("/api/v1/notifications/mark-all-read/", {}),
};
