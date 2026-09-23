import {
  createUser,
  getUserByEmail,
} from "./database.service";

import type { User } from "../db/types";

const SESSION_KEY = "local_explore_user_id";

export async function register(
  name: string,
  email: string,
  password: string,
  preferences: string[] = []
): Promise<User> {

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser =
    await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error(
      "Email sudah terdaftar."
    );
  }

  const user: User = {
    name: name.trim(),
    email: normalizedEmail,
    password: password,
    preferences: [...preferences],
    createdAt: new Date().toISOString(),
  };

  const id =
    await createUser(user);

  return {
    ...user,
    id,
  };
}

export async function login(
  email: string,
  password: string
): Promise<User> {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user =
    await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error(
      "Email atau password salah."
    );
  }

  if (user.password !== password) {
    throw new Error(
      "Email atau password salah."
    );
  }

  if (!user.id) {
    throw new Error(
      "Data user tidak valid."
    );
  }

  localStorage.setItem(
    SESSION_KEY,
    String(user.id)
  );

  return user;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUserId():
  number | null {
  const value =
    localStorage.getItem(SESSION_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isNaN(id) ? null : id;
}

export function isLoggedIn(): boolean {
  return getCurrentUserId() !== null;
}