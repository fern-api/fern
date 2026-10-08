/**
 * Real-runtime e2e for CLI-snippet injection, gated on a Rust toolchain.
 *
 * This is the plan's `--dry-run` guard: it proves the commands the assembler emits are actually
 * accepted by the fern CLI SDK runtime, not merely well-shaped strings. It:
 *   1. builds a throwaway CLI binary from the committed twilio-like fixture spec against the
 *      in-repo `fern_cli_sdk` crate (no mutation to that crate);
 *   2. generates a catalog from the binary's own `--schema` (the real source of command names +
 *      flags) in the v1 contract shape;
 *   3. runs the real loadAPIWorkspace -> IR -> convertIrToFdrApi pipeline on the same spec and
 *      injects CLI snippets using that generated catalog;
 *   4. feeds every assembled command back to the binary with `--dry-run` and asserts it exits 0,
 *      plus a full coverage count.
 *
 * Skipped automatically when `cargo` is unavailable (e.g. the TypeScript CI image), so it only
 * runs where a Rust toolchain exists. The first run compiles the crate (~40s); subsequent runs are
 * incremental.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as pathJoin, resolve } from "node:path";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import assert from "assert";
import { beforeAll, describe, expect, it } from "vitest";
import { convertIrToFdrApi } from "../../ir-to-fdr-converter/convertIrToFdrApi.js";
import { parseCliCatalog } from "../catalog.js";
import { CLI_SNIPPET_LANGUAGE, injectCliSnippetsIntoApiDefinition } from "../injectCliSnippets.js";
import { CliCatalog, CliCatalogInput, CliCatalogInputLocation } from "../types.js";

type ApiDefinition = FdrCjsSdk.api.v1.register.ApiDefinition;

interface SchemaProp {
    location: string;
    flag?: string;
    type?: string;
}
interface RootSchema {
    operations?: { operation: string; httpMethod: string; path: string }[];
}
interface CommandSchema {
    input?: { properties?: Record<string, SchemaProp>; required?: string[] };
}

const FIXTURE_DIR = pathJoin(__dirname, "fixtures", "twilio-like");
const CRATE_DIR = resolve(__dirname, "../../../../../../generators/cli/sdk");

/** Resolve a usable `cargo` (PATH first, then the rustup default location). */
function findCargo(): string | undefined {
    if (spawnSync("cargo", ["--version"], { stdio: "ignore" }).status === 0) {
        return "cargo";
    }
    const home = process.env.HOME;
    if (home != null) {
        const candidate = pathJoin(home, ".cargo", "bin", "cargo");
        if (spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0) {
            return candidate;
        }
    }
    return undefined;
}

const cargo = findCargo();

/** Build a throwaway CLI binary embedding the fixture spec; returns its path. */
function buildFixtureBinary(cargoBin: string): string {
    const buildDir = mkdtempSync(pathJoin(tmpdir(), "cli-snippets-e2e-"));
    mkdirSync(pathJoin(buildDir, "src"), { recursive: true });
    cpSync(pathJoin(FIXTURE_DIR, "openapi.yml"), pathJoin(buildDir, "openapi.yaml"));
    writeFileSync(
        pathJoin(buildDir, "Cargo.toml"),
        [
            "[package]",
            'name = "twilio-like-fixture"',
            'version = "0.0.0"',
            'edition = "2021"',
            "",
            "[[bin]]",
            'name = "twilio-like-fixture"',
            'path = "src/main.rs"',
            "",
            "[dependencies]",
            `fern-cli-sdk = { path = ${JSON.stringify(CRATE_DIR)} }`,
            ""
        ].join("\n")
    );
    writeFileSync(
        pathJoin(buildDir, "src", "main.rs"),
        [
            "use fern_cli_sdk::app::CliApp;",
            "use fern_cli_sdk::openapi::OpenApiBinding;",
            "",
            "fn main() {",
            '    CliApp::new("twilio-like")',
            '        .binding(OpenApiBinding::new().spec(include_str!("../openapi.yaml")))',
            "        .run()",
            "}",
            ""
        ].join("\n")
    );
    execFileSync(cargoBin, ["build", "--bin", "twilio-like-fixture"], { cwd: buildDir, stdio: "inherit" });
    return pathJoin(buildDir, "target", "debug", "twilio-like-fixture");
}

