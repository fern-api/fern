import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { formatDiagnostic, formatReport, runRubicon } from "../runRubicon.js";
import { chooseConfigPath } from "../sdkRubicon.js";
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
        "fern.config.json": JSON.stringify({ organization: "acme", version: "*" }),
        ...files
    });
    return folder;
}

function run(path: string, options: Partial<Parameters<typeof runRubicon>[0]> = {}) {
    return runRubicon({
        context: createMockTaskContext(),
        configPath: join(path, "sdk-config.yml"),
        outDir: path,
        apiName: "api",
        organization: "acme",
        createFernConfig: false,
        generatorVersion: undefined,
        force: false,
        dryRun: false,
        strict: false,
        ...options
    });
}

describe("runRubicon", () => {
    it("writes generators.yml, removes the cli target and returns the report", async () => {
        const { path, read } = await setup();
        const result = await run(path);
        expect(result.diagnostics).toEqual([]);
        expect(result.written).toBe(true);
        const written = YAML.parse(await read("generators.yml"));
        expect(written.groups.cli.generators[0]).toMatchObject({
            name: "fernapi/fern-cli-generator",
            version: "0.49.0"
        });
        expect(YAML.parse(await read("sdk-config.yml")).targets).toEqual([{ language: "typescript" }]);
    });

    it("writes nothing when there is an error diagnostic", async () => {
        const { path, read } = await setup({
            "sdk-config.yml": sdkConfig({
                api: { auth: { schemes: [{ id: "k", type: "api-key", location: "query", name: "key" }] } }
            })
        });
        const result = await run(path);
        expect(result.written).toBe(false);
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain("RUBICON_API_KEY_LOCATION");
        expect(await exists(join(path, "generators.yml"))).toBe(false);
        expect(await read("sdk-config.yml")).toBe(
            sdkConfig({ api: { auth: { schemes: [{ id: "k", type: "api-key", location: "query", name: "key" }] } } })
        );
    });

    it("writes nothing on a warning with --strict", async () => {
        const { path } = await setup({ "sdk-config.yml": sdkConfig({ client: { timeoutMs: 5000 } }) });
        const result = await run(path, { strict: true });
        expect(result.written).toBe(false);
        expect(await exists(join(path, "generators.yml"))).toBe(false);
    });

    it("writes nothing with --dry-run, and returns the same plan", async () => {
        const { path, read } = await setup();
        const result = await run(path, { dryRun: true });
        expect(result.written).toBe(false);
        expect(result.changes?.files.map((file) => file.path)).toContain(join(path, "generators.yml"));
        expect(await exists(join(path, "generators.yml"))).toBe(false);
        expect(await read("sdk-config.yml")).toBe(sdkConfig());
    });

    it("renames an idle generators.legacy.yml and reports the rollback steps", async () => {
        const { path } = await setup({ "generators.legacy.yml": "api:\n  specs: []\ngroups: {}\n" });
        const result = await run(path);
        expect(result.written).toBe(true);
        expect(await exists(join(path, "generators.legacy.pre-rubicon.yml"))).toBe(true);
        expect(result.rollback).toEqual(
            expect.arrayContaining([
                `Rename ${join(path, "generators.legacy.pre-rubicon.yml")} back to ${join(path, "generators.legacy.yml")}.`
            ])
        );
    });

    it("carries binaryName over from a previous rubicon output and reports it", async () => {
        const { path, read, write } = await setup();
        await run(path);
        const previous = YAML.parse(await read("generators.yml"));
        previous.groups.cli.generators[0].config = { binaryName: "acme" };
        await write(
            "generators.yml",
            `# Generated by fern sdk rubicon from sdk-config.yml.\n${YAML.stringify(previous)}`
        );
        await write("sdk-config.yml", sdkConfig());
        const result = await run(path);
        expect(result.carried).toEqual(["groups.cli.generators[0].config.binaryName"]);
        expect(YAML.parse(await read("generators.yml")).groups.cli.generators[0].config).toEqual({
            binaryName: "acme"
        });
    });

    it("warns RUBICON_MULTI_SPEC_BINARY_NAME for several specs without a binaryName", async () => {
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
        const result = await run(path);
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain("RUBICON_MULTI_SPEC_BINARY_NAME");
    });

    it("reads spec facts through the specs' own files, so a declared header is skipped", async () => {
        const { path, read } = await setup({
            "openapi.yml": await readFile(join(SPECS, "headers.yml"), "utf8"),
            "sdk-config.yml": sdkConfig({ api: { headers: [{ name: "X-Tenant-Id" }, { name: "X-New" }] } })
        });
        await run(path);
        expect(YAML.parse(await read("generators.yml")).api.headers).toEqual({ "X-New": { type: "string" } });
    });

    it("notes that auth may need to be added by hand when sdk-config.yml has no api.auth", async () => {
        const { path } = await setup();
        const result = await run(path);
        expect(result.notes.some((note) => note.includes("auth"))).toBe(true);
    });

    it("creates fern.config.json only when asked", async () => {
        const { path, read } = await setup();
        await run(path, { createFernConfig: true, outDir: join(path, "out") });
        expect(JSON.parse(await read("out/fern.config.json"))).toEqual({ organization: "acme", version: "*" });
    });

    it("rejects a sdk-config.yml with no cli target", async () => {
        const { path } = await setup({ "sdk-config.yml": sdkConfig({ targets: [{ language: "typescript" }] }) });
        const result = await run(path);
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["RUBICON_NO_CLI_TARGET"]);
    });
});

