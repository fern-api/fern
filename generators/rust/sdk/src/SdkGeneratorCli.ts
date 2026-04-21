import { GeneratorNotificationService } from "@fern-api/base-generator";
import { extractErrorMessage } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    AbstractRustGeneratorCli,
    formatRustCode,
    formatRustSnippet,
    RustDependencyType,
    RustFile
} from "@fern-api/rust-base";
import { Module, ModuleDeclaration, UseStatement } from "@fern-api/rust-codegen";
import {
    DynamicSnippetsGenerator,
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
} from "@fern-api/rust-dynamic-snippets";
import { generateModels, ModelGeneratorContext } from "@fern-api/rust-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { exec } from "child_process";
import { promisify } from "util";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator.js";
import { ErrorGenerator } from "./error/ErrorGenerator.js";
import { ApiClientBuilderGenerator } from "./generators/ApiClientBuilderGenerator.js";
import { ClientConfigGenerator } from "./generators/ClientConfigGenerator.js";
import { RootClientGenerator } from "./generators/RootClientGenerator.js";
import { SubClientGenerator } from "./generators/SubClientGenerator.js";
import { WebSocketChannelGenerator } from "./generators/WebSocketChannelGenerator.js";
import { ReferenceConfigAssembler } from "./reference/index.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";
import { convertDynamicEndpointSnippetRequest, convertIr } from "./utils/index.js";
import { WireTestGenerator } from "./wire-tests/index.js";

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
        ir: FernIr.IntermediateRepresentation;
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
            const errorMessage = extractErrorMessage(error);
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
            `Starting SDK generation for ${context.case.pascalSafe(context.ir.apiName)} (crate: ${context.getCrateName()}@${context.getCrateVersion()})`
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

        // Generate wire tests if enabled
        await this.generateWireTestFiles(context);

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
        context.logger.debug("Generating core files (lib.rs, error.rs, core/mod.rs, api/mod.rs)...");
        files.push(this.generateLibFile(context));
        files.push(this.generateErrorFile(context));
        files.push(this.generateCoreModFile(context));
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
        const apiClientBuilderGenerator = new ApiClientBuilderGenerator(context);
        files.push(apiClientBuilderGenerator.generate());

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

        // WebSocket channels
        if (this.hasWebSocketChannels(context)) {
            const wsChannelCount = Object.keys(context.ir.websocketChannels ?? {}).length;
            context.logger.debug(`Generating ${wsChannelCount} WebSocket channel client(s)...`);
            files.push(...this.generateWebSocketFiles(context));
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

    /**
     * Generates core/mod.rs dynamically based on which features are active.
     *
     * The static asIs mod.rs always declares `mod sse_stream` and `mod websocket` behind
     * cfg feature gates. While this works for compilation (the compiler respects #[cfg]),
     * cargo fmt does NOT evaluate feature flags — it tries to parse all declared modules
     * and fails when the corresponding .rs file doesn't exist. Generating this file
     * dynamically ensures we only declare modules for files that are actually present.
     */
    private generateCoreModFile(context: SdkGeneratorContext): RustFile {
        const hasStreaming = context.hasStreamingEndpoints();
        const hasWebSocket = context.hasWebSocketChannels();
        const hasDateTime = context.usesDateTime();
        const hasBase64 = context.usesBase64();
        const hasBigInteger = context.usesBigInteger();
        const hasFloatingPoint = context.usesFloatingPoint();

        const lines: string[] = [];
        lines.push("//! Core client infrastructure");
        lines.push("");
        lines.push("mod http_client;");
        lines.push("mod oauth_token_provider;");
        lines.push("mod request_options;");
        lines.push("mod query_parameter_builder;");
        if (hasStreaming) {
            lines.push('#[cfg(feature = "sse")]');
            lines.push("mod sse_stream;");
        }
        if (hasWebSocket) {
            lines.push('#[cfg(feature = "websocket")]');
            lines.push("mod websocket;");
        }
        lines.push("mod utils;");
        lines.push("pub mod pagination;");
        if (hasDateTime) {
            lines.push("pub mod flexible_datetime;");
        }
        if (hasBase64) {
            lines.push("pub mod base64_bytes;");
        }
        if (hasBigInteger) {
            lines.push("pub mod bigint_string;");
        }
        if (hasFloatingPoint) {
            lines.push("pub mod number_serializers;");
        }
        lines.push("");
        lines.push("pub use http_client::{ByteStream, HttpClient, OAuthConfig, RawResponse};");
        lines.push("pub use oauth_token_provider::OAuthTokenProvider;");
        lines.push("pub use request_options::RequestOptions;");
        lines.push("pub use query_parameter_builder::{QueryBuilder, QueryBuilderError, parse_structured_query};");
        if (hasStreaming) {
            lines.push('#[cfg(feature = "sse")]');
            lines.push("pub use sse_stream::SseStream;");
        }
        if (hasWebSocket) {
            lines.push('#[cfg(feature = "websocket")]');
            lines.push("pub use websocket::{DisconnectInfo, WebSocketClient, WebSocketMessage, WebSocketOptions, WebSocketState};");
        }
        lines.push("pub use utils::join_url;");
        lines.push("pub use pagination::{AsyncPaginator, SyncPaginator, PaginationResult};");
        lines.push("");

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/core"),
            fileContents: lines.join("\n")
        });
    }

    private generateApiModFile(context: SdkGeneratorContext): RustFile {
        const hasTypes = this.hasTypes(context);
        const moduleDeclarations: ModuleDeclaration[] = [];
        const useStatements: UseStatement[] = [];

        // Build module documentation
        const moduleDoc: string[] = [];
        const apiNameRaw = context.ir.apiName;
        const apiName = context.ir.apiDisplayName ?? (apiNameRaw != null ? context.case.pascalSafe(apiNameRaw) : null) ?? "API";
        const apiDescription = context.ir.apiDocs;

        moduleDoc.push(`API client and types for the ${apiName}`);
        moduleDoc.push("");

        if (apiDescription) {
            // Add first paragraph of description
            const paragraphs = apiDescription.split("\n\n");
            const firstParagraph = paragraphs[0];
            if (firstParagraph) {
                const lines = firstParagraph.split("\n");
                lines.forEach((line) => {
                    moduleDoc.push(line.trim());
                });
            }
            moduleDoc.push("");
        } else {
            moduleDoc.push("This module contains all the API definitions including request/response types");
            moduleDoc.push("and client implementations for interacting with the API.");
            moduleDoc.push("");
        }

        moduleDoc.push("## Modules");
        moduleDoc.push("");
        moduleDoc.push("- [`resources`] - Service clients and endpoints");
        if (hasTypes) {
            moduleDoc.push("- [`types`] - Request, response, and model types");
        }
        if (this.hasWebSocketChannels(context)) {
            moduleDoc.push("- [`websocket`] - WebSocket channel clients");
        }

        // Add module declarations
        moduleDeclarations.push(new ModuleDeclaration({ name: "resources", isPublic: true }));
        if (hasTypes) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "types", isPublic: true }));
        }
        if (this.hasWebSocketChannels(context)) {
            moduleDeclarations.push(new ModuleDeclaration({ name: "websocket", isPublic: true }));
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

        // WebSocket channel clients are accessible via the `websocket` submodule
        // (e.g. `crate::websocket::RealtimeClient`). We intentionally do NOT
        // glob re-export them here to keep the WebSocket API separate from
        // the HTTP resource clients.

        const apiModule = new Module({
            moduleDoc,
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

        // Generate model files (includes build_error.rs for builders)
        // This also populates inlinedUnionVariantTypeIds on the model context
        const modelContext = context.toModelGeneratorContext();
        const modelFiles = this.generateModelFilesWithContext(context, modelContext);
        files.push(...modelFiles);

        // Generate types module file, passing inlined type IDs so we skip their mod declarations
        const typesModFile = this.generateTypesModFile(context, modelContext.inlinedUnionVariantTypeIds);
        files.push(typesModFile);

        return files;
    }

    private generateModelFilesWithContext(context: SdkGeneratorContext, modelContext: ModelGeneratorContext): RustFile[] {
        return generateModels({ context: modelContext })
            .filter((file) => file.filename !== "error.rs")
            .map(
                (file) =>
                    new RustFile({
                        filename: file.filename,
                        directory: RelativeFilePath.of("src/api/types"),
                        fileContents: this.getFileContents(file)
                    })
            );
    }

    private generateTypesModFile(context: SdkGeneratorContext, inlinedTypeIds?: Set<string>): RustFile {
        const typesModule = this.buildTypesModule(context, inlinedTypeIds);
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

        // Build module documentation
        const moduleDoc: string[] = [];
        const apiNameRaw2 = context.ir.apiName;
        const apiName = context.ir.apiDisplayName ?? (apiNameRaw2 != null ? context.case.pascalSafe(apiNameRaw2) : null) ?? "API";
        const apiDescription = context.ir.apiDocs;

        // Add main title
        moduleDoc.push(`# ${apiName} SDK`);
        moduleDoc.push("");

        // Add API description if available (from OpenAPI info.description or Fern API docs)
        if (apiDescription) {
            // Split multi-line descriptions and add each line
            const descLines = apiDescription.split("\n");
            descLines.forEach((line) => {
                moduleDoc.push(line.trim());
            });
            moduleDoc.push("");
        } else {
            // Fallback if no description
            moduleDoc.push(`The official Rust SDK for the ${apiName}.`);
            moduleDoc.push("");
        }

        // Add getting started section using generated code
        moduleDoc.push("## Getting Started");
        moduleDoc.push("");
        moduleDoc.push(...this.generateGettingStartedSnippet(context));

        // Add modules section
        moduleDoc.push("## Modules");
        moduleDoc.push("");
        moduleDoc.push("- [`api`] - Core API types and models");
        moduleDoc.push("- [`client`] - Client implementations");
        moduleDoc.push("- [`config`] - Configuration options");
        moduleDoc.push("- [`core`] - Core utilities and infrastructure");
        moduleDoc.push("- [`error`] - Error types and handling");
        moduleDoc.push("- [`prelude`] - Common imports for convenience");

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
            const subClientName = `${context.case.pascalSafe(subpackage.name)}Client`;
            clientExports.push(subClientName);
        });

        useStatements.push(new UseStatement({ path: "error", items: ["ApiError", "BuildError"], isPublic: true }));

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
            moduleDoc,
            moduleDeclarations,
            useStatements,
            rawDeclarations
        });
    }

    private buildTypesModule(context: SdkGeneratorContext, inlinedTypeIds?: Set<string>): Module {
        const moduleDeclarations: ModuleDeclaration[] = [];
        const useStatements: UseStatement[] = [];
        const rawDeclarations: string[] = [];

        // Use a Set to track unique module names and prevent duplicates
        const uniqueModuleNames = new Set<string>();

        // Add regular IR types
        for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
            // Skip types that are inlined into discriminated union variants
            if (inlinedTypeIds?.has(typeId)) {
                continue;
            }
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
                    const inlinedRequestBody = endpoint.requestBody as FernIr.HttpRequestBody.InlinedRequestBody;
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

        // Add file upload request body types from services
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "fileUpload") {
                    // Get the unique type name (may have suffix if there's a collision)
                    const uniqueRequestName = context.getFileUploadRequestTypeName(endpoint.id);

                    // Use centralized method for consistent snake_case conversion (pass endpoint.id)
                    const rawModuleName = context.getModuleNameForFileUploadRequestBody(endpoint.id);
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

        // Add request types for endpoints with referenced body AND query parameters
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Check for referenced body + query parameters
                if (endpoint.requestBody?.type === "reference" && endpoint.queryParameters.length > 0) {
                    // Get the unique type name (may have suffix if there's a collision)
                    const uniqueRequestName = context.getReferencedRequestWithQueryTypeName(endpoint.id);
                    const rawModuleName = context.getModuleNameForReferencedRequestWithQuery(endpoint.id);
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

        // Add bytes request body types for bytes endpoints with query parameters
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0) {
                    const uniqueRequestName = context.getBytesRequestTypeName(endpoint.id);
                    const rawModuleName = context.getModuleNameForBytesRequestBody(endpoint.id);
                    const escapedModuleName = context.escapeRustKeyword(rawModuleName);

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
            const hasWebSocket = this.hasWebSocketChannels(context);
            context.logger.debug(`Generating README.md with ${snippetCount} endpoint example(s), websocket=${hasWebSocket}...`);

            // If there are no endpoints and no WebSocket channels, skip README generation
            if (!snippetCount && !hasWebSocket) {
                context.logger.debug(`Generated simplified README.md for SDK with no endpoints and no WebSocket channels`);
                return;
            }

            // Generate endpoint snippets (may be empty for WebSocket-only SDKs)
            let endpointSnippets: FernGeneratorExec.Endpoint[] = [];
            if (snippetCount) {
                endpointSnippets = this.generateSnippets(context);
            }

            // If there are no endpoint snippets and no WebSocket channels, skip README generation
            if (endpointSnippets.length === 0 && !hasWebSocket) {
                context.logger.debug(`Skipping README.md generation - no endpoint examples defined and no WebSocket channels`);
                return;
            }

            // Generate README content using the agent
            const readmeContent = await context.generatorAgent.generateReadme({
                context,
                endpointSnippets
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
            throw new Error(`Failed to generate README.md: ${extractErrorMessage(error)}`);
        }
    }

    private generateSnippets(context: SdkGeneratorContext) {
        const endpointSnippets: FernGeneratorExec.Endpoint[] = [];
        const dynamicIr = context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate FernIr.dynamic snippets without FernIr.dynamic IR");
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
            throw new Error(`Failed to generate reference.md: ${extractErrorMessage(error)}`);
        }
    }

    // ===========================
    // WIRE TEST GENERATION
    // ===========================

    private async generateWireTestFiles(context: SdkGeneratorContext): Promise<void> {
        if (!context.customConfig.enableWireTests) {
            return;
        }

        try {
            context.logger.debug("Generating WireMock integration tests...");

            // Add ctor crate for lifecycle management (start/stop WireMock container)
            context.dependencyManager.add("ctor", "0.2", RustDependencyType.DEV);
            // Add base64 crate for decoding base64 strings to bytes in tests
            context.dependencyManager.add("base64", "0.22", RustDependencyType.DEV);

            const wireTestGenerator = new WireTestGenerator(context, context.ir);
            await wireTestGenerator.generate();
            context.logger.debug("WireMock test generation complete");
        } catch (error) {
            context.logger.error("Failed to generate WireMock tests");
            if (error instanceof Error) {
                context.logger.debug(error.message);
                context.logger.debug(error.stack ?? "");
            }
        }
    }

    // ===========================
    // UTILITY METHODS
    // ===========================

    private generateGettingStartedSnippet(context: SdkGeneratorContext): string[] {
        const dynamicIr = context.ir.dynamic;
        if (!dynamicIr) {
            return [];
        }

        let firstEndpointId: string | undefined;
        let firstExample: FernIr.dynamic.EndpointSnippetRequest | undefined;

        for (const [endpointId, endpoint] of Object.entries(dynamicIr.endpoints)) {
            if (endpoint.examples && endpoint.examples.length > 0) {
                firstEndpointId = endpointId;
                firstExample = endpoint.examples[0];
                break;
            }
        }

        if (!firstEndpointId || !firstExample) {
            return [];
        }

        try {
            const convertedIr = convertIr(dynamicIr);
            const snippetRequest = convertDynamicEndpointSnippetRequest(firstExample);
            const dynContext = new DynamicSnippetsGeneratorContext({
                ir: convertedIr,
                config: context.config
            });
            const generator = new EndpointSnippetGenerator({ context: dynContext });
            const dynEndpoint = convertedIr.endpoints[firstEndpointId];

            if (!dynEndpoint) {
                return [];
            }

            // Generate components directly
            const components = generator.buildCodeComponents({
                endpoint: dynEndpoint,
                snippet: snippetRequest
            });
            const rawCode = components.join("\n") + "\n";
            const formattedCode = formatRustSnippet(rawCode);

            return ["```rust", ...formattedCode.trimEnd().split("\n"), "```", ""];
        } catch (error) {
            context.logger.debug(`Failed to generate snippet using EndpointSnippetGenerator: ${error}`);
            return [];
        }
    }

    private generateWebSocketFiles(context: SdkGeneratorContext): RustFile[] {
        const generator = new WebSocketChannelGenerator(context);
        return generator.generateAll();
    }

    private hasWebSocketChannels(context: SdkGeneratorContext): boolean {
        return context.hasWebSocketChannels();
    }

    private hasTypes(context: SdkGeneratorContext): boolean {
        // Check for regular IR types
        if (Object.keys(context.ir.types).length > 0) {
            return true;
        }

        // Check for endpoints that generate request types
        for (const service of Object.values(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    return true;
                }
                if (endpoint.queryParameters?.length > 0 && !endpoint.requestBody) {
                    return true;
                }
                if (endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    private hasEnvironments(context: SdkGeneratorContext): boolean {
        return context.ir.environments?.environments != null;
    }

    private getFileContents(file: RustFile): string {
        return typeof file.fileContents === "string" ? file.fileContents : file.fileContents.toString();
    }

    private getResourceExports(context: SdkGeneratorContext): string[] {
        const exports: string[] = [];
        const seen = new Set<string>();

        // Only export top-level subpackages from the root package
        const topLevelSubpackageIds = context.ir.rootPackage.subpackages;

        topLevelSubpackageIds.forEach((subpackageId) => {
            const subpackage = context.ir.subpackages[subpackageId];
            if (subpackage) {
                // Skip WebSocket-only subpackages — they don't generate HTTP client stubs
                // in resources/, so there's nothing to re-export.
                if (context.isWebSocketOnlySubpackage(subpackage)) {
                    return;
                }
                // Use registered client name from context
                // Deduplicate - multiple subpackages can resolve to the same client name
                // (e.g., HTTP and AsyncAPI sources both creating a "market_data" subpackage)
                const subClientName = context.getUniqueClientNameForSubpackage(subpackage);
                if (!seen.has(subClientName)) {
                    seen.add(subClientName);
                    exports.push(subClientName);
                }
            }
        });

        // add main root client
        exports.push(context.getClientName());
        return exports;
    }
}
