import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it } from "vitest";

import { loadSdkConfigV1 } from "../../loadSdkConfigV1.js";
import { prepareCliTargetWorkspace } from "../prepareCliTargetWorkspace.js";
import { formatDiagnostic, translateCliTarget } from "../translateCliTarget.js";
import { SPECS, type TempFolder, tempFolder, yaml } from "./helpers.js";

let folder: TempFolder | undefined;
afterEach(async () => {
    await folder?.remove();
    folder = undefined;
});

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

function sdkConfig(overrides: Record<string, unknown> = {}): string {
    return yaml({
        schemaVersion: "sdk-config/v1",
        sdkName: "acme",
        source: { specs: [{ id: "main", type: "openapi", path: "./openapi.yml" }] },
        output: { delivery: "files" },
        targets: [{ language: "typescript" }, { language: "cli" }],
        ...overrides
    });
}

async function setup(files: Record<string, string> = {}) {
    folder = await tempFolder({
        "openapi.yml": await readFile(join(SPECS, "minimal.yml"), "utf8"),
        "sdk-config.yml": sdkConfig(),
        ...files
    });
    return folder;
}

async function translate(path: string, outDir = join(path, "translated")) {
    const loaded = await loadSdkConfigV1(join(path, "sdk-config.yml"));
    return translateCliTarget({
        context: createMockTaskContext(),
        sdkConfig: loaded.config,
        absolutePathToConfig: loaded.absolutePath,
        outDir,
        apiName: "api",
        organization: "acme"
    });
}

function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function firstGenerator(generatorsYml: Record<string, unknown> | undefined): Record<string, unknown> {
    const generators = record(record(record(generatorsYml).groups).cli).generators;
    return Array.isArray(generators) ? record(generators[0]) : {};
}

describe("translateCliTarget", () => {
    it("translates the cli target into a cli group with paths relative to the generators.yml folder", async () => {
        const { path } = await setup();
        const result = await translate(path);
        expect(result.diagnostics).toEqual([]);
        expect(record(result.generatorsYml).api).toEqual({ specs: [{ openapi: "../openapi.yml" }] });
        expect(firstGenerator(result.generatorsYml)).toEqual({
            name: "fernapi/fern-cli-generator",
            version: "0.49.0",
            output: { location: "local-file-system", path: "../generated/cli" }
        });
    });

    it("returns no generators.yml when a field cannot be honored", async () => {
        const { path } = await setup({
            "sdk-config.yml": sdkConfig({
                api: { auth: { schemes: [{ id: "k", type: "api-key", location: "query", name: "key" }] } }
            })
        });
        const result = await translate(path);
        expect(result.generatorsYml).toBeUndefined();
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain("CLI_TARGET_API_KEY_LOCATION");
    });

    it("rejects a browser-login flow", async () => {
        const { path } = await setup({
            "sdk-config.yml": sdkConfig({
                api: {
                    auth: {
                        schemes: [
                            {
                                id: "login",
                                type: "oauth2",
                                flows: [
                                    {
                                        type: "authorization-code",
                                        authorizationUrl: "https://a.test/authorize",
                                        tokenUrl: "https://a.test/token"
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        });
        const result = await translate(path);
        expect(result.generatorsYml).toBeUndefined();
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain("CLI_TARGET_PUBLIC_CLIENT_ID");
    });

    it("returns sdk-config.yml's SDK version to generate, 1.0.0 by default as for the other targets", async () => {
        const { path, write } = await setup({ "sdk-config.yml": sdkConfig({ sdkVersion: "1.2.3" }) });
        expect((await translate(path)).version).toBe("1.2.3");
        await write("sdk-config.yml", sdkConfig());
        expect((await translate(path)).version).toBe("1.0.0");
    });

    it("skips a header the spec already declares", async () => {
        const { path } = await setup({
            "openapi.yml": await readFile(join(SPECS, "headers.yml"), "utf8"),
            "sdk-config.yml": sdkConfig({ api: { headers: [{ name: "X-Tenant-Id" }, { name: "X-New" }] } })
        });
        const result = await translate(path);
        expect(record(record(result.generatorsYml).api).headers).toEqual({ "X-New": { type: "string" } });
    });

    it("warns CLI_TARGET_MULTI_SPEC_BINARY_NAME for several specs", async () => {
        const { path } = await setup({
            "other.yml": await readFile(join(SPECS, "minimal.yml"), "utf8"),
            "sdk-config.yml": sdkConfig({
                source: {
                    specs: [
                        { id: "main", type: "openapi", path: "./openapi.yml" },
                        { id: "other", type: "openapi", path: "./other.yml", namespace: "other" }
                    ]
                }
            })
        });
        const result = await translate(path);
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["CLI_TARGET_MULTI_SPEC_BINARY_NAME"]);
        expect(result.generatorsYml).toBeDefined();
    });

    it("notes the generator defaults, and the missing auth block", async () => {
        const { path } = await setup();
        const { notes } = await translate(path);
        expect(notes.some((note) => note.includes("binaryName"))).toBe(true);
        expect(notes.some((note) => note.includes("api.auth"))).toBe(true);
    });
});

describe("prepareCliTargetWorkspace", () => {
    async function prepare(path: string) {
        const loaded = await loadSdkConfigV1(join(path, "sdk-config.yml"));
        return prepareCliTargetWorkspace({
            context: createMockTaskContext(),
            sdkConfig: loaded.config,
            absolutePathToConfig: loaded.absolutePath,
            organization: "acme",
            workspaceName: undefined,
            cliVersion: "0.0.0"
        });
    }

    it("loads the translated generators.yml as a workspace with one cli group, and changes no project file", async () => {
        const { path, read } = await setup();
        const before = await read("sdk-config.yml");
        const prepared = await prepare(path);
        try {
            expect(prepared.groupName).toBe("cli");
            const groups = prepared.workspace.generatorsConfiguration?.groups ?? [];
            expect(groups.map((group) => group.groupName)).toEqual(["cli"]);
            expect(groups[0]?.generators.map((generator) => [generator.name, generator.version])).toEqual([
                ["fernapi/fern-cli-generator", "0.49.0"]
            ]);
            expect(await read("sdk-config.yml")).toBe(before);
            expect(await exists(join(path, "generators.yml"))).toBe(false);
        } finally {
            await prepared.cleanup();
        }
        expect(await exists(prepared.workspace.absoluteFilePath)).toBe(false);
    });

    it("throws a config error listing every error diagnostic, and leaves no temporary folder", async () => {
        const { path } = await setup({
            "sdk-config.yml": sdkConfig({
                api: {
                    auth: { schemes: [{ id: "k", type: "api-key", location: "query", name: "key" }] },
                    environments: [
                        {
                            name: "prod",
                            urls: [
                                { name: "a", url: "https://a.test" },
                                { name: "b", url: "https://b.test" }
                            ]
                        }
                    ]
                }
            })
        });
        await expect(prepare(path)).rejects.toThrow(
            /CLI_TARGET_API_KEY_LOCATION[\s\S]*CLI_TARGET_MULTI_URL_ENVIRONMENT/
        );
    });
});

describe("formatDiagnostic", () => {
    it("prints [severity] [CODE] path: reason; suggested action", () => {
        expect(
            formatDiagnostic({
                severity: "error",
                code: "CLI_TARGET_X",
                path: "api.auth",
                message: "Bad.",
                action: "Fix it."
            })
        ).toBe("[error] [CLI_TARGET_X] api.auth: Bad.; Fix it.");
    });
});
