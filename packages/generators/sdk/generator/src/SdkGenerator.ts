import { AbsoluteFilePath } from "@fern-api/core-utils";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { DeclaredTypeName, ShapeType } from "@fern-fern/ir-model/types";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/sdk-errors";
import { ServiceDeclarationHandler, WrapperDeclarationHandler } from "@fern-typescript/sdk-service-declaration-handler";
import {
    TypeReferenceToParsedTypeNodeConverter,
    TypeReferenceToRawTypeNodeConverter,
    TypeReferenceToSchemaConverter,
    TypeReferenceToStringExpressionConverter,
} from "@fern-typescript/type-reference-converters";
import { EnumTypeGenerator, getSubImportPathToRawSchema, TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { constructWrapperDeclarations } from "./constructWrapperDeclarations";
import { CoreUtilitiesManager } from "./core-utilities/CoreUtilitiesManager";
import { ImportStrategy } from "./declaration-referencers/DeclarationReferencer";
import { EndpointDeclarationReferencer } from "./declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "./declaration-referencers/ErrorDeclarationReferencer";
import { ServiceDeclarationReferencer } from "./declaration-referencers/ServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "./declaration-referencers/TypeDeclarationReferencer";
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
    private typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
    private errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
    private serviceDeclarationReferencer: ServiceDeclarationReferencer;
    private endpointDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
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
        this.typeSchemaDeclarationReferencer = new TypeDeclarationReferencer({
            containingDirectory: schemaDirectory,
        });
        this.errorDeclarationReferencer = new ErrorDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.errorSchemaDeclarationReferencer = new ErrorDeclarationReferencer({
            containingDirectory: schemaDirectory,
        });
        this.serviceDeclarationReferencer = new ServiceDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.endpointDeclarationReferencer = new EndpointDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.endpointSchemaDeclarationReferencer = new EndpointDeclarationReferencer({
            containingDirectory: schemaDirectory,
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
        this.generateTypeDeclarations();
        this.generateErrorDeclarations();
        this.generateServiceDeclarations();
        this.generateWrappers();
        this.coreUtilitiesManager.finalize(this.exportsManager, this.dependencyManager);
        this.exportsManager.writeExportsToProject(this.rootDirectory);
        await this.generatePackage();
    }

    public async copyCoreUtilities({ pathToPackage }: { pathToPackage: AbsoluteFilePath }): Promise<void> {
        await this.coreUtilitiesManager.copyCoreUtilities({ pathToPackage });
    }

    private generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            this.withFile({
                filepath: this.typeDeclarationReferencer.getExportedFilepath(typeDeclaration.name),
                run: (typeFile) => {
                    this.withFile({
                        filepath: this.typeSchemaDeclarationReferencer.getExportedFilepath(typeDeclaration.name),
                        isGeneratingSchemaFile: true,
                        run: (schemaFile) => {
                            TypeDeclarationHandler(typeDeclaration, {
                                typeFile,
                                schemaFile,
                                typeName: this.typeDeclarationReferencer.getExportedName(typeDeclaration.name),
                                context: this.context,
                            });
                        },
                    });
                },
            });
        }
    }

    private generateErrorDeclarations() {
        for (const errorDeclaration of this.intermediateRepresentation.errors) {
            this.withFile({
                filepath: this.errorDeclarationReferencer.getExportedFilepath(errorDeclaration.name),
                run: (errorFile) => {
                    this.withFile({
                        filepath: this.errorSchemaDeclarationReferencer.getExportedFilepath(errorDeclaration.name),
                        isGeneratingSchemaFile: true,
                        run: (schemaFile) => {
                            ErrorDeclarationHandler(errorDeclaration, {
                                errorFile,
                                schemaFile,
                                errorName: this.errorDeclarationReferencer.getExportedName(errorDeclaration.name),
                                context: this.context,
                            });
                        },
                    });
                },
            });
        }
    }

    private generateServiceDeclarations() {
        for (const serviceDeclaration of this.intermediateRepresentation.services.http) {
            this.withFile({
                filepath: this.serviceDeclarationReferencer.getExportedFilepath(serviceDeclaration.name),
                run: (serviceFile) => {
                    ServiceDeclarationHandler(serviceDeclaration, {
                        serviceClassName: this.serviceDeclarationReferencer.getExportedName(),
                        context: this.context,
                        serviceFile,
                        withEndpoint: this.createWithEndpoint(serviceDeclaration.name),
                    });
                },
            });
        }
    }

    private createWithEndpoint(
        serviceName: DeclaredServiceName
    ): (endpointId: string, run: (args: ServiceDeclarationHandler.withEndpoint.Args) => void) => void {
        return (endpointId, run) => {
            const endpointName: EndpointDeclarationReferencer.Name = { serviceName, endpointId };
            this.withFile({
                filepath: this.endpointDeclarationReferencer.getExportedFilepath(endpointName),
                run: (endpointFile) => {
                    this.withFile({
                        filepath: this.endpointSchemaDeclarationReferencer.getExportedFilepath(endpointName),
                        isGeneratingSchemaFile: true,
                        run: (schemaFile) => {
                            run({ endpointFile, schemaFile });
                        },
                    });
                },
            });
        };
    }

    private generateWrappers() {
        const wrapperDeclarations = constructWrapperDeclarations(this.intermediateRepresentation);
        for (const wrapperDeclaration of wrapperDeclarations) {
            this.withFile({
                filepath: this.wrapperDeclarationReferencer.getExportedFilepath(wrapperDeclaration.name),
                run: (file) => {
                    WrapperDeclarationHandler(wrapperDeclaration, {
                        file,
                        wrapperClassName: this.wrapperDeclarationReferencer.getExportedName(wrapperDeclaration.name),
                        context: this.context,
                    });
                },
            });
        }
    }

    private withFile({
        run,
        filepath,
        isGeneratingSchemaFile = false,
    }: {
        run: (file: SdkFile) => void;
        filepath: ExportedFilePath;
        // TODO switch to classes so we can override via subclass
        isGeneratingSchemaFile?: boolean;
    }) {
        const filepathStr = convertExportedFilePathToFilePath(filepath);
        this.context.logger.debug(`Generating ${filepathStr}`);

        const sourceFile = this.rootDirectory.createSourceFile(filepathStr);

        const importsManager = new ImportsManager();
        const addImport = importsManager.addImport.bind(importsManager);

        const getReferenceToNamedType = (typeName: DeclaredTypeName) =>
            this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: { type: "fromRoot" },
                referencedIn: sourceFile,
                addImport,
            });

        const typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => getReferenceToNamedType(typeName).entityName,
            resolveType: this.typeResolver.resolveTypeName.bind(this.typeResolver),
            getReferenceToRawEnum: (referenceToEnum) =>
                EnumTypeGenerator.getReferenceToRawValueType({ referenceToModule: referenceToEnum }),
        });

        const getReferenceToRawNamedType = (typeName: DeclaredTypeName) =>
            this.typeSchemaDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                subImport: getSubImportPathToRawSchema(),
                addImport,
                referencedIn: sourceFile,
            });

        const typeReferenceToRawTypeNodeConverter = new TypeReferenceToRawTypeNodeConverter({
            getReferenceToNamedType: (typeName) => getReferenceToRawNamedType(typeName).entityName,
            resolveType: this.typeResolver.resolveTypeName.bind(this.typeResolver),
        });

        const coreUtilities = this.coreUtilitiesManager.getCoreUtilities({ sourceFile, addImport });

        const getReferenceToNamedTypeSchema = (typeName: DeclaredTypeName) =>
            this.typeSchemaDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                addImport,
                referencedIn: sourceFile,
            });

        const getSchemaOfNamedType = (typeName: DeclaredTypeName) => {
            let schema = coreUtilities.zurg.Schema._fromExpression(getReferenceToNamedTypeSchema(typeName).expression);

            // when generating schemas, wrapped named types with lazy to prevent issues with circular imports
            if (isGeneratingSchemaFile) {
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
            resolveType: this.typeResolver.resolveTypeName.bind(this.typeResolver),
        });

        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const externalDependencies = createExternalDependencies({
            addDependency,
            addImport,
        });

        const getReferenceToErrorSchema = (errorName: DeclaredErrorName) =>
            this.errorSchemaDeclarationReferencer.getReferenceToError({
                name: errorName,
                importStrategy: SCHEMA_IMPORT_STRATEGY,
                addImport,
                referencedIn: sourceFile,
            });

        const typeReferenceToStringExpressionConverter = new TypeReferenceToStringExpressionConverter({
            resolveType: this.typeResolver.resolveTypeName.bind(this.typeResolver),
            stringifyEnum: EnumTypeGenerator.getReferenceToRawValue.bind(this),
        });

        const file: SdkFile = {
            sourceFile,
            getReferenceToType: typeReferenceToParsedTypeNodeConverter.convert.bind(
                typeReferenceToParsedTypeNodeConverter
            ),
            getReferenceToNamedType,
            getServiceDeclaration: (serviceName) => this.serviceResolver.getServiceDeclarationFromName(serviceName),
            getReferenceToService: (serviceName, { importAlias }) =>
                this.serviceDeclarationReferencer.getReferenceToClient({
                    name: serviceName,
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: { type: "direct", alias: importAlias },
                }),
            getReferenceToEndpointFile: (serviceName, endpointId) =>
                this.endpointDeclarationReferencer.getReferenceToEndpoint({
                    name: { serviceName, endpointId },
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: { type: "fromRoot" },
                }),
            getReferenceToEndpointSchemaFile: (serviceName, endpointId) =>
                this.endpointSchemaDeclarationReferencer.getReferenceToEndpoint({
                    name: { serviceName, endpointId },
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: SCHEMA_IMPORT_STRATEGY,
                }),
            getReferenceToWrapper: (wrapperName, { importAlias }) =>
                this.wrapperDeclarationReferencer.getReferenceToWrapper({
                    name: wrapperName,
                    referencedIn: sourceFile,
                    addImport,
                    importStrategy: { type: "direct", alias: importAlias },
                }),
            resolveTypeReference: this.typeResolver.resolveTypeReference.bind(this.typeResolver),
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                this.errorDeclarationReferencer.getReferenceToError({
                    name: errorName,
                    importStrategy: { type: "fromRoot" },
                    referencedIn: sourceFile,
                    addImport,
                }),
            externalDependencies,
            coreUtilities,
            getSchemaOfNamedType,
            getErrorSchema: (errorName) =>
                coreUtilities.zurg.Schema._fromExpression(getReferenceToErrorSchema(errorName).expression),
            authSchemes: parseAuthSchemes({
                apiAuth: this.intermediateRepresentation.auth,
                coreUtilities,
                getReferenceToType: (typeReference) =>
                    typeReferenceToParsedTypeNodeConverter.convert(typeReference).typeNode,
            }),
            fernConstants: this.intermediateRepresentation.constants,
            getReferenceToRawType: typeReferenceToRawTypeNodeConverter.convert.bind(
                typeReferenceToRawTypeNodeConverter
            ),
            getReferenceToRawNamedType,
            getReferenceToRawError: (errorName) =>
                this.errorSchemaDeclarationReferencer.getReferenceToError({
                    name: errorName,
                    importStrategy: SCHEMA_IMPORT_STRATEGY,
                    subImport: getSubImportPathToRawSchema(),
                    addImport,
                    referencedIn: sourceFile,
                }),
            getSchemaOfTypeReference: typeReferenceToSchemaConverter.convert.bind(typeReferenceToSchemaConverter),
            convertExpressionToString: (expression, typeReference) =>
                typeReferenceToStringExpressionConverter.convert(typeReference)(expression),
        };

        run(file);

        if (sourceFile.getStatements().length === 0) {
            sourceFile.delete();
            this.context.logger.debug(`Skipping ${filepathStr} (no content)`);
        } else {
            importsManager.writeImportsToSourceFile(sourceFile);
            this.exportsManager.addExportsForFilepath(filepath);
            this.context.logger.debug(`Generated ${filepathStr}`);
        }
    }
}
