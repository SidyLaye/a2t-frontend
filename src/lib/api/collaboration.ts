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

export const collaborationApi = {
  listComments: (params: { content_type?: number; model_label?: string; object_id: string; is_internal?: boolean }) =>
    apiClient.get<PaginatedResponse<Comment>>("/api/v1/comments/", { params }).then((r) => r.data),

  createComment: (data: { content_type?: number; model_label?: string; object_id: string; body: string; is_internal?: boolean }) =>
    apiClient.post<Comment>("/api/v1/comments/", data).then((r) => r.data),
};
