import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { json, requireAdmin, DEFAULT_ADMIN_EMAILS, ensureAdminsTable } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = await requireAdmin();
  if (!current) return json({ error: "Admins only" }, 403);

  await ensureAdminsTable();
  const db = getDb();
  const rows = await db.select().from(admins).orderBy(desc(admins.id));

  const existingEmails = new Set(rows.map((r) => r.email.toLowerCase()));
  const allList = [...rows];

  for (const dEmail of DEFAULT_ADMIN_EMAILS) {
    if (!existingEmails.has(dEmail.toLowerCase())) {
      allList.push({
        id: -1,
        email: dEmail,
        addedBy: "system",
        createdAt: new Date(),
      });
      existingEmails.add(dEmail.toLowerCase());
    }
  }

  return json(allList);
}

export async function POST(req: Request) {
  const current = await requireAdmin();
  if (!current) return json({ error: "Admins only" }, 403);

  const body = await req.json().catch(() => ({}));
  const rawEmail = String(body.email ?? "").trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailRegex.test(rawEmail)) {
    return json({ error: "Please enter a valid email address" }, 400);
  }

  await ensureAdminsTable();
  const db = getDb();

  try {
    const [row] = await db
      .insert(admins)
      .values({
        email: rawEmail,
        addedBy: current.email || "admin",
      })
      .onConflictDoNothing()
      .returning();

    if (!row) {
      return json({ error: "This email is already an admin" }, 400);
    }
    return json(row, 201);
  } catch {
    return json({ error: "Failed to add admin" }, 500);
  }
}

export async function DELETE(req: Request) {
  const current = await requireAdmin();
  if (!current) return json({ error: "Admins only" }, 403);

  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const email = url.searchParams.get("email")?.toLowerCase().trim();

  await ensureAdminsTable();
  const db = getDb();

  if (id && id > 0) {
    const [row] = await db.delete(admins).where(eq(admins.id, id)).returning();
    return json({ deleted: true, row });
  }

  if (email) {
    const [row] = await db.delete(admins).where(eq(admins.email, email)).returning();
    return json({ deleted: true, row });
  }

  return json({ error: "Missing id or email parameter" }, 400);
}
