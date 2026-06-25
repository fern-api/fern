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
 * We also drop the `cargo:crates/pipeline-fixture` workspace member that
 * the template inherits verbatim from cli-sdk's own `dist-workspace.toml`.
 * `pipeline-fixture` is a cli-sdk-only release-pipeline smoke-test crate; it
 * is never vendored into generated CLIs, so leaving the member in place makes
 * `cargo metadata` / `cargo dist plan` fail to load a nonexistent manifest.
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
 * comments would otherwise dangle without context), and strips `"npm"`
 * from the `installers` array so cargo-dist only produces shell +
 * powershell installers. Leaves the file unchanged when no anchors
 * match and installers doesn't contain npm.
 */
export function applyDistWorkspacePatch(distToml: string): string {
    let result = distToml.replace(NPM_SCOPE_BLOCK, "").replace(NPM_PACKAGE_BLOCK, "");
    result = stripNpmInstaller(result);
    result = removeWorkspaceMember(result, PIPELINE_FIXTURE_MEMBER);
    return result;
}

/**
 * Remove a workspace member entry from the `members = [...]` array under
 * `[workspace]`, leaving the rest of the list intact. No-op when the
 * `[workspace]` section, the `members` array, or the member is absent.
 */
export function removeWorkspaceMember(distToml: string, member: string): string {
    return distToml.replace(
        /(\[workspace\]\s*\nmembers\s*=\s*\[)([^\]]*)\]/,
        (_match, prefix: string, inner: string) => {
            const items = inner
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && s !== `"${member}"`);
            return `${prefix}${items.join(", ")}]`;
        }
    );
}

/**
 * Defensively removes `"npm"` from the `installers = [...]` line in
 * dist-workspace.toml. This ensures that even if an older or manually
 * edited template still lists npm, the generated output won't include
 * it — npm publishing is handled by the separate ci.yml pipeline.
 */
export function stripNpmInstaller(distToml: string): string {
    return distToml.replace(/^(installers\s*=\s*\[)([^\]]*)\]/m, (_match, prefix: string, inner: string) => {
        const items = inner
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s !== '"npm"');
        return `${prefix}${items.join(", ")}]`;
    });
}

/**
 * Add a types crate as a workspace member. Inserts a `members` array
 * entry under `[workspace]` if the section exists, or appends a new
 * `[workspace]` section.
 */
export function addWorkspaceMember(distToml: string, typesCrateName: string): string {
    const memberLine = `"cargo:${typesCrateName}"`;
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

/**
 * cli-sdk-only release-pipeline smoke-test crate. It lives in cli-sdk's
 * workspace but is never vendored into generated CLIs, so its `members`
 * entry must be stripped from the shipped `dist-workspace.toml`.
 */
const PIPELINE_FIXTURE_MEMBER = "cargo:crates/pipeline-fixture";

const NPM_SCOPE_BLOCK = `# A namespace to use when publishing this package to the npm registry
npm-scope = "@fern-api"
`;

const NPM_PACKAGE_BLOCK = `# The npm package should have this name
npm-package = "cli-sdk"
`;
