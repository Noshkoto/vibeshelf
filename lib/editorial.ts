// Editorial — hand-curated copy keyed off app slugs and shelf issues.
// Issues are derived from app.createdAt by year+month; editor's notes and
// provenance ("built notes") are authored by the curator here, not stored
// in the database.

export const FIRST_ISSUE = { year: 2026, month: 4 } as const;

export interface Issue {
  year: number;
  month: number;
  slug: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatIssueSlug(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseIssueSlug(slug: string): Issue | null {
  const m = /^(\d{4})-(\d{2})$/.exec(slug);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month, slug };
}

export function shelfNumber(year: number, month: number): number {
  return (year - FIRST_ISSUE.year) * 12 + (month - FIRST_ISSUE.month) + 1;
}

export function monthLabel(month: number): string {
  return MONTHS[month - 1] ?? "";
}

export function issueLabel(issue: Issue): string {
  return `${monthLabel(issue.month)} ${issue.year}`;
}

export function currentIssue(now: Date = new Date()): Issue {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return { year, month, slug: formatIssueSlug(year, month) };
}

export function appIssue(createdAt: string): Issue {
  const d = new Date(createdAt);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  return { year, month, slug: formatIssueSlug(year, month) };
}

function issueRank(issue: { year: number; month: number }): number {
  return issue.year * 12 + issue.month;
}

export function prevIssue(issue: Issue): Issue | null {
  if (issueRank(issue) <= issueRank(FIRST_ISSUE)) return null;
  let { year, month } = issue;
  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return { year, month, slug: formatIssueSlug(year, month) };
}

export function nextIssue(issue: Issue, now: Date = new Date()): Issue | null {
  const cur = currentIssue(now);
  if (issueRank(issue) >= issueRank(cur)) return null;
  let { year, month } = issue;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return { year, month, slug: formatIssueSlug(year, month) };
}

export function isValidIssue(issue: Issue, now: Date = new Date()): boolean {
  const first = issueRank(FIRST_ISSUE);
  const self = issueRank(issue);
  const cur = issueRank(currentIssue(now));
  return self >= first && self <= cur;
}

export function allIssues(now: Date = new Date()): Issue[] {
  const out: Issue[] = [];
  let year: number = FIRST_ISSUE.year;
  let month: number = FIRST_ISSUE.month;
  const cur = currentIssue(now);
  while (year < cur.year || (year === cur.year && month <= cur.month)) {
    out.push({ year, month, slug: formatIssueSlug(year, month) });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Editorial copy — hand-written by the curator. Add entries as issues ship.
// ---------------------------------------------------------------------------

const ISSUE_NOTES: Record<string, string> = {
  "2026-04":
    "Issue one. The shelf is new, and this month it holds only itself — a small piece of meta that felt correct to open with. The submissions box is open; your afternoon build belongs in Issue two.",
};

export function issueNote(issueSlug: string): string | null {
  return ISSUE_NOTES[issueSlug] ?? null;
}

const BUILT_NOTES: Record<string, string> = {
  vibeshelf:
    "Built in one long afternoon with Claude Code. One prompt to begin, three rewrites, one custom cursor.",
};

export function builtNote(slug: string): string | null {
  return BUILT_NOTES[slug] ?? null;
}
