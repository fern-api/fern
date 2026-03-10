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
 * Formats an ISO 8601 date string as "Month Day, Year" (e.g., "March 9, 2026").
 */
export function formatLastUpdatedDate(isoDate: string): string {
    const date = new Date(isoDate);
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
    // Replace the existing last-updated line in the raw frontmatter string.
    // Handles both `last-updated: VALUE` and `last-updated: "VALUE"` forms.
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
 * Runs `git log -1 --format=%cI -- <filepath>` to get the last commit date for a file.
 * Uses `%cI` (committer date) rather than `%aI` (author date) because the committer
 * date reflects when the change was actually applied to the branch — more accurate
 * for crawl scheduling purposes (e.g. cherry-picked or rebased commits retain their
 * original author date, but the committer date updates).
 * Returns undefined if the file is untracked, git is unavailable, or the directory is not a git repo.
 */
export async function getGitLastModifiedDate(absoluteFilePath: AbsoluteFilePath): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", absoluteFilePath]);
        const isoDate = stdout.trim();
        if (isoDate === "") {
            // File is not tracked by git
            return undefined;
        }
        return formatLastUpdatedDate(isoDate);
    } catch {
        // git is not available, or the directory is not a git repo
        return undefined;
    }
}

/**
 * Returns the raw ISO 8601 date from `git log` for comparison purposes.
 * Unlike `getGitLastModifiedDate`, this does NOT format the date — it
 * returns the ISO string directly so callers can compare timestamps.
 * Uses `%cI` (committer date) — see `getGitLastModifiedDate` for rationale.
 */
export async function getGitLastModifiedISO(absoluteFilePath: AbsoluteFilePath): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", absoluteFilePath]);
        const isoDate = stdout.trim();
        return isoDate === "" ? undefined : isoDate;
    } catch {
        return undefined;
    }
}

/**
 * For each Markdown-sourced page, ensures `last-updated` reflects the most
 * recent change — either from git history or from a user-supplied value,
 * whichever is newer.
 *
 * Behaviour per page:
 *  1. API-generated pages (in `excludePaths`) → returned unchanged.
 *  2. No existing `last-updated` → inject git timestamp (or leave unchanged
 *     if there is no git history).
 *  3. Has `last-updated` AND git timestamp is newer → **replace** with the
 *     git timestamp so the value never goes stale.
 *  4. Has `last-updated` AND git timestamp is older or equal → keep the
 *     user-supplied value.
 *
 * Pages listed in `excludePaths` are never modified — use this to skip
 * API-generated content (e.g. OpenAPI tag description pages) whose timestamps
 * would be derived from a single spec file, producing identical dates across
 * many pages.  Identical `<lastmod>` values cause Google to stop trusting
 * the signal domain-wide and waste Bing crawl budget.
 *
 * Pages without git history (untracked files) and pages in non-git
 * environments are also left unchanged.
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
    excludePaths?: ReadonlySet<RelativeFilePath>
): Promise<Record<RelativeFilePath, string>> {
    const result: Record<RelativeFilePath, string> = {};
    const entries = Object.entries(pages);

    await asyncPool(GIT_CONCURRENCY_LIMIT, entries, async ([relativePath, markdown]) => {
        const key = RelativeFilePath.of(relativePath);

        // Skip API-generated pages (e.g. OpenAPI tag descriptions).
        // A single openapi.yaml change regenerates N pages with the same
        // timestamp — omitting lastmod is safer than an inaccurate one.
        if (excludePaths?.has(key)) {
            result[key] = markdown;
            return;
        }

        const absoluteFilePath = resolve(absolutePathToFernFolder, relativePath);

        // Check for an existing user-supplied last-updated value.
        const existingDate = getExistingLastUpdated(markdown);

        if (existingDate != null) {
            // The page already has a last-updated value.  Check whether
            // git has a newer timestamp — if so, replace it to prevent
            // the user-specified date from going stale.
            const gitISO = await getGitLastModifiedISO(absoluteFilePath);
            if (gitISO != null) {
                const gitDate = new Date(gitISO);
                const userDate = parseFormattedDate(existingDate);
                if (userDate != null && gitDate > userDate) {
                    // Git timestamp is newer — override the stale value.
                    const formatted = formatLastUpdatedDate(gitISO);
                    result[key] = replaceLastUpdatedInMarkdown(markdown, formatted);
                    return;
                }
            }
            // User-supplied date is still current (or no git history).
            result[key] = markdown;
            return;
        }

        // No existing last-updated — inject from git.
        const date = await getGitLastModifiedDate(absoluteFilePath);
        result[key] = date != null ? injectLastUpdatedIntoMarkdown(markdown, date) : markdown;
    });

    return result;
}
