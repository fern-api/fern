import { GeneratorNotificationService } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractRustGeneratorCli, formatRustCode, RustFile } from "@fern-api/rust-base";
import { Module, ModuleDeclaration, UseStatement } from "@fern-api/rust-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/rust-dynamic-snippets";
import { generateModels } from "@fern-api/rust-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpRequestBody, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { exec } from "child_process";
import { promisify } from "util";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { ClientConfigGenerator } from "./generators/ClientConfigGenerator";
import { RootClientGenerator } from "./generators/RootClientGenerator";
import { SubClientGenerator } from "./generators/SubClientGenerator";
import { ReferenceConfigAssembler } from "./reference";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest, convertIr } from "./utils";

const execAsync = promisify(exec);

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

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        // First, generate all the files
        context.logger.debug("Generating package files before publishing...");
        await this.generate(context);

        const publishInfo = await this.getPublishInfo(context);
        const version = context.getCrateVersion();

        context.logger.info(
            `Publishing crate ${publishInfo.packageName}@${version} to registry: ${publishInfo.registryUrl}`
        );
        context.logger.debug(`Package name: ${publishInfo.packageName}, Version: ${version}`);

        // Send publishing notification with crates package coordinate
        const packageCoordinate = FernGeneratorExec.PackageCoordinate.crates({
            name: publishInfo.packageName,
            version
        });
        await context.generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.publishing(packageCoordinate)
        );

        // Execute cargo publish
        await this.cargoPublish({
            context,
            registryUrl: publishInfo.registryUrl,
            token: publishInfo.token
        });

        // Send published notification
        await context.generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.published(packageCoordinate)
        );

        context.logger.info(`Successfully published crate ${publishInfo.packageName}@${version}`);
    }

    /**
     * Publishes the Rust crate to crates.io or a custom registry using cargo publish.
     */
    private async cargoPublish({
        context,
        registryUrl,
        token
    }: {
        context: SdkGeneratorContext;
        registryUrl: string;
        token: string;
    }): Promise<void> {
        const publishCommand = ["cargo", "publish", "--token", token];

        // Add registry URL if it's not the default crates.io
        const isCustomRegistry = registryUrl !== "https://crates.io/api/v1/crates";
        if (isCustomRegistry) {
            publishCommand.push("--registry-url", registryUrl);
            context.logger.debug(`Using custom registry: ${registryUrl}`);
        } else {
            context.logger.debug("Publishing to default crates.io registry");
        }

        const command = publishCommand.join(" ");
        context.logger.debug(`Executing cargo publish from: ${context.project.absolutePathToOutputDirectory}`);
        context.logger.debug(`Command: ${command.replace(token, "***")}`);

        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: context.project.absolutePathToOutputDirectory
            });

            if (stdout) {
                context.logger.info(stdout);
            }
            if (stderr) {
                context.logger.warn(stderr);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            context.logger.debug(`Cargo publish failed with error: ${errorMessage}`);
            throw new Error(`Failed to publish crate: ${errorMessage}`);
        }
    }

    /**
     * Extracts publish info from the generator config.
     *
     * NOTE: Once generator-exec-sdk is published with crates types, we can add:
     * - Check for publishInfo.type === "crates" in GitHub mode
     * - Check for outputMode.registriesV2?.crates in publish mode
     *
     * For now, we use npm format which the configuration layer converts from crates.
     */
    private getPublishInfo(context: SdkGeneratorContext): { registryUrl: string; packageName: string; token: string } {
        const outputMode = context.config.output.mode;

        // Handle github mode with publish info
        if (outputMode.type === "github" && outputMode.publishInfo != null) {
            const publishInfo = outputMode.publishInfo;

            if (publishInfo.type === "crates") {
                return {
                    registryUrl: publishInfo.registryUrl,
                    packageName: publishInfo.packageName,
                    token: publishInfo.tokenEnvironmentVariable
                };
            }
        }

        // Handle direct publish mode
        if (outputMode.type === "publish") {
            const cratesConfig = outputMode.registriesV2?.crates;
            if (cratesConfig) {
                return {
                    registryUrl: cratesConfig.registryUrl,
                    packageName: cratesConfig.packageName,
                    token: cratesConfig.token ?? ""
                };
            }
        }

        return {
            registryUrl: "https://crates.io/api/v1/crates",
            packageName: context.getCrateName(),
            token: ""
        };
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
        context.logger.debug(
            `Starting SDK generation for ${context.ir.apiName.pascalCase.safeName} (crate: ${context.getCrateName()}@${context.getCrateVersion()})`
        );

        const projectFiles = await this.generateProjectFiles(context);
        context.logger.debug(`Generated ${projectFiles.length} project files`);
        context.project.addSourceFiles(...projectFiles);

        context.logger.debug("Generating README.md with code examples...");
        // Generate README if configured
        await this.generateReadme(context);

        context.logger.debug("Generating reference.md documentation...");
        // Generate reference.md if configured
        await this.generateReference(context);

        context.logger.debug(`Persisting files to ${context.project.absolutePathToOutputDirectory}...`);
        await context.project.persist();
        context.logger.debug("File persistence complete");

        context.logger.debug("Formatting Rust code with rustfmt...");
        await formatRustCode({
            outputDir: context.project.absolutePathToOutputDirectory,
            logger: context.logger
        });
        context.logger.debug("Code formatting complete");
    }

    private async generateProjectFiles(context: SdkGeneratorContext): Promise<RustFile[]> {
        const files: RustFile[] = [];

        // Core files
        context.logger.debug("Generating core files (lib.rs, error.rs, api/mod.rs)...");
        files.push(this.generateLibFile(context));
        files.push(this.generateErrorFile(context));
        files.push(this.generateApiModFile(context));

        // Environment.rs (if environments are defined)
        const hasEnvironments = context.ir.environments?.environments != null;
        if (hasEnvironments) {
            const envCount = context.ir.environments?.environments.environments.length ?? 0;
            context.logger.debug(`Generating environment.rs with ${envCount} environment(s)...`);
            const environmentFile = await this.generateEnvironmentFile(context);
            if (environmentFile) {
                files.push(environmentFile);
            }
        }

        // ClientConfig.rs and ApiClientBuilder.rs (always generate with conditional template processing)
        context.logger.debug("Generating client configuration files...");
        const clientConfigGenerator = new ClientConfigGenerator(context);
        files.push(clientConfigGenerator.generate());

        // Client.rs and nested mod.rs files
        context.logger.debug(`Generating root client: ${context.getClientName()}...`);
        const rootClientGenerator = new RootClientGenerator(context);
        files.push(...rootClientGenerator.generateAllFiles());

        // Services/**/*.rs
        const serviceCount = Object.keys(context.ir.services).length;
        context.logger.debug(`Generating ${serviceCount} service client(s)...`);
        this.generateSubClientFiles(context, files);

        // Types/**/*.rs
        if (this.hasTypes(context)) {
            const typeCount = Object.keys(context.ir.types).length;
            context.logger.debug(`Generating ${typeCount} type definition(s)...`);
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

    private generateApiModFile(context: SdkGeneratorContext): RustFile {
        const hasTypes = this.hasTypes(context);
        const moduleDeclarations: ModuleDeclaration[] = [];
        const useStatements: UseStatement[] = [];

        // Add module declarations
        moduleDeclarations.push(new ModuleDeclaration({ name: "resources", isPublic: true }));
        if (hasTypes) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "types", isPublic: true }));
        }

        // Add named re-exports for resources
        const resourceExports = this.getResourceExports(context);
        if (resourceExports.length > 0) {
            useStatements.push(new UseStatement({ path: "resources", items: resourceExports, isPublic: true }));
        }

        // Add named re-exports for types
        if (hasTypes) {
            useStatements.push(new UseStatement({ path: "types", items: ["*"], isPublic: true }));
        }

        const apiModule = new Module({
            moduleDeclarations,
            useStatements
        });

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/api"),
            fileContents: apiModule.toString()
        });
    }

    private async generateEnvironmentFile(context: SdkGeneratorContext): Promise<RustFile | null> {
        const environmentGenerator = new EnvironmentGenerator({ context });
        return environmentGenerator.generate();
    }

    private generateSubClientFiles(context: SdkGeneratorContext, files: RustFile[]): void {
        Object.values(context.ir.subpackages).forEach((subpackage) => {
            // Generate client files, but some may return null if they generate unified mod.rs instead
            const subClientGenerator = new SubClientGenerator(context, subpackage);
            const clientFile = subClientGenerator.generate();
            if (clientFile) {
                files.push(clientFile);
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
                    directory: RelativeFilePath.of("src/api/types"),
                    fileContents: this.getFileContents(file)
                })
        );
    }

    private generateTypesModFile(context: SdkGeneratorContext): RustFile {
        const typesModule = this.buildTypesModule(context);
        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/api/types"),
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
        moduleDeclarations.push(new ModuleDeclaration({ name: "api", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "error", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "core", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "config", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "client", isPublic: true }));
        moduleDeclarations.push(new ModuleDeclaration({ name: "prelude", isPublic: true }));

        if (this.hasEnvironments(context)) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "environment", isPublic: true }));
        }

        // Add re-exports
        const clientExports = [];
        const subpackages = Object.values(context.ir.subpackages);

        // Only add root client if there are multiple services
        if (subpackages.length > 1) {
            clientExports.push(clientName);
        }

        // Add all sub-clients
        subpackages.forEach((subpackage) => {
            const subClientName = `${subpackage.name.pascalCase.safeName}Client`;
            clientExports.push(subClientName);
        });

        useStatements.push(new UseStatement({ path: "error", items: ["ApiError"], isPublic: true }));

        if (this.hasEnvironments(context)) {
            useStatements.push(new UseStatement({ path: "environment", items: ["*"], isPublic: true }));
        }

        if (hasTypes) {
            useStatements.push(new UseStatement({ path: "api", items: ["*"], isPublic: true }));
        }

        // Add re-exports

        useStatements.push(new UseStatement({ path: "core", items: ["*"], isPublic: true }));
        useStatements.push(new UseStatement({ path: "config", items: ["*"], isPublic: true }));
        useStatements.push(new UseStatement({ path: "client", items: ["*"], isPublic: true }));

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

        // Use a Set to track unique module names and prevent duplicates
        const uniqueModuleNames = new Set<string>();

        // Add regular IR types
        for (const [_typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            // Use centralized method to get unique filename and extract module name from it
            const filename = context.getUniqueFilenameForType(typeDeclaration);
            const rawModuleName = filename.replace(".rs", ""); // Remove .rs extension
            const escapedModuleName = context.escapeRustKeyword(rawModuleName);
            // Use getUniqueTypeNameForDeclaration to prevent type name conflicts
            const typeName = context.getUniqueTypeNameForDeclaration(typeDeclaration);

            // Only add if we haven't seen this module name before
            if (!uniqueModuleNames.has(escapedModuleName)) {
                uniqueModuleNames.add(escapedModuleName);
                moduleDeclarations.push(new ModuleDeclaration({ name: escapedModuleName, isPublic: true }));
                useStatements.push(
                    new UseStatement({
                        path: escapedModuleName,
                        items: [typeName],
                        isPublic: true
                    })
                );
            }
        }

        // Add inlined request body types from services
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    const inlinedRequestBody = endpoint.requestBody as HttpRequestBody.InlinedRequestBody;
                    // Get the unique type name (may have suffix if there's a collision)
                    const uniqueRequestName = context.getInlineRequestTypeName(endpoint.id);

                    // Use centralized method for consistent snake_case conversion (pass endpoint.id)
                    const rawModuleName = context.getModuleNameForInlinedRequestBody(endpoint.id);
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);

                    // Only add if we haven't seen this module name before
                    if (!uniqueModuleNames.has(escapedModuleName)) {
                        uniqueModuleNames.add(escapedModuleName);
                        moduleDeclarations.push(new ModuleDeclaration({ name: escapedModuleName, isPublic: true }));
                        useStatements.push(
                            new UseStatement({
                                path: escapedModuleName,
                                items: [uniqueRequestName],
                                isPublic: true
                            })
                        );
                    }
                }
            }
        }

        // Add query parameter request structs for query-only endpoints
        for (const [serviceId, service] of Object.entries(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Add query request structs for endpoints without request body but with query parameters
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    // Get the unique type name (may have suffix if there's a collision)
                    const uniqueQueryRequestTypeName = context.getQueryRequestUniqueTypeName(endpoint.id);
                    const rawModuleName = context.getModuleNameForQueryRequest(endpoint.id);
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);

                    // Only add if we haven't seen this module name before
                    if (!uniqueModuleNames.has(escapedModuleName)) {
                        uniqueModuleNames.add(escapedModuleName);
                        moduleDeclarations.push(new ModuleDeclaration({ name: escapedModuleName, isPublic: true }));
                        useStatements.push(
                            new UseStatement({
                                path: escapedModuleName,
                                items: [uniqueQueryRequestTypeName],
                                isPublic: true
                            })
                        );
                    }
                }
            }
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
            const snippetCount = context.ir.dynamic?.endpoints ? Object.keys(context.ir.dynamic.endpoints).length : 0;
            context.logger.debug(`Generating README.md with ${snippetCount} endpoint example(s)...`);

            // Generate README content using the agent
            const readmeContent = await context.generatorAgent.generateReadme({
                context,
                endpointSnippets: this.generateSnippets(context)
            });

            context.logger.debug(
                `Generated README.md (${readmeContent.length} characters, ${readmeContent.split("\n").length} lines)`
            );
            // Add README to the project
            const readmeFile = new RustFile({
                filename: "README.md",
                directory: RelativeFilePath.of(""),
                fileContents: readmeContent
            });
            context.project.addSourceFiles(readmeFile);

            context.logger.debug("Successfully added README.md to project");
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            context.logger.debug(`README generation failed: ${errorMsg}`);
            throw new Error(`Failed to generate README.md: ${errorMsg}`);
        }
    }

    private generateSnippets(context: SdkGeneratorContext) {
        const endpointSnippets: FernGeneratorExec.Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }
        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: context.config
        });
        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            const method = endpoint.location.method;
            const path = FernGeneratorExec.EndpointPath(endpoint.location.path);
            for (const endpointExample of endpoint.examples ?? []) {
                const generatedSnippet = dynamicSnippetsGenerator.generateSync(
                    convertDynamicEndpointSnippetRequest(endpointExample)
                );
                endpointSnippets.push({
                    exampleIdentifier: endpointExample.id,
                    id: {
                        method,
                        path,
                        identifierOverride: endpointId
                    },
                    // Snippets are marked as 'typescript' for compatibility with FernGeneratorExec, which will be deprecated.
                    snippet: FernGeneratorExec.EndpointSnippet.typescript({
                        client: generatedSnippet.snippet
                    })
                });
            }
        }
        return endpointSnippets;
    }

    // ===========================
    // REFERENCE GENERATION
    // ===========================
    private async generateReference(context: SdkGeneratorContext): Promise<void> {
        try {
            const endpointCount = Object.values(context.ir.services).reduce(
                (total, service) => total + service.endpoints.length,
                0
            );
            context.logger.debug(`Generating reference.md documentation for ${endpointCount} endpoint(s)...`);

            const builder = new ReferenceConfigAssembler(context).buildReferenceConfigBuilder();
            const content = await context.generatorAgent.generateReference(builder);

            context.logger.debug(
                `Generated reference.md (${content.length} characters, ${content.split("\n").length} lines)`
            );

            const referenceFile = new RustFile({
                filename: "reference.md",
                directory: RelativeFilePath.of(""),
                fileContents: content
            });

            context.project.addSourceFiles(referenceFile);
            context.logger.debug("Successfully added reference.md to project");
        } catch (error) {
            const errorMsg = extractErrorMessage(error);
            context.logger.debug(`Reference generation failed: ${errorMsg}`);
            throw new Error(`Failed to generate reference.md: ${errorMsg}`);
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

    private getResourceExports(context: SdkGeneratorContext): string[] {
        const exports: string[] = [];

        // Only export top-level subpackages from the root package
        const topLevelSubpackageIds = context.ir.rootPackage.subpackages;

        topLevelSubpackageIds.forEach((subpackageId) => {
            const subpackage = context.ir.subpackages[subpackageId];
            if (subpackage) {
                const subClientName = `${subpackage.name.pascalCase.safeName}Client`;
                exports.push(subClientName);
            }
        });

        // add main root client
        exports.push(context.getClientName());
        return exports;
    }
}
