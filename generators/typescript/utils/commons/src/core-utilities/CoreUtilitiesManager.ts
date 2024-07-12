import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, mkdir, rm, writeFile } from "fs/promises";
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
import { PaginationImpl } from "./pagination/PaginationImpl";
import { RuntimeImpl } from "./runtime/RuntimeImpl";
import { StreamingUtilsImpl } from "./stream-utils/StreamUtilsImpl";
import { UtilsImpl } from "./utils/UtilsImpl";
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
            streamUtils: new StreamingUtilsImpl({ getReferenceToExport }),
            auth: new AuthImpl({ getReferenceToExport }),
            base: new BaseCoreUtilitiesImpl({ getReferenceToExport }),
            callbackQueue: new CallbackQueueImpl({ getReferenceToExport }),
            formDataUtils: new FormDataUtilsImpl({ getReferenceToExport }),
            runtime: new RuntimeImpl({ getReferenceToExport }),
            pagination: new PaginationImpl({ getReferenceToExport }),
            utils: new UtilsImpl({ getReferenceToExport })
        };
    }

    public finalize(exportsManager: ExportsManager, dependencyManager: DependencyManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories(this.getPathToUtility(utility));
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
                const fromPath =
                    process.env.NODE_ENV === "test"
                        ? path.join(__dirname, "../../../../..", utility.repoInfoForTesting.path)
                        : utility.originalPathOnDocker;
                const toPath = join(
                    pathToSrc,
                    ...this.getPathToUtility(utility).map((directory) => RelativeFilePath.of(directory.nameOnDisk))
                );
                await cp(fromPath, toPath, {
                    recursive: true
                });
                if (utilityName === "auth") {
                    // TODO(amckinney): Find a better way to add utility-scoped overrides. The way we designed the
                    // core utilities manifest is not flexible enough.
                    for (const [filepath, content] of Object.entries(this.authOverrides)) {
                        await writeFile(path.join(toPath, filepath), content);
                    }
                }
                if (utility.writeConditionalFiles != null) {
                    await utility.writeConditionalFiles(toPath);
                }
                if (utility.repoInfoForTesting.ignoreGlob != null && process.env.NODE_ENV === "test") {
                    const filesToDelete = await glob(utility.repoInfoForTesting.ignoreGlob, {
                        cwd: toPath,
                        absolute: true
                    });
                    await Promise.all(filesToDelete.map((filepath) => rm(filepath, { recursive: true })));
                }
                if (utility.testsInfo?.useTests) {
                    const unitTestDestinationPath = path.join(
                        pathToRoot,
                        RelativeFilePath.of(`tests/unit/${utility.testsInfo?.testFolderName || utility.name}`)
                    );
                    await mkdir(unitTestDestinationPath, { recursive: true });

                    const testFiles = await glob("**/*test.ts", {
                        cwd: fromPath,
                        nodir: true,
                        absolute: true
                    });
                    await Promise.all(
                        testFiles.map(async (file: string) => {
                            const destinationFile = path.join(unitTestDestinationPath, path.basename(file));
                            await mkdir(path.dirname(destinationFile), { recursive: true });
                            await cp(file, destinationFile);
                            console.log("\n\n\n Just copied file: ", file, " to ", destinationFile, "\n\n\n");
                        })
                    );
                    // await cp(unitTestSourcePath, unitTestDestinationPath, { recursive: true });
                }
            })
        );
    }

    public addAuthOverride({ filepath, content }: { filepath: RelativeFilePath; content: string }): void {
        this.authOverrides[filepath] = content;
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
                importsManager
            });
        };
    }

    private getPathToUtility(utility: CoreUtility.Manifest): ExportedDirectory[] {
        return [...this.getCoreUtilitiesFilepath(), ...utility.pathInCoreUtilities];
    }

    private getCoreUtilitiesFilepath(): ExportedDirectory[] {
        return [
            {
                nameOnDisk: "core"
            }
        ];
    }
}
