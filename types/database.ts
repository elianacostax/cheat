export type Profile = {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  name?: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string | null;
  media_url?: string | null;
  media_type: 'text' | 'image' | 'audio' | 'gif';
  created_at: string;
  sender?: Profile;
};
