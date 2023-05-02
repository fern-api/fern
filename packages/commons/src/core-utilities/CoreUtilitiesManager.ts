import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, rm } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { SourceFile } from "ts-morph";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory, ExportsManager } from "../exports-manager";
import { ImportsManager } from "../imports-manager";
import { getReferenceToExportViaNamespaceImport } from "../referencing";
import { AuthImpl } from "./auth/AuthImpl";
import { BaseCoreUtilitiesImpl } from "./base/BaseCoreUtilitiesImpl";
import { CallbackQueueImpl } from "./callback-queue/CallbackQueueImpl";
import { CoreUtilities } from "./CoreUtilities";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { FetcherImpl } from "./fetcher/FetcherImpl";
import { FormDataUtilsImpl } from "./form-data-utils/FormDataUtilsImpl";
import { StreamingFetcherImpl } from "./streaming-fetcher/StreamingFetcherImpl";
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

    public getCoreUtilities({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, importsManager });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport }),
            streamingFetcher: new StreamingFetcherImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport }),
            base: new BaseCoreUtilitiesImpl({ getReferenceToExport }),
            callbackQueue: new CallbackQueueImpl({ getReferenceToExport }),
            formDataUtils: new FormDataUtilsImpl({ getReferenceToExport }),
        };
    }

    public finalize(exportsManager: ExportsManager, dependencyManager: DependencyManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories(this.getPathToUtility(utility));
            utility.addDependencies?.(dependencyManager);
        }
    }

    public async copyCoreUtilities({ pathToSrc }: { pathToSrc: AbsoluteFilePath }): Promise<void> {
        await Promise.all(
            [...Object.values(this.referencedCoreUtilities)].map(async (utility) => {
                const toPath = join(
                    pathToSrc,
                    ...this.getPathToUtility(utility).map((directory) => RelativeFilePath.of(directory.nameOnDisk))
                );
                await cp(
                    process.env.NODE_ENV === "test"
                        ? path.join(__dirname, "../../../..", utility.repoInfoForTesting.path)
                        : utility.originalPathOnDocker,
                    toPath,
                    { recursive: true }
                );

                if (utility.repoInfoForTesting.ignoreGlob != null && process.env.NODE_ENV === "test") {
                    const filesToDelete = await glob(utility.repoInfoForTesting.ignoreGlob, {
                        cwd: toPath,
                        absolute: true,
                    });
                    await Promise.all(filesToDelete.map((filepath) => rm(filepath, { recursive: true })));
                }
            })
        );
    }

    private createGetReferenceToExport({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args) {
        return ({ manifest, exportedName }: { manifest: CoreUtility.Manifest; exportedName: string }) => {
            this.referencedCoreUtilities[manifest.name] = manifest;
            return getReferenceToExportViaNamespaceImport({
                exportedName,
                filepathInsideNamespaceImport: manifest.pathInCoreUtilities,
                filepathToNamespaceImport: { directories: this.getCoreUtilitiesFilepath(), file: undefined },
                namespaceImport: "core",
                referencedIn: sourceFile,
                importsManager,
            });
        };
    }

    private getPathToUtility(utility: CoreUtility.Manifest): ExportedDirectory[] {
        return [...this.getCoreUtilitiesFilepath(), ...utility.pathInCoreUtilities];
    }

    private getCoreUtilitiesFilepath(): ExportedDirectory[] {
        return [
            {
                nameOnDisk: "core",
            },
        ];
    }
}
