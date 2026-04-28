import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestContext } from "../../../__test__/utils/createTestContext.js";
import { InitCommand } from "../command.js";

function buildArgs({ params, org }: { tmp: string; params?: string; org?: string }): InitCommand.Args {
    return {
        "log-level": "info",
        yes: false,
        ...(params != null ? { params } : {}),
        ...(org != null ? { org } : {})
    } as InitCommand.Args;
}

describe("InitCommand --params", () => {
    let tmp: string;

    beforeEach(async () => {
        tmp = join(tmpdir(), `fern-init-test-${randomUUID()}`);
        await mkdir(tmp, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmp, { recursive: true, force: true });
    });

    it("writes fern.yml from inline JSON input without running the wizard", async () => {
        const context = await createTestContext({ cwd: AbsoluteFilePath.of(tmp) });
        const cmd = new InitCommand();

        const payload = {
            org: "acme",
            api: { specs: [{ openapi: "./openapi.yml" }] },
            sdks: {
                targets: {
                    typescript: { output: "./sdks/typescript" }
                }
            }
        };

        await cmd.handle(context, buildArgs({ tmp, params: JSON.stringify(payload) }));

        const written = await readFile(join(tmp, "fern.yml"), "utf-8");
        expect(written).toContain("org: acme");
        expect(written).toContain("./sdks/typescript");
        expect(written).toContain("yaml-language-server: $schema=");
    });

    it("reads JSON input from a file when prefixed with '@' (curl-style)", async () => {
        const context = await createTestContext({ cwd: AbsoluteFilePath.of(tmp) });
        const cmd = new InitCommand();

        const payload = {
            org: "acme-file",
            api: { specs: [{ openapi: "./openapi.yml" }] }
        };
        const payloadPath = join(tmp, "payload.json");
        await writeFile(payloadPath, JSON.stringify(payload), "utf-8");

        await cmd.handle(context, buildArgs({ tmp, params: "@payload.json" }));

        const written = await readFile(join(tmp, "fern.yml"), "utf-8");
        expect(written).toContain("org: acme-file");
    });

    it("rejects --params combined with --org", async () => {
        const context = await createTestContext({ cwd: AbsoluteFilePath.of(tmp) });
        const cmd = new InitCommand();

        await expect(
            cmd.handle(
                context,
                buildArgs({
                    tmp,
                    org: "other",
                    params: JSON.stringify({ org: "acme", api: { specs: [{ openapi: "./x" }] } })
                })
            )
        ).rejects.toMatchObject({
            message: expect.stringContaining("--params cannot be combined with --org"),
            code: CliError.Code.ConfigError
        });
    });

    it("rejects a --params payload that does not match the fern-yml schema", async () => {
        const context = await createTestContext({ cwd: AbsoluteFilePath.of(tmp) });
        const cmd = new InitCommand();

        await expect(
            cmd.handle(context, buildArgs({ tmp, params: JSON.stringify({ org: 123 }) }))
        ).rejects.toMatchObject({
            message: expect.stringContaining("did not match the fern-yml schema"),
            code: CliError.Code.ValidationError
        });
    });

    it("refuses to overwrite an existing fern.yml", async () => {
        const context = await createTestContext({ cwd: AbsoluteFilePath.of(tmp) });
        const cmd = new InitCommand();

        await writeFile(join(tmp, "fern.yml"), "org: existing\n", "utf-8");

        await expect(
            cmd.handle(
                context,
                buildArgs({
                    tmp,
                    params: JSON.stringify({ org: "new", api: { specs: [{ openapi: "./x" }] } })
                })
            )
        ).rejects.toMatchObject({
            code: CliError.Code.ConfigError
        });
    });
});
