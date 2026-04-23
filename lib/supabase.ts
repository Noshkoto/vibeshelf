"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(url ?? "", anon ?? "", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _client;
}

let _signInPromise: Promise<string | null> | null = null;

export async function ensureSignedIn(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (_signInPromise) return _signInPromise;

  _signInPromise = (async () => {
    const supa = getSupabase();
    const { data: session } = await supa.auth.getSession();
    if (session.session?.user?.id) return session.session.user.id;

    const { data, error } = await supa.auth.signInAnonymously();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Anonymous sign-in failed", error);
      return null;
    }
    return data.user?.id ?? null;
  })();

  return _signInPromise;
}
