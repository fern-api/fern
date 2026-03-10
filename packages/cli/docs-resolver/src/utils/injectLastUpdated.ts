/**
 * Injects git-derived `last-updated` dates into markdown page frontmatter.
 *
 * lastmod policy by content type (per XML sitemap best-practice research):
 *
 * | Content type                          | lastmod recommendation          |
 * |---------------------------------------|---------------------------------|
 * | Markdown pages (guides, changelogs)   | ON — git file timestamp         |
 * | API reference pages (from OpenAPI)    | OFF — omit entirely             |
 * | Sitemap index entries                 | ON — section-level git timestamp|
 *
 * Rationale:
 * - Google applies binary trust to `<lastmod>`: identical dates across pages
 *   causes domain-wide ignore.  A single OpenAPI spec change regenerates N
 *   endpoint pages with the same timestamp, triggering that heuristic.
 * - Bing relies on `<lastmod>` as its *primary* crawl scheduling signal
 *   (Bing Webmaster Blog, February 2023).
 * - `<changefreq>` and `<priority>` are ignored by both Google and Bing and
 *   should be omitted from sitemaps entirely.
 *
 * This module only injects dates into Markdown-sourced pages.  Pages that
 * originate from OpenAPI specs (e.g. tag description pages) must be excluded
 * by the caller via the `excludePaths` parameter.
 */
import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { execFile } from "child_process";
import matter from "gray-matter";
import { promisify } from "util";

import { asyncPool } from "./asyncPool.js";

const execFileAsync = promisify(execFile);

const MONTH_NAMES = [
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
    "December"
];

/**
 * Formats a date string as "Month Day, Year" (e.g., "March 9, 2026").
 * Accepts both `YYYY-MM-DD` (from `git log --format=%cs`) and full ISO 8601.
 * When given `YYYY-MM-DD`, parses the components directly to avoid
 * timezone-induced off-by-one errors.
 */
