const key = (userId: string, conversationId: string) =>
  `charliana:read:${userId}:${conversationId}`;

export function getLastRead(userId: string, conversationId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key(userId, conversationId));
}

export function markRead(userId: string, conversationId: string, at: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key(userId, conversationId), at);
}
