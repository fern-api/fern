import { execFileSync, execSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { beforeAll, describe, expect, it } from "vitest";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";

/**
 * Cargo-gated end-to-end check: every command the generator assembles is fed back to the REAL Fern
 * CLI SDK runtime with `--dry-run`, which validates the request locally. This is the only test that
 * proves the assembled `--flag` / `--params` / `--json` / multipart commands are actually accepted by
 * the runtime — the --schema golden only pins flag names, not acceptance. Skipped automatically where
 * `cargo` is unavailable (e.g. CI's TypeScript image); runs in the cargo-enabled `cli-dynamic-snippets`
 * CI job and locally.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, "fixtures", "twilio-like");
const CRATE_DIR = resolve(__dirname, "..", "..", "..", "sdk");
const BINARY = "twilio-like";

function findCargo(): string | undefined {
    if (spawnSync("cargo", ["--version"], { stdio: "ignore" }).status === 0) {
        return "cargo";
    }
    const candidate = process.env.HOME != null ? join(process.env.HOME, ".cargo", "bin", "cargo") : undefined;
    if (candidate != null && spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0) {
        return candidate;
    }
    return undefined;
}

const cargo = findCargo();

function buildBinary(cargoBin: string): string {
    const buildDir = mkdtempSync(join(tmpdir(), "cli-ds-dryrun-"));
    mkdirSync(join(buildDir, "src"), { recursive: true });
    cpSync(join(FIXTURE, "openapi.yml"), join(buildDir, "openapi.yaml"));
    writeFileSync(
        join(buildDir, "Cargo.toml"),
        [
            "[package]",
            'name = "dryrun-fixture-cli"',
            'version = "0.0.0"',
            'edition = "2021"',
            "",
            "[[bin]]",
            'name = "dryrun-fixture-cli"',
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
            `    CliApp::new(${JSON.stringify(BINARY)})`,
            '        .binding(OpenApiBinding::new().spec(include_str!("../openapi.yaml")))',
            "        .run()",
            "}",
            ""
        ].join("\n")
    );
    execFileSync(cargoBin, ["build", "--manifest-path", join(buildDir, "Cargo.toml"), "--bin", "dryrun-fixture-cli"], {
        stdio: "inherit"
    });
    return join(buildDir, "target", "debug", "dryrun-fixture-cli");
}

const CONFIG = {
    dryRun: false,
    irFilepath: "<placeholder>",
    output: { path: "<placeholder>", mode: { type: "publish" } },
    organization: "twilio-like",
    workspaceName: BINARY,
    environment: { type: "local" },
    whitelabel: false,
    writeUnitTests: false,
    generateOauthClients: false,
    customConfig: {}
} as unknown as FernGeneratorExec.GeneratorConfig;

describe.skipIf(cargo == null)("every assembled command passes the runtime --dry-run", () => {
    let binary: string;
    let dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
    let filePath: string;

    beforeAll(() => {
        if (cargo == null) {
            return;
        }
        binary = buildBinary(cargo);
        dynamicIr = JSON.parse(
            readFileSync(join(FIXTURE, "dynamic-ir.json"), "utf-8")
        ) as FernIr.dynamic.DynamicIntermediateRepresentation;
        // A real file for the multipart File field; --dry-run may inspect it.
        const fileDir = mkdtempSync(join(tmpdir(), "cli-ds-upload-"));
        filePath = join(fileDir, "image.png");
        writeFileSync(filePath, "fake-bytes");
    }, 600_000);

    // Example values per endpoint (keyed by "METHOD path"), covering every parameter location/shape.
    function requestsByEndpoint(): Record<string, FernIr.dynamic.EndpointSnippetRequest> {
        return {
            "POST /2010-04-01/Accounts/{AccountSid}/Messages.json": {
                endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Messages.json" },
                pathParameters: { AccountSid: "AC123" },
                requestBody: { To: "+15558675310", From: "+15017122661", Body: "Hi" }
            },
            "GET /2010-04-01/Accounts/{AccountSid}/Messages.json": {
                endpoint: { method: "GET", path: "/2010-04-01/Accounts/{AccountSid}/Messages.json" },
                pathParameters: { AccountSid: "AC123" },
                queryParameters: { PageSize: 20 }
            },
            "POST /2010-04-01/Accounts/{AccountSid}/Calls.json": {
                endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Calls.json" },
                pathParameters: { AccountSid: "AC123" },
                headers: { "X-Custom-Header": "hval" },
                requestBody: { To: "+15558675310", json: "raw" }
            },
            "POST /2010-04-01/Accounts/{AccountSid}/Calls/Stream.json": {
                endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Calls/Stream.json" },
                pathParameters: { AccountSid: "AC123" },
                requestBody: { To: "+15558675310", "Parameter1.Name": "foo" }
            },
            "POST /2010-04-01/Accounts/{AccountSid}/Addresses.json": {
                endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Addresses.json" },
                pathParameters: { AccountSid: "AC123" },
                requestBody: { CustomerName: "Ada", Address: { City: "SF", Zip: "94105" } }
            },
            "POST /2010-04-01/Accounts/{AccountSid}/Media.json": {
                endpoint: { method: "POST", path: "/2010-04-01/Accounts/{AccountSid}/Media.json" },
                pathParameters: { AccountSid: "AC123" },
                requestBody: { File: filePath, output: "meta" }
            },
            "POST /Chat/v1/Messages": {
                endpoint: { method: "POST", path: "/Chat/v1/Messages" },
                requestBody: { Body: "hi" }
            }
        };
    }

    it("accepts every generated command", () => {
        const generator = new DynamicSnippetsGenerator({ ir: dynamicIr, config: CONFIG });
        const requests = requestsByEndpoint();
        const commands: string[] = [];
        for (const request of Object.values(requests)) {
            const { snippet } = generator.generateSync(request);
            commands.push(snippet);
        }
        expect(commands.length).toBe(Object.keys(requests).length);

        const failures: string[] = [];
        for (const command of commands) {
            // Replace the leading binary-name token with the built binary's path, then --dry-run.
            // Run through a shell so the generator's POSIX quoting (--params '{…}') is parsed as emitted.
            const withoutBinaryName = command.slice(command.indexOf(" ") + 1);
            const shellCommand = `${JSON.stringify(binary)} ${withoutBinaryName} --dry-run`;
            try {
                execSync(shellCommand, { stdio: "pipe" });
            } catch (error) {
                const err = error as { stderr?: Buffer; stdout?: Buffer };
                const detail = `${err.stderr?.toString() ?? ""}${err.stdout?.toString() ?? ""}`.split("\n")[0];
                failures.push(`  ${command}\n    → ${detail}`);
            }
        }
        if (failures.length > 0) {
            throw new Error(`Runtime rejected ${failures.length} command(s):\n${failures.join("\n")}`);
        }
    });
});
