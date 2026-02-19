import apiClient from "./client";
import type { Comment, Notification } from "@/types/collaboration";
import type { PaginatedResponse } from "@/types/api";

export const collaborationApi = {
  // Comments
  listComments: (params?: { content_type?: string; object_id?: string; is_internal?: boolean }) =>
    apiClient.get<PaginatedResponse<Comment>>("/api/v1/comments/", { params }).then((r) => r.data),

  createComment: (data: { content_type: string; object_id: string; body: string; is_internal?: boolean; parent?: string }) =>
    apiClient.post<Comment>("/api/v1/comments/", data).then((r) => r.data),

  updateComment: (id: string, data: { body: string }) =>
    apiClient.patch<Comment>(`/api/v1/comments/${id}/`, data).then((r) => r.data),

  deleteComment: (id: string) =>
    apiClient.delete(`/api/v1/comments/${id}/`),

  // Notifications
  listNotifications: () =>
    apiClient.get<PaginatedResponse<Notification>>("/api/v1/notifications/").then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(`/api/v1/notifications/${id}/read/`),

  markAllRead: () =>
    apiClient.post("/api/v1/notifications/mark-all-read/"),
};
