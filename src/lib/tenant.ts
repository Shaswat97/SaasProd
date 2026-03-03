import type { Prisma, PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

export type ResolvedTenant = {
  slug: string;
  host: string;
  databaseUrl: string;
  source: "default" | "registry";
  companyName?: string;
};

function getDefaultTenant(host: string): ResolvedTenant {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }
  return {
    slug: "default",
    host,
    databaseUrl,
    source: "default"
  };
}

export async function resolveTenant(request?: Request): Promise<ResolvedTenant | null> {
  // In the per-VPS-deployment architecture, we just use the default .env database.
  // We extract host just to populate the ResolvedTenant type.
  let host = request?.headers.get("host") ?? null;
  if (!host) {
    try {
      host = headers().get("host");
    } catch {
      host = "localhost"; // Fallback for background tasks without request context
    }
  }

  return getDefaultTenant(host!);
}

export async function getDefaultCompanyId(db: PrismaClient | Prisma.TransactionClient) {
  const company = await db.company.findFirst({
    where: { deletedAt: null },
    select: { id: true }
  });

  if (!company) {
    throw new Error("No company found. Seed the database first.");
  }

  return company.id;
}
