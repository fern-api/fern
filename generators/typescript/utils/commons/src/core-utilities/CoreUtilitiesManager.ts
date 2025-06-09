import { cp, writeFile } from "fs/promises";
import path from "path";
import { SourceFile } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportsManager } from "../exports-manager";
import { ImportsManager } from "../imports-manager";
import { getReferenceToExportViaNamespaceImport } from "../referencing";
import { CoreUtilities } from "./CoreUtilities";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { AuthImpl } from "./auth/AuthImpl";
import { BaseCoreUtilitiesImpl } from "./base-core-utilities/BaseCoreUtilitiesImpl";
import { CallbackQueueImpl } from "./callback-queue/CallbackQueueImpl";
import { FetcherImpl } from "./fetcher/FetcherImpl";
import { FormDataUtilsImpl } from "./form-data-utils/FormDataUtilsImpl";
import { PaginationImpl } from "./pagination/PaginationImpl";
import { RuntimeImpl } from "./runtime/RuntimeImpl";
import { StreamingFetcherImpl } from "./streaming-fetcher/StreamingFetcherImpl";
import { UtilsImpl } from "./utils/UtilsImpl";
import { WebsocketImpl } from "./websocket/WebsocketImpl";
import { ZurgImpl } from "./zurg/ZurgImpl";

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

    public getCoreUtilities({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, importsManager });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport }),
            streamingFetcher: new StreamingFetcherImpl({ getReferenceToExport }),
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
            utility.addDependencies?.(dependencyManager);
        }
    }

    public async copyCoreUtilities({
        pathToSrc,
        pathToRoot
    }: {
        pathToSrc: AbsoluteFilePath;
        pathToRoot: AbsoluteFilePath;
    }): Promise<void> {
        await Promise.all(
            [...Object.entries(this.referencedCoreUtilities)].map(async ([utilityName, utility]) => {
                const sourceUtilityPath = path.join("/assets/core-utilities", utilityName);
                try {
                    await cp(path.join(sourceUtilityPath, "src"), path.join(pathToRoot, "src"), {
                        recursive: true,
                        force: false
                    });
                } catch (error) {
                    // src directory might not exist, which is fine to ignore
                }
                try {
                    await cp(path.join(sourceUtilityPath, "tests"), path.join(pathToRoot, "tests"), {
                        recursive: true,
                        force: false
                    });
                } catch (error) {
                    // Tests directory might not exist, which is fine to ignore
                }

                const pathToUtilityFolder = path.join(pathToSrc, "core", utility.pathInCoreUtilities.nameOnDisk);
                if (utilityName === "auth") {
                    // TODO(amckinney): Find a better way to add utility-scoped overrides. The way we designed the
                    // core utilities manifest is not flexible enough.
                    for (const [filepath, content] of Object.entries(this.authOverrides)) {
                        await writeFile(path.join(pathToUtilityFolder, filepath), content);
                    }
                }
            })
        );
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
