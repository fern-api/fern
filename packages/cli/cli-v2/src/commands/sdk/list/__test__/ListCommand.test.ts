import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../../__test__/utils/createTestContext.js";
import type { Target } from "../../../../sdk/config/Target.js";
import { ListCommand } from "../command.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTarget(lang: Target["lang"], overrides: Partial<Omit<Target, "lang">> = {}): Target {
    return {
        name: lang,
        api: "api",
        image: `fernapi/fern-${lang}-sdk`,
        registry: undefined,
        lang,
        version: "1.0.0",
        sourceLocation: { file: "fern.yml", range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } } },
        output: { path: `./generated/${lang}` },
        ...overrides
    } as unknown as Target;
}

type InternalListCommand = {
    parseLanguageFilter(value: string): string;
    parseTypeFilter(value: string): string;
    filterConfiguredTargets(opts: {
        targets: Target[];
        languageFilter: string | undefined;
        typeFilter: string | undefined;
    }): Target[];
    formatOutput(target: Target): string;
    printHuman(opts: {
        context: Awaited<ReturnType<typeof createTestContextWithCapture>>["context"];
        configuredTargets: Target[];
        availableGenerators: never[];
        languageFilter: string | undefined;
        typeFilter: string | undefined;
    }): void;
    printJson(opts: {
        context: Awaited<ReturnType<typeof createTestContextWithCapture>>["context"];
        configuredTargets: Target[];
        availableGenerators: never[];
        languageFilter: string | undefined;
        typeFilter: string | undefined;
    }): void;
};

function internals(cmd: ListCommand): InternalListCommand {
    return cmd as unknown as InternalListCommand;
}

// ---------------------------------------------------------------------------
// parseLanguageFilter
// ---------------------------------------------------------------------------

describe("ListCommand.parseLanguageFilter", () => {
    const cmd = new ListCommand();

    it("accepts valid lowercase language", () => {
        expect(internals(cmd).parseLanguageFilter("typescript")).toBe("typescript");
    });

    it("accepts valid uppercase language (case-insensitive)", () => {
        expect(internals(cmd).parseLanguageFilter("TypeScript")).toBe("typescript");
    });

    it("throws CliError for unsupported language", () => {
        expect(() => internals(cmd).parseLanguageFilter("cobol")).toThrow(CliError);
    });

    it("error message includes the bad value", () => {
        expect(() => internals(cmd).parseLanguageFilter("cobol")).toThrow('"cobol" is not a supported language');
    });
});

// ---------------------------------------------------------------------------
// parseTypeFilter
// ---------------------------------------------------------------------------

describe("ListCommand.parseTypeFilter", () => {
    const cmd = new ListCommand();

    it.each(["sdk", "model", "server"])("accepts valid type '%s'", (type) => {
        expect(internals(cmd).parseTypeFilter(type)).toBe(type);
    });

    it("accepts uppercase type (case-insensitive)", () => {
        expect(internals(cmd).parseTypeFilter("SDK")).toBe("sdk");
    });

    it("throws CliError for unsupported type", () => {
        expect(() => internals(cmd).parseTypeFilter("webhook")).toThrow(CliError);
    });

    it("error message includes the bad value", () => {
        expect(() => internals(cmd).parseTypeFilter("webhook")).toThrow('"webhook" is not a supported generator type');
    });
});

// ---------------------------------------------------------------------------
// filterConfiguredTargets
// ---------------------------------------------------------------------------

