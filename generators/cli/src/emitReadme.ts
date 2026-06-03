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
    const blocks = generateBlocks({ binaryName, authBindings, npmPublishInfo });

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
    return lines(`# ${displayName} CLI`, "", `Command-line interface for the ${displayName} API.`, "");
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
    authBindings: DetectedAuthBinding[];
    npmPublishInfo: ResolvedNpmPublishInfo | undefined;
}): Block[] {
    const { binaryName, authBindings, npmPublishInfo } = args;
    return [
        generateInstallation({ binaryName, npmPublishInfo }),
        generateAuthentication({ binaryName, authBindings }),
        generateUsage(binaryName),
        generateOutputFormats(binaryName),
        generateConfiguration(binaryName),
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
            ""
        );
    } else {
        content = lines(
            "## Installation",
            "",
            "Build from source:",
            "",
            "```bash",
            "cargo build --release",
            "```",
            "",
            `The compiled binary will be available at \`target/release/${binaryName}\`.`,
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
            envLines.push(`export ${envVar}="<your ${describeAuthKind(binding.kind)}>"`);
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
            ""
        )
    });
}

function generateUsage(binaryName: string): Block {
    return new Block({
        id: "USAGE",
        content: lines(
            "## Usage",
            "",
            "```bash",
            `${binaryName} --help                 # list commands and flags`,
            `${binaryName} --help --format json   # full machine-readable command surface`,
            "```",
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
            `${binaryName} <command> --format json | jq`,
            "```",
            ""
        )
    });
}

function generateConfiguration(binaryName: string): Block {
    const envPrefix = toEnvVarPrefix(binaryName);
    return new Block({
        id: "CONFIGURATION",
        content: lines(
            "## Configuration",
            "",
            "Override the default base URL with the `--base-url` flag or the environment variable:",
            "",
            "```bash",
            `export ${envPrefix}_BASE_URL="https://api.example.com"`,
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
// Helpers
// ---------------------------------------------------------------------------

function describeAuthKind(kind: DetectedAuthBinding["kind"]): string {
    switch (kind) {
        case "bearer":
            return "token";
        case "header":
            return "api key";
        case "basic":
            return "credential";
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
