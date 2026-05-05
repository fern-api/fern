import { assertNever } from "@fern-api/core-utils";
import { LogLevel } from "@fern-api/logger";

import { Log } from "./Log.js";

export type GithubAnnotationLevel = "error" | "warning";

/**
 * Properties supported by GitHub Actions `::error/warning file=...,line=...,title=...::message`
 * workflow commands. See https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions
 *
 * `file` is repository-relative (anchored on `GITHUB_WORKSPACE`); GHA renders annotations on that
 * file/line in the PR's "Files changed" tab. `title` becomes the heading shown in the Annotations
 * panel — keep it short and identifying (e.g., the workspace or generator name).
 *
 * The spec also defines `col`, `endLine`, and `endColumn`. We omit them from this type until a
 * caller needs them — adding fields later is non-breaking; supporting unused ones isn't free
 * (more surface to test, more noise in the API).
 */
export interface GithubAnnotationProperties {
    file?: string;
    line?: number;
    title?: string;
}

export function shouldEmitGithubAnnotations(): boolean {
    return process.env.GITHUB_ACTIONS === "true";
}

let loggerAnnotationsSuppressed = false;

/**
 * Runs `fn` with the generic logger-driven annotation hook muted, restoring the previous state
 * afterward (even if `fn` throws). Used by commands like `fern automations generate` that emit
 * their own structured annotations from a per-generator collector — without this guard, every
 * failure would produce two annotations: a generic one from `cliContext.logger.error` (no
 * file/line metadata) and the rich one with `file=` / `line=` from the structured emitter,
 * burning through the GHA per-step cap twice as fast and confusing the panel.
 *
 * Implemented as a scoped runner rather than a `set(true)` / `set(false)` pair so re-entrant
 * usage and exception paths can't leave the flag in the wrong state.
 */
export async function withSuppressedLoggerAnnotations<T>(fn: () => Promise<T>): Promise<T> {
    const previous = loggerAnnotationsSuppressed;
    loggerAnnotationsSuppressed = true;
    try {
        return await fn();
    } finally {
        loggerAnnotationsSuppressed = previous;
    }
}

/**
 * Internal hook for the logger to consult before emitting an annotation. Exported from this module
 * so the logger and tests can read the suppression state, but intentionally **not** re-exported
 * from the package index — outside callers should drive suppression via
 * {@link withSuppressedLoggerAnnotations} instead of polling the flag.
 */
export function areLoggerAnnotationsSuppressed(): boolean {
    return loggerAnnotationsSuppressed;
}

/**
 * Renders the GHA workflow command for an arbitrary annotation. Use this when the caller has
 * structured metadata (file, line, title) — typically a command-level emitter that knows about
 * specific failures. For ad-hoc logger-driven annotations, see {@link renderGithubAnnotationFromLog}.
 *
 * Returns `undefined` when the body is empty after sanitization, so callers can pipe to
 * `process.stdout.write` without conditional branches at the call site.
 */
export function renderGithubAnnotation(
    level: GithubAnnotationLevel,
    body: string,
    properties: GithubAnnotationProperties = {}
): string | undefined {
    const sanitized = sanitizeForAnnotationBody(body);
    // A whitespace-only body would render as `::error:: \n` — visually empty in the GHA panel
    // and indistinguishable from a bug. Drop these so the function's "no annotation worth
    // emitting" contract stays meaningful at call sites.
    if (sanitized.trim().length === 0) {
        return undefined;
    }
    const propertiesString = formatProperties(properties);
    const prefix = propertiesString.length > 0 ? `::${level} ${propertiesString}::` : `::${level}::`;
    return `${prefix}${sanitized}\n`;
}

/**
 * Bridges a `Log` from the CLI's logger into a GHA annotation. Returns `undefined` for log levels
 * that don't map to an annotation (info/debug/trace) and for status-only logs marked `omitOnTTY`,
 * which exist for non-TTY readability and aren't real errors (e.g., the per-task "Failed." line
 * emitted on task finalization).
 *
 * The log's `prefix` (typically a colored workspace tag like `[workspace-name]`) becomes the
 * annotation `title=` so the Annotations panel groups failures by workspace.
 */
