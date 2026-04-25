"use client";

import { deleteAppAction } from "./actions";

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deleteAppAction}
      onSubmit={(e) => {
        if (!confirm(`Remove "${title}" from the shelf?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember opacity-60 transition-opacity hover:opacity-100"
      >
        Remove
      </button>
    </form>
  );
}
