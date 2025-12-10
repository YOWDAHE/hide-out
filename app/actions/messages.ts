'use server';

import prisma from '@/lib/prisma';
import { requireUser } from './auth';

const assertParticipant = async (conversationId: string, userId: string) => {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });

  if (!membership) throw new Error('You are not a participant in this conversation');
};

export async function getMessages(conversationId: string, limit = 50) {
  const user = await requireUser();
  await assertParticipant(conversationId, user.id);

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const user = await requireUser();
  await assertParticipant(conversationId, user.id);
  if (!content.trim()) throw new Error('Message content cannot be empty');

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
        isAIMessage: false,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}

export async function sendAIMessage(conversationId: string, content: string) {
  const user = await requireUser();
  await assertParticipant(conversationId, user.id);
  if (!content.trim()) throw new Error('Message content cannot be empty');

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: null,
        content,
        isAIMessage: true,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return message;
}

