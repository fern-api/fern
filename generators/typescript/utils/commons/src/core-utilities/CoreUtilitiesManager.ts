import { cp, mkdir, rm, writeFile } from "fs/promises";
import { glob } from "glob";
import path from "path";
import { SourceFile } from "ts-morph";

import {
    AbsoluteFilePath,
    File,
    FileOrDirectory,
    RelativeFilePath,
    dirname,
    getDirectoryContents,
    join
} from "@fern-api/fs-utils";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportedDirectory, ExportsManager } from "../exports-manager";
import { ImportsManager } from "../imports-manager";
import { getReferenceToExportViaNamespaceImport } from "../referencing";
import { CoreUtilities } from "./CoreUtilities";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { AuthImpl } from "./auth/AuthImpl";
import { BaseCoreUtilitiesImpl } from "./base/BaseCoreUtilitiesImpl";
import { CallbackQueueImpl } from "./callback-queue/CallbackQueueImpl";
import { FetcherImpl } from "./fetcher/FetcherImpl";
import { FormDataUtilsImpl } from "./form-data-utils/FormDataUtilsImpl";
import { PaginationImpl } from "./pagination/PaginationImpl";
import { PromiseUtilsImpl } from "./promise/PromiseUtilsImpl";
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
            utils: new UtilsImpl({ getReferenceToExport }),
            promiseUtils: new PromiseUtilsImpl({ getReferenceToExport })
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
                    recursive: true,
                    filter: (source) => {
                        if (source.includes("__test__")) {
                            return false;
                        }
                        return true;
                    }
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

                // Copy over unit tests
                if (utility.unitTests) {
                    const toUnitTestPath = join(
                        pathToRoot,
                        RelativeFilePath.of("tests/unit"),
                        RelativeFilePath.of(utility.name)
                    );
                    await mkdir(toUnitTestPath, { recursive: true });

                    const fromUnitTestPath = join(utility.originalPathOnDocker, utility.unitTests.fromDirectory);
                    const files: { path: AbsoluteFilePath; file: File }[] = [];
                    const contents = await getDirectoryContents(fromUnitTestPath);
                    for (const fileOrDirectory of contents) {
                        this.getAllFiles(fileOrDirectory, toUnitTestPath, files);
                    }

                    for (const file of files) {
                        await mkdir(dirname(file.path), { recursive: true });
                        let contents = file.file.contents;
                        for (const [find, replace] of Object.entries(utility.unitTests.findAndReplace)) {
                            contents = contents.replaceAll(find, replace);
                        }
                        await writeFile(file.path, contents);
                    }
                }
            })
        );
    }

    private getAllFiles(
        fileOrDirectory: FileOrDirectory,
        absoluteFilePath: AbsoluteFilePath,
        files: { path: AbsoluteFilePath; file: File }[]
    ): void {
        if (fileOrDirectory.type === "directory") {
            for (const content of fileOrDirectory.contents) {
                this.getAllFiles(content, join(absoluteFilePath, RelativeFilePath.of(fileOrDirectory.name)), files);
            }
        } else {
            files.push({
                file: fileOrDirectory,
                path: join(absoluteFilePath, RelativeFilePath.of(fileOrDirectory.name))
            });
        }
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
