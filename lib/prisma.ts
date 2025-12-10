import { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prismaClientStringleton = () => {
    return new PrismaClient({
        adapter
    })
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientStringleton>;
} & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientStringleton()

export default prisma
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma