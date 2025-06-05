import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { Project } from "ts-morph";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

const filePathOnDockerContainer = AbsoluteFilePath.of("/assets/asIs");
/**
 * A map containing the original source path and the target path in the generated project
 */
const asIsFiles = {
    core: {
        mergeHeaders: { "core/headers.ts": "src/core/headers.ts" },
        json: {
            vanilla: { "core/json.vanilla.ts": "src/core/json.ts" },
            bigint: { "core/json.bigint.ts": "src/core/json.ts" }
        }
    },
    tests: {
        mockServer: {
            "tests/mock-server/*": "tests/mock-server/"
        },
        bigintSetup: { "tests/bigint.setup.ts": "tests/bigint.setup.ts" }
    }
} as const;

export namespace AsIsManager {
    export interface Init {
        useBigInt: boolean;
        generateWireTests: boolean;
    }
}

export class AsIsManager {
    private readonly useBigInt: boolean;
    private readonly generateWireTests: boolean;
    constructor({ useBigInt, generateWireTests }: AsIsManager.Init) {
        this.useBigInt = useBigInt;
        this.generateWireTests = generateWireTests;
    }

    public async AddToTsProject({ project }: { project: Project }): Promise<void> {
        const filesToCopy: Record<string, string>[] = [];

        filesToCopy.push(asIsFiles.core.mergeHeaders);
        if (this.useBigInt) {
            filesToCopy.push(asIsFiles.tests.bigintSetup);
            filesToCopy.push(asIsFiles.core.json.bigint);
        } else {
            filesToCopy.push(asIsFiles.core.json.vanilla);
        }
        if (this.generateWireTests) {
            filesToCopy.push(asIsFiles.tests.mockServer);
        }

        for (const [sourcePattern, targetPattern] of filesToCopy.flatMap(Object.entries) as [string, string][]) {
            if (sourcePattern.includes("*")) {
                const matches = await glob(sourcePattern, {
                    cwd: filePathOnDockerContainer,
                    absolute: false
                });

                for (const match of matches) {
                    const sourceFilePath = path.join(filePathOnDockerContainer, match);
                    const relativePath = path.relative(filePathOnDockerContainer, match);
                    const targetFilePath = path.join(targetPattern, relativePath);
                    const fileContent = await fs.readFile(sourceFilePath, "utf-8");
                    project.createSourceFile(targetFilePath, fileContent, { overwrite: true });
                }
            } else {
                // Handle direct file mapping
                const fileContent = await fs.readFile(path.join(filePathOnDockerContainer, sourcePattern), "utf-8");
                project.createSourceFile(targetPattern, fileContent, { overwrite: true });
            }
        }
    }
}
