import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import path, { join } from "path";
import { SourceFile } from "ts-morph";

/**
 * Minimal interface for an in-memory filesystem volume.
 * Structurally compatible with memfs Volume so consumers don't need a
 * direct dependency on the memfs package.
 */
export interface MemfsVolume {
    mkdirSync(path: string, options?: { recursive?: boolean }): unknown;
    writeFileSync(file: string, data: string | Buffer): void;
    // biome-ignore lint/suspicious/noExplicitAny: must be compatible with memfs Volume's overloaded signatures
    readFileSync(file: string, encoding: string): any;
    // biome-ignore lint/suspicious/noExplicitAny: must be compatible with memfs Volume's overloaded signatures
    readdirSync(path: string, options: { withFileTypes: true }): any;
    existsSync(path: string): boolean;
    unlinkSync(path: string): void;
}

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

    constructor({
        streamType,
        formDataSupport,
        fetchSupport,
        relativePackagePath = DEFAULT_PACKAGE_PATH,
        relativeTestPath = DEFAULT_TEST_PATH,
        generateEndpointMetadata,
        customPagerName
    }: {
        streamType: "wrapper" | "web";
        formDataSupport: "Node16" | "Node18";
        fetchSupport: "node-fetch" | "native";
        relativePackagePath?: string;
        relativeTestPath?: string;
        generateEndpointMetadata: boolean;
        customPagerName: string;
    }) {
        this.streamType = streamType;
        this.formDataSupport = formDataSupport;
        this.fetchSupport = fetchSupport;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.customPagerName = customPagerName;
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

    /**
     * Copies core utility files into a memfs Volume instead of to disk.
     * This allows fixImportsInVolume to process core utility imports in-memory
     * alongside generated source files, eliminating the need for a post-persist
     * disk pass on core utility files.
     */
    public async copyCoreUtilitiesToVolume(volume: MemfsVolume): Promise<void> {
        const coreFiles = await this.collectCoreUtilityFiles();

        // mkdirSync/writeFileSync are synchronous — no need for Promise.all.
        for (const { destinationFile, content } of coreFiles) {
            const volumePath = "/" + destinationFile;
            volume.mkdirSync(path.dirname(volumePath), { recursive: true });
            volume.writeFileSync(volumePath, content);
        }
    }

    public async copyCoreUtilities({ pathToRoot }: { pathToRoot: AbsoluteFilePath }): Promise<void> {
        const coreFiles = await this.collectCoreUtilityFiles();

        await Promise.all(
            coreFiles.map(async ({ destinationFile, content }) => {
                const destPath = path.join(pathToRoot, destinationFile);
                await mkdir(path.dirname(destPath), { recursive: true });
                await writeFile(destPath, content);
            })
        );
    }

    /**
     * Collects all core utility files with their destination paths and content.
     * Shared by both copyCoreUtilitiesToVolume (in-memory) and copyCoreUtilities (disk).
     *
     * Files are read as UTF-8 strings because replaceImportPaths needs string
     * content. All core utility files are .ts source files so this is safe.
     */
    private async collectCoreUtilityFiles(): Promise<Array<{ destinationFile: string; content: string }>> {
        const globResults = await Promise.all(
            Object.entries(this.referencedCoreUtilities).map(async ([_name, utility]) => {
                const { patterns, ignore } = utility.getFilesPatterns({
                    streamType: this.streamType,
                    formDataSupport: this.formDataSupport,
                    fetchSupport: this.fetchSupport
                });
                return glob(patterns, { ignore, cwd: UTILITIES_PATH, nodir: true });
            })
        );
        const files = new Set(globResults.flat());

        const isCustomPackagePath = this.relativePackagePath !== DEFAULT_PACKAGE_PATH;
        const findAndReplace: Record<string, { importPath: string; body: string }> = isCustomPackagePath
            ? {
                  [DEFAULT_PACKAGE_PATH]: {
                      importPath: this.getPackagePathImport(),
                      body: this.relativePackagePath
                  },
                  [DEFAULT_TEST_PATH]: {
                      importPath: this.getTestPathImport(),
                      body: this.relativeTestPath
                  }
              }
            : {};

        const result: Array<{ destinationFile: string; content: string }> = [];

        // Collect globbed source files
        const fileEntries = await Promise.all(
            Array.from(files).map(async (file) => {
                let destinationFile = file;
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
                let content = await readFile(sourcePath, "utf8");

                if (isCustomPackagePath) {
                    content = this.replaceImportPaths(content, findAndReplace);
                }

                return { destinationFile, content };
            })
        );
        result.push(...fileEntries);

        // Auth overrides
        if (this.referencedCoreUtilities["auth"] != null) {
            for (const [filepath, content] of Object.entries(this.authOverrides)) {
                result.push({
                    destinationFile: path.join(this.relativePackagePath, "core", "auth", filepath),
                    content
                });
            }
        }

        // Custom pagination
        if (this.referencedCoreUtilities["customPagination"] != null) {
            let customPagerContents = await readFile(
                path.join(UTILITIES_PATH, "src/core/pagination/CustomPager.ts"),
                "utf8"
            );
            customPagerContents = customPagerContents.replaceAll("CustomPager", this.customPagerName);
            result.push({
                destinationFile: path.join(
                    this.relativePackagePath,
                    "core",
                    "pagination",
                    `${this.customPagerName}.ts`
                ),
                content: customPagerContents
            });
        }

        // Pagination index
        if (this.referencedCoreUtilities["pagination"] != null) {
            const hasCustomPagination = this.referencedCoreUtilities["customPagination"] != null;
            const indexContent = hasCustomPagination
                ? `export { ${this.customPagerName}, create${this.customPagerName} } from "./${this.customPagerName}";\nexport { Page } from "./Page";\n`
                : `export { Page } from "./Page";\n`;
            result.push({
                destinationFile: path.join(this.relativePackagePath, "core", "pagination", "index.ts"),
                content: indexContent
            });
        }

        return result;
    }

    /**
     * Pure string transformation: replaces import paths in file content.
     * Used by both the Volume-based and disk-based copy flows.
     */
    private replaceImportPaths(
        content: string,
        findAndReplace: Record<string, { importPath: string; body: string }>
    ): string {
        const lines = content.split("\n");
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

        return hasReplaced ? updatedLines.join("\n") : content;
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
