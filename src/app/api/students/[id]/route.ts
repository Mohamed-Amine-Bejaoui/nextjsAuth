import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import { studentUpdateSchema } from "@/lib/validation";

const studentFields = {
  id: true,
  userId: true,
  name: true,
  email: true,
  level: true,
  pedagogicalInfo: true,
  createdAt: true,
  updatedAt: true,
} as const;

type RouteContext = { params: Promise<{ id: string }> };

async function findStudent(id: string) {
  const studentId = Number(id);
  return Number.isInteger(studentId) && studentId > 0
    ? prisma.student.findUnique({ where: { id: studentId }, select: studentFields })
    : null;
}

export async function PATCH(req: Request, context: RouteContext) {
  const authorization = await requireRole(["ADMIN", "ENSEIGNANT"]);
  if (authorization.response) return authorization.response;

  const { id } = await context.params;
  const student = await findStudent(id);
  if (!student) {
    return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
  }

  const parsed = studentUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const data =
    authorization.user.role === "ENSEIGNANT"
      ? {
          level: parsed.data.level,
          pedagogicalInfo: parsed.data.pedagogicalInfo,
        }
      : parsed.data;
  const updated = await prisma.student.update({
    where: { id: student.id },
    data,
    select: studentFields,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authorization = await requireRole(["ADMIN"]);
  if (authorization.response) return authorization.response;

  const { id } = await context.params;
  const student = await findStudent(id);
  if (!student) {
    return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
  }
  await prisma.student.delete({ where: { id: student.id } });
  return NextResponse.json({ ok: true });
}
