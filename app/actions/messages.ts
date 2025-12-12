'use server';

import prisma from '@/lib/prisma';
import { requireUser } from './auth';
import OpenAI from 'openai';
import { groq } from '@/lib/groq';
import Groq from 'groq-sdk';

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

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const recipients = participants
    .map((p) => p.userId)
    .filter((id) => id !== user.id);

  if (process.env.NEXT_PUBLIC_SOCKET_URL && recipients.length > 0) {
    console.log("Sending a ping")
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message, recipients }),
      });
    } catch (err) {
      console.error("Failed to notify socket server", err);
      // don't throw; message is already saved
    }
  }

  return message;
}

// export async function sendAIMessage(conversationId: string, content: string) {
//   const user = await requireUser();
//   await assertParticipant(conversationId, user.id);
//   if (!content.trim()) throw new Error('Message content cannot be empty');

//   const [message] = await prisma.$transaction([
//     prisma.message.create({
//       data: {
//         conversationId,
//         senderId: null,
//         content,
//         isAIMessage: true,
//       },
//     }),
//     prisma.conversation.update({
//       where: { id: conversationId },
//       data: { updatedAt: new Date() },
//     }),
//   ]);

//   return message;
// }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// export async function sendAIMessage(conversationId: string, content: string) {
//   const user = await requireUser();

//   const trimmed = content.trim();
//   if (!trimmed) throw new Error("Message content cannot be empty");

//   // 1) Save user's message
//   const userMessage = await prisma.message.create({
//     data: {
//       conversationId,
//       senderId: user.id,
//       content: trimmed,
//       isAIMessage: false,
//     },
//   });

//   // 2) Fetch recent history to give context to the model
//   const history = await prisma.message.findMany({
//     where: { conversationId },
//     orderBy: { createdAt: "asc" },
//     take: 20,
//   });

//   const messagesForModel: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
//     history.map((m) => ({
//       role: m.isAIMessage ? "assistant" : "user",
//       content: m.content,
//     }));

//   // 3) Call LLM
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a helpful AI chat assistant in a messaging app." + "You always reply in a good manner.",
//       },
//       ...messagesForModel,
//     ],
//   });

//   const aiText =
//     completion.choices[0]?.message?.content?.trim() ||
//     "Sorry, I could not generate a response.";

//   // 4) Save AI reply
//   const aiMessage = await prisma.message.create({
//     data: {
//       conversationId,
//       senderId: null,
//       content: aiText,
//       isAIMessage: true,
//     },
//   });

//   // 5) Update conversation timestamp
//   await prisma.conversation.update({
//     where: { id: conversationId },
//     data: { updatedAt: new Date() },
//   });

//   return { userMessage, aiMessage };
// }

export async function sendAIMessage(conversationId: string, content: string) {
  const user = await requireUser();

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message content cannot be empty");

  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: trimmed,
      isAIMessage: false,
    },
  });

  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const messagesForModel: Groq.Chat.ChatCompletionMessageParam[] = history.map(
    (m) => ({
      role: (m.isAIMessage ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    })
  );

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system" as const,
        content:
          "You are a helpful AI chat assistant in a messaging app. You always reply in a good manner.",
      },
      ...messagesForModel,
    ],
  });

  const aiText =
    completion.choices[0]?.message?.content?.trim() ||
    "Sorry, I could not generate a response.";

  const aiMessage = await prisma.message.create({
    data: {
      conversationId,
      senderId: null,
      content: aiText,
      isAIMessage: true,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { userMessage, aiMessage };
}