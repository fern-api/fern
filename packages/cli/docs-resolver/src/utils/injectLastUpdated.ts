import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { execFile } from "child_process";
import matter from "gray-matter";
import { promisify } from "util";

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
        // Find the last occurrence of '\n---' within the match to locate the closing delimiter
        const matchStr = frontmatterMatch[0];
        const closingIdx = matchStr.lastIndexOf("\n---");
        const insertPos = frontmatterMatch.index + closingIdx;
        return markdown.slice(0, insertPos) + `\nlast-updated: ${date}` + markdown.slice(insertPos);
    }

    // No frontmatter — prepend a new block
    return `---\nlast-updated: ${date}\n---\n${markdown}`;
}

/**
 * Runs `git log -1 --format=%aI -- <filepath>` to get the last commit date for a file.
 * Returns undefined if the file is untracked, git is unavailable, or the directory is not a git repo.
 */
export async function getGitLastModifiedDate(absoluteFilePath: AbsoluteFilePath): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%aI", "--", absoluteFilePath]);
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
 * For each page in `pages` that does not already have `last-updated` in its frontmatter,
 * looks up the file's last git commit date and injects it.
 *
 * Pages without a git history (untracked files) and pages in non-git environments
 * are left unchanged.
 *
 * Queries run in parallel for performance.
 */
export async function injectLastUpdatedDates(
    pages: Record<RelativeFilePath, string>,
    absolutePathToFernFolder: AbsoluteFilePath
): Promise<Record<RelativeFilePath, string>> {
    const result: Record<RelativeFilePath, string> = {};

    await Promise.all(
        Object.entries(pages).map(async ([relativePath, markdown]) => {
            const key = RelativeFilePath.of(relativePath);
            if (hasLastUpdated(markdown)) {
                result[key] = markdown;
                return;
            }

            const absoluteFilePath = resolve(absolutePathToFernFolder, relativePath);
            const date = await getGitLastModifiedDate(absoluteFilePath);

            result[key] = date != null ? injectLastUpdatedIntoMarkdown(markdown, date) : markdown;
        })
    );

    return result;
}
