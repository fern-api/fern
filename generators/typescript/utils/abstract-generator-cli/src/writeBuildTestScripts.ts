import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const FERN_DIR = ".fern";

export async function writeBuildTestScripts({
    pathToProject,
    packageManager
}: {
    pathToProject: AbsoluteFilePath;
    packageManager: "pnpm" | "yarn";
}): Promise<void> {
    const fernDir = path.join(pathToProject, FERN_DIR);
    await mkdir(fernDir, { recursive: true });

    const buildScript = generateBuildScript(packageManager);
    const testScript = generateTestScript(packageManager);

    await writeFile(path.join(fernDir, "build.sh"), buildScript, { mode: 0o755 });
    await writeFile(path.join(fernDir, "test.sh"), testScript, { mode: 0o755 });
}

function generateBuildScript(packageManager: "pnpm" | "yarn"): string {
    if (packageManager === "yarn") {
        return [
            "#!/bin/sh",
            "set -e",
            "",
            'if [ ! -f "package.json" ]; then',
            '  echo "No package.json found, skipping build"',
            "  exit 0",
            "fi",
            "",
            "corepack enable",
            "corepack prepare yarn --activate",
            "",
            'if [ -f "yarn.lock" ]; then',
            "  corepack yarn install --frozen-lockfile",
            "else",
            "  corepack yarn install",
            "fi",
            "",
            "if grep -q '\"build\":' package.json; then",
            "  corepack yarn build",
            "fi",
            ""
        ].join("\n");
    }

    return [
        "#!/bin/sh",
        "set -e",
        "",
        'if [ ! -f "package.json" ]; then',
        '  echo "No package.json found, skipping build"',
        "  exit 0",
        "fi",
        "",
        "corepack enable",
        "corepack prepare pnpm --activate",
        "",
        'if [ -f "pnpm-lock.yaml" ]; then',
        "  corepack pnpm install --frozen-lockfile",
        "else",
        "  corepack pnpm install",
        "fi",
        "",
        "if grep -q '\"build\":' package.json; then",
        "  corepack pnpm build",
        "fi",
        ""
    ].join("\n");
}

function generateTestScript(packageManager: "pnpm" | "yarn"): string {
    if (packageManager === "yarn") {
        return [
            "#!/bin/sh",
            "set -e",
            "",
            'if [ ! -f "package.json" ]; then',
            '  echo "No package.json found, skipping tests"',
            "  exit 0",
            "fi",
            "",
            "if grep -q '\"test\":' package.json; then",
            "  corepack yarn test",
            "fi",
            ""
        ].join("\n");
    }

    return [
        "#!/bin/sh",
        "set -e",
        "",
        'if [ ! -f "package.json" ]; then',
        '  echo "No package.json found, skipping tests"',
        "  exit 0",
        "fi",
        "",
        "if grep -q '\"test\":' package.json; then",
        "  corepack pnpm test",
        "fi",
        ""
    ].join("\n");
}
