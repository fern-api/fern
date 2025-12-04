import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, mkdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import path, { join } from "path";
import { SourceFile } from "ts-morph";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportsManager } from "../exports-manager";
import { ImportsManager } from "../imports-manager";
import { getReferenceToExportViaNamespaceImport } from "../referencing";
import { AuthImpl } from "./Auth";
import { CallbackQueueImpl } from "./CallbackQueue";
import { CoreUtilities } from "./CoreUtilities";
import { CoreUtility, CoreUtilityName } from "./CoreUtility";
import { FetcherImpl } from "./Fetcher";
import { FileUtilsImpl } from "./FileUtils";
import { FormDataUtilsImpl } from "./FormDataUtils";
import { LoggingImpl } from "./Logging";
import { PaginationImpl } from "./Pagination";
import { RuntimeImpl } from "./Runtime";
import { SerializationCodeGenerator } from "./schema-generator/SchemaGenerator";
import { YupSerializationCodeGenerator } from "./schema-generator/YupSchemaGenerator";
import { ZodSerializationCodeGenerator } from "./schema-generator/ZodSchemaGenerator";
import { StreamImpl } from "./Stream";
import { UrlUtilsImpl } from "./UrlUtils";
import { UtilsImpl } from "./Utils";
import { WebsocketImpl } from "./Websocket";
import { ZurgImpl } from "./Zurg";

/**
 * Serializer type options.
 * - "zurg": Legacy custom serialization
 * - "zod": Zod-based serialization
 * - "yup": Yup-based serialization
 * - "none": No serialization layer
 */
export type SerializerType = "zurg" | "zod" | "yup" | "none";

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
    private readonly serializer: SerializerType;

    constructor({
        streamType,
        formDataSupport,
        fetchSupport,
        relativePackagePath = DEFAULT_PACKAGE_PATH,
        relativeTestPath = DEFAULT_TEST_PATH,
        generateEndpointMetadata,
        serializer = "zurg"
    }: {
        streamType: "wrapper" | "web";
        formDataSupport: "Node16" | "Node18";
        fetchSupport: "node-fetch" | "native";
        relativePackagePath?: string;
        relativeTestPath?: string;
        generateEndpointMetadata: boolean;
        serializer?: SerializerType;
    }) {
        this.streamType = streamType;
        this.formDataSupport = formDataSupport;
        this.fetchSupport = fetchSupport;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.serializer = serializer;
    }

    /**
     * Returns the serializer type being used.
     */
    public getSerializerType(): SerializerType {
        return this.serializer;
    }

    /**
     * Returns true if serialization is enabled (not "none").
     */
    public isSerializationEnabled(): boolean {
        return this.serializer !== "none";
    }

    /**
     * Creates the appropriate serializer implementation based on configured type.
     */
    private createSerializer(
        getReferenceToExport: CoreUtility.Init["getReferenceToExport"]
    ): SerializationCodeGenerator {
        switch (this.serializer) {
            case "zod":
                return new ZodSerializationCodeGenerator();
            case "yup":
                return new YupSerializationCodeGenerator();
            case "zurg":
                return new ZurgImpl({
                    getReferenceToExport,
                    generateEndpointMetadata: this.generateEndpointMetadata
                });
            case "none":
                // When serialization is disabled, we still need to return a serializer
                // for type compatibility, but it should never be used.
                // Default to Zurg as a placeholder.
                return new ZurgImpl({
                    getReferenceToExport,
                    generateEndpointMetadata: this.generateEndpointMetadata
                });
        }
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

        // Create serializer based on configured type
        const serializer = this.createSerializer(getReferenceToExport);

        return {
            serializer,
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
            })
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
                streamType: this.streamType,
                formDataSupport: this.formDataSupport,
                fetchSupport: this.fetchSupport
            });
        }

        // Add serializer dependencies based on configured type
        switch (this.serializer) {
            case "zod":
                dependencyManager.addDependency("zod", "^3.23.8");
                break;
            case "yup":
                dependencyManager.addDependency("yup", "^1.4.0");
                break;
            // "zurg" and "none" don't require additional dependencies
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
