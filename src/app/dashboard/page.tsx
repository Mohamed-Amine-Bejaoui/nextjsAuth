import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
 
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");
  const students = await prisma.student.findMany({
    where: user.role === "ETUDIANT" ? { userId: user.id } : {},
    select: {
      id: true,
      name: true,
      email: true,
      level: true,
      pedagogicalInfo: true,
    },
    orderBy: { name: "asc" },
  });
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-2xl font-bold">
        Bonjour {user.name} !
      </h1>
      <p>Email : {user.email}</p>
      <p>Rôle : <strong>{user.role}</strong></p>
      <p>Membre depuis le{" "}
        {user.createdAt.toLocaleDateString("fr-FR")}</p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Étudiants</h2>
        {students.length === 0 ? (
          <p>Aucune donnée autorisée.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {students.map((student) => (
              <article key={student.id} className="rounded border p-4">
                <h3 className="font-semibold">{student.name}</h3>
                <p>{student.email}</p>
                <p>Niveau : {student.level ?? "Non renseigné"}</p>
                <p>
                  Informations pédagogiques :{" "}
                  {student.pedagogicalInfo ?? "Non renseignées"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      {user.role === "ADMIN" && (
        <p className="rounded bg-blue-50 p-3">
          Vous pouvez créer et supprimer des étudiants via les endpoints
          <code className="mx-1">/api/students</code>.
        </p>
      )}
      {user.role === "ENSEIGNANT" && (
        <p className="rounded bg-blue-50 p-3">
          Vous pouvez consulter les étudiants et modifier leurs informations
          pédagogiques.
        </p>
      )}
      <LogoutButton />
    </main>
  );
}
