import { writeFile } from "fs/promises";
import path from "path";
import type { DetectedAuthBinding } from "./detectAuth.js";

/**
 * Minimal info extracted from the generator config's GitHub output mode.
 * Kept narrow so the pipeline doesn't depend on the full GeneratorConfig type.
 */
export interface GithubInfo {
    repoUrl: string;
    version: string;
}

/**
 * Write a README.md into `outputDir` documenting the generated CLI binary.
 *
 * The README is intentionally concise — it tells the user what the CLI
 * does, how to install it, how to authenticate, and where to find more
 * help. It's only generated when the output target is a GitHub repository,
 * since that's the context where a README provides the most value.
 */
export async function generateReadme(args: {
    outputDir: string;
    binaryName: string;
    authBindings: DetectedAuthBinding[];
    github: GithubInfo;
}): Promise<void> {
    const content = renderReadme(args);
    await writeFile(path.join(args.outputDir, "README.md"), content);
}

export function renderReadme(args: {
    binaryName: string;
    authBindings: DetectedAuthBinding[];
    github: GithubInfo;
}): string {
    const { binaryName, authBindings, github } = args;
    const lines: string[] = [];

    lines.push(`# ${binaryName}`);
    lines.push("");
    lines.push(`A command-line interface for the ${binaryName} API.`);
    lines.push("");

    // Installation
    lines.push("## Installation");
    lines.push("");
    lines.push("### From GitHub Releases");
    lines.push("");
    lines.push(`Download the latest release for your platform from the [releases page](${github.repoUrl}/releases).`);
    lines.push("");
    lines.push("### From source");
    lines.push("");
    lines.push("```bash");
    lines.push(`cargo install --git ${github.repoUrl}`);
    lines.push("```");
    lines.push("");

    // Usage
    lines.push("## Usage");
    lines.push("");
    lines.push("```bash");
    lines.push(`${binaryName} --help`);
    lines.push("```");
    lines.push("");

    // Authentication
    if (authBindings.length > 0) {
        lines.push("## Authentication");
        lines.push("");
        lines.push("Set the following environment variable(s) to authenticate:");
        lines.push("");
        for (const binding of authBindings) {
            const envVars = extractEnvVars(binding);
            for (const envVar of envVars) {
                lines.push(`- \`${envVar}\``);
            }
        }
        lines.push("");
        lines.push("For example:");
        lines.push("");
        const firstEnvVar = extractEnvVars(authBindings[0]!)[0];
        lines.push("```bash");
        lines.push(`export ${firstEnvVar}="your-token"`);
        lines.push(`${binaryName} --help`);
        lines.push("```");
        lines.push("");
    }

    return lines.join("\n");
}

/**
 * Extract environment variable names from a detected auth binding's
 * Rust call string. The env vars appear as string literals inside
 * `from_env("...")` or `.env("...")` calls.
 */
function extractEnvVars(binding: DetectedAuthBinding): string[] {
    const envVarPattern = /(?:from_env|\.env)\("([^"]+)"\)/g;
    const envVars: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = envVarPattern.exec(binding.rustCall)) !== null) {
        envVars.push(match[1]!);
    }
    return envVars;
}
