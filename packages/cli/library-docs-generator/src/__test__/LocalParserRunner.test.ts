import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { TaskContext } from "@fern-api/task-context";

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/docker-utils", () => ({
    runContainer: vi.fn()
}));

import { runContainer } from "@fern-api/docker-utils";
import { runLocalParser } from "../LocalParserRunner.js";

function makeContext(): TaskContext {
    return {
        logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() }
    } as unknown as TaskContext;
}

function bindFor(binds: string[], suffix: string): string {
    return (binds.find((b) => b.endsWith(suffix)) ?? "").slice(0, -suffix.length);
}

describe("runLocalParser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.FERN_PYTHON_PARSER_IMAGE;
        delete process.env.FERN_CPP_PARSER_IMAGE;
    });

    it("runs the CLI entry point, mounts /repo + /output + config, and returns the unwrapped ir", async () => {
        let writtenConfig: unknown;
        (runContainer as Mock).mockImplementation(async ({ binds }: { binds: string[] }) => {
            const configPath = bindFor(binds, ":/input/config.json:ro");
            writtenConfig = JSON.parse(await readFile(configPath, "utf-8"));

            const outputDir = bindFor(binds, ":/output");
            await writeFile(
                join(outputDir, "ir.json"),
                JSON.stringify({ ir: { rootModule: { name: "sdk" } }, metadata: { packageName: "sdk" } })
            );
        });

        const ir = await runLocalParser({
            context: makeContext(),
            sourcePath: AbsoluteFilePath.of("/tmp/src"),
            language: "PYTHON",
            config: { packagePath: "pkg", sourceUrl: "https://github.com/acme/sdk" }
        });

        // The IR is unwrapped from the `{ ir, metadata }` envelope the parser writes.
        expect(ir).toEqual({ rootModule: { name: "sdk" } });

        const call = (runContainer as Mock).mock.calls[0]?.[0];
        // Without this command the image boots the Lambda handler instead of the CLI.
        expect(call.args).toEqual(["python", "-m", "src.cli_entrypoint"]);
        // Pinned, version-tagged image (exact version asserted by the env-override test below).
        expect(call.imageName).toMatch(/^ghcr\.io\/fern-api\/python-library-docs-parser:/);
        expect(call.binds).toContain("/tmp/src:/repo:ro");
        // `undefined` fields (e.g. doxyfileContent for Python) are dropped by JSON.stringify.
        expect(writtenConfig).toEqual({ packagePath: "pkg", sourceUrl: "https://github.com/acme/sdk" });
    });

    it("uses the C++ image and forwards doxyfileContent", async () => {
        let writtenConfig: unknown;
        (runContainer as Mock).mockImplementation(async ({ binds }: { binds: string[] }) => {
            const configPath = bindFor(binds, ":/input/config.json:ro");
            writtenConfig = JSON.parse(await readFile(configPath, "utf-8"));

            const outputDir = bindFor(binds, ":/output");
            await writeFile(join(outputDir, "ir.json"), JSON.stringify({ ir: { rootNamespace: { name: "acme" } } }));
        });

        const ir = await runLocalParser({
            context: makeContext(),
            sourcePath: AbsoluteFilePath.of("/tmp/cpp"),
            language: "CPP",
            config: { doxyfileContent: "PROJECT_NAME = acme", sourceUrl: "https://github.com/acme/cpp" }
        });

        expect(ir).toEqual({ rootNamespace: { name: "acme" } });
        const call = (runContainer as Mock).mock.calls[0]?.[0];
        expect(call.imageName).toMatch(/^ghcr\.io\/fern-api\/cpp-library-docs-parser:/);
        expect(writtenConfig).toEqual({
            doxyfileContent: "PROJECT_NAME = acme",
            sourceUrl: "https://github.com/acme/cpp"
        });
    });

    it("honors the per-language image override env var", async () => {
        process.env.FERN_PYTHON_PARSER_IMAGE = "python-library-docs-parser:local";
        (runContainer as Mock).mockImplementation(async ({ binds }: { binds: string[] }) => {
            await writeFile(join(bindFor(binds, ":/output"), "ir.json"), JSON.stringify({ ir: { rootModule: {} } }));
        });

        await runLocalParser({
            context: makeContext(),
            sourcePath: AbsoluteFilePath.of("/tmp/src"),
            language: "PYTHON",
            config: {}
        });

        const call = (runContainer as Mock).mock.calls[0]?.[0];
        expect(call.imageName).toBe("python-library-docs-parser:local");
    });

    it("throws when the container produces no ir.json", async () => {
        (runContainer as Mock).mockResolvedValue(undefined);

        await expect(
            runLocalParser({
                context: makeContext(),
                sourcePath: AbsoluteFilePath.of("/tmp/src"),
                language: "PYTHON",
                config: {}
            })
        ).rejects.toThrow(/did not produce IR/);
    });
});
