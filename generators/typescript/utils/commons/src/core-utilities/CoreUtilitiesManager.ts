import { cp, mkdir, writeFile } from "fs/promises";
import { glob } from "glob";
import path from "path";
import { SourceFile } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportsManager } from "../exports-manager";
import { ImportsManager } from "../imports-manager";
import { getReferenceToExportViaNamespaceImport } from "../referencing";
import { AuthImpl } from "./Auth";
import { CallbackQueueImpl } from "./CallbackQueue";
import { CoreUtilities } from "./CoreUtilities";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { FetcherImpl } from "./Fetcher";
import { FormDataUtilsImpl } from "./FormDataUtils";
import { PaginationImpl } from "./Pagination";
import { RuntimeImpl } from "./Runtime";
import { StreamImpl } from "./Stream";
import { UtilsImpl } from "./Utils";
import { WebsocketImpl } from "./Websocket";
import { ZurgImpl } from "./Zurg";

export declare namespace CoreUtilitiesManager {
    namespace getCoreUtilities {
        interface Args {
            sourceFile: SourceFile;
            importsManager: ImportsManager;
            exportsManager: ExportsManager;
            relativePackagePath: string;
            relativeTestPath: string;
        }
    }
}

const PATH_ON_CONTAINER = "/assets/core-utilities";

const DEFAULT_PACKAGE_PATH = "src";
const DEFAULT_TEST_PATH = "tests";

export class CoreUtilitiesManager {
    private referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};
    private authOverrides: Record<RelativeFilePath, string> = {};
    private streamType: "wrapper" | "web";

    private relativePackagePath: string;
    private relativeTestPath: string;

    constructor({
        streamType,
        relativePackagePath = DEFAULT_PACKAGE_PATH,
        relativeTestPath = DEFAULT_TEST_PATH
    }: {
        streamType: "wrapper" | "web";
        relativePackagePath?: string;
        relativeTestPath?: string;
    }) {
        this.streamType = streamType;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
    }

    public getCoreUtilities({
        sourceFile,
        importsManager,
        exportsManager,
        relativePackagePath,
        relativeTestPath
    }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({
            sourceFile,
            importsManager,
            exportsManager,
            relativePackagePath,
            relativeTestPath
        });

        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport, packagePath: relativePackagePath }),
            stream: new StreamImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport, packagePath: relativePackagePath }),
            callbackQueue: new CallbackQueueImpl({ getReferenceToExport }),
            formDataUtils: new FormDataUtilsImpl({ getReferenceToExport }),
            runtime: new RuntimeImpl({ getReferenceToExport }),
            pagination: new PaginationImpl({ getReferenceToExport, packagePath: relativePackagePath }),
            utils: new UtilsImpl({ getReferenceToExport }),
            websocket: new WebsocketImpl({ getReferenceToExport })
        };
    }

    public finalize(exportsManager: ExportsManager, dependencyManager: DependencyManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories(
                [
                    {
                        nameOnDisk: "core"
                    },
                    utility.pathInCoreUtilities
                ],
                true
            );
            utility.addDependencies?.(dependencyManager, {
                streamType: this.streamType
            });
        }
    }

    public async copyCoreUtilities({
        pathToSrc,
        pathToRoot
    }: {
        pathToSrc: AbsoluteFilePath;
        pathToRoot: AbsoluteFilePath;
    }): Promise<void> {
        const files = new Set(
            await Promise.all(
                Object.entries(this.referencedCoreUtilities).map(async ([name, utility]) => {
                    const { patterns, ignore } = utility.getFilesPatterns({
                        streamType: this.streamType
                    });

                    const foundFiles = await glob(patterns, {
                        ignore,
                        cwd: PATH_ON_CONTAINER,
                        nodir: true
                    });
                    return foundFiles;
                })
            ).then((results) => results.flat())
        );

        // Copy each file to the destination preserving the directory structure
        await Promise.all(
            Array.from(files).map(async (file) => {
                // If the client specified a package path, we need to copy the file to the correct location
                let destinationFile = file;
                const isCustomPackagePath = this.relativePackagePath !== DEFAULT_PACKAGE_PATH;

                if (isCustomPackagePath) {
                    const isPathAlreadyUpdated = file.includes(this.relativePackagePath);
                    if (!isPathAlreadyUpdated) {
                        const isTestFile = file.includes(DEFAULT_TEST_PATH);
                        const isSourceFile = file.includes(DEFAULT_PACKAGE_PATH);

                        if (isTestFile) {
                            destinationFile = file.replace(DEFAULT_TEST_PATH, this.relativeTestPath);
                        } else if (isSourceFile) {
                            destinationFile = file.replace(DEFAULT_PACKAGE_PATH, this.relativePackagePath);
                        }
                    }
                }

                const sourcePath = path.join(PATH_ON_CONTAINER, file);
                const destPath = path.join(pathToRoot, destinationFile);

                // Ensure the destination directory exists
                const destDir = path.dirname(destPath);
                await mkdir(destDir, { recursive: true });

                // Copy the file
                await cp(sourcePath, destPath);
            })
        );

        // Handle auth overrides
        if (this.referencedCoreUtilities["auth"] != null) {
            await Promise.all(
                Object.entries(this.authOverrides).map(async ([filepath, content]) => {
                    const destPath = path.join(pathToSrc, "core", "auth", filepath);
                    await writeFile(destPath, content);
                })
            );
        }
    }

    public addAuthOverride({ filepath, content }: { filepath: RelativeFilePath; content: string }): void {
        this.authOverrides[filepath] = content;
    }

    private addManifestAndDependencies(manifest: CoreUtility.Manifest): void {
        if (this.referencedCoreUtilities[manifest.name] != null) {
            return;
        }
        this.referencedCoreUtilities[manifest.name] = manifest;
        if (manifest.dependsOn != null) {
            for (const dependency of manifest.dependsOn) {
                this.addManifestAndDependencies(dependency);
            }
        }
    }

    private createGetReferenceToExport({
        sourceFile,
        importsManager,
        exportsManager,
        relativePackagePath,
        relativeTestPath
    }: CoreUtilitiesManager.getCoreUtilities.Args) {
        return ({ manifest, exportedName }: { manifest: CoreUtility.Manifest; exportedName: string }) => {
            this.addManifestAndDependencies(manifest);
            return getReferenceToExportViaNamespaceImport({
                exportedName,
                filepathInsideNamespaceImport: [manifest.pathInCoreUtilities],
                filepathToNamespaceImport: {
                    directories: [
                        {
                            nameOnDisk: "core"
                        }
                    ],
                    file: undefined
                },
                namespaceImport: "core",
                referencedIn: sourceFile,
                importsManager,
                exportsManager
            });
        };
    }
}
