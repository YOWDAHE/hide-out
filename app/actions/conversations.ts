'use server';

import prisma from '@/lib/prisma';
import { requireUser } from './auth';
// import { requireUser } from './auth';

export async function getUserConversations() {
  const user = await requireUser();

  return prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: { include: { user: { select: { id: true, email: true, name: true, image: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createDirectConversation(partnerId: string) {
  const user = await requireUser();
  if (!partnerId) throw new Error('Partner is required');
  if (partnerId === user.id) throw new Error('Cannot start a direct chat with yourself');

  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'DIRECT',
      participants: { some: { userId: user.id } },
      AND: { participants: { some: { userId: partnerId } } },
    },
    include: { participants: true },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participants: { create: [{ userId: user.id }, { userId: partnerId }] },
    },
    include: { participants: true },
  });
}

export async function createAIConversation() {
  const user = await requireUser();

  return prisma.conversation.create({
    data: {
      type: 'AI',
      participants: { create: [{ userId: user.id }] },
    },
    include: { participants: true },
  });
}

export async function searchUsersByName(query: string) {
  const user = await requireUser();
  const term = query.trim();
  console.log("Getting user", term)
  if (!term) return [];

  const searchedUser = prisma.user.findMany({
    where: {
      // id: { not: user.id },
      name: { contains: term, mode: 'insensitive' },
    },
    select: { id: true, name: true, email: true, image: true },
    take: 12,
  });
  console.log(await searchedUser)
  return searchedUser;
}

