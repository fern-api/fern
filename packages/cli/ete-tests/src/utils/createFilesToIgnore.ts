import { mkdir, writeFile } from "fs/promises";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

export async function createFilesToIgnore(pathOfDirectory: AbsoluteFilePath): Promise<void> {
    const absolutePathToLocalOutput = join(pathOfDirectory, RelativeFilePath.of("generated/typescript"));
    await writeFile(`${absolutePathToLocalOutput}/.fernignore`, "fern.js\n**/*.txt");
    await writeFile(`${absolutePathToLocalOutput}/fern.js`, "#!/usr/bin/env node\nconsole.log('Fern <3 OpenAPI')");
    await mkdir(`${absolutePathToLocalOutput}/slam`);
    await writeFile(`${absolutePathToLocalOutput}/slam/slam.txt`, "Practice schema-first API design with Fern");
}
