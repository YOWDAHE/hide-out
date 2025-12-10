'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';
import type { User } from '@/app/generated/prisma/client';

const SESSION_COOKIE = 'ho_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type SafeUser = Pick<User, 'id' | 'email' | 'name' | 'image'>;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
});

const setSessionCookie = async (userId: string) => {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
};

export async function currentUser(): Promise<SafeUser | null> {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session?.value) return null;

  const user = await prisma.user.findUnique({ where: { id: session.value } });
  if (!user) {
    (await cookies()).delete(SESSION_COOKIE);
    return null;
  }

  return toSafeUser(user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await currentUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

export async function signup(input: AuthPayload): Promise<SafeUser> {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const name = input.name?.trim();

  if (!email || !password) throw new Error('Email and password are required');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email is already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  await setSessionCookie(user.id);
  return toSafeUser(user);
}

export async function login(input: AuthPayload): Promise<SafeUser> {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');

  await setSessionCookie(user.id);
  return toSafeUser(user);
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

