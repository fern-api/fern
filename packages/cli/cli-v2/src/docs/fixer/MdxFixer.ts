import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { FernRcSchemaLoader } from "../../config/fern-rc/FernRcSchemaLoader.js";
import type { MdxParseError } from "../errors/MdxParseError.js";
import type { AiProviderClient, AiProviderResolution } from "./AiProvider.js";
import { resolveAiProvider } from "./AiProvider.js";

// chalk is used in the noKeyResult fallback message below
void chalk;

export declare namespace MdxFixer {
    export interface ApplyResult {
        /** Whether a fix was actually applied */
        applied: boolean;
        /** Human-readable description of what changed */
        summary: string;
        /** Strategy used for the fix: deterministic string-replace, or AI provider name */
        strategy?: "deterministic" | "anthropic" | "openai" | "bedrock";
    }
}

/**
 * Apply fixes to MDX/Markdown files that failed to parse.
 *
 * Strategy is deterministic-first:
 *   1. If the {@link MdxParseError} carries a `fix` suggestion AND the `before`
 *      text is present in the file, perform a literal string replace. This is
 *      fast, requires no API key, and produces predictable diffs.
 *   2. Otherwise, fall back to an AI provider (`anthropic` by default; can be
 *      switched to `openai` or `bedrock` via `~/.fernrc`). The provider is
 *      asked to return the corrected file contents; we strip code fences and
 *      write the file back.
 *
 * Configure the AI provider with:
 *   fern config ai set-provider <anthropic|openai|bedrock>
 *   fern config ai set-key <key>     # for anthropic / openai
 *
 * Bedrock uses the standard AWS credentials chain (env vars / ~/.aws/credentials).
 */
export class MdxFixer {
    /**
     * Apply a fix for an MDX parse error. Writes the file in place when a fix
     * is produced.
     */
    public async applyFix({
        error,
        absoluteFilepath
    }: {
        error: MdxParseError;
        absoluteFilepath: string;
    }): Promise<MdxFixer.ApplyResult> {
        const content = await readFile(absoluteFilepath, "utf-8");

        // 1. Deterministic path — string replace based on the structured fix hint.
        const deterministic = this.tryDeterministicFix({ error, content });
        if (deterministic != null) {
            await writeFile(absoluteFilepath, deterministic.patched, "utf-8");
            return {
                applied: true,
                summary: `replaced \`${truncate(deterministic.fix.before)}\` with \`${truncate(deterministic.fix.after)}\``,
                strategy: "deterministic"
            };
        }

        if (error.fix != null) {
            // We had a fix suggestion but couldn't locate the `before` text in
            // the file — likely the source has drifted from what the parser saw.
            return {
                applied: false,
                summary: `Could not locate \`${truncate(error.fix.before)}\` in ${path.basename(absoluteFilepath)}.`
            };
        }

        // 2. AI fallback.
        const resolution = await this.resolveProvider();
        if (!resolution.ok) {
            return { applied: false, summary: resolution.reason };
        }

        let patched: string;
        try {
            patched = await resolution.client.complete(buildPrompt({ error, content, absoluteFilepath }));
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return { applied: false, summary: `AI fix failed (${resolution.provider}): ${message}` };
        }

        patched = stripCodeFences(patched);

        if (patched.trim() === content.trim()) {
            return { applied: false, summary: "AI returned the same content — no changes written." };
        }

        await writeFile(absoluteFilepath, patched, "utf-8");
        return {
            applied: true,
            summary: `patched the file via ${resolution.provider}.`,
            strategy: resolution.provider
        };
    }

    /**
     * Produce a displayable diff for the fix without writing anything. Returns
     * `undefined` when no diff can be produced (no deterministic match and no
     * AI provider configured / available).
     */
    public async previewFix({
        error,
        absoluteFilepath
    }: {
        error: MdxParseError;
        absoluteFilepath: string;
    }): Promise<string | undefined> {
        const content = await readFile(absoluteFilepath, "utf-8");

        const deterministic = this.tryDeterministicFix({ error, content });
        if (deterministic != null) {
            return formatInlineDiff({
                original: content,
                patched: deterministic.patched,
                filepath: absoluteFilepath
            });
        }

        if (error.fix != null) {
            // Fix hint present but `before` text absent — nothing to preview.
            return undefined;
        }

        const resolution = await this.resolveProvider();
        if (!resolution.ok) {
            return undefined;
        }

        let patched: string;
        try {
            patched = await resolution.client.complete(buildPrompt({ error, content, absoluteFilepath }));
        } catch {
            return undefined;
        }

        patched = stripCodeFences(patched);
        if (patched.trim() === content.trim()) {
            return undefined;
        }

        return formatInlineDiff({ original: content, patched, filepath: absoluteFilepath });
    }

