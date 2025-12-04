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
import { AjvSerializationCodeGenerator } from "./schema-generator/AjvSchemaGenerator";
import { SerializationCodeGenerator } from "./schema-generator/SchemaGenerator";
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
 * - "ajv": Ajv (JSON Schema) based serialization
 * - "none": No serialization layer
 */
export type SerializerType = "zurg" | "zod" | "ajv" | "none";

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
            case "ajv":
                return new AjvSerializationCodeGenerator();
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
            case "ajv":
                dependencyManager.addDependency("ajv", "^8.17.1");
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
        const allFiles = new Set(
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

        // For non-Zurg serializers, filter out schema files - they'll be generated instead
        const shouldGenerateSchemas = this.serializer !== "zurg" && this.serializer !== "none";
        const files = shouldGenerateSchemas
            ? Array.from(allFiles).filter((f) => !f.includes("/schemas/"))
            : Array.from(allFiles);

        // Copy each file to the destination preserving the directory structure
        await Promise.all(
            files.map(async (file) => {
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

        // Generate schema runtime files for non-Zurg serializers
        if (shouldGenerateSchemas) {
            await this.generateSchemaRuntimeFiles(pathToSrc);
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
    }

    /**
     * Generate schema runtime files for non-Zurg serializers.
     * These files provide the same API as Zurg but use the underlying validation library.
     */
    private async generateSchemaRuntimeFiles(pathToSrc: AbsoluteFilePath): Promise<void> {
        const schemasDir = path.join(pathToSrc, "core", "schemas");
        await mkdir(schemasDir, { recursive: true });

        const runtimeFiles = this.getSchemaRuntimeFiles();
        await Promise.all(
            runtimeFiles.map(async ({ relativePath, content }) => {
                const filePath = path.join(schemasDir, relativePath);
                await mkdir(path.dirname(filePath), { recursive: true });
                await writeFile(filePath, content);
            })
        );
    }

    /**
     * Get the runtime files for the current serializer.
     */
    private getSchemaRuntimeFiles(): Array<{ relativePath: string; content: string }> {
        switch (this.serializer) {
            case "zod":
                return this.getZodRuntimeFiles();
            case "ajv":
                return this.getAjvRuntimeFiles();
            default:
                return [];
        }
    }

    /**
     * Generate Zod-based runtime files.
     */
    private getZodRuntimeFiles(): Array<{ relativePath: string; content: string }> {
        return [
            {
                relativePath: "index.ts",
                content: `export * from "./Schema.js";
export * from "./builders/index.js";
`
            },
            {
                relativePath: "Schema.ts",
                content: `import { z } from "zod";

export type Schema<Raw, Parsed> = {
    parse: (raw: unknown) => Parsed;
    json: (parsed: Parsed) => Raw;
    parseOrThrow: (raw: unknown) => Parsed;
    jsonOrThrow: (parsed: Parsed) => Raw;
    optional: () => Schema<Raw | null | undefined, Parsed | undefined>;
};

export type ObjectSchema<Raw, Parsed> = Schema<Raw, Parsed> & {
    extend: <R2, P2>(extension: ObjectSchema<R2, P2>) => ObjectSchema<Raw & R2, Parsed & P2>;
    passthrough: () => ObjectSchema<Raw, Parsed>;
};
`
            },
            {
                relativePath: "builders/index.ts",
                content: `export * from "./object/index.js";
export * from "./primitives/index.js";
export * from "./enum/index.js";
export * from "./list/index.js";
export * from "./record/index.js";
export * from "./date/index.js";
export * from "./lazy/index.js";
export * from "./literals/index.js";
export * from "./set/index.js";
export * from "./undiscriminated-union/index.js";
export * from "./union/index.js";
export * from "./schema-utils/index.js";
`
            },
            {
                relativePath: "builders/object/index.ts",
                content: `export { object, objectWithoutOptionalProperties } from "./object.js";
export { property } from "./property.js";
`
            },
            {
                relativePath: "builders/object/object.ts",
                content: `import { z } from "zod";
import type { ObjectSchema } from "../../Schema.js";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";

export function object<T extends Record<string, z.ZodTypeAny>>(schema: T): ObjectSchema<z.input<z.ZodObject<T>>, z.output<z.ZodObject<T>>> {
    const zodSchema = z.object(schema);
    return {
        ...getSchemaUtils(zodSchema),
        extend: (extension) => object({ ...schema, ...(extension as any) }),
        passthrough: () => {
            const passSchema = zodSchema.passthrough();
            return { ...getSchemaUtils(passSchema), extend: (ext) => object({ ...schema, ...(ext as any) }), passthrough: () => object(schema) as any };
        }
    } as any;
}

export const objectWithoutOptionalProperties = object;
`
            },
            {
                relativePath: "builders/object/property.ts",
                content: `import { z } from "zod";

export function property<T extends z.ZodTypeAny>(rawKey: string, schema: T): T {
    // In Zod, we handle key mapping differently - return schema as-is
    return schema;
}
`
            },
            {
                relativePath: "builders/primitives/index.ts",
                content: `export { string } from "./string.js";
export { number } from "./number.js";
export { boolean } from "./boolean.js";
export { any } from "./any.js";
export { unknown } from "./unknown.js";
`
            },
            {
                relativePath: "builders/primitives/string.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const string = () => getSchemaUtils(z.string());
`
            },
            {
                relativePath: "builders/primitives/number.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const number = () => getSchemaUtils(z.number());
`
            },
            {
                relativePath: "builders/primitives/boolean.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const boolean = () => getSchemaUtils(z.boolean());
`
            },
            {
                relativePath: "builders/primitives/any.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const any = () => getSchemaUtils(z.any());
`
            },
            {
                relativePath: "builders/primitives/unknown.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const unknown = () => getSchemaUtils(z.unknown());
`
            },
            {
                relativePath: "builders/enum/index.ts",
                content: `export { enum_ } from "./enum.js";
`
            },
            {
                relativePath: "builders/enum/enum.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const enum_ = <T extends string>(values: T[]) => getSchemaUtils(z.enum(values as [T, ...T[]]));
`
            },
            {
                relativePath: "builders/list/index.ts",
                content: `export { list } from "./list.js";
`
            },
            {
                relativePath: "builders/list/list.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const list = <T extends z.ZodTypeAny>(itemSchema: T) => getSchemaUtils(z.array(itemSchema));
`
            },
            {
                relativePath: "builders/record/index.ts",
                content: `export { record } from "./record.js";
`
            },
            {
                relativePath: "builders/record/record.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const record = <K extends z.ZodTypeAny, V extends z.ZodTypeAny>(keySchema: K, valueSchema: V) => getSchemaUtils(z.record(keySchema, valueSchema));
`
            },
            {
                relativePath: "builders/date/index.ts",
                content: `export { date } from "./date.js";
`
            },
            {
                relativePath: "builders/date/date.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const date = () => getSchemaUtils(z.string().transform((s) => new Date(s)));
`
            },
            {
                relativePath: "builders/lazy/index.ts",
                content: `export { lazy, lazyObject } from "./lazy.js";
`
            },
            {
                relativePath: "builders/lazy/lazy.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const lazy = <T extends z.ZodTypeAny>(getter: () => T) => getSchemaUtils(z.lazy(getter));
export const lazyObject = lazy;
`
            },
            {
                relativePath: "builders/literals/index.ts",
                content: `export { stringLiteral, booleanLiteral } from "./literals.js";
`
            },
            {
                relativePath: "builders/literals/literals.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const stringLiteral = <T extends string>(value: T) => getSchemaUtils(z.literal(value));
export const booleanLiteral = <T extends boolean>(value: T) => getSchemaUtils(z.literal(value));
`
            },
            {
                relativePath: "builders/set/index.ts",
                content: `export { set } from "./set.js";
`
            },
            {
                relativePath: "builders/set/set.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const set = <T extends z.ZodTypeAny>(itemSchema: T) => getSchemaUtils(z.array(itemSchema).transform((arr) => new Set(arr)));
`
            },
            {
                relativePath: "builders/undiscriminated-union/index.ts",
                content: `export { undiscriminatedUnion } from "./undiscriminatedUnion.js";
`
            },
            {
                relativePath: "builders/undiscriminated-union/undiscriminatedUnion.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const undiscriminatedUnion = <T extends z.ZodTypeAny[]>(schemas: T) => getSchemaUtils(z.union(schemas as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]));
`
            },
            {
                relativePath: "builders/union/index.ts",
                content: `export { union, discriminant } from "./union.js";
`
            },
            {
                relativePath: "builders/union/union.ts",
                content: `import { z } from "zod";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";
export const discriminant = <T extends string>(rawKey: string, parsedKey: string) => ({ rawKey, parsedKey });
export const union = <T extends z.ZodTypeAny[]>(discriminator: string, schemas: T) => getSchemaUtils(z.discriminatedUnion(discriminator, schemas as any));
`
            },
            {
                relativePath: "builders/schema-utils/index.ts",
                content: `export { getSchemaUtils } from "./getSchemaUtils.js";
`
            },
            {
                relativePath: "builders/schema-utils/getSchemaUtils.ts",
                content: `import { z } from "zod";
import type { Schema } from "../../Schema.js";

export function getSchemaUtils<T extends z.ZodTypeAny>(schema: T): Schema<z.input<T>, z.output<T>> {
    return {
        parse: (raw) => {
            const result = schema.safeParse(raw);
            return result.success ? result.data : raw;
        },
        json: (parsed) => parsed as any,
        parseOrThrow: (raw) => schema.parse(raw),
        jsonOrThrow: (parsed) => parsed as any,
        optional: () => getSchemaUtils(schema.optional()) as any
    };
}
`
            }
        ];
    }

    /**
     * Generate Ajv-based runtime files (placeholder - uses Zod for now).
     */
    private getAjvRuntimeFiles(): Array<{ relativePath: string; content: string }> {
        // TODO: Implement Ajv-specific runtime
        return this.getZodRuntimeFiles();
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
