import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../../__test__/utils/createTestContext.js";
import type { Workspace } from "../../../../workspace/Workspace.js";
import { MigrateCommand } from "../command.js";

const SIMPLE_API_DIR = AbsoluteFilePath.of(join(__dirname, "../../../../__test__/fixtures/simple-api"));

function args(overrides: Partial<MigrateCommand.Args> = {}): MigrateCommand.Args {
    return {
        "log-level": "info",
        force: false,
        output: "-",
        strict: false,
        ...overrides
    };
}

describe("fern sdk migrate", () => {
    let temporaryDirectory: string;

    beforeEach(async () => {
        temporaryDirectory = await mkdtemp(join(tmpdir(), "fern-sdk-migrate-"));
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { force: true, recursive: true });
    });

    it("writes a deterministic multi-target SDK Config document", async () => {
        const output = join(temporaryDirectory, "sdk-config.json");
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });

        await new MigrateCommand().handle(context, args({ output }));

        const contents = await readFile(output, "utf-8");
        const sdkConfig = JSON.parse(contents) as {
            schemaVersion: string;
            targets: Array<{ generatorVersion?: string; language: string }>;
        };
        expect(contents.endsWith("\n")).toBe(true);
        expect(sdkConfig.schemaVersion).toBe("sdk-config/v1");
        expect(sdkConfig.targets).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ generatorVersion: "0.39.3", language: "typescript" }),
                expect.objectContaining({ generatorVersion: "4.3.10", language: "python" })
            ])
        );
    });

    it("writes only JSON to stdout", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });

        await new MigrateCommand().handle(context, args());

        const stdout = getStdout();
        expect(stdout.endsWith("\n")).toBe(true);
        expect(JSON.parse(stdout)).toMatchObject({ schemaVersion: "sdk-config/v1" });
    });

    it("preserves API facts and local publication settings", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        const api = workspace.apis.api;
        if (sdkConfig == null || api == null) {
            throw new Error("Expected SDK targets and an API in test workspace");
        }
        const targets = sdkConfig.targets.map((target, index) =>
            index === 0
                ? {
                      ...target,
                      publish: {
                          npm: {
                              packageName: "@acme/sdk",
                              url: "https://registry.npmjs.org"
                          }
                      }
                  }
                : target
        );
        const enrichedWorkspace: Workspace = {
            ...workspace,
            apis: {
                api: {
                    ...api,
                    defaultEnvironment: "production",
                    defaultUrl: "https://api.acme.test",
                    environments: { production: "https://api.acme.test" },
                    headers: { "X-API-Version": "2026-08-28" }
                }
            },
            sdks: { ...sdkConfig, targets }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => enrichedWorkspace });

        await new MigrateCommand().handle(context, args());

        const sdkConfigOutput = JSON.parse(getStdout()) as {
            api: unknown;
            targets: unknown[];
        };
        expect(sdkConfigOutput.api).toMatchObject({
            baseUrl: "https://api.acme.test",
            defaultEnvironment: "production",
            environments: [
                {
                    name: "production",
                    urls: [{ name: "default", url: "https://api.acme.test" }]
                }
            ],
            headers: [{ name: "X-API-Version", value: "2026-08-28" }]
        });
        expect(sdkConfigOutput.targets[0]).toMatchObject({
            package: { packageName: "@acme/sdk" },
            output: {
                delivery: "files",
                path: "./generated/typescript",
                publish: { registry: "npm", url: "https://registry.npmjs.org" }
            }
        });
    });

    it("uses ZIP delivery for publication-only targets", async () => {
        const { context, getStdout } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        const target = sdkConfig?.targets[0];
        if (sdkConfig == null || target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }
        const workspaceWithPublication: Workspace = {
            ...workspace,
            sdks: {
                ...sdkConfig,
                targets: [
                    {
                        ...target,
                        output: {},
                        publish: { npm: { packageName: "@acme/sdk" } }
                    }
                ]
            }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => workspaceWithPublication });

        await new MigrateCommand().handle(context, args());

        const sdkConfigOutput = JSON.parse(getStdout()) as { targets: unknown[] };
        expect(sdkConfigOutput.targets[0]).toMatchObject({
            package: { packageName: "@acme/sdk" },
            output: { delivery: "zip", publish: { registry: "npm" } }
        });
    });

    it("protects existing output unless --force is set", async () => {
        const output = join(temporaryDirectory, "sdk-config.json");
        await writeFile(output, "existing\n");
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const command = new MigrateCommand();

        await expect(command.handle(context, args({ output }))).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("already exists")
        );
        expect(await readFile(output, "utf-8")).toBe("existing\n");

        await command.handle(context, args({ force: true, output }));
        expect(JSON.parse(await readFile(output, "utf-8"))).toMatchObject({ schemaVersion: "sdk-config/v1" });
    });

    it("does not write output when --strict encounters a mapping diagnostic", async () => {
        const output = join(temporaryDirectory, "sdk-config.json");
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        if (sdkConfig == null) {
            throw new Error("Expected SDK targets in test workspace");
        }
        const targets = sdkConfig.targets.map((target, index) =>
            index === 0 ? { ...target, version: "latest" } : target
        );
        const workspaceWithTag: Workspace = { ...workspace, sdks: { ...sdkConfig, targets } };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => workspaceWithTag });

        await expect(new MigrateCommand().handle(context, args({ output, strict: true }))).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("strict mode")
        );
        await expect(readFile(output, "utf-8")).rejects.toSatisfy(
            (error) => error instanceof Error && "code" in error && error.code === "ENOENT"
        );
    });

    it("reports invalid Maven coordinates before strict mode rejects output", async () => {
        const output = join(temporaryDirectory, "sdk-config.json");
        const { context, getStderr } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        const target = sdkConfig?.targets[0];
        if (sdkConfig == null || target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }
        const workspaceWithInvalidCoordinate: Workspace = {
            ...workspace,
            sdks: {
                ...sdkConfig,
                targets: [
                    {
                        ...target,
                        image: "fernapi/fern-java-sdk",
                        lang: "java",
                        publish: { maven: { coordinate: ":artifact" } }
                    }
                ]
            }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", {
            value: async () => workspaceWithInvalidCoordinate
        });

        await expect(new MigrateCommand().handle(context, args({ output, strict: true }))).rejects.toSatisfy(
            (error) => error instanceof CliError && error.message.includes("strict mode")
        );
        expect(getStderr()).toContain("Maven coordinates must use groupId:artifactId format");
        await expect(readFile(output, "utf-8")).rejects.toSatisfy(
            (error) => error instanceof Error && "code" in error && error.code === "ENOENT"
        );
    });

    it("requires --group in non-interactive mode when groups are ambiguous", async () => {
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        if (sdkConfig == null) {
            throw new Error("Expected SDK targets in test workspace");
        }
        const targets = sdkConfig.targets.map((target, index) => ({
            ...target,
            groups: [index === 0 ? "production" : "staging"]
        }));
        const ambiguousWorkspace: Workspace = {
            ...workspace,
            sdks: { ...sdkConfig, defaultGroup: undefined, targets }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => ambiguousWorkspace });

        await expect(new MigrateCommand().handle(context, args())).rejects.toSatisfy(
            (error) =>
                error instanceof CliError &&
                error.message.includes("Multiple SDK groups") &&
                error.message.includes("--group")
        );
    });

    it("requires --api in non-interactive mode when a group references multiple APIs", async () => {
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const sdkConfig = workspace.sdks;
        const api = workspace.apis.api;
        if (sdkConfig == null || api == null) {
            throw new Error("Expected SDK targets and an API in test workspace");
        }
        const targets = sdkConfig.targets.map((target, index) => (index === 0 ? target : { ...target, api: "other" }));
        const ambiguousWorkspace: Workspace = {
            ...workspace,
            apis: { ...workspace.apis, other: api },
            sdks: { ...sdkConfig, targets }
        };
        Object.defineProperty(context, "loadWorkspaceOrThrow", { value: async () => ambiguousWorkspace });

        await expect(new MigrateCommand().handle(context, args())).rejects.toSatisfy(
            (error) =>
                error instanceof CliError && error.message.includes("Multiple APIs") && error.message.includes("--api")
        );
    });
});