describe("ListCommand.filterConfiguredTargets", () => {
    const cmd = new ListCommand();
    const targets = [makeTarget("typescript"), makeTarget("python"), makeTarget("go")];

    it("returns all targets when no filters applied", () => {
        expect(
            internals(cmd).filterConfiguredTargets({ targets, languageFilter: undefined, typeFilter: undefined })
        ).toHaveLength(3);
    });

    it("filters by language", () => {
        const result = internals(cmd).filterConfiguredTargets({
            targets,
            languageFilter: "typescript",
            typeFilter: undefined
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.lang).toBe("typescript");
    });

    it("returns empty array when --type is not 'sdk'", () => {
        expect(
            internals(cmd).filterConfiguredTargets({ targets, languageFilter: undefined, typeFilter: "model" })
        ).toHaveLength(0);
        expect(
            internals(cmd).filterConfiguredTargets({ targets, languageFilter: undefined, typeFilter: "server" })
        ).toHaveLength(0);
    });

    it("returns all targets when --type is 'sdk'", () => {
        expect(
            internals(cmd).filterConfiguredTargets({ targets, languageFilter: undefined, typeFilter: "sdk" })
        ).toHaveLength(3);
    });

    it("applies language and type filters together", () => {
        const result = internals(cmd).filterConfiguredTargets({
            targets,
            languageFilter: "python",
            typeFilter: "sdk"
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.lang).toBe("python");
    });
});

// ---------------------------------------------------------------------------
// formatOutput
// ---------------------------------------------------------------------------

describe("ListCommand.formatOutput", () => {
    const cmd = new ListCommand();

    it("returns path when no git config", () => {
        expect(internals(cmd).formatOutput(makeTarget("typescript", { output: { path: "./out" } }))).toBe("./out");
    });

    it("returns './' when neither path nor git is configured", () => {
        expect(internals(cmd).formatOutput(makeTarget("typescript", { output: {} }))).toBe("./");
    });

    it("returns git.repository for GitHub repository output", () => {
        const target = makeTarget("typescript", {
            output: { git: { repository: "acme/my-sdk", mode: "push" } as never }
        });
        expect(internals(cmd).formatOutput(target)).toBe("acme/my-sdk");
    });

    it("returns git.uri for self-hosted git output", () => {
        const target = makeTarget("typescript", {
            output: { git: { uri: "git@github.internal/acme/my-sdk", mode: "push" } as never }
        });
        expect(internals(cmd).formatOutput(target)).toBe("git@github.internal/acme/my-sdk");
    });
});

// ---------------------------------------------------------------------------
// printHuman — output messages
// ---------------------------------------------------------------------------

describe("ListCommand printHuman messages", () => {
    const cmd = new ListCommand();

    it("shows informative message when --type model is used (not misleading 'no match')", async () => {
        const { context, getStderr } = await createTestContextWithCapture({
            cwd: AbsoluteFilePath.of("/tmp")
        });

        internals(cmd).printHuman({
            context,
            configuredTargets: [makeTarget("typescript"), makeTarget("python")],
            availableGenerators: [],
            languageFilter: undefined,
            typeFilter: "model"
        });

        const output = getStderr();
        expect(output).toContain("always of type 'sdk'");
        expect(output).not.toContain("No configured SDK targets match the given filters");
    });

    it("shows 'No SDK targets configured' when no targets and no filters", async () => {
        const { context, getStderr } = await createTestContextWithCapture({
            cwd: AbsoluteFilePath.of("/tmp")
        });

        internals(cmd).printHuman({
            context,
            configuredTargets: [],
            availableGenerators: [],
            languageFilter: undefined,
            typeFilter: undefined
        });

        expect(getStderr()).toContain("No SDK targets configured");
    });
});

// ---------------------------------------------------------------------------
// printJson — output structure
// ---------------------------------------------------------------------------

describe("ListCommand.printJson", () => {
    const cmd = new ListCommand();

    it("outputs valid JSON with 'configured' and 'available' keys", async () => {
        const { context, getStdout } = await createTestContextWithCapture({
            cwd: AbsoluteFilePath.of("/tmp")
        });

        internals(cmd).printJson({
            context,
            configuredTargets: [makeTarget("typescript")],
            availableGenerators: [],
            languageFilter: undefined,
            typeFilter: undefined
        });

        const parsed = JSON.parse(getStdout()) as { configured: unknown[]; available: unknown[] };
        expect(parsed).toHaveProperty("configured");
        expect(parsed).toHaveProperty("available");
        expect(parsed.configured).toHaveLength(1);
        expect(parsed.available).toHaveLength(0);
    });

    it("configured entries include expected fields", async () => {
        const { context, getStdout } = await createTestContextWithCapture({
            cwd: AbsoluteFilePath.of("/tmp")
        });

        internals(cmd).printJson({
            context,
            configuredTargets: [makeTarget("python", { groups: ["staging"] })],
            availableGenerators: [],
            languageFilter: undefined,
            typeFilter: undefined
        });

        const parsed = JSON.parse(getStdout()) as {
            configured: Array<{ name: string; language: string; version: string; groups: string[] }>;
        };
        const entry = parsed.configured[0];
        expect(entry?.name).toBe("python");
        expect(entry?.language).toBe("python");
        expect(entry?.version).toBe("1.0.0");
        expect(entry?.groups).toEqual(["staging"]);
    });
});
