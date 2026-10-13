# TP2 - Gestion des rôles

Application Next.js de gestion des étudiants avec authentification JWT,
Prisma/SQLite et contrôle d'accès serveur.

## Démarrage

```bash
npm run dev
```

Ouvrir http://localhost:3000.

Routes d'authentification :

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Routes étudiants :

- `GET /api/students` : tous les étudiants pour `ADMIN` et `ENSEIGNANT`,
  uniquement son profil pour `ETUDIANT`
- `POST /api/students` : réservé à `ADMIN`
- `PATCH /api/students/:id` : `ADMIN`, ou `ENSEIGNANT` pour les champs
  pédagogiques
- `DELETE /api/students/:id` : réservé à `ADMIN`

Le serveur récupère toujours le rôle depuis l'utilisateur authentifié en base.
Un rôle envoyé par le navigateur n'est jamais accepté comme autorité et les
réponses API n'exposent jamais le mot de passe.

## Utilisateurs de test

Les nouveaux comptes reçoivent le rôle `ETUDIANT` par défaut. Pour créer les
comptes nécessaires aux tests du TP :

```bash
npx prisma studio
```

Dans la table `User`, définir manuellement un compte `ADMIN` et un compte
`ENSEIGNANT`. Les valeurs autorisées sont `ADMIN`, `ENSEIGNANT` et `ETUDIANT`.

Les utilisateurs créés avant la migration TP2 peuvent ne pas encore avoir de
profil dans `Student`. Pour les compléter automatiquement une fois, exécuter
ce script SQL dans Prisma Studio ou SQLite :

```sql
INSERT INTO Student (userId, name, email)
SELECT User.id, User.name, User.email
FROM User
LEFT JOIN Student ON Student.userId = User.id
WHERE Student.id IS NULL;
```

Dans PowerShell, les requêtes `curl` doivent utiliser `curl.exe`, des
guillemets doubles autour de l'URL et le backtick `` ` `` pour continuer une
commande sur plusieurs lignes.

## Tests manuels de sécurité

- Sans session, `GET /api/students` retourne `401`.
- Un `ETUDIANT` reçoit `403` pour `POST` et `DELETE`.
- Un `ENSEIGNANT` reçoit `403` pour `POST` et `DELETE`.
- Un `ADMIN` peut effectuer toutes les opérations CRUD.
- Une réponse d'authentification ou d'étudiant ne contient jamais `password`.
