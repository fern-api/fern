import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { randomUUID } from "crypto";
import { readFile, rm } from "fs/promises";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CompileCommand } from "../commands/api/compile/command.js";
import { createTestContextWithCapture } from "./utils/createTestContext.js";

const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "fixtures"));
const SIMPLE_API_DIR = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
const INVALID_API_DIR = AbsoluteFilePath.of(join(FIXTURES_DIR, "invalid-api"));

function baseArgs(overrides?: Partial<CompileCommand.Args>): CompileCommand.Args {
    return {
        "log-level": "info",
        dynamic: false,
        "disable-examples": true,
        ...overrides
    };
}

describe("fern api compile", () => {
    const cmd = new CompileCommand();

    describe("--output <file>", () => {
        let outputPath: string;

        beforeEach(() => {
            outputPath = join(SIMPLE_API_DIR, `ir-test-${randomUUID()}.json`);
        });

        afterEach(async () => {
            try {
                await rm(outputPath, { force: true });
            } catch {
                // ignore
            }
        });

        it("writes valid IR JSON to the specified file", async () => {
            const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            expect(await doesPathExist(AbsoluteFilePath.of(outputPath))).toBe(true);

            const content = await readFile(outputPath, "utf-8");
            const ir = JSON.parse(content);
            expect(ir.apiName).toBeDefined();
        });

        it("writes no human-readable output to stderr at default log level", async () => {
            const { context, getStderr } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            expect(getStderr()).toBe("");
        });
    });

    describe("no --output (validate only)", () => {
        it("produces no stdout output", async () => {
            const { context, getStdout } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs());

            expect(getStdout()).toBe("");
        });

        it("produces no stderr output at default log level", async () => {
            const { context, getStderr } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs());

            expect(getStderr()).toBe("");
        });
    });

    describe("--api flag", () => {
        let outputPath: string;

        beforeEach(() => {
            outputPath = join(SIMPLE_API_DIR, `ir-test-${randomUUID()}.json`);
        });

        afterEach(async () => {
            try {
                await rm(outputPath, { force: true });
            } catch {
                // ignore
            }
        });

        it("compiles a specific API by name", async () => {
            const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ api: "api", output: outputPath }));

            const content = await readFile(outputPath, "utf-8");
            const ir = JSON.parse(content);
            expect(ir.apiName).toBeDefined();
        });

        it("throws CliError for a non-existent API name", async () => {
            const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await expect(cmd.handle(context, baseArgs({ api: "nonexistent" }))).rejects.toThrow(
                "API 'nonexistent' not found"
            );
        });
    });

    describe("validation errors", () => {
        it("throws CliError with error details for an invalid API", async () => {
            const { context, getStderr } = await createTestContextWithCapture({ cwd: INVALID_API_DIR });
            await expect(cmd.handle(context, baseArgs())).rejects.toThrow(CliError);

            const stderr = getStderr();
            expect(stderr.length).toBeGreaterThan(0);
        });
    });
});
