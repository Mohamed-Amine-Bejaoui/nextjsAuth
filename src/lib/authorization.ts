import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const ROLES = ["ADMIN", "ENSEIGNANT", "ETUDIANT"] as const;
export type Role = (typeof ROLES)[number];

type AuthorizedUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type AuthorizationResult =
  | { user: AuthorizedUser; response?: undefined }
  | { user?: undefined; response: NextResponse };

export async function requireRole(
  allowedRoles: readonly Role[] = ROLES,
): Promise<AuthorizationResult> {
  const session = await getSession();
  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 401 },
      ),
    };
  }

  if (!ROLES.includes(user.role as Role)) {
    return {
      response: NextResponse.json(
        { error: "Rôle invalide" },
        { status: 403 },
      ),
    };
  }

  const authorizedUser = { ...user, role: user.role as Role };
  if (!allowedRoles.includes(authorizedUser.role)) {
    return {
      response: NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 },
      ),
    };
  }

  return { user: authorizedUser };
}
