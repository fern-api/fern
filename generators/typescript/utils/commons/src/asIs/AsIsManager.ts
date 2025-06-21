import fs from "fs/promises";
import { glob } from "glob";
import path from "path";
import { Project } from "ts-morph";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

const filePathOnDockerContainer = AbsoluteFilePath.of("/assets/asIs");

const DEFAULT_PACKAGE_PATH = "src";
export namespace AsIsManager {
    export interface Init {
        useBigInt: boolean;
        generateWireTests: boolean;
        relativePackagePath: string;
        relativeTestPath: string;
    }
}

export class AsIsManager {
    private readonly useBigInt: boolean;
    private readonly generateWireTests: boolean;
    private readonly relativePackagePath: string;
    private readonly relativeTestPath: string;
    constructor({ useBigInt, generateWireTests, relativePackagePath, relativeTestPath }: AsIsManager.Init) {
        this.useBigInt = useBigInt;
        this.generateWireTests = generateWireTests;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
    }

    /**
     * A map containing the original source path and the target path in the generated project
     */
    private getAsIsFiles() {
        return {
            core: {
                mergeHeaders: { "core/headers.ts": `${this.relativePackagePath}/core/headers.ts` },
                json: {
                    vanilla: { "core/json.vanilla.ts": `${this.relativePackagePath}/core/json.ts` },
                    bigint: { "core/json.bigint.ts": `${this.relativePackagePath}/core/json.ts` }
                }
            },
            tests: {
                mockServer: {
                    ["tests/mock-server/*"]: `${this.relativeTestPath}/mock-server/`
                },
                bigintSetup: { ["tests/bigint.setup.ts"]: `${this.relativeTestPath}/bigint.setup.ts` }
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
                    const relativePath = path.relative(filePathOnDockerContainer, match);
                    const targetFilePath = path.join(targetPattern, relativePath);
                    let fileContent = await fs.readFile(sourceFilePath, "utf-8");

                    // Transform import paths in test files
                    if (sourcePattern.includes("tests")) {
                        // Only change the import paths if the relativePackagePath is not "src"
                        if (this.relativePackagePath !== DEFAULT_PACKAGE_PATH) {
                            // Calculate the relative path from the test file to the package path
                            const testDir = path.dirname(targetFilePath);
                            const relativePathToPackage = path.relative(testDir, this.relativePackagePath);
                            const normalizedPath = relativePathToPackage.replace(/\\/g, "/"); // Normalize for Windows paths

                            // Replace the import path with the calculated relative path
                            fileContent = fileContent.replace(
                                /from "([^"]*\/)src\/([^"]*)"/g,
                                `from "${normalizedPath}/$2"`
                            );
                        }
                    }

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
