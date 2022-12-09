import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CoreUtilities } from "@fern-typescript/contexts";
import { cp, rm } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { SourceFile } from "ts-morph";
import { getReferenceToExportViaNamespaceImport } from "../declaration-referencers/utils/getReferenceToExportViaNamespaceImport";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { ExportsManager } from "../exports-manager/ExportsManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { AuthImpl } from "./implementations/AuthImpl";
import { BaseCoreUtilitiesImpl } from "./implementations/BaseCoreUtilitiesImpl";
import { FetcherImpl } from "./implementations/FetcherImpl";
import { ZurgImpl } from "./implementations/ZurgImpl";

const CORE_UTILITIES_FILEPATH: ExportedDirectory[] = [{ nameOnDisk: "core" }];

export declare namespace CoreUtilitiesManager {
    namespace getCoreUtilities {
        interface Args {
            sourceFile: SourceFile;
            importsManager: ImportsManager;
        }
    }
}

export class CoreUtilitiesManager {
    private packageName: string;
    private referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};

    constructor({ packageName }: { packageName: string }) {
        this.packageName = packageName;
    }

    public getCoreUtilities({ sourceFile, importsManager }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, importsManager });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport }),
            base: new BaseCoreUtilitiesImpl({ getReferenceToExport }),
        };
    }

    public finalize(exportsManager: ExportsManager, dependencyManager: DependencyManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories(getPathToUtility(utility));
            utility.addDependencies?.(dependencyManager);
        }
    }

    public async copyCoreUtilities({ pathToPackage }: { pathToPackage: AbsoluteFilePath }): Promise<void> {
        await Promise.all(
            [...Object.values(this.referencedCoreUtilities)].map(async (utility) => {
                const toPath = join(
                    pathToPackage,
                    "src",
                    ...getPathToUtility(utility).map((directory) => RelativeFilePath.of(directory.nameOnDisk))
                );
                await cp(
                    process.env.NODE_ENV === "test"
                        ? path.join(__dirname, "../../../../../..", utility.repoInfoForTesting.path)
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
                filepathToNamespaceImport: { directories: CORE_UTILITIES_FILEPATH, file: undefined },
                namespaceImport: "core",
                referencedIn: sourceFile,
                importsManager,
                packageName: this.packageName,
            });
        };
    }
}

function getPathToUtility(utility: CoreUtility.Manifest): ExportedDirectory[] {
    return [...CORE_UTILITIES_FILEPATH, ...utility.pathInCoreUtilities];
}
