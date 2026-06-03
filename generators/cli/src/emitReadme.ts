import { Block, BlockMerger, ReadmeParser } from "@fern-api/generator-cli/readme";
import { readFile, writeFile } from "fs/promises";
import path from "path";

import type { DetectedAuthBinding } from "./detectAuth.js";
import { toEnvVarPrefix } from "./identity.js";
import type { ResolvedNpmPublishInfo } from "./resolveOutputConfig.js";

/**
 * Emit `README.md` into the generated CLI project.
 *
 * Uses the same `ReadmeParser` + `BlockMerger` merge mechanism as Fern
 * SDK READMEs so that customer-authored H2 sections are preserved on
 * regeneration. Generated sections are always overwritten; sections
 * whose id is NOT in the generated set are kept in their original
 * position.
 *
 * Unlike the SDK `ReadmeGenerator` (which renders language-specific
 * install commands, code-snippet features, and badge shields), the CLI
 * README documents binary invocation, auth env vars, output formats,
 * and shell completions — content that has no overlap with the SDK
 * feature model. We therefore build our own `Block[]` list directly
 * rather than constructing a `ReadmeConfig` for the SDK generator.
 */
export async function emitReadme(args: {
    outputDir: string;
    binaryName: string;
    apiDisplayName: string | undefined;
    authBindings: DetectedAuthBinding[];
    npmPublishInfo: ResolvedNpmPublishInfo | undefined;
}): Promise<void> {
    const { outputDir, binaryName, apiDisplayName, authBindings, npmPublishInfo } = args;
    const displayName = apiDisplayName ?? binaryName;

    const header = generateHeader(displayName);
    const blocks = generateBlocks({ binaryName, displayName, authBindings, npmPublishInfo });

    const readmePath = path.join(outputDir, "README.md");
    const existing = await readExistingReadme(readmePath);
    const finalBlocks = mergeWithExisting({ existing, generatedBlocks: blocks });

    const content = header + finalBlocks.map((b) => b.content).join("");
    await writeFile(readmePath, content);
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function generateHeader(displayName: string): string {
    const suffix = displayName.toUpperCase().endsWith("API") ? "" : " API";
    return lines(`# ${displayName} CLI`, "", `Command-line interface for the ${displayName}${suffix}.`, "");
}

// ---------------------------------------------------------------------------
// Block builders — one per generated H2 section.
//
// Each follows the same convention as ReadmeGenerator's private helpers:
// build a content string starting with `## Title\n`, ending with a
// trailing blank line (`\n`), and wrap it in a `Block` keyed by a
// SCREAMING_SNAKE_CASE id that ReadmeParser.sectionNameToID would
// produce from the heading text.
// ---------------------------------------------------------------------------

function generateBlocks(args: {
    binaryName: string;
    displayName: string;
    authBindings: DetectedAuthBinding[];
    npmPublishInfo: ResolvedNpmPublishInfo | undefined;
}): Block[] {
    const { binaryName, displayName, authBindings, npmPublishInfo } = args;
    const envPrefix = toEnvVarPrefix(binaryName);
    return [
        generateInstallation({ binaryName, npmPublishInfo }),
        generateAuthentication({ binaryName, authBindings }),
        generateUsage({ binaryName, displayName, envPrefix, authBindings }),
        generateCommonFlags(binaryName),
        generateEnvironmentVariables(envPrefix),
        generateOutputFormats(binaryName),
        generateShellCompletion(binaryName)
    ];
}

function generateInstallation(args: { binaryName: string; npmPublishInfo: ResolvedNpmPublishInfo | undefined }): Block {
    const { binaryName, npmPublishInfo } = args;
    let content: string;
    if (npmPublishInfo != null) {
        content = lines(
            "## Installation",
            "",
            "Install the CLI globally via npm:",
            "",
            "```bash",
            `npm install -g ${npmPublishInfo.packageName}`,
            "```",
            "",
            "Or run it directly without installing:",
            "",
            "```bash",
            `npx ${npmPublishInfo.packageName} --help`,
            "```",
            "",
            "### Build from source",
            "",
            "If you prefer to build from source, install the [Rust toolchain](https://rustup.rs/) and run:",
            "",
            "```bash",
            "cargo build --release",
            `./target/release/${binaryName} --help`,
            "```",
            ""
        );
    } else {
        content = lines(
            "## Installation",
            "",
            "Install the [Rust toolchain](https://rustup.rs/) if you don't have it:",
            "",
            "```bash",
            'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh',
            "```",
            "",
            "Then build from source:",
            "",
            "```bash",
            "cargo build --release",
            `./target/release/${binaryName} --help`,
            "```",
            ""
        );
    }
    return new Block({ id: "INSTALLATION", content });
}

function generateAuthentication(args: { binaryName: string; authBindings: DetectedAuthBinding[] }): Block {
    const { binaryName, authBindings } = args;
    if (authBindings.length === 0) {
        return new Block({
            id: "AUTHENTICATION",
            content: lines(
                "## Authentication",
                "",
                `This API requires authentication. Run \`${binaryName} --help\` for details.`,
                ""
            )
        });
    }
    const envLines: string[] = [];
    for (const binding of authBindings) {
        for (const envVar of binding.envVars) {
            envLines.push(`export ${envVar}="${placeholderForKind(binding.kind)}"`);
        }
    }
    return new Block({
        id: "AUTHENTICATION",
        content: lines(
            "## Authentication",
            "",
            "Set the following environment variable(s) before using the CLI:",
            "",
            "```bash",
            ...envLines,
            "```",
            "",
            "A `.env` file in the working directory is also supported — the CLI auto-loads it on startup.",
            ""
        )
    });
}

function generateUsage(args: {
    binaryName: string;
    displayName: string;
    envPrefix: string;
    authBindings: DetectedAuthBinding[];
}): Block {
    const { binaryName, displayName, envPrefix, authBindings } = args;

    const helpBlock = buildHelpOutput({ binaryName, displayName, envPrefix, authBindings });

    return new Block({
        id: "USAGE",
        content: lines(
            "## Usage",
            "",
            "```",
            ...helpBlock,
            "```",
            "",
            "Every API resource appears as a subcommand (e.g. `" +
                binaryName +
                " <resource> <method>`). " +
                "Run `" +
                binaryName +
                " <resource> --help` to see available methods.",
            ""
        )
    });
}

function generateCommonFlags(binaryName: string): Block {
    return new Block({
        id: "COMMON_FLAGS",
        content: lines(
            "## Common flags",
            "",
            "These flags are available on every operation:",
            "",
            "| Flag | Description |",
            "|------|-------------|",
            "| `--dry-run` | Validate the request locally and print the HTTP request without sending it — useful for scripting and agent workflows |",
            "| `--json <JSON\\|->` | Supply a request body as JSON (or `-` to read stdin); individual body fields also have their own flags |",
            "| `--params <JSON>` | Merge extra parameters as JSON (overrides individual flags) |",
            "| `--format <json\\|table\\|yaml\\|csv>` | Output format (default `json`) |",
            "| `--output <PATH>` | Write binary responses to a file |",
            "| `--base-url <URL>` | Override the API base URL (e.g. for testing against a mock server) |",
            "| `--page-all` | Auto-paginate and stream results as NDJSON |",
            "| `--page-limit <N>` | Max pages to fetch when auto-paginating (default `10`) |",
            "| `-q, --quiet` | Suppress stdout output on success (errors still go to stderr) |",
            "",
            "### Dry run",
            "",
            "The `--dry-run` flag renders the exact HTTP request the CLI would send, without executing it. " +
                "This is particularly valuable for AI agent integration — agents can validate their intent " +
                "before committing to a write operation:",
            "",
            "```bash",
            `${binaryName} <resource> <method> --dry-run`,
            "```",
            ""
        )
    });
}

function generateEnvironmentVariables(envPrefix: string): Block {
    return new Block({
        id: "ENVIRONMENT_VARIABLES",
        content: lines(
            "## Environment variables",
            "",
            `| Variable | Description |`,
            `|----------|-------------|`,
            `| \`${envPrefix}_BASE_URL\` | Override the API base URL |`,
            `| \`${envPrefix}_CA_BUNDLE\` | Path to PEM file with extra trust roots (or \`SSL_CERT_FILE\`) |`,
            `| \`${envPrefix}_INSECURE=1\` | Skip TLS verification (debugging only) |`,
            `| \`${envPrefix}_PROXY\` | HTTP(S) proxy URL |`,
            `| \`${envPrefix}_TIMEOUT_SECS\` | Total request timeout in seconds |`,
            "",
            "Standard environment variables (`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` / `SSL_CERT_FILE`) are also honored.",
            ""
        )
    });
}

function generateOutputFormats(binaryName: string): Block {
    return new Block({
        id: "OUTPUT_FORMATS",
        content: lines(
            "## Output formats",
            "",
            "Use the global `--format` flag to control output. Supported values: `json` (default), `table`, `yaml`, `csv`.",
            "",
            "```bash",
            `# Pipe JSON output through jq`,
            `${binaryName} <resource> <method> --format json | jq`,
            "",
            "# Machine-readable catalog of every operation",
            `${binaryName} --help --format json | jq 'length'`,
            "```",
            ""
        )
    });
}

function generateShellCompletion(binaryName: string): Block {
    return new Block({
        id: "SHELL_COMPLETION",
        content: lines(
            "## Shell completion",
            "",
            "Generate shell completion scripts:",
            "",
            "```bash",
            `${binaryName} completion <bash|zsh|fish|powershell>`,
            "```",
            ""
        )
    });
}

// ---------------------------------------------------------------------------
// Help-output builder — renders a representative top-level --help block
// with the correct binary name, display name, env-var prefix, and auth
// env vars substituted in.
// ---------------------------------------------------------------------------

function buildHelpOutput(args: {
    binaryName: string;
    displayName: string;
    envPrefix: string;
    authBindings: DetectedAuthBinding[];
}): string[] {
    const { binaryName, displayName, envPrefix, authBindings } = args;

    const out: string[] = [];
    out.push(displayName);
    out.push("");
    out.push(`Usage: ${binaryName} [OPTIONS] <COMMAND>`);
    out.push("");
    out.push("Commands:");
    out.push("  ...                API resource commands (run --help to list)");
    out.push("  generate-skills    Generate SKILL.md files for AI agent integration");
    out.push("  completion         Generate shell completion scripts");
    out.push("  man                Generate a man page (roff format)");
    out.push("  help               Print this message or the help of the given subcommand(s)");
    out.push("");
    out.push("Options:");
    out.push("      --dry-run          Validate the request locally without sending it to the API");
    out.push("      --format <FORMAT>  Output format: json (default), table, yaml, csv");
    out.push("      --base-url <URL>   Override the API base URL (e.g. for testing against a mock server)");
    out.push("  -q, --quiet            Suppress stdout output on success (errors still go to stderr)");
    out.push("  -h, --help             Print help");
    out.push("  -V, --version          Print version");
    out.push("");
    out.push("Environment variables:");

    // Auth env vars first
    for (const binding of authBindings) {
        for (const envVar of binding.envVars) {
            out.push(`  ${padEnvVar(envVar)}${describeAuthEnvVar(binding.kind)}`);
        }
    }

    out.push(`  ${padEnvVar(`${envPrefix}_BASE_URL`)}Override the API base URL`);
    out.push(`  ${padEnvVar(`${envPrefix}_CA_BUNDLE`)}Path to PEM file with extra trust roots (or SSL_CERT_FILE)`);
    out.push(`  ${padEnvVar(`${envPrefix}_INSECURE=1`)}Skip TLS verification (debugging only)`);
    out.push(`  ${padEnvVar(`${envPrefix}_PROXY`)}HTTP(S) proxy URL`);
    out.push(`  ${padEnvVar(`${envPrefix}_TIMEOUT_SECS`)}Total request timeout`);
    out.push("");
    out.push("Standard env vars (HTTPS_PROXY / HTTP_PROXY / NO_PROXY / SSL_CERT_FILE) are also honored.");

    return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENV_VAR_COL_WIDTH = 36;

function padEnvVar(envVar: string): string {
    return envVar.padEnd(ENV_VAR_COL_WIDTH);
}

function describeAuthEnvVar(kind: DetectedAuthBinding["kind"]): string {
    switch (kind) {
        case "bearer":
            return "Bearer token for authentication";
        case "header":
            return "API key for authentication";
        case "basic":
            return "Credential for authentication";
    }
}

function placeholderForKind(kind: DetectedAuthBinding["kind"]): string {
    switch (kind) {
        case "bearer":
            return "<your token>";
        case "header":
            return "<your api key>";
        case "basic":
            return "<your credential>";
    }
}

/**
 * Join lines with `\n` and append a trailing newline. The trailing
 * empty-string element in each call-site produces the blank line that
 * separates adjacent H2 sections when blocks are concatenated.
 */
function lines(...parts: string[]): string {
    return parts.join("\n") + "\n";
}

async function readExistingReadme(readmePath: string): Promise<string | undefined> {
    try {
        return await readFile(readmePath, "utf-8");
    } catch {
        return undefined;
    }
}

/**
 * Mirrors `ReadmeGenerator.mergeBlocks()` from `@fern-api/generator-cli`:
 * parse the existing README into blocks, then merge with the freshly
 * generated set so customer-authored H2 sections survive regeneration.
 */
function mergeWithExisting(args: { existing: string | undefined; generatedBlocks: Block[] }): Block[] {
    const { existing, generatedBlocks } = args;
    if (existing == null) {
        return generatedBlocks;
    }
    const parser = new ReadmeParser();
    const parsed = parser.parse({ content: existing });
    const merger = new BlockMerger({
        original: parsed.blocks,
        updated: generatedBlocks
    });
    return merger.merge();
}
