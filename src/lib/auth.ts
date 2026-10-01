export interface UserSession {
  id: string;
  name: string;
  email: string;
}

const authKeyPattern = /auth|token|session|user/i;
export const authStorageKey = "smartrecycle-authenticated";
export const userStorageKey = "smartrecycle-user";
type Router = { replace: (href: string) => void };

export function subscribeToAuth(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener("smartrecycle-auth-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("smartrecycle-auth-change", onChange);
  };
}

function notifyAuthChange(): void {
  window.dispatchEvent(new Event("smartrecycle-auth-change"));
}

export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(authStorageKey) === "true";
}

export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(userStorageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function setAuthenticated(user?: UserSession): void {
  window.localStorage.setItem(authStorageKey, "true");
  if (user) {
    window.localStorage.setItem(userStorageKey, JSON.stringify(user));
  }
  notifyAuthChange();
}

export function logout(router?: Router): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(authStorageKey);
    window.localStorage.removeItem(userStorageKey);
    for (const key of Object.keys(window.localStorage)) {
      if (authKeyPattern.test(key)) window.localStorage.removeItem(key);
    }

    for (const key of Object.keys(window.sessionStorage)) {
      if (authKeyPattern.test(key)) window.sessionStorage.removeItem(key);
    }

    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=", 1)[0]?.trim();
      if (name && authKeyPattern.test(name)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
    notifyAuthChange();
  }

  if (router) {
    router.replace("/");
  }
}
