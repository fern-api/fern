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
import { BaseCoreUtilitiesImpl } from "./BaseCoreUtilities";
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
        }
    }
}

export class CoreUtilitiesManager {
    private referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};
    private authOverrides: Record<RelativeFilePath, string> = {};
    private streamType: "wrapper" | "web";

    constructor({ streamType }: { streamType: "wrapper" | "web" }) {
        this.streamType = streamType;
    }

    public getCoreUtilities({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, importsManager });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport }),
            stream: new StreamImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport }),
            baseCoreUtilities: new BaseCoreUtilitiesImpl({ getReferenceToExport }),
            callbackQueue: new CallbackQueueImpl({ getReferenceToExport }),
            formDataUtils: new FormDataUtilsImpl({ getReferenceToExport }),
            runtime: new RuntimeImpl({ getReferenceToExport }),
            pagination: new PaginationImpl({ getReferenceToExport }),
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
        const pathOnContainer = "/assets/core-utilities";
        const files = new Set(
            await Promise.all(
                Object.entries(this.referencedCoreUtilities).map(async ([_, utility]) => {
                    const { patterns, ignore } = utility.getFilesPatterns({
                        streamType: this.streamType
                    });
                    return await glob(patterns, {
                        ignore,
                        cwd: pathOnContainer,
                        nodir: true
                    });
                })
            ).then((results) => results.flat())
        );

        // Copy each file to the destination preserving the directory structure
        await Promise.all(
            Array.from(files).map(async (file) => {
                const sourcePath = path.join(pathOnContainer, file);
                const destPath = path.join(pathToRoot, file);

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

    private createGetReferenceToExport({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args) {
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
                importsManager
            });
        };
    }
}
