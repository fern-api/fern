import { GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, RustFile } from "@fern-api/rust-base";
import { Module, ModuleDeclaration, UseStatement } from "@fern-api/rust-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/rust-dynamic-snippets";
import { generateModels } from "@fern-api/rust-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { ClientConfigGenerator } from "./generators/ClientConfigGenerator";
import { RootClientGenerator } from "./generators/RootClientGenerator";
import { SubClientGenerator } from "./generators/SubClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest, convertIr } from "./utils";

export class SdkGeneratorCli extends AbstractRustGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    // ===========================
    // LIFECYCLE METHODS
    // ===========================

    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        return customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : SdkCustomConfigSchema.parse({});
    }

    protected async publishPackage(_context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.writeForDownload(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    // ===========================
    // MAIN GENERATION ORCHESTRATION
    // ===========================

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        context.logger.info("=== GENERATE METHOD CALLED ===");

        const projectFiles = await this.generateProjectFiles(context);
        context.project.addSourceFiles(...projectFiles);

        context.logger.info("=== CALLING generateReadme ===");
        // Generate README if configured
        await this.generateReadme(context);

        context.logger.info("=== CALLING persist ===");
        await context.project.persist();
        context.logger.info("=== PERSIST COMPLETE ===");
    }

    private async generateProjectFiles(context: SdkGeneratorContext): Promise<RustFile[]> {
        const files: RustFile[] = [];

        // Core files
        files.push(this.generateLibFile(context));
        files.push(this.generateErrorFile(context));

        // Environment.rs (if environments are defined)
        const environmentFile = await this.generateEnvironmentFile(context);
        if (environmentFile) {
            files.push(environmentFile);
        }

        // ClientConfig.rs and ApiClientBuilder.rs (always generate with conditional template processing)
        const clientConfigGenerator = new ClientConfigGenerator(context);
        files.push(clientConfigGenerator.generate());

        // Client.rs
        const rootClientGenerator = new RootClientGenerator(context);
        files.push(rootClientGenerator.generate());

        // Services/**/*.rs
        this.generateSubClientFiles(context, files);

        // Types/**/*.rs
        if (this.hasTypes(context)) {
            files.push(...this.generateTypeFiles(context));
        }

        return files;
    }

    // ===========================
    // CORE FILE GENERATORS
    // ===========================

    private generateLibFile(context: SdkGeneratorContext): RustFile {
        const hasTypes = this.hasTypes(context);
        const clientName = context.getClientName();

        const libModule = this.buildLibModule(context, hasTypes, clientName);

        return new RustFile({
            filename: "lib.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: libModule.toString()
        });
    }

    private generateErrorFile(context: SdkGeneratorContext): RustFile {
        const errorGenerator = new ErrorGenerator(context);
        return new RustFile({
            filename: "error.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: errorGenerator.generateErrorRs()
        });
    }

    private async generateEnvironmentFile(context: SdkGeneratorContext): Promise<RustFile | null> {
        const environmentGenerator = new EnvironmentGenerator({ context });
        return environmentGenerator.generate();
    }

    private generateSubClientFiles(context: SdkGeneratorContext, files: RustFile[]): void {
        Object.values(context.ir.subpackages).forEach((subpackage) => {
            if (subpackage.service != null || subpackage.hasEndpointsInTree) {
                const subClientGenerator = new SubClientGenerator(context, subpackage);
                files.push(subClientGenerator.generate());
            }
        });
    }

    // ===========================
    // TYPE FILE GENERATORS
    // ===========================

    private generateTypeFiles(context: SdkGeneratorContext): RustFile[] {
        const files: RustFile[] = [];

        // Generate model files
        const modelFiles = this.generateModelFiles(context);
        files.push(...modelFiles);

        // Generate types module file
        const typesModFile = this.generateTypesModFile(context);
        files.push(typesModFile);

        return files;
    }

    private generateModelFiles(context: SdkGeneratorContext): RustFile[] {
        return generateModels({ context: context.toModelGeneratorContext() }).map(
            (file) =>
                new RustFile({
                    filename: file.filename,
                    directory: RelativeFilePath.of("src/types"),
                    fileContents: this.getFileContents(file)
                })
        );
    }

    private generateTypesModFile(context: SdkGeneratorContext): RustFile {
        const typesModule = this.buildTypesModule(context);
        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/types"),
            fileContents: typesModule.toString()
        });
    }

    // ===========================
    // MODULE BUILDERS (AST-based)
    // ===========================

    private buildLibModule(context: SdkGeneratorContext, hasTypes: boolean, clientName: string): Module {
        const moduleDeclarations: ModuleDeclaration[] = [];
        const useStatements: UseStatement[] = [];
        const rawDeclarations: string[] = [];

        // Add module declarations
        moduleDeclarations.push(new ModuleDeclaration({ name: "client", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "error", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "client_config", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "pagination", isPublic: true }));

        // Add core module (always include file operations)
        moduleDeclarations.push(new ModuleDeclaration({ name: "core", isPublic: true }));

        if (this.hasEnvironments(context)) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "environment", isPublic: true }));
        }

        if (hasTypes) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "types", isPublic: true }));
        }

        // Add re-exports
        const clientExports = [];
        const subpackages = Object.values(context.ir.subpackages).filter(
            (subpackage) => subpackage.service != null || subpackage.hasEndpointsInTree
        );

        // Only add root client if there are multiple services
        if (subpackages.length > 1) {
            clientExports.push(clientName);
        }

        // Add all sub-clients
        subpackages.forEach((subpackage) => {
            const subClientName = `${subpackage.name.pascalCase.safeName}Client`;
            clientExports.push(subClientName);
        });

        useStatements.push(
            new UseStatement({
                path: "client",
                items: clientExports,
                isPublic: true
            })
        );
        useStatements.push(new UseStatement({ path: "error", items: ["ApiError"], isPublic: true }));

        if (this.hasEnvironments(context)) {
            useStatements.push(new UseStatement({ path: "environment", items: ["*"], isPublic: true }));
        }

        if (hasTypes) {
            useStatements.push(new UseStatement({ path: "types", items: ["*"], isPublic: true }));
        }

        // Add re-exports
        useStatements.push(new UseStatement({ path: "client_config", items: ["*"], isPublic: true }));
        useStatements.push(new UseStatement({ path: "pagination", items: ["*"], isPublic: true }));

        // Add core module re-exports (always include file operations)
        useStatements.push(new UseStatement({ path: "core", items: ["*"], isPublic: true }));

        return new Module({
            moduleDeclarations,
            useStatements,
            rawDeclarations
        });
    }

    private buildTypesModule(context: SdkGeneratorContext): Module {
        const moduleDeclarations: ModuleDeclaration[] = [];
        const useStatements: UseStatement[] = [];
        const rawDeclarations: string[] = [];

        for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            const rawModuleName = typeDeclaration.name.name.snakeCase.unsafeName;
            const escapedModuleName = context.configManager.escapeRustKeyword(rawModuleName);
            moduleDeclarations.push(new ModuleDeclaration({ name: escapedModuleName, isPublic: true }));
            useStatements.push(
                new UseStatement({
                    path: escapedModuleName,
                    items: ["*"],
                    isPublic: true
                })
            );
        }

        return new Module({
            moduleDeclarations,
            useStatements,
            rawDeclarations
        });
    }

    // ===========================
    // README GENERATION
    // ===========================

    private async generateReadme(context: SdkGeneratorContext): Promise<void> {
        try {
            context.logger.info("Starting README generation...");

            // Generate endpoint snippets using dynamic snippets
            const endpointSnippets = this.generateDynamicSnippets(context);

            context.logger.debug(`Generated ${endpointSnippets.length} endpoint snippets`);

            // Generate README content using the agent
            const readmeContent = await context.generatorAgent.generateReadme({
                context,
                endpointSnippets
            });

            context.logger.debug(`Generated README content length: ${readmeContent.length}`);

            // Add README to the project
            const readmeFile = new RustFile({
                filename: "README.md",
                directory: RelativeFilePath.of(""),
                fileContents: readmeContent
            });

            context.project.addSourceFiles(readmeFile);
            context.logger.info("Successfully added README.md to project");
        } catch (error) {
            context.logger.error("Failed to generate README.md");
            if (error instanceof Error) {
                context.logger.error("Error details:", error.message);
                if (error.stack) {
                    context.logger.debug("Stack trace:", error.stack);
                }
            }
        }
    }

    private generateDynamicSnippets(context: SdkGeneratorContext): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];

        const dynamicIr = context.ir.dynamic;
        if (dynamicIr == null) {
            context.logger.warn("Cannot generate README without dynamic IR");
            return endpointSnippets;
        }

        try {
            context.logger.info("Using DynamicSnippetsGenerator for Rust snippet generation");

            const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
                ir: convertIr(dynamicIr),
                config: context.config
            });

            for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
                const path = FernGeneratorExec.EndpointPath(endpoint.location.path);
                for (const endpointExample of endpoint.examples ?? []) {
                    endpointSnippets.push({
                        exampleIdentifier: endpointExample.id,
                        id: {
                            method: endpoint.location.method,
                            path,
                            identifierOverride: endpointId
                        },
                        snippet: FernGeneratorExec.EndpointSnippet.go({
                            client: dynamicSnippetsGenerator.generateSync(
                                convertDynamicEndpointSnippetRequest(endpointExample)
                            ).snippet
                        })
                    });
                }
            }

            context.logger.info(`Generated ${endpointSnippets.length} dynamic snippets`);
            return endpointSnippets;
        } catch (error) {
            context.logger.error(`Failed to generate dynamic snippets: ${error}`);
            return endpointSnippets;
        }
    }

    // ===========================
    // UTILITY METHODS
    // ===========================

    private hasTypes(context: SdkGeneratorContext): boolean {
        return Object.keys(context.ir.types).length > 0;
    }

    private hasEnvironments(context: SdkGeneratorContext): boolean {
        return context.ir.environments?.environments != null;
    }

    private getFileContents(file: RustFile): string {
        return typeof file.fileContents === "string" ? file.fileContents : file.fileContents.toString();
    }
}
