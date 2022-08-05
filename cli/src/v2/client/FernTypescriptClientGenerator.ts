import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { ServiceDeclarationHandler } from "@fern-typescript/client-v2";
import { File, GeneratorContext } from "@fern-typescript/declaration-handler";
import { ErrorDeclarationHandler } from "@fern-typescript/errors-v2";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeDeclarationHandler } from "@fern-typescript/types-v2";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { Directory, Project, SourceFile } from "ts-morph";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ExportsManager } from "../exports-manager/ExportsManager";
import { createExternalDependencies } from "../external-dependencies/ExternalDependencies";
import { generateTypeScriptProject } from "../generate-ts-project/generateTypeScriptProject";
import { getRelativePathAsModuleSpecifierTo } from "../getRelativePathAsModuleSpecifierTo";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { getFilepathForService } from "./utils/getFilepathForService";
import { getFilepathForType } from "./utils/getFilepathForType";
import { getGeneratedTypeName } from "./utils/getGeneratedTypeName";
import { getReferenceToExportedType } from "./utils/getReferenceToExportedType";
import { getReferenceToService } from "./utils/getReferenceToService";
import { getReferenceToType } from "./utils/getReferenceToType";
import { writeClientFile } from "./writeClientFile";

const ROOT_API_DIRECTORY = "/api";

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
    private exportsManager = new ExportsManager(ROOT_API_DIRECTORY);
    private dependencyManager = new DependencyManager();
    private typeResolver: TypeResolver;
    private errorResolver: ErrorResolver;

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
        await this.generateClientFile();
        this.exportsManager.writeExportsToProject(this.rootDirectory);
        for (const sourceFile of this.rootDirectory.getSourceFiles()) {
            sourceFile.formatText();
        }
        await this.generatePackage();
    }

    private async generateTypeDeclarations() {
        for (const typeDeclaration of this.intermediateRepresentation.types) {
            await TypeDeclarationHandler.run(typeDeclaration, {
                withFile: async (run) => {
                    const sourceFile = this.getApiDirectory().createSourceFile(
                        getFilepathForType(typeDeclaration.name)
                    );
                    this.exportsManager.addExport(sourceFile, { exportAll: true });
                    return this.withFile({
                        sourceFile,
                        run,
                    });
                },
                context: this.context,
            });
        }
    }

    private async generateErrorDeclarations() {
        for (const errorDeclaration of this.intermediateRepresentation.errors) {
            await ErrorDeclarationHandler.run(errorDeclaration, {
                withFile: async (run) => {
                    const sourceFile = this.getApiDirectory().createSourceFile(
                        getFilepathForType(errorDeclaration.name)
                    );
                    this.exportsManager.addExport(sourceFile, { exportAll: true });
                    return this.withFile({
                        sourceFile,
                        run,
                    });
                },
                context: this.context,
            });
        }
    }

    private async generateServiceDeclarations() {
        for (const serviceDeclaration of this.intermediateRepresentation.services.http) {
            await ServiceDeclarationHandler.run(serviceDeclaration, {
                withFile: async (run) => {
                    const sourceFile = this.getApiDirectory().createSourceFile(
                        getFilepathForService(serviceDeclaration.name)
                    );
                    this.exportsManager.addExport(sourceFile, {
                        namespaceExport: sourceFile.getBaseNameWithoutExtension(),
                    });
                    await this.withFile({
                        sourceFile,
                        run,
                    });
                },
                context: this.context,
            });
        }
    }

    private async generateClientFile() {
        const clientFile = this.rootDirectory.createSourceFile("/client.ts");
        await this.withFile({
            sourceFile: clientFile,
            run: (file) => {
                writeClientFile(this.intermediateRepresentation, file);
                file.sourceFile.addExportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(clientFile, ROOT_API_DIRECTORY),
                });
            },
        });
        const rootIndexTs = this.rootDirectory.createSourceFile("/index.ts");
        rootIndexTs.addExportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(rootIndexTs, clientFile),
            namespaceExport: this.apiName,
        });
    }

    private async withFile({ run, sourceFile }: { run: (file: File) => void | Promise<void>; sourceFile: SourceFile }) {
        this.context.logger.info(`Generating ${path.relative("/", sourceFile.getFilePath())}`);

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
            getErrorDeclaration: (errorName) => this.errorResolver.getErrorDeclarationFromName(errorName),
            getReferenceToError: (errorName) =>
                getReferenceToExportedType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeName: getGeneratedTypeName(errorName),
                    exportedFromPath: getFilepathForType(errorName),
                    addImport: (moduleSpecifier, importDeclaration) =>
                        importsManager.addImport(moduleSpecifier, importDeclaration),
                }),
            externalDependencies: createExternalDependencies({
                addDependency,
                addImport: (moduleSpecifier, importDeclaration) =>
                    importsManager.addImport(moduleSpecifier, importDeclaration),
            }),
            addDependency,
            fernConstants: this.intermediateRepresentation.constants,
        };

        await run(file);

        importsManager.writeImportsToSourceFile(sourceFile);
    }

    private getApiDirectory() {
        return (
            this.rootDirectory.getDirectory(ROOT_API_DIRECTORY) ??
            this.rootDirectory.createDirectory(ROOT_API_DIRECTORY)
        );
    }
}
