import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const VERIFY_SCRIPT_FILENAME = "verify.sh";
const VERIFY_SCRIPT_DIRNAME = ".fern";
const VERIFY_SCRIPT_MODE = 0o755;

/**
 * Renders the `.fern/verify.sh` body for the given package manager. The script
 * is the contract the paired validator Docker image executes against a freshly
 * generated SDK to confirm it installs, builds, and tests cleanly.
 */
export function buildVerifyScript(packageManager: "pnpm" | "yarn"): string {
    return `#!/bin/bash
set -euo pipefail
${packageManager} install
${packageManager} build
${packageManager} test
`;
}

export async function writeVerifyScript({
    pathToProject,
    packageManager
}: {
    pathToProject: AbsoluteFilePath;
    packageManager: "pnpm" | "yarn";
}): Promise<void> {
    const verifyScriptDir = path.join(pathToProject, VERIFY_SCRIPT_DIRNAME);
    await mkdir(verifyScriptDir, { recursive: true });
    const verifyScriptPath = path.join(verifyScriptDir, VERIFY_SCRIPT_FILENAME);
    await writeFile(verifyScriptPath, buildVerifyScript(packageManager), { mode: VERIFY_SCRIPT_MODE });
}
