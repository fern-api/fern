import { readFile, writeFile } from "fs/promises";
import path from "path";

/**
 * Strip Fern-specific identifiers from the shipped `dist-workspace.toml`.
 *
 * The SDK template's file pins `npm-scope = "@fern-api"` and
 * `npm-package = "cli-sdk"` — values used by cargo-dist when generating
 * its npm installer artifact. If the customer runs `cargo dist plan`
 * without editing these, the published installer would target Fern's
 * npm namespace, which is wrong. We delete both lines so the customer
 * either fills in their own values or accepts cargo-dist's defaults
 * (no npm installer).
 *
 * Everything else in the file — `targets`, `installers`, `ci`,
 * `archive` formats — is generic boilerplate worth keeping.
 *
 * No-op when the file doesn't exist (e.g. if a future change removes
 * the dist-workspace.toml from the SDK template entirely).
 */
export async function patchDistWorkspaceToml(args: {
    outputDir: string;
    typesCrateName?: string;
    sdkCrateName?: string;
}): Promise<void> {
    const { outputDir, typesCrateName, sdkCrateName } = args;
    const distTomlPath = path.join(outputDir, "dist-workspace.toml");
    let contents: string;
    try {
        contents = await readFile(distTomlPath, "utf-8");
    } catch {
        return;
    }

    if (typesCrateName != null || sdkCrateName != null) {
        let patched = contents;
        if (typesCrateName != null) {
            patched = addWorkspaceMember(patched, typesCrateName);
        }
        if (sdkCrateName != null) {
            patched = addWorkspaceMember(patched, sdkCrateName);
        }
        await writeFile(distTomlPath, patched);
        return;
    }

    const patched = applyDistWorkspacePatch(contents);
    if (patched === contents) {
        return;
    }
    await writeFile(distTomlPath, patched);
}

/**
 * Pure transformation, exported for unit-test access. Removes the two
 * Fern-branded lines (and their preceding `#` comments, when those
 * comments would otherwise dangle without context). Leaves the file
 * unchanged when neither anchor is present.
 */
export function applyDistWorkspacePatch(distToml: string): string {
    return distToml.replace(NPM_SCOPE_BLOCK, "").replace(NPM_PACKAGE_BLOCK, "");
}

/**
 * Add a types crate as a workspace member. Inserts a `members` array
 * entry under `[workspace]` if the section exists, or appends a new
 * `[workspace]` section.
 */
export function addWorkspaceMember(distToml: string, typesCrateName: string): string {
    const memberLine = `"${typesCrateName}"`;
    // Look for existing [workspace] with members = [...]
    const workspaceMatch = distToml.match(/(\[workspace\]\s*\nmembers\s*=\s*\[)([^\]]*)\]/);
    if (workspaceMatch != null) {
        const existing = workspaceMatch[2]?.trim() ?? "";
        const newMembers = existing.length > 0 ? `${existing}, ${memberLine}` : memberLine;
        return distToml.replace(workspaceMatch[0], `${workspaceMatch[1]}${newMembers}]`);
    }
    // Look for [workspace] without members
    const wsIdx = distToml.indexOf("[workspace]");
    if (wsIdx !== -1) {
        const insertPos = wsIdx + "[workspace]".length;
        return distToml.slice(0, insertPos) + `\nmembers = [${memberLine}]` + distToml.slice(insertPos);
    }
    // No [workspace] section — append one
    return distToml + `\n[workspace]\nmembers = [${memberLine}]\n`;
}

const NPM_SCOPE_BLOCK = `# A namespace to use when publishing this package to the npm registry
npm-scope = "@fern-api"
`;

const NPM_PACKAGE_BLOCK = `# The npm package should have this name
npm-package = "cli-sdk"
`;
