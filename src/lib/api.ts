export function apiBase(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  return base.replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = init;
  const h = new Headers(headers);

  const isForm = rest.body instanceof FormData;
  if (!isForm) {
    h.set("Content-Type", h.get("Content-Type") ?? "application/json");
  }

  if (token) {
    h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${apiBase()}${path}`, { ...rest, headers: h });
  const blobTypes = ["application/zip", "text/csv", "application/octet-stream"];
  const ctype = res.headers.get("Content-Type")?.split(";")[0] ?? "";

  if (blobTypes.includes(ctype)) {
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.blob() as Promise<T>;
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portal_token");
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("portal_token", token);
  else localStorage.removeItem("portal_token");
}

export type StoredPortalUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
};

export function getStoredUser(): StoredPortalUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("portal_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPortalUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredPortalUser | null): void {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem("portal_user", JSON.stringify(user));
  else localStorage.removeItem("portal_user");
}
