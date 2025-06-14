import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { Project } from "ts-morph";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

const filePathOnDockerContainer = AbsoluteFilePath.of("/assets/asIs");

export namespace AsIsManager {
    export interface Init {
        useBigInt: boolean;
        generateWireTests: boolean;
        rootDirectory: string;
        testDirectory: string;
    }
}

export class AsIsManager {
    private readonly useBigInt: boolean;
    private readonly generateWireTests: boolean;
    private readonly rootDirectory: string;
    private readonly testDirectory: string;
    constructor({ useBigInt, generateWireTests, testDirectory, rootDirectory }: AsIsManager.Init) {
        this.useBigInt = useBigInt;
        this.generateWireTests = generateWireTests;
        this.rootDirectory = rootDirectory;
        this.testDirectory = testDirectory;
    }

    /**
     * A map containing the original source path and the target path in the generated project
     */
    private getAsIsFiles() {
        return {
            core: {
                mergeHeaders: { "core/headers.ts": `${this.rootDirectory}/core/headers.ts` },
                json: {
                    vanilla: { "core/json.vanilla.ts": `${this.rootDirectory}/core/json.ts` },
                    bigint: { "core/json.bigint.ts": `${this.rootDirectory}/core/json.ts` }
                }
            },
            tests: {
                mockServer: {
                    ["tests/mock-server/*"]: `${this.testDirectory}/mock-server/`
                },
                bigintSetup: { ["tests/bigint.setup.ts"]: `${this.testDirectory}/bigint.setup.ts` }
            },
            scripts: {
                renameToEsmFiles: {
                    "scripts/rename-to-esm-files.js": "scripts/rename-to-esm-files.js"
                }
            }
        };
    }

    public async AddToTsProject({ project }: { project: Project }): Promise<void> {
        const filesToCopy: Record<string, string>[] = [];
        const asIsFiles = this.getAsIsFiles();

        filesToCopy.push(asIsFiles.core.mergeHeaders);
        filesToCopy.push(asIsFiles.scripts.renameToEsmFiles);
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
                    const sourcePatternBase = sourcePattern.replace("/*", "");
                    const relativePath = path.relative(sourcePatternBase, match);
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
