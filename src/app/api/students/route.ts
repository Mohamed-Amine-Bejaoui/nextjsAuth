import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import { studentCreateSchema } from "@/lib/validation";

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

export async function GET() {
  const authorization = await requireRole();
  if (authorization.response) return authorization.response;

  const where =
    authorization.user.role === "ETUDIANT"
      ? { userId: authorization.user.id }
      : {};
  const students = await prisma.student.findMany({
    where,
    select: studentFields,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const authorization = await requireRole(["ADMIN"]);
  if (authorization.response) return authorization.response;

  const parsed = studentCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { userId, ...data } = parsed.data;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    if (user.role !== "ETUDIANT") {
      return NextResponse.json(
        { error: "Le profil doit être lié à un étudiant" },
        { status: 400 },
      );
    }
    const existingStudent = await prisma.student.findUnique({ where: { userId } });
    if (existingStudent) {
      return NextResponse.json({ error: "Cet utilisateur a déjà un profil étudiant" }, { status: 409 });
    }
  }

  const student = await prisma.student.create({
    data: { ...data, userId: userId ?? null },
    select: studentFields,
  });
  return NextResponse.json(student, { status: 201 });
}
