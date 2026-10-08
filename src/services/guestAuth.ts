const GUEST_KEY = 'ibadan_life_guest_session_v1';

export interface GuestSession {
  guest_id: string;
  created_at: string;
}

export function getOrCreateGuestSession(): GuestSession {
  try {
    const existing = localStorage.getItem(GUEST_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed && parsed.guest_id) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage error reading guest session:', err);
  }

  const randomSegment = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
  const newGuestId = `guest_ibadan_${Date.now()}_${randomSegment}`;

  const session: GuestSession = {
    guest_id: newGuestId,
    created_at: new Date().toISOString()
  };

  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('LocalStorage error saving guest session:', err);
  }

  return session;
}
