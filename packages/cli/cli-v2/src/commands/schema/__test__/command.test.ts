import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../__test__/utils/createTestContext.js";
import { SchemaCommand } from "../command.js";

describe("fern schema", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-schema-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("prints the full fern.yml JSON Schema when no name is provided", async () => {
        const { context, getStdout, getStderr } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: true });

        expect(getStderr()).toBe("");

        const parsed = JSON.parse(getStdout());
        expect(parsed.type).toBe("object");
        expect(parsed.properties).toBeDefined();
        expect(parsed.properties.org).toBeDefined();
        expect(parsed.properties.sdks).toBeDefined();
        expect(parsed.required).toContain("org");
    });

    it("prints the sdks JSON Schema when requested", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: true, name: "sdks" });

        const parsed = JSON.parse(getStdout());
        expect(parsed.type).toBe("object");
        expect(parsed.properties.targets).toBeDefined();
        expect(parsed.required).toContain("targets");
    });

    it("prints the api JSON Schema when requested", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: true, name: "api" });

        const parsed = JSON.parse(getStdout());
        expect(parsed.type).toBe("object");
        expect(parsed.properties.specs).toBeDefined();
        expect(parsed.required).toContain("specs");
    });

    it("prints the sdks.targets JSON Schema (single target shape) when requested", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: true, name: "sdks.targets" });

        const parsed = JSON.parse(getStdout());
        expect(parsed).toBeDefined();
    });

    it("emits minified JSON when --no-pretty is set", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: false, name: "cli" });

        const raw = getStdout();
        // Minified output should not contain newlines inside the JSON payload.
        // The logger always appends a trailing newline, so trim before asserting.
        const trimmed = raw.trimEnd();
        expect(trimmed.includes("\n")).toBe(false);

        const parsed = JSON.parse(trimmed);
        expect(parsed.type).toBe("object");
        expect(parsed.properties.version).toBeDefined();
    });

    it("throws a helpful CliError for an unknown schema name", async () => {
        const { context } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await expect(
            cmd.handle(context, { "log-level": "info", pretty: true, name: "not-a-real-schema" })
        ).rejects.toMatchObject({
            message: expect.stringContaining("Unknown schema 'not-a-real-schema'"),
            code: CliError.Code.ConfigError
        });
    });

    it("does not require a workspace to exist", async () => {
        // testDir is an empty scratch directory — no fern.yml in sight.
        const { context, getStderr } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SchemaCommand();

        await cmd.handle(context, { "log-level": "info", pretty: true });

        expect(getStderr()).toBe("");
    });
});
