import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { CoreUtilities } from "@fern-typescript/sdk-declaration-handler";
import { cp, rm } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { SourceFile } from "ts-morph";
import { getReferenceToExportViaNamespaceImport } from "../declaration-referencers/utils/getReferenceToExportViaNamespaceImport";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";
import { ExportsManager } from "../exports-manager/ExportsManager";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { AuthImpl } from "./implementations/AuthImpl";
import { FetcherImpl } from "./implementations/FetcherImpl";
import { ZurgImpl } from "./implementations/ZurgImpl";

const CORE_UTILITIES_FILEPATH: ExportedDirectory[] = [{ nameOnDisk: "core" }];

export declare namespace CoreUtilitiesManager {
    namespace getCoreUtilities {
        interface Args {
            sourceFile: SourceFile;
            addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        }
    }
}

export class CoreUtilitiesManager {
    private referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};

    public getCoreUtilities({ sourceFile, addImport }: CoreUtilitiesManager.getCoreUtilities.Args): CoreUtilities {
        const getReferenceToExport = this.createGetReferenceToExport({ sourceFile, addImport });
        return {
            zurg: new ZurgImpl({ getReferenceToExport }),
            fetcher: new FetcherImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport }),
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

    private createGetReferenceToExport({ sourceFile, addImport }: CoreUtilitiesManager.getCoreUtilities.Args) {
        return ({ manifest, exportedName }: { manifest: CoreUtility.Manifest; exportedName: string }) => {
            this.referencedCoreUtilities[manifest.name] = manifest;
            return getReferenceToExportViaNamespaceImport({
                exportedName,
                filepathInsideNamespaceImport: manifest.pathInCoreUtilities,
                directoryToNamespaceImport: CORE_UTILITIES_FILEPATH,
                namespaceImport: "core",
                referencedIn: sourceFile,
                addImport: (moduleSpecifier, importDeclaration) => {
                    addImport(moduleSpecifier, importDeclaration);
                },
            });
        };
    }
}

function getPathToUtility(utility: CoreUtility.Manifest): ExportedDirectory[] {
    return [...CORE_UTILITIES_FILEPATH, ...utility.pathInCoreUtilities];
}
