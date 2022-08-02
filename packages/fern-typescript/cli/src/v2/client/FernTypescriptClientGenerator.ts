import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { Volume } from "memfs/lib/volume";
import { Directory, Project } from "ts-morph";
import { generateTypeScriptProject } from "../generate-ts-project/generateTypeScriptProject";
import { ServiceDeclarationHandler } from "../service-declaration-handler/ServiceDeclarationHandler";
import { TypeDeclarationHandler } from "../type-declaration-handler/TypeDeclarationHandler";
import { DependencyManager } from "./dependency-manager/DependencyManager";
import { ExportDeclaration, ExportsManager } from "./exports-manager/ExportsManager";
import { createExternalDependencies } from "./external-dependencies/ExternalDependencies";
import { ImportsManager } from "./imports-manager/ImportsManager";
import { Logger } from "./logger/Logger";
import { TypeResolver } from "./type-resolver/TypeResolver";
import { File, ImportOptions } from "./types";
import { getFilepathForError } from "./utils/getFilepathForError";
import { getFilepathForService } from "./utils/getFilepathForService";
import { getFilepathForType } from "./utils/getFilepathForType";
import { getGeneratedErrorName } from "./utils/getGeneratedErrorName";
import { getGeneratedServiceName } from "./utils/getGeneratedServiceName";
import { getReferenceToExportedType } from "./utils/getReferenceToExportedType";
import { getReferenceToService } from "./utils/getReferenceToService";
import { getReferenceToType } from "./utils/getReferenceToType";
import { getRelativeModuleSpecifierTo } from "./utils/getRelativeModuleSpecifierTo";

const IMPORT_OPTIONS: ImportOptions = { importDirectlyFromFile: false };

const ROOT_DIRECTORY = "/";

export declare namespace FernTypescriptClientGenerator {
    export interface Init {
        apiName: string;
        intermediateRepresentation: IntermediateRepresentation;
        logger: Logger;
        volume: Volume;
        packageName: string;
        packageVersion: string | undefined;
    }
}

export class FernTypescriptClientGenerator {
    private apiName: string;
    private logger: Logger;
    private intermediateRepresentation: IntermediateRepresentation;

    private project: Project;
    private exportsManager = new ExportsManager();
    private dependencyManager = new DependencyManager();
    private typeResolver: TypeResolver;

    private generatePackage: () => Promise<void>;

    constructor({
        apiName,
        intermediateRepresentation,
        logger,
        volume,
        packageName,
        packageVersion,
    }: FernTypescriptClientGenerator.Init) {
        this.apiName = apiName;
        this.logger = logger;
        this.intermediateRepresentation = intermediateRepresentation;

        this.project = new Project({
            useInMemoryFileSystem: true,
        });

        this.typeResolver = new TypeResolver(intermediateRepresentation);

        this.generatePackage = async () => {
            await generateTypeScriptProject({
                volume,
                packageName,
                packageVersion,
                project: this.project,
                dependencies: this.dependencyManager.getDependencies(),
            });
        };
    }

    public async generate(): Promise<void> {
        const rootDirectory = this.getRootDirectory();

        await this.generateTypeDeclarations();
        await this.generateServiceDeclarations();

        // TODO write api.ts

        this.exportsManager.writeExportsToProject(rootDirectory);

        const indexTs = rootDirectory.createSourceFile("index.ts");
        indexTs.addExportDeclaration({
            namespaceExport: this.apiName,
            moduleSpecifier: getRelativeModuleSpecifierTo(indexTs, rootDirectory.getSourceFileOrThrow("api.ts")),
        });

        for (const sourceFile of this.getRootDirectory().getSourceFiles()) {
            sourceFile.formatText();
        }

        await this.generatePackage();
    }

    private async generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            await TypeDeclarationHandler.run(typeDeclaration, {
                withFile: async (run) =>
                    this.withFile({
                        filepath: getFilepathForType(typeDeclaration.name),
                        exportDeclaration: { exportAll: true },
                        run,
                    }),
                logger: this.logger,
                fernConstants: this.intermediateRepresentation.constants,
            });
        }
    }

    private async generateServiceDeclarations() {
        for (const serviceDeclaration of this.intermediateRepresentation.services.http) {
            await ServiceDeclarationHandler.run(serviceDeclaration, {
                withFile: async (run) => {
                    const generatedServiceName = getGeneratedServiceName(serviceDeclaration.name);

                    await this.withFile({
                        filepath: getFilepathForService(serviceDeclaration.name),
                        exportDeclaration: {
                            namespaceExport: generatedServiceName,
                        },
                        run,
                    });
                },
                logger: this.logger,
                fernConstants: this.intermediateRepresentation.constants,
            });
        }
    }

    private async withFile({
        filepath,
        exportDeclaration,
        run,
    }: {
        filepath: string;
        exportDeclaration: ExportDeclaration | undefined;
        run: (file: File) => void | Promise<void>;
    }) {
        this.logger.info(`Generating ${filepath}`);

        const sourceFile = this.getRootDirectory().createSourceFile(filepath);
        if (exportDeclaration != null) {
            this.exportsManager.addExport(sourceFile, exportDeclaration);
        }

        const importsManager = new ImportsManager();

        const addDependency = (name: string, version: string, options?: { preferPeer?: boolean }) => {
            this.dependencyManager.addDependency(name, version, options);
        };

        const file: File = {
            sourceFile,
            getReferenceToType: (typeReference) =>
                getReferenceToType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeReference,
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                    importOptions: IMPORT_OPTIONS,
                }),
            getReferenceToService: (serviceName) =>
                getReferenceToService({
                    referencedIn: sourceFile,
                    apiName: this.apiName,
                    serviceName,
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                }),
            resolveTypeReference: (typeReference) => this.typeResolver.resolveTypeReference(typeReference),
            getReferenceToError: (errorName) =>
                getReferenceToExportedType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeName: getGeneratedErrorName(errorName),
                    exportedFromPath: getFilepathForError(errorName),
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                    importOptions: IMPORT_OPTIONS,
                }),
            externalDependencies: createExternalDependencies({
                addDependency,
                addImport: (moduleSpecifier, importDeclaration) =>
                    importsManager.addImport(moduleSpecifier, importDeclaration),
            }),
            addDependency,
        };

        await run(file);

        importsManager.writeImportsToSourceFile(sourceFile);
    }

    private getRootDirectory(): Directory {
        return this.project.getDirectory(ROOT_DIRECTORY) ?? this.project.createDirectory(ROOT_DIRECTORY);
    }
}
