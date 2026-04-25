import { fetchAllApps } from "@/lib/server";
import { isAdminAuthed, loginAction, logoutAction } from "./actions";
import { DeleteButton } from "./DeleteButton";

export const metadata = { title: "Admin · Vibeshelf", robots: "noindex" };
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await isAdminAuthed();
  const { error } = await searchParams;

  if (!authed) {
    return <LoginScreen error={!!error} />;
  }

  const apps = await fetchAllApps();

  return (
    <div className="container-page py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-paper">Admin Panel</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">
            {apps.length} project{apps.length !== 1 ? "s" : ""} on the shelf
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim transition-colors hover:text-paper border border-paper/20 rounded px-3 py-1.5"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="rule-paper-dashed mb-8 opacity-60" />

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-paper/10">
              <th className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Project
              </th>
              <th className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Maker
              </th>
              <th className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Category
              </th>
              <th className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Upvotes
              </th>
              <th className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Added
              </th>
              <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr
                key={app.slug}
                className="group border-b border-paper/10 transition-colors hover:bg-ink-soft"
              >
                <td className="py-4 pr-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body text-sm text-paper">{app.title}</span>
                    <a
                      href={`/app/${app.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-paper-dim hover:text-acid transition-colors"
                    >
                      /{app.slug}
                    </a>
                  </div>
                </td>
                <td className="py-4 pr-6 font-mono text-xs text-paper-dim">
                  {app.makerHandle ?? app.makerName}
                </td>
                <td className="py-4 pr-6 font-mono text-xs text-paper-dim capitalize">
                  {app.category}
                </td>
                <td className="py-4 pr-6 font-mono text-xs text-paper-dim">
                  {app.upvotes}
                </td>
                <td className="py-4 pr-6 font-mono text-xs text-paper-dim">
                  {new Date(app.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-4">
                  <DeleteButton slug={app.slug} title={app.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {apps.length === 0 && (
          <p className="mt-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">
            The shelf is empty.
          </p>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ error }: { error: boolean }) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="display mb-1 text-3xl text-paper">Admin</h1>
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-paper-dim">
          Vibeshelf · Restricted
        </p>

        <div className="rule-paper-dashed mb-8 opacity-60" />

        <form action={loginAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-dim">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoFocus
              required
              autoComplete="current-password"
              className="rounded border border-paper/20 bg-ink-soft px-4 py-3 font-mono text-sm text-paper placeholder-paper-dim/40 outline-none focus:border-acid/50 focus:ring-1 focus:ring-acid/30"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
              Incorrect password — try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded bg-acid px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-opacity hover:opacity-90"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
