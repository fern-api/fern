import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService, CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { AsIsFileDefinition } from "../AsIs.js";
import { RustDependencyManager, RustDependencySpec, RustDependencyType, RustProject } from "../project/index.js";
import {
    convertPascalToSnakeCase,
    convertToSnakeCase,
    escapeRustKeyword,
    escapeRustReservedType,
    generateDefaultCrateName,
    RustCycleDetector,
    validateAndSanitizeCrateName
} from "../utils/index.js";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly case: CaseConverter;
    public readonly project: RustProject;
    public readonly dependencyManager: RustDependencyManager;
    public publishConfig: FernGeneratorExec.CratesGithubPublishInfo | undefined;
    private readonly irUsesTypeCache = new Map<string, boolean>();
    private readonly featureCache = new Map<string, boolean>();

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.case = new CaseConverter({
            generationLanguage: customConfig.capitalizeInitialisms ? undefined : "rust",
            keywords: ir.casingsConfig?.keywords,
            smartCasing: ir.casingsConfig?.smartCasing ?? true
        });

        // Detect illegal recursive type cycles before any generation
        // This will throw an error if the schema has cycles that cannot be represented in Rust
        const cycleDetector = new RustCycleDetector(ir);
        cycleDetector.detectIllegalCycles();

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
        this.applyExtraDependencies();

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

        // Conditionally include ordered-float only when floating-point sets are used
        if (this.usesOrderedFloat()) {
            this.dependencyManager.add("ordered-float", { version: "4.5", features: ["serde"] });
        }

        // Conditionally include num-bigint only when big integer types are used
        if (this.usesBigInteger()) {
            this.dependencyManager.add("num-bigint", { version: "0.4", features: ["serde"] });
        }

        // Conditionally include chrono only when datetime/date types are used
        if (this.usesDateTime()) {
            this.dependencyManager.add("chrono", { version: "0.4", features: ["serde"] });
        }

        // Conditionally include uuid only when UUID types are used
        if (this.usesUuid()) {
            this.dependencyManager.add("uuid", { version: "1.0", features: ["serde"] });
        }

        // Conditionally include base64 only when base64 types are used
        if (this.usesBase64()) {
            this.dependencyManager.add("base64", "0.22");
        }

        this.dependencyManager.add("tokio-test", "0.4", RustDependencyType.DEV);
    }

    /**
     * Apply extra dependencies from config, overriding any bundled versions.
     * Called after all bundled deps (base + conditional) are registered so
     * user-specified versions always take precedence.
     */
    private applyExtraDependencies(): void {
        const extraDeps = this.customConfig.extraDependencies ?? {};
        for (const [name, versionOrSpec] of Object.entries(extraDeps)) {
            if (typeof versionOrSpec === "string") {
                this.dependencyManager.add(name, versionOrSpec);
            } else {
                this.dependencyManager.add(name, versionOrSpec as RustDependencySpec);
            }
        }

        const extraDevDeps = this.customConfig.extraDevDependencies ?? {};
        for (const [name, versionOrSpec] of Object.entries(extraDevDeps)) {
            if (typeof versionOrSpec === "string") {
                this.dependencyManager.add(name, versionOrSpec, RustDependencyType.DEV);
            } else {
                this.dependencyManager.add(name, versionOrSpec as RustDependencySpec, RustDependencyType.DEV);
            }
        }
    }

    /**
     * Detect features from IR and add conditional dependencies
     * Also respects custom features configuration from customConfig
     */
    private detectAndAddFeatureDependencies(): void {
        const hasFileUpload = this.hasFileUploadEndpoints();
        const hasStreaming = this.hasStreamingEndpoints();

        // Track auto-detected default features
        const autoDetectedDefaults: string[] = [];

        // Only declare multipart feature when file upload endpoints exist
        if (hasFileUpload) {
            this.dependencyManager.addFeature("multipart", ["reqwest/multipart"]);
            autoDetectedDefaults.push("multipart");
        }

        const hasWebSocket = this.hasWebSocketChannels();

        // Only declare websocket feature when WebSocket channels exist
        if (hasWebSocket) {
            this.dependencyManager.add("tokio-tungstenite", { version: "0.24", features: ["native-tls"], optional: true });
            this.dependencyManager.add("urlencoding", { version: "2.1", optional: true });
            this.dependencyManager.add("rand", { version: "0.9", optional: true });

            this.dependencyManager.addFeature("websocket", ["tokio-tungstenite", "urlencoding", "rand"]);
            autoDetectedDefaults.push("websocket");
        }

        // Only declare sse feature when streaming endpoints exist
        if (hasStreaming) {
            this.dependencyManager.add("reqwest-sse", { version: "0.1", optional: true });
            this.dependencyManager.add("pin-project", { version: "1.1", optional: true });

            this.dependencyManager.addFeature("sse", ["reqwest-sse", "pin-project"]);
            autoDetectedDefaults.push("sse");
        }

        // Add custom features from configuration
        if (this.customConfig.features) {
            for (const [featureName, dependencies] of Object.entries(this.customConfig.features)) {
                this.dependencyManager.addFeature(featureName, dependencies);
            }
        }

        // Apply default features (custom override or auto-detected)
        const defaultFeatures = this.customConfig.defaultFeatures ?? autoDetectedDefaults;
        for (const feature of defaultFeatures) {
            this.dependencyManager.enableDefaultFeature(feature);
        }
    }

    private cachedFeature(key: string, compute: () => boolean): boolean {
        const cached = this.featureCache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const result = compute();
        this.featureCache.set(key, result);
        return result;
    }

    /**
     * Check if IR uses a specific primitive type
     */
    private irUsesType(typeName: "DATE_TIME" | "DATE" | "UUID" | "BIG_INTEGER" | "BASE_64" | "FLOAT" | "DOUBLE"): boolean {
        const cached = this.irUsesTypeCache.get(typeName);
        if (cached !== undefined) {
            return cached;
        }

        const result = this.computeIrUsesType(typeName);
        this.irUsesTypeCache.set(typeName, result);
        return result;
    }

    private computeIrUsesType(typeName: "DATE_TIME" | "DATE" | "UUID" | "BIG_INTEGER" | "BASE_64" | "FLOAT" | "DOUBLE"): boolean {
        // Use a visited set to prevent infinite recursion on circular types
        const visited = new Set<string>();

        for (const typeDecl of Object.values(this.ir.types)) {
            if (this.typeShapeUsesBuiltin(typeDecl.shape, typeName, visited)) {
                return true;
            }
        }

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody != null) {
                    if (endpoint.requestBody.type === "inlinedRequestBody") {
                        for (const property of endpoint.requestBody.properties) {
                            if (this.typeReferenceUsesBuiltin(property.valueType, typeName, visited)) {
                                return true;
                            }
                        }
                    } else if (endpoint.requestBody.type === "reference") {
                        if (this.typeReferenceUsesBuiltin(endpoint.requestBody.requestBodyType, typeName, visited)) {
                            return true;
                        }
                    } else if (endpoint.requestBody.type === "fileUpload") {
                        // File upload properties are implicitly base64-encoded bytes
                        if (typeName === "BASE_64") {
                            return true;
                        }
                        // Also check body properties within file upload requests
                        for (const property of endpoint.requestBody.properties) {
                            if (property.type === "bodyProperty") {
                                if (this.typeReferenceUsesBuiltin(property.valueType, typeName, visited)) {
                                    return true;
                                }
                            }
                        }
                    }
                }

                if (endpoint.response?.body) {
                    const usesBuiltin = endpoint.response.body._visit({
                        json: (json: FernIr.JsonResponse) => {
                            return json._visit({
                                response: (response: FernIr.JsonResponseBody) =>
                                    this.typeReferenceUsesBuiltin(response.responseBodyType, typeName, visited),
                                nestedPropertyAsResponse: (nested: FernIr.JsonResponseBodyWithProperty) =>
                                    this.typeReferenceUsesBuiltin(nested.responseBodyType, typeName, visited),
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
                    if (this.typeReferenceUsesBuiltin(param.valueType, typeName, visited)) {
                        return true;
                    }
                }

                for (const param of endpoint.pathParameters) {
                    if (this.typeReferenceUsesBuiltin(param.valueType, typeName, visited)) {
                        return true;
                    }
                }

                for (const header of endpoint.headers) {
                    if (this.typeReferenceUsesBuiltin(header.valueType, typeName, visited)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if a type shape uses a specific builtin type
     * @param visited Set of type IDs already visited to prevent infinite recursion
     */
    private typeShapeUsesBuiltin(shape: FernIr.Type, typeName: string, visited: Set<string>): boolean {
        return shape._visit({
            alias: (alias: FernIr.AliasTypeDeclaration) =>
                this.typeReferenceUsesBuiltin(alias.aliasOf, typeName, visited),
            enum: () => false,
            object: (obj: FernIr.ObjectTypeDeclaration) => {
                for (const property of obj.properties) {
                    if (this.typeReferenceUsesBuiltin(property.valueType, typeName, visited)) {
                        return true;
                    }
                }
                return false;
            },
            union: (union: FernIr.UnionTypeDeclaration) => {
                for (const variant of union.types) {
                    const usesBuiltin = variant.shape._visit({
                        singleProperty: (property: FernIr.SingleUnionTypeProperty) =>
                            this.typeReferenceUsesBuiltin(property.type, typeName, visited),
                        samePropertiesAsObject: (declaredType: FernIr.DeclaredTypeName) => {
                            // Prevent infinite recursion by checking if we've visited this type
                            if (visited.has(declaredType.typeId)) {
                                return false;
                            }
                            const typeDecl = this.ir.types[declaredType.typeId];
                            if (typeDecl) {
                                return this.typeShapeUsesBuiltin(typeDecl.shape, typeName, visited);
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
                    if (this.typeReferenceUsesBuiltin(member.type, typeName, visited)) {
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
     * @param visited Set of type IDs already visited to prevent infinite recursion
     */
    private typeReferenceUsesBuiltin(typeRef: FernIr.TypeReference, typeName: string, visited: Set<string>): boolean {
        return typeRef._visit({
            primitive: (primitive: FernIr.PrimitiveType) => {
                return primitive.v1 === typeName;
            },
            container: (container: FernIr.ContainerType) => {
                return container._visit({
                    list: (list: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(list, typeName, visited),
                    set: (set: FernIr.TypeReference) => this.typeReferenceUsesBuiltin(set, typeName, visited),
                    optional: (optional: FernIr.TypeReference) =>
                        this.typeReferenceUsesBuiltin(optional, typeName, visited),
                    nullable: (nullable: FernIr.TypeReference) =>
                        this.typeReferenceUsesBuiltin(nullable, typeName, visited),
                    map: (map: FernIr.MapType) =>
                        this.typeReferenceUsesBuiltin(map.keyType, typeName, visited) ||
                        this.typeReferenceUsesBuiltin(map.valueType, typeName, visited),
                    literal: () => false,
                    _other: () => false
                });
            },
            named: (named: FernIr.NamedType) => {
                // Prevent infinite recursion by checking if we've already visited this type
                if (visited.has(named.typeId)) {
                    return false;
                }

                // Mark this type as visited
                visited.add(named.typeId);

                const typeDecl = this.ir.types[named.typeId];
                if (typeDecl) {
                    return this.typeShapeUsesBuiltin(typeDecl.shape, typeName, visited);
                }
                return false;
            },
            unknown: () => false,
            _other: () => false
        });
    }

    /**
     * Check if IR uses datetime types (DateTime or NaiveDate)
     */
    public usesDateTime(): boolean {
        return this.irUsesType("DATE_TIME") || this.irUsesType("DATE");
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
     * Check if IR uses base64 types
     */
    public usesBase64(): boolean {
        return this.irUsesType("BASE_64");
    }

    /**
     * Check if IR uses floating point types (float or double)
     */
    public usesFloatingPoint(): boolean {
        return this.irUsesType("FLOAT") || this.irUsesType("DOUBLE");
    }

    /**
     * Check if IR uses floating point types (float or double) in sets,
     * which requires ordered-float for Hash/Ord implementations.
     */
    public usesOrderedFloat(): boolean {
        return this.cachedFeature("usesOrderedFloat", () => {
            for (const typeDecl of Object.values(this.ir.types)) {
                if (this.typeShapeUsesOrderedFloat(typeDecl.shape)) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * Check if a type shape uses floating point types inside sets
     * (which requires OrderedFloat for Hash/Ord)
     */
    private typeShapeUsesOrderedFloat(shape: FernIr.Type): boolean {
        return shape._visit({
            alias: (alias: FernIr.AliasTypeDeclaration) =>
                this.typeReferenceUsesOrderedFloat(alias.aliasOf),
            enum: () => false,
            object: (obj: FernIr.ObjectTypeDeclaration) => {
                for (const property of obj.properties) {
                    if (this.typeReferenceUsesOrderedFloat(property.valueType)) {
                        return true;
                    }
                }
                return false;
            },
            union: (union: FernIr.UnionTypeDeclaration) => {
                for (const variant of union.types) {
                    const uses = variant.shape._visit({
                        singleProperty: (property: FernIr.SingleUnionTypeProperty) =>
                            this.typeReferenceUsesOrderedFloat(property.type),
                        samePropertiesAsObject: () => false,
                        noProperties: () => false,
                        _other: () => false
                    });
                    if (uses) {
                        return true;
                    }
                }
                return false;
            },
            undiscriminatedUnion: (union: FernIr.UndiscriminatedUnionTypeDeclaration) => {
                for (const member of union.members) {
                    if (this.typeReferenceUsesOrderedFloat(member.type)) {
                        return true;
                    }
                }
                return false;
            },
            _other: () => false
        });
    }

    /**
     * Check if a type reference uses a floating-point type inside a set container
     */
    private typeReferenceUsesOrderedFloat(typeRef: FernIr.TypeReference): boolean {
        return typeRef._visit({
            primitive: () => false,
            container: (container: FernIr.ContainerType) => {
                return container._visit({
                    list: () => false,
                    set: (setType: FernIr.TypeReference) => {
                        // Check if the set element type is a float/double
                        return setType._visit({
                            primitive: (primitive: FernIr.PrimitiveType) => {
                                return primitive.v1 === "FLOAT" || primitive.v1 === "DOUBLE";
                            },
                            container: () => false,
                            named: () => false,
                            unknown: () => false,
                            _other: () => false
                        });
                    },
                    optional: (optional: FernIr.TypeReference) =>
                        this.typeReferenceUsesOrderedFloat(optional),
                    nullable: (nullable: FernIr.TypeReference) =>
                        this.typeReferenceUsesOrderedFloat(nullable),
                    map: (map: FernIr.MapType) =>
                        this.typeReferenceUsesOrderedFloat(map.keyType) ||
                        this.typeReferenceUsesOrderedFloat(map.valueType),
                    literal: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    /**
     * Get the datetime type to use for datetime primitives.
     * Returns "offset" for DateTime<FixedOffset> (default) - preserves original timezone,
     * or "utc" for DateTime<Utc> - converts everything to UTC.
     * Both options use flexible parsing that accepts any format and assumes UTC when no timezone.
     */
    public getDateTimeType(): "offset" | "utc" {
        return this.customConfig.dateTimeType ?? "offset";
    }

    /**
     * Check if IR has any file upload endpoints
     */
    public hasFileUploadEndpoints(): boolean {
        return this.cachedFeature("hasFileUploadEndpoints", () =>
            Object.values(this.ir.services).some((service) =>
                service.endpoints.some((endpoint) => endpoint.requestBody?.type === "fileUpload")
            )
        );
    }

    /**
     * Check if IR has any bytes (octet-stream) request body endpoints
     */
    public hasBytesEndpoints(): boolean {
        return this.cachedFeature("hasBytesEndpoints", () =>
            Object.values(this.ir.services).some((service) =>
                service.endpoints.some((endpoint) => endpoint.requestBody?.type === "bytes")
            )
        );
    }

    public hasWebSocketChannels(): boolean {
        return this.cachedFeature("hasWebSocketChannels", () => {
            const websocketsEnabled = this.customConfig.enableWebsockets || this.customConfig.generateWebSocketClients === true;
            return (
                websocketsEnabled &&
                this.ir.websocketChannels != null &&
                Object.keys(this.ir.websocketChannels).length > 0
            );
        });
    }

    public hasStreamingEndpoints(): boolean {
        return this.cachedFeature("hasStreamingEndpoints", () =>
            Object.values(this.ir.services).some((service) =>
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
            )
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
    private registerAllFilenames(ir: FernIr.IntermediateRepresentation): void {
        this.logger.debug("=== Pre-registering all filenames ===");

        // Priority 1: All IR types (covers Enum, Alias, Struct, Union, UndiscriminatedUnion)
        let schemaTypeCount = 0;
        for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
            // Register filename
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
            const typeName = this.case.snakeSafe(typeDeclaration.name.name);
            const fullPath = [...pathParts, typeName];
            const baseFilename = convertToSnakeCase(fullPath.join("_"));

            const registeredFilename = this.project.filenameRegistry.registerSchemaTypeFilename(typeId, baseFilename);

            // Register type name without path prefix
            const baseTypeName = this.case.pascalSafe(typeDeclaration.name.name);

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
                    const requestName = this.case.pascalUnsafe(endpoint.requestBody.name);
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
                    const requestName = `${this.case.pascalSafe(endpoint.name)}Request`;
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
                    const requestName = `${this.case.pascalSafe(endpoint.name)}Request`;
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

        // Priority 3.6: Bytes request body with query parameters
        let bytesRequestCount = 0;
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                // Only bytes endpoints with query parameters
                if (endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0) {
                    const requestName = `${this.case.pascalSafe(endpoint.name)}Request`;
                    const baseFilename = convertPascalToSnakeCase(requestName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerBytesRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerBytesRequestTypeName(
                        endpoint.id,
                        requestName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== requestName) {
                        this.logger.debug(
                            `Bytes request collision resolved: ` +
                                `${requestName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    bytesRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${bytesRequestCount} bytes request filenames and type names`);

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
            const baseClientName = `${this.case.pascalSafe(subpackage.name)}Client`;
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
    public getExtraDependencies(): Record<string, string | RustDependencySpec> {
        return this.customConfig.extraDependencies ?? {};
    }

    /**
     * Get extra dev dependencies with empty object fallback
     */
    public getExtraDevDependencies(): Record<string, string | RustDependencySpec> {
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
        return this.customConfig.clientClassName ?? `${this.case.pascalSafe(this.ir.apiName)}Client`;
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
            if (this.case.snakeUnsafe(typeDeclaration.name.name) === typeNameSnake) {
                // Use fernFilepath + type name for unique module names to prevent collisions
                // E.g., "folder-a/Response" becomes "folder_a_response"
                // E.g., "foo/ImportingType" becomes "foo_importing_type"
                const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
                const typeName = this.case.snakeSafe(typeDeclaration.name.name);
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
    public getModulePathForDeclaredType(declaredTypeName: FernIr.DeclaredTypeName): string {
        // Extract the type name using case converter
        const typeName = this.case.snakeUnsafe(declaredTypeName.name);

        // Try to find the exact type declaration in IR that matches both name and fernFilepath
        const typeDeclaration = Object.values(this.ir.types).find((type) => {
            // Match by name
            const nameMatches =
                this.case.snakeUnsafe(type.name.name) === typeName ||
                this.case.pascalSafe(type.name.name) === typeName ||
                getOriginalName(type.name.name) === typeName;

            // Match by fernFilepath
            const pathMatches =
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        this.case.pascalSafe(part) === this.case.pascalSafe(declaredTypeName.fernFilepath.allParts[idx]!)
                );

            return nameMatches && pathMatches;
        });

        if (typeDeclaration) {
            // Use fernFilepath + type name for unique module names
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
            const typeNameSnake = this.case.snakeSafe(typeDeclaration.name.name);
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
    public getUniqueFilenameForType(typeDeclaration: FernIr.TypeDeclaration): string {
        // Find typeId in IR by matching the typeDeclaration reference
        const typeId = Object.entries(this.ir.types).find(([_, type]) => type === typeDeclaration)?.[0];

        if (!typeId) {
            throw new Error(
                `Type not found in IR: ${this.case.pascalSafe(typeDeclaration.name.name)}. ` +
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
    public getUniqueTypeNameForDeclaration(typeDeclaration: FernIr.TypeDeclaration): string {
        // Find typeId in IR by matching the typeDeclaration reference
        const typeId = Object.entries(this.ir.types).find(([_, type]) => type === typeDeclaration)?.[0];

        if (!typeId) {
            throw new Error(
                `Type not found in IR: ${this.case.pascalSafe(typeDeclaration.name.name)}. ` +
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
    public getUniqueTypeNameForReference(declaredTypeName: FernIr.DeclaredTypeName): string {
        const baseTypeName = this.case.pascalSafe(declaredTypeName.name);

        // Try to find the type declaration in IR
        const typeDeclaration = Object.values(this.ir.types).find(
            (type) =>
                this.case.pascalSafe(type.name.name) === baseTypeName &&
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        this.case.pascalSafe(part) === this.case.pascalSafe(declaredTypeName.fernFilepath.allParts[idx]!)
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
     * This looks up the type in IR and endpoint and returns its unique name.
     *
     * @param endpoint
     * @param serviceId
     * @returns The unique type name, or the base name if not found in IR
     */

    public getQueryRequestTypeName(endpoint: FernIr.HttpEndpoint, serviceId: string): string {
        // Generate query-specific request type name with service context to prevent collisions
        const methodName = this.case.pascalSafe(endpoint.name);
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
                    this.case.pascalSafe(otherEndpoint.name) === methodName &&
                    otherEndpoint.queryParameters.length > 0 &&
                    !otherEndpoint.requestBody
            );
        });

        if (hasCollision) {
            // Include full subpackage path to make it unique (e.g., auth/analytics → AuthAnalytics)
            const pathParts = subpackage.fernFilepath.allParts.map((part) => this.case.pascalSafe(part));
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
     * Get filename for bytes request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     */
    public getFilenameForBytesRequestBody(endpointId: string): string {
        return this.project.filenameRegistry.getBytesRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for bytes request body from filename.
     */
    public getModuleNameForBytesRequestBody(endpointId: string): string {
        const filename = this.getFilenameForBytesRequestBody(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get unique type name for bytes request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     */
    public getBytesRequestTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getBytesRequestTypeNameOrThrow(endpointId);
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
        fernFilepath: FernIr.FernFilepath;
    }): string {
        // Use the full fernFilepath to create unique filenames to prevent collisions
        // E.g., "nested-no-auth/api" becomes "nested_no_auth_api.rs"
        const pathParts = subpackage.fernFilepath.allParts.map((part) => this.case.snakeSafe(part));
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
        fernFilepath: FernIr.FernFilepath;
    }): string {
        // Find the subpackage ID by matching fernFilepath
        const subpackageId = Object.entries(this.ir.subpackages).find(([, sp]) => {
            return (
                sp.fernFilepath.allParts.length === subpackage.fernFilepath.allParts.length &&
                sp.fernFilepath.allParts.every(
                    (part, index) =>
                        this.case.pascalSafe(part) === this.case.pascalSafe(subpackage.fernFilepath.allParts[index]!)
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
        const pathParts = subpackage.fernFilepath.allParts.map((part) => this.case.pascalSafe(part));
        return pathParts.join("") + "Client";
    }

    /**
     * Get the API key header name from the IR auth schemes.
     * Returns the wireValue of the first header auth scheme, or "api_key" as default.
     */
    public getApiKeyHeaderName(): string {
        return this.getFirstHeaderAuthValue((header) => getWireValue(header.name)) ?? "api_key";
    }

    /**
     * Get the API key prefix from the IR auth schemes (e.g., "Token", "Bearer").
     * Returns undefined if no prefix is configured.
     */
    public getApiKeyPrefix(): string | undefined {
        return this.getFirstHeaderAuthValue((header) => header.prefix);
    }

    /**
     * Get the placeholder value for the header auth scheme.
     * Falls back to bearer token placeholder, then undefined.
     */
    public getHeaderAuthPlaceholder(): string | undefined {
        return this.getFirstHeaderAuthValue((header) => header.headerPlaceholder) ?? this.getBearerTokenPlaceholder();
    }

    /**
     * Get the placeholder value for the bearer token auth scheme.
     */
    public getBearerTokenPlaceholder(): string | undefined {
        return this.getFirstAuthSchemeValue((scheme) =>
            FernIr.AuthScheme._visit(scheme, {
                bearer: (bearer) => bearer.tokenPlaceholder,
                header: () => undefined,
                basic: () => undefined,
                oauth: () => undefined,
                inferred: () => undefined,
                _other: () => undefined
            })
        );
    }

    /**
     * Get the placeholder value for the basic auth username.
     */
    public getBasicAuthUsernamePlaceholder(): string | undefined {
        return this.getFirstAuthSchemeValue((scheme) =>
            FernIr.AuthScheme._visit(scheme, {
                basic: (basic) => basic.usernamePlaceholder,
                bearer: () => undefined,
                header: () => undefined,
                oauth: () => undefined,
                inferred: () => undefined,
                _other: () => undefined
            })
        );
    }

    /**
     * Get the placeholder value for the basic auth password.
     */
    public getBasicAuthPasswordPlaceholder(): string | undefined {
        return this.getFirstAuthSchemeValue((scheme) =>
            FernIr.AuthScheme._visit(scheme, {
                basic: (basic) => basic.passwordPlaceholder,
                bearer: () => undefined,
                header: () => undefined,
                oauth: () => undefined,
                inferred: () => undefined,
                _other: () => undefined
            })
        );
    }

    /**
     * Get the most appropriate auth placeholder from configured auth schemes.
     * Checks header, bearer, and basic auth schemes in order.
     */
    public getAuthPlaceholder(): string | undefined {
        return (
            this.getFirstHeaderAuthValue((header) => header.headerPlaceholder) ??
            this.getBearerTokenPlaceholder() ??
            this.getBasicAuthUsernamePlaceholder()
        );
    }

    private getFirstHeaderAuthValue<T>(selector: (header: FernIr.HeaderAuthScheme) => T | undefined): T | undefined {
        if (this.ir.auth?.schemes) {
            for (const scheme of this.ir.auth.schemes) {
                const result = FernIr.AuthScheme._visit(scheme, {
                    header: (header) => selector(header),
                    bearer: () => undefined,
                    basic: () => undefined,
                    oauth: () => undefined,
                    inferred: () => undefined,
                    _other: () => undefined
                });
                if (result !== undefined) {
                    return result;
                }
            }
        }
        return undefined;
    }

    private getFirstAuthSchemeValue<T>(selector: (scheme: FernIr.AuthScheme) => T | undefined): T | undefined {
        if (this.ir.auth?.schemes) {
            for (const scheme of this.ir.auth.schemes) {
                const result = selector(scheme);
                if (result !== undefined) {
                    return result;
                }
            }
        }
        return undefined;
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
        const apiName = this.case.snakeUnsafe(this.ir.apiName);
        return generateDefaultCrateName(orgName, apiName);
    }
}
