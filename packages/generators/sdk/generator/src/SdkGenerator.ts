import { AbsoluteFilePath } from "@fern-api/core-utils";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ShapeType } from "@fern-fern/ir-model/types";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/sdk-errors";
import { ServiceDeclarationHandler, WrapperDeclarationHandler } from "@fern-typescript/sdk-service-declaration-handler";
import {
    TypeReferenceToParsedTypeNodeConverter,
    TypeReferenceToRawTypeNodeConverter,
    TypeReferenceToSchemaConverter,
} from "@fern-typescript/type-reference-converters";
import { RAW_TYPE_NAME, TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { constructWrapperDeclarations } from "./constructWrapperDeclarations";
import { CoreUtilitiesManager } from "./core-utilities/CoreUtilitiesManager";
import { ImportStrategy } from "./declaration-referencers/DeclarationReferencer";
import { ErrorDeclarationReferencer } from "./declaration-referencers/ErrorDeclarationReferencer";
import { ErrorSchemaDeclarationReferencer } from "./declaration-referencers/ErrorSchemaDeclarationReferencer";
import { ServiceDeclarationReferencer } from "./declaration-referencers/ServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "./declaration-referencers/TypeDeclarationReferencer";
import { TypeSchemaDeclarationReferencer } from "./declaration-referencers/TypeSchemaDeclarationReferencer";
import { getReferenceToExportFromRoot } from "./declaration-referencers/utils/getReferenceToExportFromRoot";
import { WrapperDeclarationReferencer } from "./declaration-referencers/WrapperDeclarationReferencer";
import { DependencyManager } from "./dependency-manager/DependencyManager";
import {
    convertExportedFilePathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "./exports-manager/ExportedFilePath";
import { ExportsManager } from "./exports-manager/ExportsManager";
import { createExternalDependencies } from "./external-dependencies/createExternalDependencies";
import { generateTypeScriptProject } from "./generate-ts-project/generateTypeScriptProject";
import { ImportsManager } from "./imports-manager/ImportsManager";
import { parseAuthSchemes } from "./parseAuthSchemes";

const SCHEMA_IMPORT_STRATEGY: ImportStrategy = { type: "fromRoot", namespaceImport: "schemas" };

export declare namespace SdkGenerator {
    export interface Init {
        apiName: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: GeneratorContext;
        volume: Volume;
        packageName: string;
        packageVersion: string | undefined;
    }
}

export class SdkGenerator {
    private apiName: string;
    private context: GeneratorContext;
    private intermediateRepresentation: IntermediateRepresentation;

    private rootDirectory: Directory;
    private exportsManager = new ExportsManager();
    private dependencyManager = new DependencyManager();
    private coreUtilitiesManager = new CoreUtilitiesManager();
    private typeResolver: TypeResolver;
    private errorResolver: ErrorResolver;
    private serviceResolver: ServiceResolver;

    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeSchemaDeclarationReferencer: TypeSchemaDeclarationReferencer;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
    private errorSchemaDeclarationReferencer: ErrorSchemaDeclarationReferencer;
    private serviceDeclarationReferencer: ServiceDeclarationReferencer;
    private wrapperDeclarationReferencer: WrapperDeclarationReferencer;

    private generatePackage: () => Promise<void>;

    constructor({
        apiName,
        intermediateRepresentation,
        context,
        volume,
        packageName,
        packageVersion,
    }: SdkGenerator.Init) {
        this.apiName = apiName;
        this.context = context;
        this.intermediateRepresentation = intermediateRepresentation;

        const project = new Project({
            useInMemoryFileSystem: true,
        });
        this.rootDirectory = project.createDirectory("/");
        this.typeResolver = new TypeResolver(intermediateRepresentation);
        this.errorResolver = new ErrorResolver(intermediateRepresentation);
        this.serviceResolver = new ServiceResolver(intermediateRepresentation);

        const apiDirectory: ExportedDirectory[] = [
            {
                nameOnDisk: "api",
                exportDeclaration: { namespaceExport: this.apiName },
            },
        ];

        const schemaDirectory: ExportedDirectory[] = [
            {
                nameOnDisk: "schemas",
            },
        ];

        this.typeDeclarationReferencer = new TypeDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.typeSchemaDeclarationReferencer = new TypeSchemaDeclarationReferencer({
            containingDirectory: schemaDirectory,
        });
        this.errorDeclarationReferencer = new ErrorDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.errorSchemaDeclarationReferencer = new ErrorSchemaDeclarationReferencer({
            containingDirectory: schemaDirectory,
        });
        this.serviceDeclarationReferencer = new ServiceDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.wrapperDeclarationReferencer = new WrapperDeclarationReferencer({
            containingDirectory: apiDirectory,
        });

        this.generatePackage = async () => {
            await generateTypeScriptProject({
                volume,
                packageName,
                packageVersion,
                project,
                dependencies: this.dependencyManager.getDependencies(),
            });
        };
    }

    public async generate(): Promise<void> {
        await this.generateTypeDeclarations();
        await this.generateErrorDeclarations();
        await this.generateServiceDeclarations();
        await this.generateWrappers();
        this.coreUtilitiesManager.addExports(this.exportsManager);
        this.exportsManager.writeExportsToProject(this.rootDirectory);
        for (const sourceFile of this.rootDirectory.getSourceFiles()) {
            sourceFile.formatText();
        }
        await this.generatePackage();
    }

    public async copyCoreUtilities({ pathToPackage }: { pathToPackage: AbsoluteFilePath }): Promise<void> {
        await this.coreUtilitiesManager.copyCoreUtilities({ pathToPackage });
    }

    private async generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            await this.withFile({
                filepath: this.typeDeclarationReferencer.getExportedFilepath(typeDeclaration.name),
                run: async (typeFile) => {
                    await this.withFile({
                        filepath: this.typeSchemaDeclarationReferencer.getExportedFilepath(typeDeclaration.name),
                        run: async (schemaFile) => {
                            await TypeDeclarationHandler.run(typeDeclaration, {
                                typeFile,
                                schemaFile,
                                exportedName: this.typeDeclarationReferencer.getExportedName(typeDeclaration.name),
                                context: this.context,
                            });
                        },
                        typeNameBeingGenerated: typeDeclaration.name,
                    });
                },
            });
        }
    }

    private async generateErrorDeclarations() {
        for (const errorDeclaration of this.intermediateRepresentation.errors) {
            await this.withFile({
                filepath: this.errorDeclarationReferencer.getExportedFilepath(errorDeclaration.name),
                run: async (errorFile) => {
                    await this.withFile({
                        filepath: this.errorSchemaDeclarationReferencer.getExportedFilepath(errorDeclaration.name),
                        run: async (schemaFile) => {
                            await ErrorDeclarationHandler.run(errorDeclaration, {
                                errorFile,
                                schemaFile,
                                exportedName: this.errorDeclarationReferencer.getExportedName(errorDeclaration.name),
                                context: this.context,
                            });
                        },
                    });
                },
            });
        }
    }

    private async generateServiceDeclarations() {
        for (const serviceDeclaration of this.intermediateRepresentation.services.http) {
            await this.withFile({
                filepath: this.serviceDeclarationReferencer.getExportedFilepath(serviceDeclaration.name),
                run: async (file) => {
                    await ServiceDeclarationHandler.run(serviceDeclaration, {
                        file,
                        exportedName: this.serviceDeclarationReferencer.getExportedName(),
                        context: this.context,
                    });
                },
            });
        }
    }

    private async generateWrappers() {
        const wrapperDeclarations = constructWrapperDeclarations(this.intermediateRepresentation);
        for (const wrapperDeclaration of wrapperDeclarations) {
            await this.withFile({
                filepath: this.wrapperDeclarationReferencer.getExportedFilepath(wrapperDeclaration.name),
                run: async (file) => {
                    await WrapperDeclarationHandler.run(wrapperDeclaration, {
                        file,
                        exportedName: this.wrapperDeclarationReferencer.getExportedName(wrapperDeclaration.name),
                        context: this.context,
                    });
                },
            });
        }
    }

    private async withFile({
        run,
        filepath,
        typeNameBeingGenerated,
    }: {
        run: (file: SdkFile) => void | Promise<void>;
        filepath: ExportedFilePath;
        typeNameBeingGenerated?: DeclaredTypeName;
    }) {
        const filepathStr = convertExportedFilePathToFilePath(filepath);
        this.context.logger.debug(`Generating ${filepathStr}`);

        this.exportsManager.addExportsForFilepath(filepath);

        const sourceFile = this.rootDirectory.createSourceFile(filepathStr);

        const importsManager = new ImportsManager();
        const addImport = importsManager.addImport.bind(importsManager);

        const getReferenceToNamedType = (typeName: DeclaredTypeName) =>
            this.typeDeclarationReferencer.getReferenceTo(typeName, {
                importStrategy: { type: "fromRoot" },
                referencedIn: sourceFile,
                addImport,
            });

        const typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => getReferenceToNamedType(typeName).entityName,
            resolveType: (typeName) => this.typeResolver.resolveTypeName(typeName),
        });

        const getReferenceToRawNamedType = (typeName: DeclaredTypeName) =>
            this.typeSchemaDeclarationReferencer.getReferenceTo(typeName, {
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                subImport: [RAW_TYPE_NAME],
                addImport,
                referencedIn: sourceFile,
            });

        const typeReferenceToRawTypeNodeConverter = new TypeReferenceToRawTypeNodeConverter({
            getReferenceToNamedType: (typeName) => getReferenceToRawNamedType(typeName).entityName,
            resolveType: (typeName) => this.typeResolver.resolveTypeName(typeName),
        });

        const coreUtilities = this.coreUtilitiesManager.getCoreUtilities({ sourceFile, addImport });

        const getReferenceToNamedTypeSchema = (typeName: DeclaredTypeName) =>
            this.typeSchemaDeclarationReferencer.getReferenceTo(typeName, {
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                addImport,
                referencedIn: sourceFile,
            });

        const stringifiedTypeNameBeingGenerated =
            typeNameBeingGenerated != null ? stringifyTypeName(typeNameBeingGenerated) : undefined;
        const getSchemaOfNamedType = (typeName: DeclaredTypeName) => {
            let schema = coreUtilities.zurg.Schema._fromExpression(getReferenceToNamedTypeSchema(typeName).expression);

            // if this type eventually references the type we're generating, then use lazy()
            if (
                stringifiedTypeNameBeingGenerated != null &&
                this.typeResolver
                    .getTypeDeclarationFromName(typeName)
                    .referencedTypes.some(
                        (referencedType) => stringifyTypeName(referencedType) === stringifiedTypeNameBeingGenerated
                    )
            ) {
                const resolvedType = this.typeResolver.resolveTypeName(typeName);
                schema =
                    resolvedType._type === "named" && resolvedType.shape === ShapeType.Object
                        ? coreUtilities.zurg.lazyObject(schema)
                        : coreUtilities.zurg.lazy(schema);
            }

            return schema;
        };

        const typeReferenceToSchemaConverter = new TypeReferenceToSchemaConverter({
            getSchemaOfNamedType,
            zurg: coreUtilities.zurg,
            resolveType: (typeName) => this.typeResolver.resolveTypeName(typeName),
        });

        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const externalDependencies = createExternalDependencies({
            addDependency,
            addImport,
        });

        const getReferenceToErrorSchema = (errorName: DeclaredErrorName) =>
            this.errorSchemaDeclarationReferencer.getReferenceTo(errorName, {
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                addImport,
                referencedIn: sourceFile,
            });

        const file: SdkFile = {
            sourceFile,
            getReferenceToType: typeReferenceToParsedTypeNodeConverter.convert.bind(
                typeReferenceToParsedTypeNodeConverter
            ),
            getReferenceToNamedType,
            getServiceDeclaration: (serviceName) => this.serviceResolver.getServiceDeclarationFromName(serviceName),
            getReferenceToService: (serviceName, { importAlias }) =>
                this.serviceDeclarationReferencer.getReferenceTo(serviceName, {
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: { type: "direct", alias: importAlias },
                }),
            getReferenceToWrapper: (wrapperName, { importAlias }) =>
                this.wrapperDeclarationReferencer.getReferenceTo(wrapperName, {
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: { type: "direct", alias: importAlias },
                }),
            resolveTypeReference: this.typeResolver.resolveTypeReference.bind(this.typeResolver),
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                this.errorDeclarationReferencer.getReferenceTo(errorName, {
                    importStrategy: { type: "fromRoot" },
                    referencedIn: sourceFile,
                    addImport,
                }),
            externalDependencies,
            coreUtilities,
            getSchemaOfNamedType,
            getErrorSchema: (errorName) =>
                coreUtilities.zurg.Schema._fromExpression(getReferenceToErrorSchema(errorName).expression),
            addDependency,
            authSchemes: parseAuthSchemes({
                apiAuth: this.intermediateRepresentation.auth,
                externalDependencies,
                getReferenceToType: (typeReference) =>
                    typeReferenceToParsedTypeNodeConverter.convert(typeReference).typeNode,
            }),
            fernConstants: this.intermediateRepresentation.constants,
            addNamedExport: (namedExport) => {
                this.exportsManager.addExport(sourceFile, {
                    namedExports: [namedExport],
                });
            },
            getReferenceToExportInSameFile: (exportedName) =>
                getReferenceToExportFromRoot({
                    referencedIn: sourceFile,
                    exportedName,
                    exportedFromPath: filepath,
                    addImport: importsManager.addImport.bind(importsManager),
                }),
            getReferenceToRawType: typeReferenceToRawTypeNodeConverter.convert.bind(
                typeReferenceToRawTypeNodeConverter
            ),
            getReferenceToRawNamedType,
            getSchemaOfTypeReference: typeReferenceToSchemaConverter.convert.bind(typeReferenceToSchemaConverter),
        };

        await run(file);

        importsManager.writeImportsToSourceFile(sourceFile);

        this.context.logger.debug(`Generated ${filepathStr}`);
    }
}

type StringifiedTypeName = string;
function stringifyTypeName(typeName: DeclaredTypeName): StringifiedTypeName {
    return typeName.fernFilepath.map((part) => part.originalValue).join("/") + ":" + typeName.name;
}
