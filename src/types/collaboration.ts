export interface Comment {
  id: string;
  content_type: string;
  object_id: string;
  author: string | null;
  author_name: string;
  author_email: string;
  body: string;
  is_internal: boolean;
  parent: string | null;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string;
}
