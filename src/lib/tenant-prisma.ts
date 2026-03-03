import { PrismaClient } from "@prisma/client";
import { resolveTenant, type ResolvedTenant } from "@/lib/tenant";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function getTenantPrisma(request?: Request): Promise<PrismaClient | null> {
  const tenant = await resolveTenant(request);
  if (!tenant) return null;
  // In the per-VPS deployment model, every request goes to the one database defined in .env
  return prisma;
}

export async function getTenantInfo(request?: Request): Promise<ResolvedTenant | null> {
  return resolveTenant(request);
}
