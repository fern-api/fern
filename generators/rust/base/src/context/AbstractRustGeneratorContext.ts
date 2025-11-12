import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import type * as FernIr from "@fern-fern/ir-sdk/api";
import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFileDefinition } from "../AsIs";
import { RustDependencyManager, RustDependencySpec, RustDependencyType, RustProject } from "../project";
import {
    convertPascalToSnakeCase,
    convertToSnakeCase,
    escapeRustKeyword,
    escapeRustReservedType,
    generateDefaultCrateName,
    validateAndSanitizeCrateName
} from "../utils";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;
    public readonly dependencyManager: RustDependencyManager;
    public publishConfig: FernGeneratorExec.CratesGithubPublishInfo | undefined;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);

        // Extract publish config from output mode
        config.output.mode._visit<void>({
            github: (github) => {
                if (github.publishInfo?.type === "crates") {
                    this.publishConfig = github.publishInfo;
                }
            },
            publish: () => undefined,
            downloadFiles: () => undefined,
            _other: () => undefined
        });

        this.dependencyManager = new RustDependencyManager();
        this.addBaseDependencies();
        this.detectAndAddFeatureDependencies();

        this.project = new RustProject({
            context: this,
            crateName: this.getCrateName(),
            crateVersion: this.getCrateVersion(),
            clientClassName: this.getClientName()
        });

        // Pre-register ALL filenames before any generation
        this.registerAllFilenames(ir);
    }

    /**
     * Add base dependencies that are always required
     */
    private addBaseDependencies(): void {
        this.dependencyManager.add("serde", { version: "1.0", features: ["derive"] });
        this.dependencyManager.add("serde_json", "1.0");
        this.dependencyManager.add("reqwest", {
            version: "0.12",
            features: ["json", "stream"], // stream is needed for ByteStream (file downloads)
            defaultFeatures: false
        });
        this.dependencyManager.add("tokio", { version: "1.0", features: ["full"] });
        this.dependencyManager.add("futures", "0.3");
        this.dependencyManager.add("bytes", "1.0");
        this.dependencyManager.add("thiserror", "1.0");
        this.dependencyManager.add("percent-encoding", "2.3");
        this.dependencyManager.add("ordered-float", { version: "4.5", features: ["serde"] });

        // Always include chrono and uuid for QueryBuilder support
        this.dependencyManager.add("chrono", { version: "0.4", features: ["serde"] });
        this.dependencyManager.add("uuid", { version: "1.0", features: ["serde"] });

        this.dependencyManager.add("tokio-test", "0.4", RustDependencyType.DEV);

        const extraDeps = this.customConfig.extraDependencies ?? {};
        for (const [name, versionOrSpec] of Object.entries(extraDeps)) {
            if (typeof versionOrSpec === "string") {
                this.dependencyManager.add(name, versionOrSpec);
            } else {
                this.dependencyManager.add(name, versionOrSpec as RustDependencySpec);
            }
        }

        const extraDevDeps = this.customConfig.extraDevDependencies ?? {};
        for (const [name, version] of Object.entries(extraDevDeps)) {
            this.dependencyManager.add(name, version, RustDependencyType.DEV);
        }
    }

    /**
     * Detect features from IR and add conditional dependencies
     */
    private detectAndAddFeatureDependencies(): void {
        const usesBigInt = this.usesBigInteger();

        if (usesBigInt) {
            this.dependencyManager.add("num-bigint", { version: "0.4", features: ["serde"] });
        }

        const hasFileUpload = this.hasFileUploadEndpoints();
        const hasStreaming = this.hasStreamingEndpoints();

        // Always declare multipart feature (empty if not used, to avoid cfg warnings)
        if (hasFileUpload) {
            // Add multipart feature that enables reqwest/multipart
            this.dependencyManager.addFeature("multipart", ["reqwest/multipart"]);
            this.dependencyManager.enableDefaultFeature("multipart");
        } else {
            // Add empty multipart feature to satisfy cfg checks
            this.dependencyManager.addFeature("multipart", []);
        }

        // Always declare sse feature (empty if not used, to avoid cfg warnings)
        if (hasStreaming) {
            // Add SSE-specific dependencies as optional
            this.dependencyManager.add("reqwest-sse", { version: "0.1", optional: true });
            this.dependencyManager.add("pin-project", { version: "1.1", optional: true });

            // Add sse feature that enables SSE dependencies
            this.dependencyManager.addFeature("sse", ["reqwest-sse", "pin-project"]);
            this.dependencyManager.enableDefaultFeature("sse");
        } else {
            // Add empty sse feature to satisfy cfg checks
            this.dependencyManager.addFeature("sse", []);
        }
    }

    /**
     * Check if IR uses a specific primitive type
     */
    private irUsesType(typeName: "DATE_TIME" | "UUID" | "BIG_INTEGER"): boolean {
        for (const typeDecl of Object.values(this.ir.types)) {
            if (this.typeShapeUsesBuiltin(typeDecl.shape, typeName)) {
                return true;
            }
        }

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody != null) {
                    if (endpoint.requestBody.type === "inlinedRequestBody") {
                        for (const property of endpoint.requestBody.properties) {
                            if (this.typeReferenceUsesBuiltin(property.valueType, typeName)) {
                                return true;
                            }
                        }
                    } else if (endpoint.requestBody.type === "reference") {
                        if (this.typeReferenceUsesBuiltin(endpoint.requestBody.requestBodyType, typeName)) {
                            return true;
                        }
                    }
                }

                if (endpoint.response?.body) {
                    const usesBuiltin = endpoint.response.body._visit({
                        json: (json: FernIr.JsonResponse) => {
                            return json._visit({
                                response: (response: FernIr.JsonResponseBody) =>
                                    this.typeReferenceUsesBuiltin(response.responseBodyType, typeName),
                                nestedPropertyAsResponse: (nested: FernIr.JsonResponseBodyWithProperty) =>
                                    this.typeReferenceUsesBuiltin(nested.responseBodyType, typeName),
                                _other: () => false
                            });
                        },
                        fileDownload: () => false,
                        streaming: () => false,
                        streamParameter: () => false,
                        text: () => false,
                        bytes: () => false,
                        _other: () => false
                    });
                    if (usesBuiltin) {
                        return true;
                    }
                }

                for (const param of endpoint.queryParameters) {
                    if (this.typeReferenceUsesBuiltin(param.valueType, typeName)) {
                        return true;
                    }
                }

                for (const param of endpoint.pathParameters) {
                    if (this.typeReferenceUsesBuiltin(param.valueType, typeName)) {
                        return true;
                    }
                }

                for (const header of endpoint.headers) {
                    if (this.typeReferenceUsesBuiltin(header.valueType, typeName)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if a type shape uses a specific builtin type
     */
    private typeShapeUsesBuiltin(shape: FernIr.Type, typeName: string): boolean {
        return shape._visit({
            alias: (alias: FernIr.AliasTypeDeclaration) => this.typeReferenceUsesBuiltin(alias.aliasOf, typeName),
            enum: () => false,
            object: (obj: FernIr.ObjectTypeDeclaration) => {
                for (const property of obj.properties) {
                    if (this.typeReferenceUsesBuiltin(property.valueType, typeName)) {
                        return true;
                    }
                }
                return false;
            },
            union: (union: FernIr.UnionTypeDeclaration) => {
                for (const variant of union.types) {
                    const usesBuiltin = variant.shape._visit({
                        singleProperty: (property: FernIr.SingleUnionTypeProperty) =>
                            this.typeReferenceUsesBuiltin(property.type, typeName),
                        samePropertiesAsObject: (declaredType: FernIr.DeclaredTypeName) => {
                            const typeDecl = this.ir.types[declaredType.typeId];
                            if (typeDecl) {
                                return this.typeShapeUsesBuiltin(typeDecl.shape, typeName);
                            }
                            return false;
                        },
                        noProperties: () => false,
                        _other: () => false
                    });
                    if (usesBuiltin) {
                        return true;
                    }
                }
                return false;
            },
            undiscriminatedUnion: (union: FernIr.UndiscriminatedUnionTypeDeclaration) => {
                for (const member of union.members) {
                    if (this.typeReferenceUsesBuiltin(member.type, typeName)) {
                        return true;
                    }
                }
                return false;
            },
            _other: () => false
        });
    }

    /**
     * Check if a type reference uses a specific builtin type
     */
    private typeReferenceUsesBuiltin(typeRef: FernIr.TypeReference, typeName: string): boolean {
        return typeRef._visit({
            primitive: (primitive: FernIr.PrimitiveType) => {
                return primitive.v1 === typeName;
            },
            container: (container: FernIr.ContainerType) => {
                return container._visit({
                    list: (list: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(list, typeName),
                    set: (set: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(set, typeName),
                    optional: (optional: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(optional, typeName),
                    nullable: (nullable: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(nullable, typeName),
                    map: (map: FernIr.MapType) =>
                        this.typeReferenceUsesBuiltin(map.keyType, typeName) ||
                        this.typeReferenceUsesBuiltin(map.valueType, typeName),
                    literal: () => false,
                    _other: () => false
                });
            },
            named: (named: FernIr.NamedType) => {
                const typeDecl = this.ir.types[named.typeId];
                if (typeDecl) {
                    return this.typeShapeUsesBuiltin(typeDecl.shape, typeName);
                }
                return false;
            },
            unknown: () => false,
            _other: () => false
        });
    }

    /**
     * Check if IR uses datetime types
     */
    public usesDateTime(): boolean {
        return this.irUsesType("DATE_TIME");
    }

    /**
     * Check if IR uses uuid types
     */
    public usesUuid(): boolean {
        return this.irUsesType("UUID");
    }

    /**
     * Check if IR uses big integer types
     */
    public usesBigInteger(): boolean {
        return this.irUsesType("BIG_INTEGER");
    }

    /**
     * Check if IR has any file upload endpoints
     */
    public hasFileUploadEndpoints(): boolean {
        return Object.values(this.ir.services).some((service) =>
            service.endpoints.some((endpoint) => endpoint.requestBody?.type === "fileUpload")
        );
    }

    /**
     * Check if IR has any streaming endpoints
     */
    public hasStreamingEndpoints(): boolean {
        return Object.values(this.ir.services).some((service) =>
            service.endpoints.some((endpoint) => {
                if (!endpoint.response?.body) {
                    return false;
                }
                return endpoint.response.body._visit({
                    streaming: () => true,
                    streamParameter: () => true,
                    json: () => false,
                    fileDownload: () => false,
                    text: () => false,
                    bytes: () => false,
                    _other: () => false
                });
            })
        );
    }

    /**
     * Pre-registers all filenames to prevent collisions.
     * This is called once during context construction, before any file generation.
     * Follows Swift's priority-based registration pattern.
     *
     * Registration Priority:
     * 1. IR schema types (Enum, Alias, Struct, Union, UndiscriminatedUnion)
     * 2. Inline request body types
     * 3. Query request types
     */
    private registerAllFilenames(ir: IntermediateRepresentation): void {
        this.logger.debug("=== Pre-registering all filenames ===");

        // Priority 1: All IR types (covers Enum, Alias, Struct, Union, UndiscriminatedUnion)
        let schemaTypeCount = 0;
        for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
            // Register filename
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            const typeName = typeDeclaration.name.name.snakeCase.safeName;
            const fullPath = [...pathParts, typeName];
            const baseFilename = convertToSnakeCase(fullPath.join("_"));

            const registeredFilename = this.project.filenameRegistry.registerSchemaTypeFilename(typeId, baseFilename);

            // Register type name without path prefix
            const baseTypeName = typeDeclaration.name.name.pascalCase.safeName;

            const registeredTypeName = this.project.filenameRegistry.registerSchemaTypeTypeName(typeId, baseTypeName);

            // Log if collision was resolved
            if (registeredFilename !== baseFilename || registeredTypeName !== baseTypeName) {
                this.logger.debug(
                    `Schema type collision resolved: ` +
                        `${baseTypeName} → ${registeredTypeName}, ` +
                        `${baseFilename}.rs → ${registeredFilename}.rs`
                );
            }
            schemaTypeCount++;
        }
        this.logger.debug(`Registered ${schemaTypeCount} schema type filenames and type names`);

        // Priority 2: Inline request bodies from ALL services
        let inlineRequestCount = 0;
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    const requestName = endpoint.requestBody.name.pascalCase.unsafeName;
                    const baseFilename = convertPascalToSnakeCase(requestName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerInlineRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerInlineRequestTypeName(
                        endpoint.id,
                        requestName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== requestName) {
                        this.logger.debug(
                            `Inline request collision resolved: ` +
                                `${requestName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    inlineRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${inlineRequestCount} inline request filenames and type names`);

        // Priority 2.5: File upload request bodies from ALL services
        let fileUploadRequestCount = 0;
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "fileUpload") {
                    // Use endpoint name to generate request type name (like TypeScript generator)
                    const requestName = `${endpoint.name.pascalCase.safeName}Request`;
                    const baseFilename = convertPascalToSnakeCase(requestName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerFileUploadRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerFileUploadRequestTypeName(
                        endpoint.id,
                        requestName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== requestName) {
                        this.logger.debug(
                            `File upload request collision resolved: ` +
                                `${requestName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    fileUploadRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${fileUploadRequestCount} file upload request filenames and type names`);

        // Priority 3: Query request types from ALL services
        let queryRequestCount = 0;
        for (const [serviceId, service] of Object.entries(ir.services)) {
            for (const endpoint of service.endpoints) {
                // Only endpoints with query params and no request body
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    const queryTypeName = this.getQueryRequestTypeName(endpoint, serviceId);
                    const baseFilename = convertPascalToSnakeCase(queryTypeName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerQueryRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerQueryRequestTypeName(
                        endpoint.id,
                        queryTypeName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== queryTypeName) {
                        this.logger.debug(
                            `Query request collision resolved: ` +
                                `${queryTypeName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    queryRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${queryRequestCount} query request filenames and type names`);

        // Priority 3.5: Referenced request with query parameters
        let referencedRequestWithQueryCount = 0;
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                // Only endpoints with referenced body AND query parameters
                if (endpoint.requestBody?.type === "reference" && endpoint.queryParameters.length > 0) {
                    // Generate request type name like CreateUsernameReferencedRequest
                    const requestName = `${endpoint.name.pascalCase.safeName}Request`;
                    const baseFilename = convertPascalToSnakeCase(requestName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerReferencedRequestWithQueryFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerReferencedRequestWithQueryTypeName(
                        endpoint.id,
                        requestName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== requestName) {
                        this.logger.debug(
                            `Referenced request with query collision resolved: ` +
                                `${requestName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    referencedRequestWithQueryCount++;
                }
            }
        }
        this.logger.debug(
            `Registered ${referencedRequestWithQueryCount} referenced request with query filenames and type names`
        );

        // Priority 4: Client names (root client + all subpackage clients)
        let clientNameCount = 0;

        // Register root client first
        const rootClientName = this.getClientName();
        const registeredRootClientName = this.project.filenameRegistry.registerClientName("root", rootClientName);
        if (registeredRootClientName !== rootClientName) {
            this.logger.debug(`Root client collision resolved: ${rootClientName} → ${registeredRootClientName}`);
        }
        clientNameCount++;

        // Register all subpackage clients
        for (const [subpackageId, subpackage] of Object.entries(ir.subpackages)) {
            const baseClientName = `${subpackage.name.pascalCase.safeName}Client`;
            const registeredClientName = this.project.filenameRegistry.registerClientName(subpackageId, baseClientName);

            if (registeredClientName !== baseClientName) {
                this.logger.debug(`Client collision resolved: ${baseClientName} → ${registeredClientName}`);
            }
            clientNameCount++;
        }
        this.logger.debug(`Registered ${clientNameCount} client names`);

        this.logger.debug(
            `=== Pre-registration complete: ${schemaTypeCount + inlineRequestCount + queryRequestCount} filenames, ${clientNameCount} client names ===`
        );
    }

    // =====================================
    // Configuration Management Methods
    // =====================================

    /**
     * Get extra dependencies with empty object fallback
     */
    public getExtraDependencies(): Record<string, string> {
        return this.customConfig.extraDependencies ?? {};
    }

    /**
     * Get extra dev dependencies with empty object fallback
     */
    public getExtraDevDependencies(): Record<string, string> {
        return this.customConfig.extraDevDependencies ?? {};
    }

    /**
     * Get the crate name with fallback to generated default
     */
    public getCrateName(): string {
        const crateName = this.customConfig.crateName ?? this.generateDefaultCrateName();
        return validateAndSanitizeCrateName(crateName);
    }

    /**
     * Get the crate version from --version flag or use default
     * Priority: 1) customConfig.crateVersion, 2) publishConfig.publishTarget.version, 3) default "0.1.0"
     */
    public getCrateVersion(): string {
        // Priority 1: Check customConfig.packageVersion (explicitly set in generators.yml) and for --local generation
        if (this.customConfig.crateVersion != null) {
            return this.customConfig.crateVersion;
        }

        // Priority 2: Check version from output mode (same as TypeScript generator)
        // This picks up the --version flag from the CLI

        const versionFromOutputMode = this.config.output?.mode._visit({
            downloadFiles: () => undefined,
            github: (github) => github.version,
            publish: (publish) => publish.version,
            _other: () => undefined
        });

        if (versionFromOutputMode != null) {
            return versionFromOutputMode;
        }

        // Priority 3: Try to get version from publishConfig (set via output.location = crates) for remote generation
        if (this.ir.publishConfig != null) {
            let publishTarget;

            // Extract publishTarget based on publishConfig type
            if (this.ir.publishConfig.type === "github" || this.ir.publishConfig.type === "direct") {
                publishTarget = this.ir.publishConfig.target;
            } else if (this.ir.publishConfig.type === "filesystem") {
                publishTarget = this.ir.publishConfig.publishTarget;
            }

            if (publishTarget != null) {
                if (publishTarget.type === "crates" && publishTarget.version != null) {
                    return publishTarget.version;
                }
            }
        }
        // Default version if no version specified
        return "0.1.0";
    }

    /**
     * Get the client class name using the registered name from the filename registry.
     * Falls back to custom config or generated default for initial registration.
     */
    public getClientName(): string {
        // Try to get the registered root client name first (if project is initialized)
        if (this.project != null) {
            const registeredName = this.project.filenameRegistry.getClientNameOrUndefined("root");
            if (registeredName != null) {
                return registeredName;
            }
        }

        // Fallback for initial registration phase (before project is created or registry is populated)
        return this.customConfig.clientClassName ?? `${this.ir.apiName.pascalCase.safeName}Client`;
    }

    /**
     * Escapes Rust keywords by prefixing them with 'r#'
     */
    public escapeRustKeyword(name: string): string {
        return escapeRustKeyword(name);
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
     */
    public escapeRustReservedType(name: string): string {
        return escapeRustReservedType(name);
    }

    // =====================================
    // Type and Module Path Methods
    // =====================================

    /**
     * Get the correct module path for a type using fernFilepath + type name
     * to create unique filenames and import paths that prevent collisions.
     *
     * This method should be used whenever generating:
     * - Type filenames (e.g., "foo_importing_type.rs")
     * - Module declarations (e.g., "pub mod foo_importing_type;")
     * - Import paths (e.g., "use crate::foo_importing_type::ImportingType;")
     *
     * @param typeNameSnake The snake_case name of the type to look up
     * @returns The unique module path (fernFilepath parts + type name joined with underscores)
     */
    public getModulePathForType(typeNameSnake: string): string {
        // Find the type declaration in the IR
        for (const typeDeclaration of Object.values(this.ir.types)) {
            if (typeDeclaration.name.name.snakeCase.unsafeName === typeNameSnake) {
                // Use fernFilepath + type name for unique module names to prevent collisions
                // E.g., "folder-a/Response" becomes "folder_a_response"
                // E.g., "foo/ImportingType" becomes "foo_importing_type"
                const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
                const typeName = typeDeclaration.name.name.snakeCase.safeName;
                const fullPath = [...pathParts, typeName];
                // Join with underscore and then apply snake_case conversion to ensure proper formatting
                // This handles cases like "union__key" -> "union_key"
                const rawName = fullPath.join("_");
                return convertToSnakeCase(rawName);
            }
        }

        // Fallback to old behavior if type not found (for backward compatibility)
        return typeNameSnake;
    }

    // TODO: @iamnamananand996 simplify collisions detection more

    /**
     * Get the module path for a type reference with full fernFilepath information.
     * This ensures we get the correct module path when there are name collisions.
     *
     * @param declaredTypeName The declared type name from a type reference
     * @returns The unique module path (fernFilepath parts + type name joined with underscores)
     */
    public getModulePathForDeclaredType(declaredTypeName: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        name: { pascalCase?: { safeName: string }; snakeCase?: { unsafeName: string }; originalName?: string };
    }): string {
        // Extract the type name - can be from pascalCase or snakeCase
        const typeName =
            declaredTypeName.name.snakeCase?.unsafeName ||
            declaredTypeName.name.originalName ||
            declaredTypeName.name.pascalCase?.safeName ||
            "";

        // Try to find the exact type declaration in IR that matches both name and fernFilepath
        const typeDeclaration = Object.values(this.ir.types).find((type) => {
            // Match by name (try different formats)
            const nameMatches =
                type.name.name.snakeCase.unsafeName === typeName ||
                type.name.name.pascalCase.safeName === typeName ||
                type.name.name.originalName === typeName;

            // Match by fernFilepath
            const pathMatches =
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        part.pascalCase.safeName === declaredTypeName.fernFilepath.allParts[idx]?.pascalCase.safeName
                );

            return nameMatches && pathMatches;
        });

        if (typeDeclaration) {
            // Use fernFilepath + type name for unique module names
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            const typeNameSnake = typeDeclaration.name.name.snakeCase.safeName;
            const fullPath = [...pathParts, typeNameSnake];
            const rawName = fullPath.join("_");
            return convertToSnakeCase(rawName);
        }

        // Fallback to base name if not found in IR
        return convertToSnakeCase(typeName);
    }

    /**
     * Get the unique filename for a type declaration using pre-registered names.
     * This replaces the old collision detection logic that used a Set.
     *
     * @param typeDeclaration The type declaration to generate a filename for
     * @returns The unique filename (e.g., "foo_importing_type.rs")
     */
    public getUniqueFilenameForType(typeDeclaration: {
        name: {
            fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
            name: { snakeCase: { safeName: string }; pascalCase: { safeName: string } };
        };
    }): string {
        // Find typeId in IR by matching the typeDeclaration reference
        const typeId = Object.entries(this.ir.types).find(([_, type]) => type === typeDeclaration)?.[0];

        if (!typeId) {
            throw new Error(
                `Type not found in IR: ${typeDeclaration.name.name.pascalCase.safeName}. ` +
                    `This should never happen - all types should be pre-registered.`
            );
        }

        return this.project.filenameRegistry.getSchemaTypeFilenameOrThrow(typeId);
    }

    /**
     * Get a unique type name for a type declaration using pre-registered names.
     * This replaces the old dynamic collision detection logic.
     *
     * @param typeDeclaration The type declaration to generate a type name for
     * @returns The unique type name (e.g., "TaskError" or "TypeTaskError" if collision)
     */
    public getUniqueTypeNameForDeclaration(typeDeclaration: {
        name: {
            fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
            name: { pascalCase: { safeName: string } };
        };
    }): string {
        // Find typeId in IR by matching the typeDeclaration reference
        const typeId = Object.entries(this.ir.types).find(([_, type]) => type === typeDeclaration)?.[0];

        if (!typeId) {
            throw new Error(
                `Type not found in IR: ${typeDeclaration.name.name.pascalCase.safeName}. ` +
                    `This should never happen - all types should be pre-registered.`
            );
        }

        return this.project.filenameRegistry.getSchemaTypeTypeNameOrThrow(typeId);
    }

    /**
     * Get the unique type name for a DeclaredTypeName (used in type references).
     * This looks up the type in IR and returns its unique name.
     *
     * @param declaredTypeName The declared type name from a type reference
     * @returns The unique type name, or the base name if not found in IR
     */
    public getUniqueTypeNameForReference(declaredTypeName: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        name: { pascalCase: { safeName: string } };
    }): string {
        const baseTypeName = declaredTypeName.name.pascalCase.safeName;

        // Try to find the type declaration in IR
        const typeDeclaration = Object.values(this.ir.types).find(
            (type) =>
                type.name.name.pascalCase.safeName === baseTypeName &&
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        part.pascalCase.safeName === declaredTypeName.fernFilepath.allParts[idx]?.pascalCase.safeName
                )
        );

        if (typeDeclaration) {
            // Use the same logic as getUniqueTypeNameForDeclaration to get the unique name
            return this.getUniqueTypeNameForDeclaration(typeDeclaration);
        }

        // Fallback: return base name if not found in IR (could be external type or error type)
        return baseTypeName;
    }

    // TODO: @iamnamananand996 simplify collisions detection more

    /**
     * Get the unique query type name (used in type references).
     * This looks up the type in IR and endpoind and returns its unique name.
     *
     * @param endpoint
     * @param serviceId
     * @returns The unique type name, or the base name if not found in IR
     */

    public getQueryRequestTypeName(endpoint: HttpEndpoint, serviceId: string): string {
        // Generate query-specific request type name with service context to prevent collisions
        const methodName = endpoint.name.pascalCase.safeName;
        const baseTypeName = `${methodName}QueryRequest`;

        // Find the subpackage that owns this service to get naming context
        const subpackage = Object.values(this.ir.subpackages).find((subpkg) => subpkg.service === serviceId);

        if (!subpackage) {
            // No subpackage found - use base name
            return baseTypeName;
        }

        // Check if there are other services with endpoints of the same name
        const hasCollision = Object.entries(this.ir.services).some(([otherServiceId, otherService]) => {
            if (otherServiceId === serviceId) {
                return false; // Skip the current service
            }

            // Check if this other service has an endpoint with the same name
            return otherService.endpoints.some(
                (otherEndpoint) =>
                    otherEndpoint.name.pascalCase.safeName === methodName &&
                    otherEndpoint.queryParameters.length > 0 &&
                    !otherEndpoint.requestBody
            );
        });

        if (hasCollision) {
            // Include full subpackage path to make it unique (e.g., auth/analytics → AuthAnalytics)
            const pathParts = subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
            const subpackagePrefix = pathParts.join("");
            return `${subpackagePrefix}${baseTypeName}`;
        }

        // No collision - use base name
        return baseTypeName;
    }

    /**
     * Get filename for inlined request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR (NOT the request name string)
     */
    public getFilenameForInlinedRequestBody(endpointId: string): string {
        return this.project.filenameRegistry.getInlineRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for inlined request body from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForInlinedRequestBody(endpointId: string): string {
        const filename = this.getFilenameForInlinedRequestBody(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get filename for query request using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR (NOT the request type name string)
     */
    public getFilenameForQueryRequest(endpointId: string): string {
        return this.project.filenameRegistry.getQueryRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for query request from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForQueryRequest(endpointId: string): string {
        const filename = this.getFilenameForQueryRequest(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get unique type name for inline request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., ListUsersRequest2 if there's a collision)
     */
    public getInlineRequestTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getInlineRequestTypeNameOrThrow(endpointId);
    }

    /**
     * Get unique type name for query request using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., ListUsersQuery2 if there's a collision)
     */
    public getQueryRequestUniqueTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getQueryRequestTypeNameOrThrow(endpointId);
    }

    /**
     * Get filename for file upload request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR (NOT the request name string)
     */
    public getFilenameForFileUploadRequestBody(endpointId: string): string {
        return this.project.filenameRegistry.getFileUploadRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for file upload request body from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForFileUploadRequestBody(endpointId: string): string {
        const filename = this.getFilenameForFileUploadRequestBody(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get unique type name for file upload request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., UploadFileRequest2 if there's a collision)
     */
    public getFileUploadRequestTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getFileUploadRequestTypeNameOrThrow(endpointId);
    }

    /**
     * Get filename for referenced request with query using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     */
    public getFilenameForReferencedRequestWithQuery(endpointId: string): string {
        return this.project.filenameRegistry.getReferencedRequestWithQueryFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for referenced request with query from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForReferencedRequestWithQuery(endpointId: string): string {
        const filename = this.getFilenameForReferencedRequestWithQuery(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get unique type name for referenced request with query using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., CreateUsernameReferencedRequest2 if there's a collision)
     */
    public getReferencedRequestWithQueryTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getReferencedRequestWithQueryTypeNameOrThrow(endpointId);
    }

    /**
     * Converts PascalCase to snake_case consistently across the generator
     */
    private convertPascalToSnakeCase(pascalCase: string): string {
        return convertPascalToSnakeCase(pascalCase);
    }

    /**
     * Get the unique filename for a subpackage using its fernFilepath
     * to prevent filename collisions between subpackages with the same name in different paths.
     *
     * @param subpackage The subpackage to generate a filename for
     * @returns The unique filename (e.g., "nested_no_auth_api.rs")
     */
    public getUniqueFilenameForSubpackage(subpackage: {
        fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
    }): string {
        // Use the full fernFilepath to create unique filenames to prevent collisions
        // E.g., "nested-no-auth/api" becomes "nested_no_auth_api.rs"
        const pathParts = subpackage.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        return `${pathParts.join("_")}.rs`;
    }

    /**
     * Get the unique client name for a subpackage using the registered name from the filename registry.
     * This ensures consistent naming and prevents collisions.
     *
     * @param subpackage The subpackage to get the client name for
     * @returns The unique client name (e.g., "NestedNoAuthApiClient" or "BasicAuthClient2" if collision)
     */
    public getUniqueClientNameForSubpackage(subpackage: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
    }): string {
        // Find the subpackage ID by matching fernFilepath
        const subpackageId = Object.entries(this.ir.subpackages).find(([, sp]) => {
            return (
                sp.fernFilepath.allParts.length === subpackage.fernFilepath.allParts.length &&
                sp.fernFilepath.allParts.every(
                    (part, index) =>
                        part.pascalCase.safeName === subpackage.fernFilepath.allParts[index]?.pascalCase.safeName
                )
            );
        })?.[0];

        if (subpackageId != null) {
            // Use registered name if available
            const registeredName = this.project.filenameRegistry.getClientNameOrUndefined(subpackageId);
            if (registeredName != null) {
                return registeredName;
            }
        }

        // Fallback to old behavior if not found (shouldn't happen in normal flow)
        const pathParts = subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
        return pathParts.join("") + "Client";
    }

    /**
     * Get the core AsIs template files for this generator type
     */
    public abstract getCoreAsIsFiles(): AsIsFileDefinition[];

    // =====================================
    // Private Helper Methods
    // =====================================

    /**
     * Generate default package name from organization and API name
     */
    private generateDefaultCrateName(): string {
        const orgName = this.config.organization;
        const apiName = this.ir.apiName.snakeCase.unsafeName;
        return generateDefaultCrateName(orgName, apiName);
    }
}
