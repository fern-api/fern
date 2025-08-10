import { GeneratorNotificationService } from "@fern-api/base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, RustFile } from "@fern-api/rust-base";
import { Module, ModuleDeclaration, UseStatement } from "@fern-api/rust-codegen";
import {
    DynamicSnippetsGenerator,
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
} from "@fern-api/rust-dynamic-snippets";
import { generateModels } from "@fern-api/rust-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator";
import { convertIr, convertDynamicEndpointSnippetRequest } from "./utils";
import { ClientConfigGenerator } from "./generators/ClientConfigGenerator";
import { RootClientGenerator } from "./generators/RootClientGenerator";
import { SubClientGenerator } from "./generators/SubClientGenerator";

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
        moduleDeclarations.push(new ModuleDeclaration({ name: "api_client_builder", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "http_client", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "request_options", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "client_error", isPublic: true }));

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
        useStatements.push(
            new UseStatement({
                path: "api_client_builder",
                items: ["*"],
                isPublic: true
            })
        );
        useStatements.push(new UseStatement({ path: "http_client", items: ["*"], isPublic: true }));
        useStatements.push(
            new UseStatement({
                path: "request_options",
                items: ["*"],
                isPublic: true
            })
        );
        useStatements.push(new UseStatement({ path: "client_error", items: ["*"], isPublic: true }));

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

            // Generate endpoint snippets
            const endpointSnippets = this.generateSnippets(context);

            context.logger.debug(`Generated ${endpointSnippets.length} endpoint snippets`);
            context.logger.debug("Calling generateReadme on agent...");

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

    private generateSnippets(context: SdkGeneratorContext): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];

        const dynamicIr = context.ir.dynamic;
        if (dynamicIr == null) {
            context.logger.warn("Cannot generate dynamic snippets without dynamic IR - falling back to basic snippets");
            return this.generateBasicSnippets(context);
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
            context.logger.info("Falling back to basic snippet generation");
            return this.generateBasicSnippets(context);
        }
    }

    private generateBasicSnippets(context: SdkGeneratorContext): Endpoint[] {
        const endpointSnippets: Endpoint[] = [];

        try {
            // Create an EndpointSnippetGenerator to use AST-based generation
            const snippetGenerator = new EndpointSnippetGenerator({
                context: this.createDynamicSnippetsContext(context)
            });

            // Generate basic snippets for each endpoint using AST
            const services = Object.values(context.ir.services);
            for (const service of services) {
                for (const endpoint of service.endpoints) {
                    try {
                        // Create a basic endpoint snippet request
                        const basicSnippetRequest = this.createBasicSnippetRequest(endpoint, context);

                        // Convert IR endpoint to dynamic endpoint format
                        const dynamicEndpoint = this.convertEndpointToDynamic(endpoint, service);

                        // Generate snippet using AST
                        const snippet = snippetGenerator.generateSnippetSync({
                            endpoint: dynamicEndpoint,
                            request: basicSnippetRequest
                        });

                        endpointSnippets.push({
                            exampleIdentifier: `${service.name.fernFilepath.allParts.join("_")}_${endpoint.name.originalName}`,
                            id: {
                                method: endpoint.method,
                                path: FernGeneratorExec.EndpointPath(endpoint.fullPath.head),
                                identifierOverride: endpoint.id
                            },
                            snippet: FernGeneratorExec.EndpointSnippet.go({
                                client: snippet
                            })
                        });

                        context.logger.debug(`Generated AST-based snippet for ${endpoint.name.originalName}`);
                    } catch (endpointError) {
                        context.logger.debug(
                            `Error generating AST snippet for ${endpoint.name.originalName}: ${endpointError}`
                        );
                    }
                }
            }

            // If no snippets were generated, create a simple fallback using AST
            if (endpointSnippets.length === 0) {
                const fallbackSnippet = this.createFallbackSnippetWithAST(context);
                if (fallbackSnippet) {
                    endpointSnippets.push(fallbackSnippet);
                }
            }
        } catch (error) {
            context.logger.debug(`Error generating AST-based snippets: ${error}`);
        }

        return endpointSnippets;
    }

    private toSnakeCase(str: string): string {
        return str
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "")
            .replace(/-/g, "_");
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

    private createDynamicSnippetsContext(context: SdkGeneratorContext): DynamicSnippetsGeneratorContext {
        // Use the dynamic IR if available, otherwise skip
        if (context.ir.dynamic == null) {
            throw new Error("Dynamic IR is required for AST-based snippet generation");
        }
        const dynamicIr = convertIr(context.ir.dynamic);
        return new DynamicSnippetsGeneratorContext({
            ir: dynamicIr,
            config: context.config
        });
    }

    private createBasicSnippetRequest(
        endpoint: any,
        context: SdkGeneratorContext
    ): FernIr.dynamic.EndpointSnippetRequest {
        // Create a basic snippet request with minimal required fields
        return {
            endpoint: {
                method: endpoint.method,
                path: endpoint.fullPath.head
            },
            baseURL: "https://api.example.com",
            environment: undefined,
            auth: context.ir.auth ? this.createBasicAuthValues(context.ir.auth) : undefined,
            pathParameters: {},
            queryParameters: {},
            headers: {},
            requestBody: undefined
        };
    }

    private createBasicAuthValues(auth: any): FernIr.dynamic.AuthValues | undefined {
        // Create basic auth values based on auth type
        if (auth.scheme?.type === "bearer") {
            return {
                type: "bearer",
                token: "your-api-token"
            };
        } else if (auth.scheme?.type === "basic") {
            return {
                type: "basic",
                username: "your-username",
                password: "your-password"
            };
        } else if (auth.scheme?.type === "header") {
            return {
                type: "header",
                value: "your-api-key"
            };
        }
        return undefined;
    }

    private convertEndpointToDynamic(endpoint: any, service: any): FernIr.dynamic.Endpoint {
        // Convert regular IR endpoint to dynamic endpoint format
        return {
            declaration: {
                name: endpoint.name,
                fernFilepath: service.name.fernFilepath
            },
            location: {
                method: endpoint.method,
                path: endpoint.fullPath.head
            },
            auth: endpoint.auth ? this.convertAuthToDynamic(endpoint.auth) : undefined,
            request: this.convertRequestToDynamic(endpoint.request),
            response: endpoint.response,
            examples: []
        };
    }

    private convertAuthToDynamic(auth: any): FernIr.dynamic.Auth | undefined {
        // Convert auth to dynamic format
        if (auth.scheme?.type === "bearer") {
            return { type: "bearer", token: auth.token };
        } else if (auth.scheme?.type === "basic") {
            return { type: "basic", username: auth.username, password: auth.password };
        } else if (auth.scheme?.type === "header") {
            return { type: "header", header: auth.header };
        }
        return undefined;
    }

    private convertRequestToDynamic(request: any): FernIr.dynamic.Request {
        // Convert request to dynamic format - simplified
        return {
            type: "inlined",
            declaration: {
                name: request.name || "Request",
                fernFilepath: {
                    allParts: [],
                    packagePath: [],
                    file: {
                        originalName: "",
                        camelCase: { unsafeName: "", safeName: "" },
                        snakeCase: { unsafeName: "", safeName: "" },
                        screamingSnakeCase: { unsafeName: "", safeName: "" },
                        pascalCase: { unsafeName: "", safeName: "" }
                    }
                }
            },
            metadata: { includePathParameters: false, onlyPathParameters: false },
            pathParameters: request.pathParameters || [],
            queryParameters: request.queryParameters || [],
            headers: request.headers || [],
            body: request.body ? { type: "properties", value: [] } : undefined
        };
    }

    private createFallbackSnippetWithAST(context: SdkGeneratorContext): Endpoint | undefined {
        // Create a simple fallback snippet using basic client initialization
        const packageName = context.configManager.get("packageName") ?? "api_client";
        const clientName = `${packageName
            .split("_")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("")}Client`;

        const snippet = `use ${packageName}::{ClientConfig, ${clientName}};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create client configuration
    let config = ClientConfig {
        ..Default::default()
    };

    // Initialize the client
    let client = ${clientName}::new(config)?;

    // Example usage would go here
    println!("Client initialized successfully!");

    Ok(())
}`;

        return {
            exampleIdentifier: "fallback_example",
            id: {
                method: "GET",
                path: FernGeneratorExec.EndpointPath("/"),
                identifierOverride: "fallback"
            },
            snippet: FernGeneratorExec.EndpointSnippet.go({
                client: snippet
            })
        };
    }
}
