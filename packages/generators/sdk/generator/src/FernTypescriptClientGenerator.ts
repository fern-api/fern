import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { TypeReference } from "@fern-fern/ir-model/types";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/sdk-errors";
import { ServiceDeclarationHandler, WrapperDeclarationHandler } from "@fern-typescript/sdk-service-declaration-handler";
import { TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { parseAuthSchemes } from "./declarations/auth-schemes/parseAuthSchemes";
import { getExportedFilepathForError } from "./declarations/errors/getExportedFilepathForError";
import { getReferenceToError } from "./declarations/errors/getReferenceToError";
import { getExportedFilepathForService } from "./declarations/services/getExportedFilepathForService";
import { getReferenceToService } from "./declarations/services/getReferenceToService";
import { getExportedFilepathForType } from "./declarations/types/getExportedFilepathForType";
import { getReferenceToType } from "./declarations/types/getReferenceToType";
import { getReferenceToExport } from "./declarations/utils/getReferenceToExport";
import { constructWrapperDeclarations } from "./declarations/wrappers/constructWrapperDeclarations";
import { getExportedFilepathForWrapper } from "./declarations/wrappers/getExportedFilepathForWrapper";
import { getReferenceToWrapper } from "./declarations/wrappers/getReferenceToWrapper";
import { DependencyManager } from "./dependency-manager/DependencyManager";
import { convertExportedFilePathToFilePath, ExportedFilePath } from "./exports-manager/ExportedFilePath";
import { ExportsManager } from "./exports-manager/ExportsManager";
import { createExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { generateTypeScriptProject } from "./generate-ts-project/generateTypeScriptProject";
import { ImportsManager } from "./imports-manager/ImportsManager";

export declare namespace FernTypescriptClientGenerator {
    export interface Init {
        apiName: string;
        intermediateRepresentation: IntermediateRepresentation;
        context: GeneratorContext;
        volume: Volume;
        packageName: string;
        packageVersion: string | undefined;
    }
}

export class FernTypescriptClientGenerator {
    private apiName: string;
    private context: GeneratorContext;
    private intermediateRepresentation: IntermediateRepresentation;

    private rootDirectory: Directory;
    private exportsManager = new ExportsManager();
    private dependencyManager = new DependencyManager();
    private typeResolver: TypeResolver;
    private errorResolver: ErrorResolver;
    private serviceResolver: ServiceResolver;

    private generatePackage: () => Promise<void>;

    constructor({
        apiName,
        intermediateRepresentation,
        context,
        volume,
        packageName,
        packageVersion,
    }: FernTypescriptClientGenerator.Init) {
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

    private async generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            await this.withFile({
                filepath: getExportedFilepathForType(typeDeclaration.name, this.apiName),
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
                filepath: getExportedFilepathForError(errorDeclaration.name, this.apiName),
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
                filepath: getExportedFilepathForService(serviceDeclaration.name, this.apiName),
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
                filepath: getExportedFilepathForWrapper(wrapperDeclaration.name, this.apiName),
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

        const getReferenceToTypeForFile = (typeReference: TypeReference) =>
            getReferenceToType({
                apiName: this.apiName,
                referencedIn: sourceFile,
                typeReference,
                addImport: (moduleSpecifier, importDeclaration) =>
                    importsManager.addImport(moduleSpecifier, importDeclaration),
            });

        const importsManager = new ImportsManager();
        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const externalDependencies = createExternalDependencies({
            addDependency,
            addImport: (moduleSpecifier, importDeclaration) =>
                importsManager.addImport(moduleSpecifier, importDeclaration),
        });

        const file: SdkFile = {
            sourceFile,
            getReferenceToType: getReferenceToTypeForFile,
            getServiceDeclaration: (serviceName) => this.serviceResolver.getServiceDeclarationFromName(serviceName),
            getReferenceToService: (serviceName, { importAlias }) =>
                getReferenceToService({
                    referencedIn: sourceFile,
                    apiName: this.apiName,
                    serviceName,
                    addImport: importsManager.addImport.bind(importsManager),
                    importAlias,
                }),
            getReferenceToWrapper: (wrapperName, { importAlias }) =>
                getReferenceToWrapper({
                    referencedIn: sourceFile,
                    apiName: this.apiName,
                    wrapperName,
                    addImport: importsManager.addImport.bind(importsManager),
                    importAlias,
                }),
            resolveTypeReference: (typeReference) => this.typeResolver.resolveTypeReference(typeReference),
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                getReferenceToError({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    errorName,
                    addImport: importsManager.addImport.bind(importsManager),
                }),
            externalDependencies,
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
                getReferenceToExport({
                    apiName: this.apiName,
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
}
