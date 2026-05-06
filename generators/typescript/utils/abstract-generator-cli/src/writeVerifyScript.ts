import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { packageManagerCommands, SupportedPackageManager } from "./packageManagerCommands";

const VERIFY_SCRIPT_FILENAME = "verify.sh";
const VERIFY_SCRIPT_DIRNAME = ".fern";
const VERIFY_SCRIPT_MODE = 0o755;

/**
 * Renders the `.fern/verify.sh` body for the given package manager. The script
 * is the contract the paired validator Docker image executes against a freshly
 * generated SDK to confirm it installs, builds, and tests cleanly.
 */
export function buildVerifyScript(packageManager: SupportedPackageManager): string {
    const { install, build, test } = packageManagerCommands(packageManager);
    return `#!/bin/bash
set -euo pipefail
${install}
${build}
${test}
`;
}

export async function writeVerifyScript({
    pathToProject,
    packageManager
}: {
    pathToProject: AbsoluteFilePath;
    packageManager: SupportedPackageManager;
}): Promise<void> {
    const verifyScriptDir = path.join(pathToProject, VERIFY_SCRIPT_DIRNAME);
    await mkdir(verifyScriptDir, { recursive: true });
    const verifyScriptPath = path.join(verifyScriptDir, VERIFY_SCRIPT_FILENAME);
    await writeFile(verifyScriptPath, buildVerifyScript(packageManager), { mode: VERIFY_SCRIPT_MODE });
}
