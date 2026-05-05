import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { FernRcSchemaLoader } from "../../config/fern-rc/FernRcSchemaLoader.js";
import type { MdxParseError } from "../errors/MdxParseError.js";

export declare namespace MdxFixer {
    export interface ApplyResult {
        /** Whether a fix was actually applied */
        applied: boolean;
        /** Human-readable description of what changed */
        summary: string;
        /** The Claude model that produced the fix, when AI was used */
        model?: string;
    }
}

/**
 * Applies AI-powered fixes to MDX/Markdown files via the Anthropic API.
 *
 * The `fix:` hint shown in the error output is passed to Claude as guidance,
 * but Claude reads the full file and error context to produce the actual fix —
 * this is a real AI fix, not a regex string replacement.
 *
 * Requires an Anthropic API key, either via:
 *   - ANTHROPIC_API_KEY environment variable
 *   - ai.anthropic_api_key in ~/.fernrc  (set via: fern config ai set-key <key>)
 */
export class MdxFixer {
    /**
     * Apply an AI-powered fix for an MDX parse error.
     * Always calls the Anthropic API — Claude reads the full file and error
     * context to produce the corrected content.
     */
    public async applyFix({
        error,
        absoluteFilepath
    }: {
        error: MdxParseError;
        absoluteFilepath: string;
    }): Promise<MdxFixer.ApplyResult> {
        const apiKey = await this.resolveApiKey();
        if (apiKey == null) {
            return this.noKeyResult();
        }

        const content = await readFile(absoluteFilepath, "utf-8");

        let patched: string;
        try {
            patched = await callAnthropic({ prompt: buildPrompt({ error, content, absoluteFilepath }), apiKey });
        } catch (fetchError) {
            const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
            return { applied: false, summary: `AI fix failed: ${message}` };
        }

        // Strip accidental markdown code fences Claude might wrap the response in.
        patched = stripCodeFences(patched);

        if (patched.trim() === content.trim()) {
            return { applied: false, summary: "AI returned the same content — no changes written." };
        }

        await writeFile(absoluteFilepath, patched, "utf-8");
        return { applied: true, summary: "patched the file.", model: CLAUDE_MODEL };
    }

    /**
     * Ask Claude for a fix and return a displayable diff without writing anything.
     * Returns undefined if no API key is configured or Claude made no changes.
     */
    public async previewFix({
        error,
        absoluteFilepath
    }: {
        error: MdxParseError;
        absoluteFilepath: string;
    }): Promise<string | undefined> {
        const apiKey = await this.resolveApiKey();
        if (apiKey == null) {
            return undefined;
        }

        const content = await readFile(absoluteFilepath, "utf-8");

        let patched: string;
        try {
            patched = await callAnthropic({ prompt: buildPrompt({ error, content, absoluteFilepath }), apiKey });
        } catch {
            return undefined;
        }

        patched = stripCodeFences(patched);

        if (patched.trim() === content.trim()) {
            return undefined;
        }

        return formatInlineDiff({ original: content, patched, filepath: absoluteFilepath });
    }

    private async resolveApiKey(): Promise<string | undefined> {
        const envKey = process.env["ANTHROPIC_API_KEY"];
        if (envKey != null && envKey !== "") {
            return envKey;
        }
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();
        const rcKey = data.ai?.anthropic_api_key;
        return rcKey != null && rcKey !== "" ? rcKey : undefined;
    }

    private noKeyResult(): MdxFixer.ApplyResult {
        return {
            applied: false,
            summary:
                "No Anthropic API key found. Set one with:\n" +
                chalk.dim("  fern config ai set-key <key>") +
                "\n" +
                chalk.dim("  or export ANTHROPIC_API_KEY=<key>")
        };
    }
}

/**
 * Builds the prompt sent to Claude. Includes:
 *   - the structured error (code, title, raw message)
 *   - source lines with caret position so Claude sees exactly what's broken
 *   - the deterministic fix hint when available (gives Claude a strong signal)
 *   - the full file content to rewrite
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
 * Claude sometimes wraps its response in a markdown code fence even when told not to.
 * Strip it if present.
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

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

/**
 * Minimal Anthropic Messages API call — avoids importing the full SDK so we
 * don't add a hard runtime dependency just for this one feature.
 */
async function callAnthropic({ prompt, apiKey }: { prompt: string; apiKey: string }): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        })
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${body}`);
    }

    const json = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
    };

    const text = json.content.find((block) => block.type === "text")?.text;
    if (text == null) {
        throw new Error("Anthropic API returned no text content");
    }
    return text;
}