    /**
     * Try a literal string-replace based on the structured fix hint.
     * Returns `undefined` when no fix is suggested or the `before` text is
     * not present in the file.
     */
    private tryDeterministicFix({
        error,
        content
    }: {
        error: MdxParseError;
        content: string;
    }): { patched: string; fix: { before: string; after: string } } | undefined {
        if (error.fix == null) {
            return undefined;
        }
        const { before, after } = error.fix;
        if (before === "" || !content.includes(before)) {
            return undefined;
        }
        return { patched: content.replace(before, after), fix: { before, after } };
    }

    private async resolveProvider(): Promise<AiProviderResolution> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();
        return resolveAiProvider({ aiConfig: data.ai }); // async — reads keyring for API keys
    }
}

// ---------------------------------------------------------------------------
// AI prompt construction
// ---------------------------------------------------------------------------

/**
 * Build the prompt sent to whichever provider is configured. The prompt is
 * provider-agnostic: it asks for the corrected file contents only, no
 * explanation or markdown wrappers. Both Anthropic and OpenAI honour this
 * instruction reliably; we still strip code fences as a safety net.
 */
function buildPrompt({
    error,
    content,
    absoluteFilepath
}: {
    error: MdxParseError;
    content: string;
    absoluteFilepath: string;
}): string {
    const filename = path.basename(absoluteFilepath);

    const sourceContext =
        error.sourceLines.length > 0
            ? error.sourceLines.map((l) => `${l.lineNumber}: ${l.content}`).join("\n")
            : `line ${error.line ?? "?"}`;

    const fixHint =
        error.fix != null
            ? `\nSuggested fix: ${error.fix.before} → ${error.fix.after}\n` +
              `(Apply this suggestion or a better equivalent if you spot related issues.)`
            : "";

    return (
        `You are an MDX/Markdown fixer. Fix the parse error described below in ${filename}.\n` +
        `Return ONLY the corrected full file content — no explanation, no markdown fences, no code block wrappers.\n\n` +
        `Error [${error.code.code}]: ${error.code.title}\n` +
        `Message: ${error.rawMessage}\n` +
        fixHint +
        `\nSource context:\n${sourceContext}\n\n` +
        `Full file content:\n${content}`
    );
}

/**
 * Models sometimes wrap their response in a markdown code fence even when told
 * not to. Strip it if present.
 */
function stripCodeFences(text: string): string {
    const fenced = /^```(?:mdx|markdown|md)?\n([\s\S]*?)```\s*$/.exec(text.trim());
    return fenced != null ? (fenced[1] ?? text) : text;
}

function formatInlineDiff({
    original,
    patched,
    filepath
}: {
    original: string;
    patched: string;
    filepath: string;
}): string {
    const originalLines = original.split("\n");
    const patchedLines = patched.split("\n");
    const filename = path.relative(process.cwd(), filepath);

    const diffLines: string[] = [`${chalk.bold("diff")} ${chalk.cyan(filename)}`];

    const maxLines = Math.max(originalLines.length, patchedLines.length);
    let hasDiff = false;

    for (let i = 0; i < maxLines; i++) {
        const orig = originalLines[i];
        const next = patchedLines[i];
        if (orig !== next) {
            hasDiff = true;
            const lineNum = String(i + 1).padStart(4, " ");
            if (orig != null) {
                diffLines.push(chalk.red(`${lineNum} - ${orig}`));
            }
            if (next != null) {
                diffLines.push(chalk.green(`${lineNum} + ${next}`));
            }
        }
    }

    return hasDiff ? diffLines.join("\n") : "(no changes)";
}

function truncate(s: string, max = 60): string {
    return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

// Re-export for callers that want the client type directly.
export type { AiProviderClient };
