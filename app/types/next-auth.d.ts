import NextAuth from 'next-auth';
import type { User as PrismaUser } from '@/app/generated/prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User extends PrismaUser { }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
    }
}
