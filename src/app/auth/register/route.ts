import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";
 
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Cet email est déjà utilisé" },
      { status: 409 }
    );
  }
 
  const hash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await prisma.$transaction(async (database) => {
      const createdUser = await database.user.create({
        data: { name, email, password: hash },
      });
      await database.student.create({
        data: {
          userId: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
        },
      });
      return createdUser;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }
    throw error;
  }
 
  await createSession(user.id);
  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}
