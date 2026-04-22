import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { execSync } from "child_process";
import { cp, mkdir, readFile, writeFile } from "fs/promises";

const BASELINE_DIR = "baseline";
const CUSTOM_CONFIGS_DIR = "custom-configs";

/**
 * Get the path to a fixture's baseline directory.
 * e.g. seed/python-sdk/exhaustive/baseline/
 */
export function getBaselineDir(workspaceDir: AbsoluteFilePath, fixture: string): AbsoluteFilePath {
    return join(workspaceDir, RelativeFilePath.of(fixture), RelativeFilePath.of(BASELINE_DIR));
}

/**
 * Get the path to a variant's .diff file within custom-configs/.
 * e.g. seed/python-sdk/exhaustive/custom-configs/pydantic-v1.diff
 */
export function getDiffFilePath(
    workspaceDir: AbsoluteFilePath,
    fixture: string,
    outputFolder: string
): AbsoluteFilePath {
    return join(
        workspaceDir,
        RelativeFilePath.of(fixture),
        RelativeFilePath.of(CUSTOM_CONFIGS_DIR),
        RelativeFilePath.of(`${outputFolder}.diff`)
    );
}

/**
 * Get the path to the custom-configs directory for a fixture.
 * e.g. seed/python-sdk/exhaustive/custom-configs/
 */
export function getCustomConfigsDir(workspaceDir: AbsoluteFilePath, fixture: string): AbsoluteFilePath {
    return join(workspaceDir, RelativeFilePath.of(fixture), RelativeFilePath.of(CUSTOM_CONFIGS_DIR));
}

function isExecError(error: unknown): error is { status: number; stdout: string; stderr: string } {
    return typeof error === "object" && error !== null && "status" in error;
}

/**
 * Normalize absolute paths in a git diff to use relative `a/` and `b/` prefixes.
 *
 * `git diff --no-index` embeds absolute paths like:
 *   diff --git a/Users/dev/.../baseline/file.py b/var/folders/.../tmp/file.py
 *
 * This function strips the directory prefixes so the diff becomes portable:
 *   diff --git a/file.py b/file.py
 *
 * The normalized diff can then be applied with `git apply -p1`.
 */
function normalizeDiffPaths(diffContent: string, baselineDir: string, variantDir: string): string {
    // git diff --no-index strips the leading "/" from absolute paths, so
    // /Users/dev/project/baseline becomes a/Users/dev/project/baseline/file.py
    //
    // For modified files: a/ uses baseline path, b/ uses variant path.
    // For deleted files (only in baseline): BOTH a/ and b/ use the baseline path.
    // For new files (only in variant): BOTH a/ and b/ use the variant path.
    //
    // We must normalize all four combinations to produce portable relative paths.
    const baselinePrefix = baselineDir.startsWith("/") ? baselineDir.slice(1) : baselineDir;
    const variantPrefix = variantDir.startsWith("/") ? variantDir.slice(1) : variantDir;

    const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const baselineEscaped = escapeRegex(baselinePrefix);
    const variantEscaped = escapeRegex(variantPrefix);

    let normalized = diffContent;

    // Replace all four path combinations (baseline and variant can appear on either side)
    normalized = normalized.replace(new RegExp(`a/${baselineEscaped}/`, "g"), "a/");
    normalized = normalized.replace(new RegExp(`b/${baselineEscaped}/`, "g"), "b/");
    normalized = normalized.replace(new RegExp(`a/${variantEscaped}/`, "g"), "a/");
    normalized = normalized.replace(new RegExp(`b/${variantEscaped}/`, "g"), "b/");

    return normalized;
}

/**
 * Compute a unified diff between the baseline directory and a variant directory.
 * Uses `git diff --no-index --binary --no-color` for portable, reliable diffs
 * that handle binary files.
 *
 * The output diff uses relative paths (a/file.py, b/file.py) so it's portable
 * across machines and can be applied with `git apply -p1`.
 *
 * Returns the diff content as a string (empty string if directories are identical).
 */
export function computeDiff(baselineDir: AbsoluteFilePath, variantDir: AbsoluteFilePath): string {
    let rawDiff: string;
    try {
        // git diff --no-index exits with code 1 when there are differences,
        // code 0 when identical, and >1 on error
        rawDiff = execSync(`git diff --no-index --binary --no-color -- "${baselineDir}" "${variantDir}"`, {
            encoding: "utf-8",
            maxBuffer: 100 * 1024 * 1024, // 100MB
            stdio: ["pipe", "pipe", "pipe"]
        });
    } catch (error: unknown) {
        if (isExecError(error) && error.status === 1) {
            // Exit code 1 means differences found — stdout has the diff
            rawDiff = error.stdout ?? "";
        } else if (isExecError(error)) {
            throw new Error(`git diff failed: ${error.stderr ?? "unknown error"}`);
        } else {
            throw error;
        }
    }

    if (rawDiff.length === 0) {
        return rawDiff;
    }

    return normalizeDiffPaths(rawDiff, baselineDir, variantDir);
}

/**
 * Compute a diff and write it to the custom-configs directory.
 * Creates the custom-configs/ directory if it doesn't exist.
 * Returns the path to the written diff file.
 */
export async function computeAndStoreDiff(
    baselineDir: AbsoluteFilePath,
    variantDir: AbsoluteFilePath,
    workspaceDir: AbsoluteFilePath,
    fixture: string,
    outputFolder: string
): Promise<AbsoluteFilePath> {
    const diffContent = computeDiff(baselineDir, variantDir);
    const customConfigsDir = getCustomConfigsDir(workspaceDir, fixture);
    await mkdir(customConfigsDir, { recursive: true });

    const diffPath = getDiffFilePath(workspaceDir, fixture, outputFolder);
    await writeFile(diffPath, diffContent, "utf-8");
    return diffPath;
}

/**
 * Reconstruct a full variant directory from the baseline and a diff.
 *
 * 1. Copies the baseline directory to the target directory
 * 2. Applies the diff using `git apply -p1`
 */
export async function reconstructVariant(
    baselineDir: AbsoluteFilePath,
    diffFilePath: AbsoluteFilePath,
    targetDir: AbsoluteFilePath
): Promise<void> {
    // Copy baseline to target
    await mkdir(targetDir, { recursive: true });
    await cp(baselineDir, targetDir, { recursive: true });

    // Read the diff content to check if it's empty
    const diffContent = await readFile(diffFilePath, "utf-8");
    if (diffContent.trim().length === 0) {
        // Empty diff — variant is identical to baseline, nothing to apply
        return;
    }

    // Apply the diff directly from the file. The diff uses relative paths (a/file, b/file)
    // so we use -p1 to strip the a/ and b/ prefixes, applied within the target directory.
    execSync(`git apply -p1 "${diffFilePath}"`, {
        encoding: "utf-8",
        cwd: targetDir,
        stdio: ["pipe", "pipe", "pipe"]
    });
}

export { BASELINE_DIR, CUSTOM_CONFIGS_DIR };