describe("reruns", () => {
    it("writes sdk-config.rubicon.yml with the cli target when other targets remain", async () => {
        const { path, read } = await setup();
        await run(path);
        expect(YAML.parse(await read("sdk-config.rubicon.yml")).targets).toEqual([{ language: "cli" }]);
    });

    it("picks sdk-config.yml on a first run and sdk-config.rubicon.yml on a rerun", async () => {
        const { path } = await setup();
        expect(await chooseConfigPath(path)).toBe(join(path, "sdk-config.yml"));
        await run(path);
        expect(await chooseConfigPath(path)).toBe(join(path, "sdk-config.rubicon.yml"));
    });

    it("regenerates generators.yml from sdk-config.rubicon.yml and edits no SDK Config file", async () => {
        const { path, read, write } = await setup();
        await run(path);
        const sdkConfigAfterFirstRun = await read("sdk-config.yml");
        await write(
            "sdk-config.rubicon.yml",
            (await read("sdk-config.rubicon.yml")).replace(
                "targets:",
                "api:\n  defaultEnvironment: prod\n  environments:\n    - name: prod\n      urls: [{ name: api, url: https://api.acme.test }]\ntargets:"
            )
        );
        const result = await run(path, { configPath: join(path, "sdk-config.rubicon.yml") });
        expect(result.diagnostics).toEqual([]);
        expect(result.retarget).toBe("none");
        expect(YAML.parse(await read("generators.yml")).api.environments).toEqual({ prod: "https://api.acme.test" });
        expect(await read("sdk-config.yml")).toBe(sdkConfigAfterFirstRun);
    });

    it("returns undefined when neither file has a cli target", async () => {
        const { path } = await setup({ "sdk-config.yml": sdkConfig({ targets: [{ language: "typescript" }] }) });
        expect(await chooseConfigPath(path)).toBeUndefined();
    });
});

describe("formatting", () => {
    it("prints diagnostics as [severity] [CODE] path: reason; suggested action", () => {
        expect(
            formatDiagnostic({
                severity: "error",
                code: "RUBICON_X",
                path: "api.auth",
                message: "Bad.",
                action: "Fix it."
            })
        ).toBe("[error] [RUBICON_X] api.auth: Bad.; Fix it.");
    });

    it("prints the defaults, the D4 action, the rollback steps and both next commands", async () => {
        const { path } = await setup();
        const lines = formatReport(await run(path), { api: undefined });
        const text = lines.join("\n");
        expect(text).toContain("binaryName");
        expect(text).toContain("Removed the cli target");
        expect(text).toContain("Rollback instructions:");
        expect(text).toContain("fern generate --group cli");
        expect(text).toContain("FERN_USE_SDK_GEN_API=true fern generate --group cli --version <version>");
    });

    it("adds --api to the next commands for a multi-API project", async () => {
        const { path } = await setup();
        const text = formatReport(await run(path), { api: "payments" }).join("\n");
        expect(text).toContain("fern generate --api payments --group cli");
    });
});
