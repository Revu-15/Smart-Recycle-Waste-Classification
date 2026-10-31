export const authStorageKey = "smartrecycle-authenticated";
export const userStorageKey = "smartrecycle-user-profile";
export const usersDirectoryKey = "smartrecycle-users-directory";

export interface UserProfile {
  name: string;
  email: string;
  role?: string;
  accountType?: string;
  joinedDate?: string;
}

interface StoredAccount extends UserProfile {
  passwordHash: string;
}

const defaultAdminUser: StoredAccount = {
  name: "Hitendra Sharma",
  email: "hitendra@example.com",
  passwordHash: "recycle123",
  role: "Premium Member — Eco Champion",
  accountType: "Household Recycler",
  joinedDate: "January 2025",
};

const defaultDemoUser: StoredAccount = {
  name: "Eco Volunteer",
  email: "demo@smartrecycle.org",
  passwordHash: "demo123",
  role: "Community Green Advocate",
  accountType: "Volunteer / Green Ambassador",
  joinedDate: "October 2026",
};

export function getRegisteredUsers(): StoredAccount[] {
  if (typeof window === "undefined") return [defaultAdminUser, defaultDemoUser];
  try {
    const raw = window.localStorage.getItem(usersDirectoryKey);
    if (!raw) {
      const initial = [defaultAdminUser, defaultDemoUser];
      window.localStorage.setItem(usersDirectoryKey, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [defaultAdminUser, defaultDemoUser];
  } catch {
    return [defaultAdminUser, defaultDemoUser];
  }
}

export function getCurrentUser(): UserProfile {
  if (typeof window === "undefined") return defaultAdminUser;
  try {
    const raw = window.localStorage.getItem(userStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === "string") return parsed;
    }
  } catch {
    // fallback
  }
  return defaultAdminUser;
}

export function setCurrentUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(userStorageKey, JSON.stringify(user));
  window.localStorage.setItem(authStorageKey, "true");
  notifyAuthChange();
}

type Router = { replace: (href: string) => void };

export function subscribeToAuth(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener("smartrecycle-auth-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("smartrecycle-auth-change", onChange);
  };
}

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("smartrecycle-auth-change"));
  }
}

export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(authStorageKey) === "true";
}

export function setAuthenticated(user?: UserProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(authStorageKey, "true");
  if (user) {
    window.localStorage.setItem(userStorageKey, JSON.stringify(user));
  }
  notifyAuthChange();
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  accountType: string = "Household Recycler"
): { success: boolean; error?: string; user?: UserProfile } {
  if (typeof window === "undefined") {
    return { success: false, error: "Window is not defined" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    return { success: false, error: "Please enter your full name." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: "An account with this email already exists. Please sign in instead." };
  }

  const dateOptions: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  const joinedDate = new Date().toLocaleDateString("en-US", dateOptions);

  const newUser: StoredAccount = {
    name: cleanName,
    email: cleanEmail,
    passwordHash: password,
    accountType,
    role: `${accountType} — Member`,
    joinedDate,
  };

  users.push(newUser);
  window.localStorage.setItem(usersDirectoryKey, JSON.stringify(users));

  const { passwordHash: _, ...publicProfile } = newUser;
  setCurrentUser(publicProfile);

  return { success: true, user: publicProfile };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; error?: string; user?: UserProfile } {
  if (typeof window === "undefined") {
    return { success: false, error: "Window is not defined" };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { success: false, error: "Please enter your password." };
  }

  const users = getRegisteredUsers();
  const match = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!match) {
    return {
      success: false,
      error: "No account found with this email. Switch to 'Create Account' to register.",
    };
  }

  if (match.passwordHash !== password) {
    return {
      success: false,
      error: "Incorrect password. Please try again or use the demo login.",
    };
  }

  const { passwordHash: _, ...publicProfile } = match;
  setCurrentUser(publicProfile);

  return { success: true, user: publicProfile };
}

export function logout(router: Router): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(authStorageKey);
    window.localStorage.removeItem(userStorageKey);
    notifyAuthChange();
  }

  router.replace("/");
}
