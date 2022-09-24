import { AbsoluteFilePath } from "@fern-api/core-utils";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { TypeReference } from "@fern-fern/ir-model/types";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/sdk-errors";
import { ServiceDeclarationHandler, WrapperDeclarationHandler } from "@fern-typescript/sdk-service-declaration-handler";
import { TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { constructWrapperDeclarations } from "./constructWrapperDeclarations";
import { CoreUtilitiesManager } from "./core-utilities/CoreUtilitiesManager";
import { ErrorDeclarationReferencer } from "./declaration-referencers/ErrorDeclarationReferencer";
import { ServiceDeclarationReferencer } from "./declaration-referencers/ServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "./declaration-referencers/TypeDeclarationReferencer";
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
import { getReferenceToType } from "./getReferenceToType";
import { ImportsManager } from "./imports-manager/ImportsManager";
import { parseAuthSchemes } from "./parseAuthSchemes";

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
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
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

        const apiDirectory = [this.getApiDirectory()];
        this.typeDeclarationReferencer = new TypeDeclarationReferencer({
            containingDirectory: apiDirectory,
        });
        this.errorDeclarationReferencer = new ErrorDeclarationReferencer({
            containingDirectory: apiDirectory,
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
                run: async (file) => {
                    await TypeDeclarationHandler.run(typeDeclaration, {
                        file,
                        context: this.context,
                    });
                },
            });
        }
    }

    private async generateErrorDeclarations() {
        for (const errorDeclaration of this.intermediateRepresentation.errors) {
            await this.withFile({
                filepath: this.errorDeclarationReferencer.getExportedFilepath(errorDeclaration.name),
                run: async (file) => {
                    await ErrorDeclarationHandler.run(errorDeclaration, {
                        file,
                        context: this.context,
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
                        context: this.context,
                    });
                },
            });
        }
    }

    private async withFile({
        run,
        filepath,
    }: {
        run: (file: SdkFile) => void | Promise<void>;
        filepath: ExportedFilePath;
    }) {
        const filepathStr = convertExportedFilePathToFilePath(filepath);
        this.context.logger.debug(`Generating ${filepathStr}`);

        this.exportsManager.addExportsForFilepath(filepath);

        const sourceFile = this.rootDirectory.createSourceFile(filepathStr);

        const importsManager = new ImportsManager();
        const addImport = importsManager.addImport.bind(importsManager);

        const getReferenceToTypeForFile = (typeReference: TypeReference) =>
            getReferenceToType({
                typeReference,
                getReferenceToNamedType: (typeName) =>
                    this.typeDeclarationReferencer.getReferenceTo(typeName, {
                        importStrategy: { type: "fromRoot" },
                        referencedIn: sourceFile,
                        addImport,
                    }).typeNode,
            });

        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const externalDependencies = createExternalDependencies({
            addDependency,
            addImport,
        });

        const file: SdkFile = {
            sourceFile,
            getReferenceToType: getReferenceToTypeForFile,
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
            resolveTypeReference: (typeReference) => this.typeResolver.resolveTypeReference(typeReference),
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                this.errorDeclarationReferencer.getReferenceTo(errorName, {
                    importStrategy: { type: "fromRoot" },
                    referencedIn: sourceFile,
                    addImport,
                }),
            externalDependencies,
            coreUtilities: this.coreUtilitiesManager.getCoreUtilities({ sourceFile, addImport }),
            addDependency,
            authSchemes: parseAuthSchemes({
                apiAuth: this.intermediateRepresentation.auth,
                externalDependencies,
                getReferenceToType: (typeReference) => getReferenceToTypeForFile(typeReference).typeNode,
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
        };

        await run(file);

        importsManager.writeImportsToSourceFile(sourceFile);

        this.context.logger.debug(`Generated ${filepathStr}`);
    }

    private getApiDirectory(): ExportedDirectory {
        return {
            nameOnDisk: "api",
            exportDeclaration: { namespaceExport: this.apiName },
        };
    }
}
