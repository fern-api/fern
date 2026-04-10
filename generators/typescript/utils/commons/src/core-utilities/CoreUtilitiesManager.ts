import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, mkdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import path, { join } from "path";
import { SourceFile } from "ts-morph";

import { DependencyManager } from "../dependency-manager/DependencyManager.js";
import { ExportsManager } from "../exports-manager/index.js";
import { ImportsManager } from "../imports-manager/index.js";
import { getReferenceToExportViaNamespaceImport } from "../referencing/index.js";
import { AuthImpl } from "./Auth.js";
import { CallbackQueueImpl } from "./CallbackQueue.js";
import { CoreUtilities } from "./CoreUtilities.js";
import { CoreUtility, CoreUtilityName } from "./CoreUtility.js";
import { CustomPaginationImpl } from "./CustomPagination.js";
import { FetcherImpl } from "./Fetcher.js";
import { FileUtilsImpl } from "./FileUtils.js";
import { FormDataUtilsImpl } from "./FormDataUtils.js";
import { LoggingImpl } from "./Logging.js";
import { PaginationImpl } from "./Pagination.js";
import { RuntimeImpl } from "./Runtime.js";
import { StreamImpl } from "./Stream.js";
import { UrlUtilsImpl } from "./UrlUtils.js";
import { UtilsImpl } from "./Utils.js";
import { WebhookCryptoImpl } from "./WebhookCrypto.js";
import { WebsocketImpl } from "./Websocket.js";
import { ZurgImpl } from "./Zurg.js";

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

const UTILITIES_PATH = join(__dirname, "assets/core-utilities");

const DEFAULT_PACKAGE_PATH = "src";
const DEFAULT_TEST_PATH = "tests";

export class CoreUtilitiesManager {
    private readonly referencedCoreUtilities: Record<CoreUtilityName, CoreUtility.Manifest> = {};
    private readonly authOverrides: Record<RelativeFilePath, string> = {};
    private readonly streamType: "wrapper" | "web";
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly fetchSupport: "node-fetch" | "native";

    private readonly relativePackagePath: string;
    private readonly relativeTestPath: string;
    private readonly generateEndpointMetadata: boolean;
    private readonly customPagerName: string;
    private readonly maxRetries: number | undefined;

