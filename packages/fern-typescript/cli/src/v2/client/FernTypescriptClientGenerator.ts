import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { Directory, Project } from "ts-morph";
import { ServiceDeclarationHandler } from "../service-declaration-handler/ServiceDeclarationHandler";
import { TypeDeclarationHandler } from "../type-declaration-handler/TypeDeclarationHandler";
import { Logger } from "./logger/Logger";
import { TypeResolver } from "./type-resolver/TypeResolver";
import { File, ImportOptions } from "./types";
import { ExportDeclaration, Exports } from "./utils/Exports";
import { getFilepathForError } from "./utils/getFilepathForError";
import { getFilepathForService } from "./utils/getFilepathForService";
import { getFilepathForType } from "./utils/getFilepathForType";
import { getGeneratedErrorName } from "./utils/getGeneratedErrorName";
import { getGeneratedServiceName } from "./utils/getGeneratedServiceName";
import { getReferenceToExportedType } from "./utils/getReferenceToExportedType";
import { getReferenceToType } from "./utils/getReferenceToType";
import { getRelativeModuleSpecifierTo } from "./utils/getRelativeModuleSpecifierTo";
import { Imports } from "./utils/Imports";

const IMPORT_OPTIONS: ImportOptions = { importDirectlyFromFile: false };

const ROOT_DIRECTORY = "/";

export class FernTypescriptClientGenerator {
    private exports = new Exports();
    private project: Project;
    private typeResolver: TypeResolver;

    constructor(
        private readonly apiName: string,
        private readonly intermediateRepresentation: IntermediateRepresentation,
        private readonly logger: Logger
    ) {
        this.project = new Project({
            useInMemoryFileSystem: true,
        });
        this.typeResolver = new TypeResolver(intermediateRepresentation);
    }

    public async generate(): Promise<Project> {
        const rootDirectory = this.getRootDirectory();

        await this.generateTypeDeclarations();
        await this.generateServiceDeclarations();

        // TODO write api.ts

        this.exports.writeExportsToProject(rootDirectory);

        const indexTs = rootDirectory.createSourceFile("index.ts");
        indexTs.addExportDeclaration({
            namespaceExport: this.apiName,
            moduleSpecifier: getRelativeModuleSpecifierTo(indexTs, rootDirectory.getSourceFileOrThrow("api.ts")),
        });

        for (const sourceFile of this.getRootDirectory().getSourceFiles()) {
            sourceFile.formatText();
        }

        return this.project;
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
                withFile: async (run) =>
                    this.withFile({
                        filepath: getFilepathForService(serviceDeclaration.name),
                        exportDeclaration: {
                            namespaceExport: getGeneratedServiceName(serviceDeclaration.name),
                        },
                        run,
                    }),
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
            this.exports.addExport(sourceFile, exportDeclaration);
        }

        const imports = new Imports();
        const file: File = {
            sourceFile,
            getReferenceToType: (typeReference) =>
                getReferenceToType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeReference,
                    addImport: (moduleSpecifier, importDeclaration) =>
                        imports.addImport(moduleSpecifier, importDeclaration),
                    importOptions: IMPORT_OPTIONS,
                }),
            resolveTypeReference: (typeReference) => this.typeResolver.resolveTypeReference(typeReference),
            getReferenceToError: (errorName) =>
                getReferenceToExportedType({
                    apiName: this.apiName,
                    referencedIn: sourceFile,
                    typeName: getGeneratedErrorName(errorName),
                    exportedFromPath: getFilepathForError(errorName),
                    addImport: (moduleSpecifier, importDeclaration) =>
                        imports.addImport(moduleSpecifier, importDeclaration),
                    importOptions: IMPORT_OPTIONS,
                }),
        };
        await run(file);

        imports.writeImportsToSourceFile(sourceFile);
    }

    private getRootDirectory(): Directory {
        return this.project.getDirectory(ROOT_DIRECTORY) ?? this.project.createDirectory(ROOT_DIRECTORY);
    }
}
