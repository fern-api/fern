/**
 * Regenerate the committed `--schema` golden fixtures from the real Fern CLI SDK runtime.
 *
 * The parity test (`src/__test__/parity.test.ts`) asserts that the ported flag rules reproduce the
 * runtime's `--schema` output. That test reads committed golden JSON so it runs everywhere, including
 * CI's TypeScript image. This script is the cargo-gated other half: it rebuilds a throwaway CLI binary
 * from each fixture spec against the in-repo `fern-cli-sdk` crate, dumps the runtime's root +
 * per-command `--schema`, and rewrites the golden. Run it whenever the runtime's naming/flag rules
 * change:
 *
 *     node generators/cli/dynamic-snippets/scripts/generate-schema-golden.mjs
 *
 * Requires a Rust toolchain (`cargo` on PATH or at ~/.cargo/bin). Commit the resulting golden diff.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "..", "src", "__test__", "fixtures");
const CRATE_DIR = resolve(__dirname, "..", "..", "sdk");

function findCargo() {
    if (spawnSync("cargo", ["--version"], { stdio: "ignore" }).status === 0) {
        return "cargo";
    }
    const home = process.env.HOME;
    if (home != null) {
        const candidate = join(home, ".cargo", "bin", "cargo");
        if (spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0) {
            return candidate;
        }
    }
    return undefined;
}

/** Build a throwaway CLI binary embedding `openapi.yml`; returns the binary path. */
function buildBinary(cargo, fixtureDir, cliName) {
    const buildDir = mkdtempSync(join(tmpdir(), "cli-ds-golden-"));
    mkdirSync(join(buildDir, "src"), { recursive: true });
    cpSync(join(fixtureDir, "openapi.yml"), join(buildDir, "openapi.yaml"));
    writeFileSync(
        join(buildDir, "Cargo.toml"),
        [
            "[package]",
            'name = "fixture-cli"',
            'version = "0.0.0"',
            'edition = "2021"',
            "",
            "[[bin]]",
            'name = "fixture-cli"',
            'path = "src/main.rs"',
            "",
            "[dependencies]",
            `fern-cli-sdk = { path = ${JSON.stringify(CRATE_DIR)} }`,
            ""
        ].join("\n")
    );
    writeFileSync(
        join(buildDir, "src", "main.rs"),
        [
            "use fern_cli_sdk::app::CliApp;",
            "use fern_cli_sdk::openapi::OpenApiBinding;",
            "",
            "fn main() {",
            `    CliApp::new(${JSON.stringify(cliName)})`,
            '        .binding(OpenApiBinding::new().spec(include_str!("../openapi.yaml")))',
            "        .run()",
            "}",
            ""
        ].join("\n")
    );
    execFileSync(cargo, ["build", "--manifest-path", join(buildDir, "Cargo.toml"), "--bin", "fixture-cli"], {
        stdio: "inherit"
    });
    return join(buildDir, "target", "debug", "fixture-cli");
}

function schema(binary, args) {
    return JSON.parse(execFileSync(binary, [...args, "--schema"], { encoding: "utf-8" }));
}

/** Convert the runtime's root + per-command `--schema` into the committed golden shape. */
function buildGolden(binary) {
    const root = schema(binary, []);
    const commands = (root.operations ?? []).map((op) => {
        const tokens = op.operation.split(".");
        const perCommand = schema(binary, tokens);
        const props = perCommand.input?.properties ?? {};
        const required = new Set(perCommand.input?.required ?? []);
        const inputs = Object.entries(props)
            .map(([wireName, prop]) => ({
                wireName,
                location: prop.location,
                flag: typeof prop.flag === "string" ? prop.flag : undefined,
                type: prop.type,
                required: required.has(wireName) || undefined
            }))
            .sort((a, b) => a.wireName.localeCompare(b.wireName));
        return {
            operation: op.operation,
            command: tokens,
            httpMethod: op.httpMethod,
            path: op.path,
            inputs
        };
    });
    return { commands };
}

function main() {
    const cargo = findCargo();
    if (cargo == null) {
        // biome-ignore lint/suspicious/noConsole: build-time CLI script progress output
        console.error("cargo not found (PATH or ~/.cargo/bin). Install a Rust toolchain and retry.");
        process.exit(1);
    }
    const fixtures = readdirSync(FIXTURES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const fixture of fixtures) {
        const fixtureDir = join(FIXTURES_DIR, fixture.name);
        // biome-ignore lint/suspicious/noConsole: build-time CLI script progress output
        console.error(`\n[golden] building ${fixture.name} …`);
        const binary = buildBinary(cargo, fixtureDir, fixture.name);
        const golden = buildGolden(binary);
        const out = join(fixtureDir, "schema.golden.json");
        writeFileSync(out, `${JSON.stringify(golden, null, 2)}\n`);
        // biome-ignore lint/suspicious/noConsole: build-time CLI script progress output
        console.error(`[golden] wrote ${out} (${golden.commands.length} commands)`);
    }
}

main();
