"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "vs-admin";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function isAdminAuthed(): Promise<boolean> {
  const secret = (process.env.ADMIN_SECRET ?? "").trim();
  if (!secret) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === secret;
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const secret = (process.env.ADMIN_SECRET ?? "").trim();

  if (!password || !secret || password !== secret) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/admin",
    sameSite: "strict",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin");
}

export async function deleteAppAction(formData: FormData) {
  if (!(await isAdminAuthed())) redirect("/admin");

  const slug = formData.get("slug") as string;
  if (!slug) return;

  const supa = getAdminSupabase();
  if (!supa) return;

  await supa.from("upvotes").delete().eq("app_slug", slug);
  await supa.from("apps").delete().eq("slug", slug);

  redirect("/admin");
}
