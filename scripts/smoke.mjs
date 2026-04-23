import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(here, "..", ".env.local"), "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(\S+)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(\S+)/);
if (!urlMatch || !keyMatch) throw new Error("Missing envs in .env.local");

const supa = createClient(urlMatch[1], keyMatch[1]);

function log(stage, ok, extra = "") {
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${stage}${extra ? " — " + extra : ""}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  // 1. Anonymous sign-in
  const auth = await supa.auth.signInAnonymously();
  if (auth.error) return log("anonymous sign-in", false, auth.error.message);
  const uid = auth.data.user?.id;
  log("anonymous sign-in", Boolean(uid), uid ?? "no uid");
  if (!uid) return;

  const slug = `smoke-${Date.now()}`;

  // 2. Insert app
  const ins = await supa.from("apps").insert({
    slug,
    title: "Smoke Test",
    tagline: "Wire check",
    description: "Automated end-to-end smoke.",
    live_url: "https://example.com",
    maker_name: "Smoke Bot",
    maker_handle: "@smoke",
    tools: ["claude-code"],
    category: "dev-tools",
    palette: "citrus",
    motif: "grid",
    owner_id: uid,
  }).select().single();
  log("insert app", !ins.error, ins.error?.message);

  // 3. Select back
  const sel = await supa.from("apps").select("*").eq("slug", slug).maybeSingle();
  log("select app", !sel.error && sel.data?.slug === slug, sel.error?.message);

  // 4. Insert upvote
  const up = await supa.from("upvotes").insert({ app_slug: slug, owner_id: uid });
  log("insert upvote", !up.error, up.error?.message);

  // 5. Read aggregate view
  const agg = await supa.from("upvote_counts").select("*").eq("app_slug", slug).maybeSingle();
  log("read upvote_counts view", !agg.error && Number(agg.data?.upvote_count) === 1, agg.error?.message ?? `count=${agg.data?.upvote_count}`);

  // 6. Storage upload
  const blob = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: "image/png" });
  const path = `${uid}/smoke-${Date.now()}.png`;
  const upl = await supa.storage.from("covers").upload(path, blob, { contentType: "image/png" });
  log("storage upload", !upl.error, upl.error?.message);

  // 7. Get public URL
  const pub = supa.storage.from("covers").getPublicUrl(path);
  log("public URL", Boolean(pub.data.publicUrl), pub.data.publicUrl);

  // 8. Delete upvote
  const dv = await supa.from("upvotes").delete().eq("app_slug", slug).eq("owner_id", uid);
  log("delete upvote", !dv.error, dv.error?.message);

  // 9. Delete app
  const del = await supa.from("apps").delete().eq("slug", slug);
  log("delete app", !del.error, del.error?.message);

  // 10. Storage cleanup
  const rm = await supa.storage.from("covers").remove([path]);
  log("storage remove", !rm.error, rm.error?.message);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
