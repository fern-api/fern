import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const FERN_DIR = ".fern";
const OUTPUT_JSON = "output.json";

export interface GeneratorOutput {
    buildTestDockerImage?: string;
}

export async function writeBuildTestScripts({
    pathToProject,
    packageManager,
    buildTestDockerImage
}: {
    pathToProject: AbsoluteFilePath;
    packageManager: "pnpm" | "yarn";
    buildTestDockerImage?: string;
}): Promise<void> {
    const fernDir = path.join(pathToProject, FERN_DIR);
    await mkdir(fernDir, { recursive: true });

    const buildScript = generateBuildScript(packageManager);
    const testScript = generateTestScript(packageManager);

    await writeFile(path.join(fernDir, "build.sh"), buildScript, { mode: 0o755 });
    await writeFile(path.join(fernDir, "test.sh"), testScript, { mode: 0o755 });

    if (buildTestDockerImage != null) {
        const output: GeneratorOutput = { buildTestDockerImage };
        await writeFile(path.join(fernDir, OUTPUT_JSON), JSON.stringify(output, null, 2) + "\n");
    }
}

function generateBuildScript(packageManager: "pnpm" | "yarn"): string {
    if (packageManager === "yarn") {
        return `#!/bin/sh
set -e

corepack enable
corepack prepare yarn --activate
corepack yarn install --frozen-lockfile
corepack yarn build
`;
    }

    return `#!/bin/sh
set -e

corepack enable
corepack prepare pnpm --activate
corepack pnpm install --frozen-lockfile
corepack pnpm build
`;
}

function generateTestScript(packageManager: "pnpm" | "yarn"): string {
    if (packageManager === "yarn") {
        return `#!/bin/sh
set -e

corepack enable
corepack prepare yarn --activate
corepack yarn test
`;
    }

    return `#!/bin/sh
set -e

corepack enable
corepack prepare pnpm --activate
corepack pnpm test
`;
}