export function renderGithubAnnotationFromLog(log: Log): string | undefined {
    if (log.omitOnTTY === true) {
        return undefined;
    }
    const level = logLevelToAnnotationLevel(log.level);
    if (level == null) {
        return undefined;
    }
    const body = log.parts.join(" ");
    const title = log.prefix != null ? extractTitleFromPrefix(log.prefix) : undefined;
    return renderGithubAnnotation(level, body, title != null ? { title } : {});
}

function logLevelToAnnotationLevel(level: LogLevel): GithubAnnotationLevel | undefined {
    switch (level) {
        case LogLevel.Error:
            return "error";
        case LogLevel.Warn:
            return "warning";
        case LogLevel.Info:
        case LogLevel.Debug:
        case LogLevel.Trace:
            return undefined;
        default:
            assertNever(level);
    }
}

/**
 * Strips chalk colors and surrounding whitespace from a logger prefix to produce a plain title.
 * Returns `undefined` if nothing useful is left — callers shouldn't emit `title=` in that case
 * because GitHub renders an empty title as a literal blank heading.
 */
function extractTitleFromPrefix(prefix: string): string | undefined {
    const cleaned = stripAnsi(prefix).trim();
    return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Prepares an error/warn message for inclusion in a `::error::` / `::warning::` workflow command:
 * - Strips ANSI escapes (chalk colors) — they render as literal noise in GitHub's UI.
 * - Escapes literal `%` to `%25` *first* so a body that already contains `%0A` (e.g. a logged
 *   URL-encoded string) doesn't get decoded by the runner into an unintended newline. This
 *   matches `@actions/core`'s `escapeData` and the GHA workflow command spec.
 * - Trims trailing newlines added by the logger.
 * - Encodes embedded newlines as `%0A` so a multi-line message becomes a single-line workflow
 *   command that GitHub renders as a multi-line annotation.
 */
function sanitizeForAnnotationBody(content: string): string {
    return stripAnsi(content)
        .replace(/%/g, "%25")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "")
        .replace(/\n+$/g, "")
        .replace(/\n/g, "%0A");
}

/**
 * Formats annotation properties as a comma-separated key=value list per GHA workflow command spec.
 * Property values are escaped: `,` `:` and newlines are percent-encoded so they don't terminate
 * the property list or the command itself. Property order is `file,line,title` — natural reading
 * order for humans skimming the raw stdout, even though GHA's parser doesn't care.
 */
function formatProperties(properties: GithubAnnotationProperties): string {
    const parts: string[] = [];
    if (properties.file != null && properties.file.length > 0) {
        parts.push(`file=${escapeProperty(properties.file)}`);
    }
    if (properties.line != null) {
        parts.push(`line=${properties.line}`);
    }
    if (properties.title != null && properties.title.length > 0) {
        parts.push(`title=${escapeProperty(properties.title)}`);
    }
    return parts.join(",");
}

/**
 * Property values cannot contain raw `%`, `,`, `:`, `\r`, or `\n` — `,` and `:` are property-list
 * delimiters, `\r` / `\n` would terminate the workflow command, and `%` must be escaped first to
 * keep a literal `%XX` in the input from round-tripping through the runner's percent-decoder as a
 * different character. GHA's documented escape is `%XX` for all of these.
 */
function escapeProperty(value: string): string {
    return stripAnsi(value)
        .replace(/%/g, "%25")
        .replace(/\r/g, "%0D")
        .replace(/\n/g, "%0A")
        .replace(/:/g, "%3A")
        .replace(/,/g, "%2C");
}

// Matches ANSI CSI/SGR escape sequences (chalk-style colors). We strip these because GitHub
// Actions workflow commands don't render escape codes — they'd appear as literal `[31m...[39m`
// noise in the Annotations panel.
// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape sequences begin with ESC (U+001B) by definition; matching that byte is the whole point of the regex.
const ANSI_ESCAPE_PATTERN = /\[[0-?]*[ -/]*[@-~]/g;

function stripAnsi(content: string): string {
    return content.replace(ANSI_ESCAPE_PATTERN, "");
}