    constructor({
        streamType,
        formDataSupport,
        fetchSupport,
        relativePackagePath = DEFAULT_PACKAGE_PATH,
        relativeTestPath = DEFAULT_TEST_PATH,
        generateEndpointMetadata,
        customPagerName,
        maxRetries
    }: {
        streamType: "wrapper" | "web";
        formDataSupport: "Node16" | "Node18";
        fetchSupport: "node-fetch" | "native";
        relativePackagePath?: string;
        relativeTestPath?: string;
        generateEndpointMetadata: boolean;
        customPagerName: string;
        maxRetries?: number;
    }) {
        this.streamType = streamType;
        this.formDataSupport = formDataSupport;
        this.fetchSupport = fetchSupport;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.customPagerName = customPagerName;
        this.maxRetries = maxRetries;
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
            zurg: new ZurgImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            fetcher: new FetcherImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            stream: new StreamImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            auth: new AuthImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            callbackQueue: new CallbackQueueImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            formDataUtils: new FormDataUtilsImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            runtime: new RuntimeImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            pagination: new PaginationImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            customPagination: new CustomPaginationImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata,
                customPagerName: this.customPagerName
            }),
            utils: new UtilsImpl({ getReferenceToExport, generateEndpointMetadata: this.generateEndpointMetadata }),
            websocket: new WebsocketImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            fileUtils: new FileUtilsImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            urlUtils: new UrlUtilsImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            logging: new LoggingImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            }),
            webhookCrypto: new WebhookCryptoImpl({
                getReferenceToExport,
                generateEndpointMetadata: this.generateEndpointMetadata
            })
        };
    }

    public finalize(exportsManager: ExportsManager, dependencyManager: DependencyManager): void {
        for (const utility of Object.values(this.referencedCoreUtilities)) {
            exportsManager.addExportsForDirectories([
                {
                    nameOnDisk: "core"
                },
                utility.pathInCoreUtilities
            ]);
            utility.addDependencies?.(dependencyManager, {
                streamType: this.streamType,
                formDataSupport: this.formDataSupport,
                fetchSupport: this.fetchSupport
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
                        streamType: this.streamType,
                        formDataSupport: this.formDataSupport,
                        fetchSupport: this.fetchSupport
                    });

                    const foundFiles = await glob(patterns, {
                        ignore,
                        cwd: UTILITIES_PATH,
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

                const sourcePath = path.join(UTILITIES_PATH, file);
                const destPath = path.join(pathToRoot, destinationFile);

                // Ensure the destination directory exists
                const destDir = path.dirname(destPath);
                await mkdir(destDir, { recursive: true });

                // Copy the file
                await cp(sourcePath, destPath);

                // Update import paths after copying (customize findAndReplace as needed)
                if (isCustomPackagePath) {
                    const isTestFile = destinationFile.includes(this.relativeTestPath);
                    if (isTestFile) {
                        await this.updateTestFileImportPaths(destPath, destinationFile);
                    } else {
                        const findAndReplace: Record<string, { importPath: string; body: string }> = {
                            [DEFAULT_PACKAGE_PATH]: {
                                importPath: this.getPackagePathImport(),
                                body: this.relativePackagePath
                            },
                            [DEFAULT_TEST_PATH]: {
                                importPath: this.getTestPathImport(),
                                body: this.relativeTestPath
                            }
                        };

                        await this.updateImportPaths(destPath, findAndReplace);
                    }
                }
            })
        );

        // Handle maxRetries override in requestWithRetries.ts
        if (this.maxRetries != null && this.referencedCoreUtilities["fetcher"] != null) {
            const requestWithRetriesPath = path.join(
                pathToRoot,
                this.relativePackagePath,
                "core",
                "fetcher",
                "requestWithRetries.ts"
            );
            try {
                let contents = await readFile(requestWithRetriesPath, "utf8");
                contents = contents.replace(
                    /const DEFAULT_MAX_RETRIES = \d+;/,
                    `const DEFAULT_MAX_RETRIES = ${this.maxRetries};`
                );
                await writeFile(requestWithRetriesPath, contents, { encoding: "utf8" });
            } catch (_error) {
                // File may not exist if fetcher utility doesn't include requestWithRetries
            }
        }

        // Handle auth overrides
        if (this.referencedCoreUtilities["auth"] != null) {
            await Promise.all(
                Object.entries(this.authOverrides).map(async ([filepath, content]) => {
                    const destPath = path.join(pathToSrc, "core", "auth", filepath);
                    await writeFile(destPath, content);
                })
            );
        }

        if (this.referencedCoreUtilities["customPagination"] != null) {
            const paginationDir = path.join(pathToRoot, this.relativePackagePath, "core", "pagination");
            await mkdir(paginationDir, { recursive: true });

            let customPagerContents = await readFile(
                path.join(UTILITIES_PATH, "src/core/pagination/CustomPager.ts"),
                "utf8"
            );
            customPagerContents = customPagerContents.replaceAll("CustomPager", this.customPagerName);
            await writeFile(path.join(paginationDir, `${this.customPagerName}.ts`), customPagerContents, {
                encoding: "utf8"
            });
        }

        if (this.referencedCoreUtilities["pagination"] != null) {
            const hasCustomPagination = this.referencedCoreUtilities["customPagination"] != null;
            const paginationDir = path.join(pathToRoot, this.relativePackagePath, "core", "pagination");
            await mkdir(paginationDir, { recursive: true });

            if (hasCustomPagination) {
                await writeFile(
                    path.join(paginationDir, "index.ts"),
                    `export { ${this.customPagerName}, create${this.customPagerName} } from "./${this.customPagerName}";\nexport { Page } from "./Page";\n`,
                    { encoding: "utf8" }
                );
            } else {
                await writeFile(path.join(paginationDir, "index.ts"), `export { Page } from "./Page";\n`, {
                    encoding: "utf8"
                });
            }
        }
    }

    // Helper to update import paths in test files that use relative imports to source files.
    // When both test and source files are moved under a custom package path (e.g. src/management),
    // relative imports like "../../../src/core/..." need to strip the "src/" prefix since both
    // files are already under the same custom prefix.
    private async updateTestFileImportPaths(filePath: string, destinationFile: string) {
        const testDir = path.dirname(destinationFile);
        const relativePathToPackage = path.relative(testDir, this.relativePackagePath);
        const normalizedPath = relativePathToPackage.replace(/\\/g, "/");

        let contents = await readFile(filePath, "utf8");
        const originalContents = contents;

        // Replace relative import paths that reference the default package path (src/)
        // e.g. from "../../../src/core/fetcher/makeRequest" -> from "../../../core/fetcher/makeRequest"
        // where ../../../ resolves to the custom package path
        contents = contents.replace(/from "([^"]*\/)src\/([^"]*)"/g, `from "${normalizedPath}/$2"`);

        if (contents !== originalContents) {
            await writeFile(filePath, contents);
        }
    }

    // Helper to update import paths in a file
    private async updateImportPaths(
        filePath: string,
        findAndReplace: Record<string, { importPath: string; body: string }>
    ) {
        const contents = await readFile(filePath, "utf8");
        const lines = contents.split("\n");
        let hasReplaced = false;

        const updatedLines = lines.map((line) => {
            let updatedLine = line;
            for (const [find, { importPath, body }] of Object.entries(findAndReplace)) {
                if (line.includes(find)) {
                    if (line.includes("import")) {
                        updatedLine = updatedLine.replaceAll(find, importPath);
                        hasReplaced = true;
                    } else {
                        updatedLine = updatedLine.replaceAll(find, body);
                        hasReplaced = true;
                    }
                }
            }
            return updatedLine;
        });

        if (hasReplaced) {
            const updatedContent = updatedLines.join("\n");
            await writeFile(filePath, updatedContent);
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
        exportsManager
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

    private getPackagePathImport(): string {
        if (this.relativePackagePath === DEFAULT_PACKAGE_PATH) {
            return DEFAULT_PACKAGE_PATH;
        }

        const levelsOfNesting = this.relativePackagePath.split("/").length;
        const path = "../".repeat(levelsOfNesting);

        return `${path}${this.relativePackagePath}`;
    }

    private getTestPathImport(): string {
        if (this.relativeTestPath === DEFAULT_TEST_PATH) {
            return DEFAULT_TEST_PATH;
        }

        const levelsOfNesting = this.relativeTestPath.split("/").length + 1;
        const path = "../".repeat(levelsOfNesting);

        return `${path}${this.relativeTestPath}`;
    }
}
