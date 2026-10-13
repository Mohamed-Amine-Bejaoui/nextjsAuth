import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
 
export async function GET() {
  const authorization = await requireRole();
  if (authorization.response) return authorization.response;
  const user = await prisma.user.findUnique({
    where: { id: authorization.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(user);
}
