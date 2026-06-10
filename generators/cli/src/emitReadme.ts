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
 * The README follows progressive disclosure: install → auth → quick
 * start → reference link, then an Advanced section for deeper config.
 * `ReadmeParser` strips `## Table of contents` from an existing README
 * so the TOC is regenerated cleanly after the block merge.
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

    const header = generateHeader({ displayName, npmPublishInfo });
    const blocks = generateBlocks({ binaryName, displayName, authBindings, npmPublishInfo });

    const readmePath = path.join(outputDir, "README.md");
    const existing = await readExistingReadme(readmePath);
    const finalBlocks = mergeWithExisting({ existing, generatedBlocks: blocks });

    const toc = generateTableOfContents(finalBlocks);
    const content = header + toc + finalBlocks.map((b) => b.content).join("");
    await writeFile(readmePath, content);
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function generateHeader(args: { displayName: string; npmPublishInfo: ResolvedNpmPublishInfo | undefined }): string {
    const { displayName, npmPublishInfo } = args;
    const suffix = displayName.toUpperCase().endsWith("API") ? "" : " API";
    const shieldLines: string[] = [];
    if (npmPublishInfo != null) {
        shieldLines.push(
            `[![npm shield](https://img.shields.io/npm/v/${npmPublishInfo.packageName})](https://www.npmjs.com/package/${npmPublishInfo.packageName})`
        );
    }
    if (shieldLines.length > 0) {
        return lines(
            `# ${displayName} CLI`,
            "",
            shieldLines.join("\n"),
            "",
            `Command-line interface for the ${displayName}${suffix}.`,
            ""
        );
    }
    return lines(`# ${displayName} CLI`, "", `Command-line interface for the ${displayName}${suffix}.`, "");
}

// ---------------------------------------------------------------------------
// Table of contents — generated after the block merge so it reflects
// customer-added sections too.  ReadmeParser strips any existing
// `## Table of contents` block, so we never get duplicates.
// ---------------------------------------------------------------------------

function generateTableOfContents(blocks: Block[]): string {
    if (blocks.length === 0) {
        return "";
    }
    const tocLines: string[] = [];
    for (const block of blocks) {
        const title = extractBlockTitle(block);
        if (title == null) {
            continue;
        }
        const anchor = toAnchor(title);
        tocLines.push(`- [${title}](#${anchor})`);
        if (block.id === "ADVANCED") {
            for (const sub of extractSubsectionTitles(block)) {
                tocLines.push(`  - [${sub}](#${toAnchor(sub)})`);
            }
        }
    }
    return lines("## Table of contents", "", ...tocLines, "");
}

function extractBlockTitle(block: Block): string | undefined {
    const match = block.content.match(/^## (.+)/);
    return match?.[1];
}

function extractSubsectionTitles(block: Block): string[] {
    const titles: string[] = [];
    for (const match of block.content.matchAll(/^### (.+)/gm)) {
        if (match[1] != null) {
            titles.push(match[1]);
        }
    }
    return titles;
}

function toAnchor(title: string): string {
    return title.toLowerCase().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Block builders — one per generated H2 section.
//
// Each follows the same convention as ReadmeGenerator's private helpers:
// build a content string starting with `## Title\n`, ending with a
// trailing blank line (`\n`), and wrap it in a `Block` keyed by a
// SCREAMING_SNAKE_CASE id that ReadmeParser.sectionNameToID would
// produce from the heading text.
//
// Progressive disclosure ordering:
//   Layer 1 (80% path): Installation → Authentication → Quick start
//   Layer 2 (bridge):   Usage → Documentation
//   Layer 3 (deep):     Advanced (Common flags / Env vars / Output / Completion)
// ---------------------------------------------------------------------------

function generateBlocks(args: {
    binaryName: string;
    displayName: string;
    authBindings: DetectedAuthBinding[];
    npmPublishInfo: ResolvedNpmPublishInfo | undefined;
}): Block[] {
    const { binaryName, authBindings, npmPublishInfo } = args;
    const envPrefix = toEnvVarPrefix(binaryName);
    return [
        generateInstallation({ binaryName, npmPublishInfo }),
        generateAuthentication({ binaryName, authBindings }),
        generateQuickStart(binaryName),
        generateUsage(binaryName),
        generateDocumentation(),
        generateAdvanced({ binaryName, envPrefix })
    ];
}

// ---------------------------------------------------------------------------
// Installation (unchanged)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Authentication (unchanged)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Quick start (new — layer 1 "try it now")
// ---------------------------------------------------------------------------

function generateQuickStart(binaryName: string): Block {
    return new Block({
        id: "QUICK_START",
        content: lines(
            "## Quick start",
            "",
            "List available commands:",
            "",
            "```bash",
            `${binaryName} --help`,
            "```",
            "",
            "Call an API endpoint:",
            "",
            "```bash",
            `${binaryName} <resource> <method>`,
            "```",
            "",
            `Run \`${binaryName} <resource> --help\` to see available methods for a resource.`,
            ""
        )
    });
}

// ---------------------------------------------------------------------------
// Usage (trimmed — no --help dump, subcommand pattern + --json)
// ---------------------------------------------------------------------------

function generateUsage(binaryName: string): Block {
    return new Block({
        id: "USAGE",
        content: lines(
            "## Usage",
            "",
            `Every API resource appears as a subcommand (e.g. \`${binaryName} <resource> <method>\`). ` +
                `Run \`${binaryName} <resource> --help\` to see available methods.`,
            "",
            "Provide request parameters as flags or as JSON:",
            "",
            "```bash",
            `${binaryName} <resource> <method> --json '{"key": "value"}'`,
            "```",
            ""
        )
    });
}

// ---------------------------------------------------------------------------
// Documentation (reference.md link)
// ---------------------------------------------------------------------------

function generateDocumentation(): Block {
    return new Block({
        id: "DOCUMENTATION",
        content: lines("## Documentation", "", "See [reference.md](./reference.md) for the full command reference.", "")
    });
}

// ---------------------------------------------------------------------------
// Advanced — collapses Common flags / Environment variables / Output
// formats / Shell completion into ### subsections under one H2.
// ---------------------------------------------------------------------------

function generateAdvanced(args: { binaryName: string; envPrefix: string }): Block {
    const { binaryName, envPrefix } = args;
    return new Block({
        id: "ADVANCED",
        content: lines(
            "## Advanced",
            "",
            "### Common flags",
            "",
            "These flags are available on every operation:",
            "",
            "| Flag | Description |",
            "|------|-------------|",
            "| `--dry-run` | Validate the request locally and print the HTTP request without sending it |",
            "| `--json <JSON\\|->` | Supply a request body as JSON (or `-` to read stdin) |",
            "| `--params <JSON>` | Merge extra parameters as JSON (overrides individual flags) |",
            "| `--format <json\\|table\\|yaml\\|csv>` | Output format (default `json`) |",
            "| `--output <PATH>` | Write binary responses to a file |",
            "| `--base-url <URL>` | Override the API base URL |",
            "| `--page-all` | Auto-paginate and stream results as NDJSON |",
            "| `--page-limit <N>` | Max pages to fetch when auto-paginating (default `10`) |",
            "| `-q, --quiet` | Suppress stdout output on success (errors still go to stderr) |",
            "",
            "### Environment variables",
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
            "",
            "### Output formats",
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
            "",
            "### Shell completion",
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
// Helpers
// ---------------------------------------------------------------------------

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
