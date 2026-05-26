import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { E0301_JSX_ATTRIBUTE_NEEDS_BRACES, E0303_MISMATCHED_CLOSING_TAG } from "../docs/errors/MdxErrorCode.js";
import { MdxParseError } from "../docs/errors/MdxParseError.js";
import { MdxFixer } from "../docs/fixer/MdxFixer.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmpFile(name: string): string {
    return path.join(tmpdir(), `mdx-fixer-test-${process.pid}-${name}`);
}

function makeError(overrides: Partial<MdxParseError.Args> = {}): MdxParseError {
    return new MdxParseError({
        code: E0301_JSX_ATTRIBUTE_NEEDS_BRACES,
        displayRelativeFilepath: "docs/pages/test.mdx",
        line: 3,
        column: 5,
        rawMessage: "Unexpected character `<` in attribute",
        sourceLines: [{ lineNumber: 3, content: '  icon=<Icon name="star" />', isErrorLine: true }],
        fix: { before: 'icon=<Icon name="star" />', after: 'icon={<Icon name="star" />}' },
        ...overrides
    });
}

// ---------------------------------------------------------------------------
// applyFix — deterministic path
// ---------------------------------------------------------------------------

describe("MdxFixer.applyFix (deterministic)", () => {
    let tmpPath: string;

    beforeEach(() => {
        tmpPath = makeTmpFile("apply.mdx");
    });

    afterEach(async () => {
        try {
            const { unlink } = await import("fs/promises");
            await unlink(tmpPath);
        } catch {
            // ignore if already gone
        }
    });

    it("replaces the offending text and writes the file", async () => {
        const original = `# Hello\n\n<MyComponent icon=<Icon name="star" /> />\n`;
        await writeFile(tmpPath, original, "utf-8");

        const fixer = new MdxFixer();
        const result = await fixer.applyFix({ error: makeError(), absoluteFilepath: tmpPath });

        expect(result.applied).toBe(true);

        const written = await readFile(tmpPath, "utf-8");
        expect(written).toContain('icon={<Icon name="star" />}');
        expect(written).not.toContain('icon=<Icon name="star" />');
    });

    it("returns applied=false when the fix text is not present in the file", async () => {
        await writeFile(tmpPath, "# Nothing to fix here\n", "utf-8");

        const fixer = new MdxFixer();
        const result = await fixer.applyFix({ error: makeError(), absoluteFilepath: tmpPath });

        expect(result.applied).toBe(false);
        expect(result.summary).toMatch(/Could not locate/);
    });

    it("returns applied=false when error has no fix suggestion", async () => {
        await writeFile(tmpPath, "<Foo></Bar>\n", "utf-8");

        const error = makeError({ fix: undefined, code: E0303_MISMATCHED_CLOSING_TAG });
        const fixer = new MdxFixer();

        // No ANTHROPIC_API_KEY set → AI path returns applied=false
        const saved = process.env["ANTHROPIC_API_KEY"];
        delete process.env["ANTHROPIC_API_KEY"];
        try {
            const result = await fixer.applyFix({ error, absoluteFilepath: tmpPath });
            expect(result.applied).toBe(false);
            expect(result.summary).toMatch(/ANTHROPIC_API_KEY/);
        } finally {
            if (saved != null) {
                process.env["ANTHROPIC_API_KEY"] = saved;
            }
        }
    });
});

// ---------------------------------------------------------------------------
// previewFix
// ---------------------------------------------------------------------------

describe("MdxFixer.previewFix", () => {
    let tmpPath: string;

    beforeEach(() => {
        tmpPath = makeTmpFile("preview.mdx");
    });

    afterEach(async () => {
        try {
            const { unlink } = await import("fs/promises");
            await unlink(tmpPath);
        } catch {
            // ignore
        }
    });

    it("returns a diff string when the fix text is present", async () => {
        const original = `# Hello\n\n<MyComponent icon=<Icon name="star" /> />\n`;
        await writeFile(tmpPath, original, "utf-8");

        const fixer = new MdxFixer();
        const diff = await fixer.previewFix({ error: makeError(), absoluteFilepath: tmpPath });

        expect(diff).toBeDefined();
        expect(diff).toMatch(/-.*icon=<Icon/);
        expect(diff).toMatch(/\+.*icon=\{<Icon/);
    });

    it("returns undefined when fix text is not found in the file", async () => {
        // The fix `before` text is absent from the file, so the deterministic
        // path returns undefined. With error.fix set we never fall back to AI.
        await writeFile(tmpPath, "# Nothing here\n", "utf-8");

        const fixer = new MdxFixer();
        const diff = await fixer.previewFix({ error: makeError(), absoluteFilepath: tmpPath });

        expect(diff).toBeUndefined();
    });

    it("returns undefined when error has no fix suggestion and no AI provider configured", async () => {
        await writeFile(tmpPath, "<Foo></Bar>\n", "utf-8");

        const error = makeError({ fix: undefined });
        const fixer = new MdxFixer();

        // With no `fix` hint we'd fall back to the AI provider. Disabling all
        // provider keys forces previewFix to return undefined.
        const savedAnthropic = process.env["ANTHROPIC_API_KEY"];
        const savedOpenAi = process.env["OPENAI_API_KEY"];
        delete process.env["ANTHROPIC_API_KEY"];
        delete process.env["OPENAI_API_KEY"];
        try {
            const diff = await fixer.previewFix({ error, absoluteFilepath: tmpPath });
            expect(diff).toBeUndefined();
        } finally {
            if (savedAnthropic != null) {
                process.env["ANTHROPIC_API_KEY"] = savedAnthropic;
            }
            if (savedOpenAi != null) {
                process.env["OPENAI_API_KEY"] = savedOpenAi;
            }
        }
    });
});

// ---------------------------------------------------------------------------
// isClaudeCodeSession
// ---------------------------------------------------------------------------

describe("isClaudeCodeSession", () => {
    it("returns true when CLAUDE_CODE_ENTRYPOINT is set", async () => {
        const { isClaudeCodeSession } = await import("../context/isClaudeCodeSession.js");
        const saved = process.env["CLAUDE_CODE_ENTRYPOINT"];
        process.env["CLAUDE_CODE_ENTRYPOINT"] = "cli";
        try {
            expect(isClaudeCodeSession()).toBe(true);
        } finally {
            if (saved != null) {
                process.env["CLAUDE_CODE_ENTRYPOINT"] = saved;
            } else {
                delete process.env["CLAUDE_CODE_ENTRYPOINT"];
            }
        }
    });

    it("returns false when CLAUDE_CODE_ENTRYPOINT is not set", async () => {
        const { isClaudeCodeSession } = await import("../context/isClaudeCodeSession.js");
        const saved = process.env["CLAUDE_CODE_ENTRYPOINT"];
        delete process.env["CLAUDE_CODE_ENTRYPOINT"];
        try {
            expect(isClaudeCodeSession()).toBe(false);
        } finally {
            if (saved != null) {
                process.env["CLAUDE_CODE_ENTRYPOINT"] = saved;
            }
        }
    });
});
