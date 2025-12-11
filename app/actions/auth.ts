'use server';

import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import type { User } from '@/app/generated/prisma/client';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type SafeUser = Pick<User, 'id' | 'email' | 'name' | 'image'>;

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
});

export async function currentUser(): Promise<SafeUser | null> {
  const session = await getServerSession(authOptions);

  // NextAuth default session.user doesn't include id - check for session existence
  if (!session) {
    return null;
  }
  if (!session.user) {
    return null;
  }

  // Get user from database using session.user.email (most reliable)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!user) {
    return null;
  }

  return toSafeUser(user);
}

export async function requireUser(): Promise<SafeUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Authenticated session is missing user data");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  return user;
}

export async function signupWithEmail(data: AuthPayload) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(data.password.trim(), 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name?.trim()
    },
  });
}
