import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { readFile, rm } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ExportCommand } from "../commands/api/export/command.js";
import { CliError } from "../errors/CliError.js";
import { createTestContextWithCapture } from "./utils/createTestContext.js";

const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "fixtures"));
const SIMPLE_API_DIR = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
const INVALID_API_DIR = AbsoluteFilePath.of(join(FIXTURES_DIR, "invalid-api"));

function baseArgs(overrides?: Partial<ExportCommand.Args>): ExportCommand.Args {
    return {
        "log-level": "info",
        output: "output.json",
        indent: 2,
        ...overrides
    };
}

describe("fern api export", () => {
    const cmd = new ExportCommand();
    let outputPath: string;

    beforeEach(() => {
        const ext = outputPath?.endsWith(".yaml") ? "yaml" : "json";
        outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.${ext}`);
    });

    afterEach(async () => {
        try {
            await rm(outputPath, { force: true });
        } catch {
            // ignore
        }
    });

    describe("--output <file.json>", () => {
        it("writes valid OpenAPI JSON to the specified file", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.json`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            expect(await doesPathExist(AbsoluteFilePath.of(outputPath))).toBe(true);

            const content = await readFile(outputPath, "utf-8");
            const spec = JSON.parse(content);
            expect(spec.openapi).toBe("3.0.1");
            expect(spec.info).toBeDefined();
            expect(spec.info.title).toBeDefined();
            expect(spec.paths).toBeDefined();
            expect(spec.components).toBeDefined();
            expect(spec.components.schemas).toBeDefined();
        });

        it("respects custom indent", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.json`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath, indent: 4 }));

            const content = await readFile(outputPath, "utf-8");
            expect(content).toContain("    ");
            expect(() => JSON.parse(content)).not.toThrow();
        });
    });

    describe("--output <file.yaml>", () => {
        it("writes valid OpenAPI YAML to the specified file", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.yaml`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            expect(await doesPathExist(AbsoluteFilePath.of(outputPath))).toBe(true);

            const content = await readFile(outputPath, "utf-8");
            const spec = yaml.load(content) as Record<string, unknown>;
            expect(spec.openapi).toBe("3.0.1");
            expect(spec.info).toBeDefined();
            expect(spec.paths).toBeDefined();
            expect(spec.components).toBeDefined();
        });
    });

    describe("--api flag", () => {
        it("exports a specific API by name", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.json`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ api: "api", output: outputPath }));

            const content = await readFile(outputPath, "utf-8");
            const spec = JSON.parse(content);
            expect(spec.openapi).toBe("3.0.1");
        });

        it("throws CliError for a non-existent API name", async () => {
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await expect(cmd.handle(context, baseArgs({ api: "nonexistent" }))).rejects.toThrow(
                "API 'nonexistent' not found"
            );
        });
    });

    describe("validation errors", () => {
        it("throws CliError with error details for an invalid API", async () => {
            const { context, getStderr } = createTestContextWithCapture({ cwd: INVALID_API_DIR });
            await expect(cmd.handle(context, baseArgs())).rejects.toThrow(CliError);

            const stderr = getStderr();
            expect(stderr.length).toBeGreaterThan(0);
        });
    });

    describe("OpenAPI spec structure", () => {
        it("generates paths from the API definition", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.json`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            const content = await readFile(outputPath, "utf-8");
            const spec = JSON.parse(content);
            const paths = Object.keys(spec.paths);
            expect(paths.length).toBeGreaterThan(0);
        });

        it("generates component schemas from the API definition", async () => {
            outputPath = join(SIMPLE_API_DIR, `export-test-${randomUUID()}.json`);
            const { context } = createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
            await cmd.handle(context, baseArgs({ output: outputPath }));

            const content = await readFile(outputPath, "utf-8");
            const spec = JSON.parse(content);
            const schemas = Object.keys(spec.components.schemas);
            expect(schemas.length).toBeGreaterThan(0);
        });
    });
});