export function formatLastUpdatedDate(dateStr: string): string {
    const shortMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (shortMatch != null) {
        const year = Number(shortMatch[1]);
        const month = Number(shortMatch[2]) - 1;
        const day = Number(shortMatch[3]);
        return `${MONTH_NAMES[month]} ${day}, ${year}`;
    }
    const date = new Date(dateStr);
    return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/**
 * Returns true if the markdown already has a `last-updated` field in its frontmatter.
 */
export function hasLastUpdated(markdown: string): boolean {
    const parsed = matter(markdown);
    return parsed.data["last-updated"] != null;
}

/**
 * Extracts the existing `last-updated` value from frontmatter, or returns
 * undefined if the field is not present.
 */
export function getExistingLastUpdated(markdown: string): string | undefined {
    const parsed = matter(markdown);
    const value = parsed.data["last-updated"];
    return value != null ? String(value) : undefined;
}

/**
 * Replaces an existing `last-updated` value in the frontmatter with a new one.
 * If `last-updated` is not present, falls back to injection via
 * `injectLastUpdatedIntoMarkdown`.
 */
export function replaceLastUpdatedInMarkdown(markdown: string, newDate: string): string {
    if (!hasLastUpdated(markdown)) {
        return injectLastUpdatedIntoMarkdown(markdown, newDate);
    }
    return markdown.replace(/^(last-updated:\s*)["']?.*?["']?\s*$/m, `$1${newDate}`);
}

/**
 * Parses a "Month Day, Year" formatted date string (e.g. "March 9, 2026")
 * into a Date object.  Returns undefined if the string cannot be parsed.
 */
export function parseFormattedDate(formatted: string): Date | undefined {
    const date = new Date(formatted);
    return isNaN(date.getTime()) ? undefined : date;
}

/** Number of days a user-specified `last-updated` is honoured before git overrides it. */
const USER_OVERRIDE_EXPIRY_DAYS = 30;

/**
 * Injects `last-updated: <date>` into the frontmatter of a markdown string.
 * - If the file has frontmatter (starts with ---), adds the field before the closing ---.
 * - If the file has no frontmatter, prepends a new frontmatter block.
 * - If `last-updated` is already present, returns the markdown unchanged.
 */
export function injectLastUpdatedIntoMarkdown(markdown: string, date: string): string {
    if (hasLastUpdated(markdown)) {
        return markdown;
    }

    // Match frontmatter block at the start of the file.
    // The content group ([\s\S]*?\r?\n)? is optional to handle empty frontmatter (---\n---).
    const frontmatterMatch = /^---\r?\n([\s\S]*?\r?\n)?---(\r?\n|$)/.exec(markdown);
    if (frontmatterMatch != null) {
        // Find the closing '---' delimiter, handling both LF and CRLF line endings.
        const matchStr = frontmatterMatch[0];
        const closingMatch = /\r?\n---[\r\n]*$/.exec(matchStr);
        const insertPos = frontmatterMatch.index + (closingMatch?.index ?? 0);
        // Detect whether the file uses CRLF or LF and match the existing style.
        const lineEnding = markdown.includes("\r\n") ? "\r\n" : "\n";
        return markdown.slice(0, insertPos) + `${lineEnding}last-updated: ${date}` + markdown.slice(insertPos);
    }

    // No frontmatter — prepend a new block (uses LF; CRLF files will have
    // their new frontmatter block in LF, which is acceptable since parsers
    // handle mixed endings and the rest of the file retains its style).
    return `---\nlast-updated: ${date}\n---\n${markdown}`;
}

/**
 * Returns the formatted date of the most recent commit that made a
 * non-whitespace change to the file, using `git log -G'[^\s]'`.
 *
 * This filters out commits that only touch whitespace/formatting so that
 * trivial edits (indentation fixes, trailing-space cleanup) do not bump
 * the `last-updated` / `<lastmod>` signal — preventing SEO noise.
 *
 * Uses `%cs` (committer date, short YYYY-MM-DD) to avoid timezone-induced
 * off-by-one errors that occur when converting full ISO 8601 timestamps.
 *
 * Returns undefined if the file is untracked, git is unavailable, or the
 * directory is not a git repo.
 */
export async function getGitLastModifiedDate(absoluteFilePath: AbsoluteFilePath): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync("git", [
            "log",
            "-1",
            "--format=%cs",
            "-G",
            "[^\\s]",
            "--",
            absoluteFilePath
        ]);
        const dateStr = stdout.trim();
        if (dateStr === "") {
            return undefined;
        }
        return formatLastUpdatedDate(dateStr);
    } catch {
        return undefined;
    }
}

/**
 * For each Markdown-sourced page, sets `last-updated` using git history
 * with a user-override escape hatch.
 *
 * Behaviour per page:
 *  1. API-generated pages (in `excludePaths`) → returned unchanged.
 *  2. No git history for non-whitespace changes → returned unchanged.
 *  3. Page has a user-specified `last-updated` that is less than 30 days
 *     old → preserved as-is (escape hatch for manual overrides).
 *  4. Page has a user-specified `last-updated` that is 30+ days old →
 *     overridden with the git-derived date, and a warning is emitted.
 *  5. Page has no `last-updated` → injected from git.
 *
 * The 30-day window lets authors pin a meaningful date (e.g. after a
 * major content rewrite) without it going permanently stale.  After the
 * window expires, git takes over automatically.
 *
 * Git queries use `-G'[^\s]'` to skip whitespace-only commits.
 *
 * Pages listed in `excludePaths` are never modified — use this to skip
 * API-generated content (e.g. OpenAPI tag description pages) whose
 * timestamps would be derived from a single spec file, producing
 * identical dates across many pages.
 *
 * Git queries run in parallel with a concurrency limit to avoid spawning
 * too many child processes on large doc sites (500+ pages would otherwise
 * hit OS limits like EMFILE).
 */

/** Maximum number of concurrent `git log` child processes. */
const GIT_CONCURRENCY_LIMIT = 50;

export async function injectLastUpdatedDates(
    pages: Record<RelativeFilePath, string>,
    absolutePathToFernFolder: AbsoluteFilePath,
    excludePaths?: ReadonlySet<RelativeFilePath>,
    onWarning?: (message: string) => void
): Promise<Record<RelativeFilePath, string>> {
    const result: Record<RelativeFilePath, string> = {};
    const entries = Object.entries(pages);
    const now = new Date();

    await asyncPool(GIT_CONCURRENCY_LIMIT, entries, async ([relativePath, markdown]) => {
        const key = RelativeFilePath.of(relativePath);

        if (excludePaths?.has(key)) {
            result[key] = markdown;
            return;
        }

        const absoluteFilePath = resolve(absolutePathToFernFolder, relativePath);
        const date = await getGitLastModifiedDate(absoluteFilePath);

        if (date == null) {
            result[key] = markdown;
            return;
        }

        const existingValue = getExistingLastUpdated(markdown);
        if (existingValue != null) {
            const userDate = parseFormattedDate(existingValue);
            if (userDate != null) {
                const daysSinceUserDate = (now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceUserDate < USER_OVERRIDE_EXPIRY_DAYS) {
                    // User-specified date is recent — honour the manual override.
                    result[key] = markdown;
                    return;
                }
                // User-specified date has expired — override with git.
                onWarning?.(
                    `${relativePath}: manually set last-updated (${existingValue}) is older than ${USER_OVERRIDE_EXPIRY_DAYS} days; reverting to git-derived date (${date}).`
                );
            }
            result[key] = replaceLastUpdatedInMarkdown(markdown, date);
            return;
        }

        result[key] = injectLastUpdatedIntoMarkdown(markdown, date);
    });

    return result;
}
