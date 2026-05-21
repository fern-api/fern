import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { SupportedPackageManager } from "./packageManagerCommands";

const LOCKFILE_SCRIPT_FILENAME = "regenerate-lockfile.sh";
const LOCKFILE_SCRIPT_DIRNAME = ".fern";
const LOCKFILE_SCRIPT_MODE = 0o755;

export function buildLockfileScript(packageManager: SupportedPackageManager): string {
    if (packageManager === "yarn") {
        return `#!/bin/bash
set -euo pipefail
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --mode=update-lockfile --ignore-scripts --prefer-offline
`;
    }
    return `#!/bin/bash
set -euo pipefail
PNPM_FROZEN_LOCKFILE=false pnpm install --lockfile-only --ignore-scripts --prefer-offline
`;
}

export async function writeLockfileScript({
    pathToProject,
    packageManager
}: {
    pathToProject: AbsoluteFilePath;
    packageManager: SupportedPackageManager;
}): Promise<void> {
    const dir = path.join(pathToProject, LOCKFILE_SCRIPT_DIRNAME);
    await mkdir(dir, { recursive: true });
    const scriptPath = path.join(dir, LOCKFILE_SCRIPT_FILENAME);
    await writeFile(scriptPath, buildLockfileScript(packageManager), { mode: LOCKFILE_SCRIPT_MODE });
}