function schema<T>(binary: string, args: string[]): T {
    const out = execFileSync(binary, [...args, "--schema"], { encoding: "utf-8" });
    return JSON.parse(out) as T;
}

/** Generate a v1 catalog from the binary's --schema (the test-time analog of build_catalog.py). */
function generateCatalog(binary: string): CliCatalog {
    const root = schema<RootSchema>(binary, []);
    const commands = (root.operations ?? []).map((op) => {
        const tokens: string[] = op.operation.split(".");
        const perCommand = schema<CommandSchema>(binary, tokens);
        const props: Record<string, SchemaProp> = perCommand.input?.properties ?? {};
        const required: string[] = perCommand.input?.required ?? [];
        const inputs: CliCatalogInput[] = Object.entries(props).map(([wireName, prop]) => ({
            wireName,
            location: prop.location as CliCatalogInputLocation,
            flag: typeof prop.flag === "string" ? prop.flag : undefined,
            required: required.includes(wireName) ? true : undefined,
            repeated: prop.type === "array" ? true : undefined
        }));
        return { command: tokens, operation: op.operation, httpMethod: op.httpMethod, path: op.path, inputs };
    });
    return parseCliCatalog({ version: 1, source: { runtimeVersion: "e2e fixture binary" }, commands });
}

async function buildFdrApiFromFixture(): Promise<ApiDefinition> {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(AbsoluteFilePath.of(FIXTURE_DIR), RelativeFilePath.of(".")),
        context,
        cliVersion: "0.0.0",
        workspaceName: "twilio-like"
    });
    assert(workspace.didSucceed);
    assert(workspace.workspace instanceof OSSWorkspace);
    const ir = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: false
    });
    return convertIrToFdrApi({
        ir,
        snippetsConfig: {
            typescriptSdk: undefined,
            pythonSdk: undefined,
            javaSdk: undefined,
            rubySdk: undefined,
            goSdk: undefined,
            csharpSdk: undefined,
            phpSdk: undefined,
            swiftSdk: undefined,
            rustSdk: undefined
        },
        playgroundConfig: { oauth: true },
        context
    });
}

describe.skipIf(cargo == null)("CLI snippet injection e2e (--dry-run against built runtime)", () => {
    let binary: string;
    let api: ApiDefinition;
    let stats: ReturnType<typeof injectCliSnippetsIntoApiDefinition>;

    beforeAll(async () => {
        assert(cargo != null);
        binary = buildFixtureBinary(cargo);
        const catalog = generateCatalog(binary);
        api = await buildFdrApiFromFixture();
        stats = injectCliSnippetsIntoApiDefinition({ apiDefinition: api, catalog });
    }, 600_000);

    it("matches every fixture endpoint from the runtime-generated catalog", () => {
        expect(stats.totalEndpoints).toBe(2);
        expect(stats.matchedEndpoints).toBe(2);
        expect(stats.injectedSamples).toBeGreaterThanOrEqual(2);
    });

    it("every assembled command passes the runtime's --dry-run", () => {
        const endpoints = [
            ...api.rootPackage.endpoints,
            ...Object.values(api.subpackages).flatMap((pkg) => pkg.endpoints)
        ];
        const commands: string[] = [];
        for (const endpoint of endpoints) {
            for (const example of endpoint.examples) {
                const code = (example.codeSamples ?? []).find((s) => s.language === CLI_SNIPPET_LANGUAGE)?.code;
                if (code != null) {
                    commands.push(code);
                }
            }
        }
        expect(commands.length).toBeGreaterThanOrEqual(2);
        for (const code of commands) {
            // The assembled code starts with the command tokens; prepend the binary and append --dry-run.
            const result = spawnSync("sh", ["-c", `${JSON.stringify(binary)} ${code} --dry-run`], {
                encoding: "utf-8"
            });
            expect(result.status, `--dry-run failed for: ${code}\n${result.stderr}`).toBe(0);
        }
    });
});
