import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { FernFilepath, IntermediateRepresentation, TypeId } from "@fern-fern/ir-sdk/api";
import { join } from "path";
import * as ast from "../ast";
import { CSharp } from "../csharp";
import { type BaseCsharpCustomConfigSchema } from "../custom-config";
import { lazy } from "../utils/lazy";
import { camelCase, upperFirst } from "../utils/text";
import { MinimalGeneratorConfig, Support, TAbsoluteFilePath, TRelativeFilePath } from "./common";
import { Extern } from "./extern";
import { ModelNavigator } from "./model-navigator";
import { NameRegistry } from "./name-registry";

/**
 * Central configuration and code generation context for C# SDK generation.
 *
 * This class serves as the single source of truth for all code generation decisions,
 * consolidating names, namespaces, types, and settings into a unified graph. It eliminates
 * duplication between dynamic and regular generators by providing consistent access to
 * generation metadata.
 *
 * ## Key Responsibilities:
 * - Manages namespace organization for generated C# code
 * - Provides standardized naming conventions for classes, types, and identifiers
 * - Lazily initializes and caches type references and configuration values
 * - Serves as a navigation hub for the IR (Intermediate Representation) model
 * - Coordinates between code generation utilities (CSharp, NameRegistry, etc.)
 *
 * ## Lazy Initialization:
 * All returned values use lazy initialization for performance:
 * - Parameterless functions: Evaluated once and cached on first access
 * - Parameterized functions: Remain as functions, evaluated on each call
 *
 * ## Usage Pattern:
 * ```typescript
 * const generation = new Generation(ir, apiName, config, generatorConfig);
 * const namespace = generation.namespaces.root; // Lazy-evaluated and cached
 * const pager = generation.types.Pager(itemType); // Function, evaluated each call
 * ```
 *
 * This object is safe to pass throughout the code generation pipeline and should be
 * the primary source for all naming and type reference decisions.
 */
export class Generation {
    /**
     * Creates a new Generation context for C# code generation.
     *
     * @param intermediateRepresentation - The Fern IR containing the API definition,
     *                                     supports both static and dynamic IR formats
     * @param apiName - The name of the API being generated (used for namespace/class naming)
     * @param customConfig - User-provided custom configuration overrides for the generator
     * @param generatorConfig - Core generator configuration including organization and workspace info
     */
    constructor(
        private readonly intermediateRepresentation:
            | IntermediateRepresentation
            | FernIr.dynamic.DynamicIntermediateRepresentation,
        private readonly apiName: string,
        private readonly customConfig: BaseCsharpCustomConfigSchema,
        private readonly generatorConfig: MinimalGeneratorConfig,
        private readonly support: Support = {
            makeRelativeFilePath: (path) => path as TRelativeFilePath,
            makeAbsoluteFilePath: (path: string) => path as TAbsoluteFilePath,
            getNamespaceForTypeId: (typeId: TypeId) => "",
            getDirectoryForTypeId: (typeId: TypeId) => "",
            getCoreAsIsFiles: () => [],
            getCoreTestAsIsFiles: () => [],
            getPublicCoreAsIsFiles: () => [],
            getAsyncCoreAsIsFiles: () => [],
            getChildNamespaceSegments: (fernFilepath: FernFilepath) => []
        }
    ) {
        // Initialize the model navigator to traverse and query the IR
        this.model = new ModelNavigator(intermediateRepresentation, this);
    }

    /**
     * Utility for generating C# AST nodes and type references.
     * Provides methods for creating class references, type declarations, and other C# constructs.
     */
    public readonly csharp = new CSharp(this);

    /**
     * Registry for tracking and managing generated names to prevent collisions.
     * Ensures unique naming across namespaces, classes, properties, and other identifiers.
     */
    public readonly registry = new NameRegistry(this);

    /**
     * Navigator for traversing the IR model and querying type information.
     * Provides access to types, endpoints, errors, and other IR elements.
     */
    public readonly model: ModelNavigator;

    /**
     * Manager for external dependencies and imports.
     * Tracks which external packages and types are needed by the generated code.
     */
    public readonly extern = new Extern(this);

    /**
     * Lazily-initialized configuration settings for C# code generation.
     *
     * These settings control various aspects of the generated code including:
     * - Namespace configuration
     * - Feature flags (websockets, forward-compatible enums, etc.)
     * - Type generation options (discriminated unions, additional properties)
     * - Naming customization (client class names, exception classes)
     * - Testing options (mock server tests)
     * - Access modifiers and visibility settings
     *
     * All settings are derived from the custom configuration with sensible defaults.
     * Each property is lazily evaluated and cached on first access.
     */
    public readonly settings = lazy({
        /** The root namespace for all generated C# code (e.g., "Acme.MyApi"). Defaults to Organization_ApiName in camelCase. */
        namespace: () =>
            this.customConfig.namespace ??
            upperFirst(camelCase(`${this.generatorConfig.organization}_${this.apiName}`)),
        /** List of types that should use ReadOnlyMemory<byte> instead of byte[] for binary data. Default: []. */
        readOnlyMemoryTypes: () => this.customConfig["read-only-memory-types"] ?? [],
        /** When true, simplifies object dictionaries in generated code for better type safety. Default: false. */
        simplifyObjectDictionaries: () => this.customConfig["simplify-object-dictionaries"] ?? false,
        /** When true, uses fully-qualified namespaces in generated code to avoid naming conflicts. Default: false. */
        useFullyQualifiedNamespaces: () => this.customConfig["experimental-fully-qualified-namespaces"] ?? false,
        /** When true, runs dotnet format on generated code for consistent formatting. Default: false. */
        useDotnetFormat: () => this.customConfig["experimental-dotnet-format"] ?? false,
        /** When true, enables WebSocket support in the generated SDK. Default: false. */
        enableWebsockets: () => this.customConfig["experimental-enable-websockets"] ?? false,
        /** When true, generates readonly constants instead of static properties. Default: false. */
        enableReadonlyConstants: () => this.customConfig["experimental-readonly-constants"] ?? false,
        /** Temporary mapping of websocket environment configurations. Default: {}. */
        temporaryWebsocketEnvironments: () => this.customConfig["temporary-websocket-environments"] ?? {},
        /** Custom name for the base API exception class. Default: "" (auto-generated). */
        baseApiExceptionClassName: () => this.customConfig["base-api-exception-class-name"] ?? "",
        /** Custom name for the base exception class. Default: "" (auto-generated). */
        baseExceptionClassName: () => this.customConfig["base-exception-class-name"] ?? "",
        /** When true, generates discriminated unions with type discriminators. Default: true. */
        shouldGeneratedDiscriminatedUnions: () => this.customConfig["use-discriminated-unions"] ?? true,
        /** Custom name for the exported public client class. Default: "" (uses clientClassName or computed name). */
        exportedClientClassName: () => this.customConfig["exported-client-class-name"] ?? "",
        /** Custom name for the internal client class. Default: "" (auto-generated from organization/workspace). */
        clientClassName: () => this.customConfig["client-class-name"] ?? "",
        /** When true, places core classes in the root namespace instead of {root}.Core. Default: true. */
        rootNamespaceForCoreClasses: () => this.customConfig["root-namespace-for-core-classes"] ?? true,
        /** Custom NuGet package identifier. Default: "" (uses root namespace). */
        packageId: () => this.customConfig["package-id"] ?? "",
        /** When true, generates enums that can handle unknown/future values gracefully. Default: true. */
        isForwardCompatibleEnumsEnabled: () =>
            this.customConfig["enable-forward-compatible-enums"] ??
            this.customConfig["experimental-enable-forward-compatible-enums"] ??
            true,
        /** Mapping of websocket environment configurations. Default: {}. */
        websocketEnvironments: () => this.customConfig["temporary-websocket-environments"] ?? {},
        /** When true, generates additional properties support for objects to handle extra fields. Default: true. */
        generateNewAdditionalProperties: () =>
            this.customConfig["additional-properties"] ??
            this.customConfig["experimental-additional-properties"] ??
            true,
        /** Custom name for the pagination class. Default: "" (auto-generated). */
        customPagerName: () => this.customConfig["custom-pager-name"] ?? "",
        /** Custom name for the environment configuration class. Default: "" (auto-generated). */
        environmentClassName: () => this.customConfig["environment-class-name"] ?? "",
        /** When true, generates dedicated error type classes for API errors. Default: true. */
        generateErrorTypes: () => this.customConfig["generate-error-types"] ?? true,
        /** When true, inlines path parameters in method signatures instead of using a request object. Default: true. */
        shouldInlinePathParameters: () => this.customConfig["inline-path-parameters"] ?? true,
        /** When true, includes exception handler infrastructure for custom error handling. Default: false. */
        includeExceptionHandler: () => this.customConfig["include-exception-handler"] ?? false,
        /** When true, generates mock server tests for the SDK. Default: true. */
        shouldGenerateMockServerTests: () => this.customConfig["generate-mock-server-tests"] ?? true,
        /** Access modifier for the root client class (Public or Internal). Default: Public. */
        rootClientAccess: () =>
            this.customConfig["root-client-class-access"] == "internal" ? ast.Access.Internal : ast.Access.Public,
        /** Additional NuGet package dependencies to include in the generated project. Default: {}. */
        extraDependencies: () => this.customConfig["extra-dependencies"] ?? {},
        /** When true, uses PascalCase for environment names (e.g., "Production" instead of "production"). Default: true. */
        pascalCaseEnvironments: () => this.customConfig["pascal-case-environments"] ?? true,
        /** When true, requires explicit namespace declarations instead of using file-scoped namespaces. Default: false. */
        explicitNamespaces: () => this.customConfig["explicit-namespaces"] === true
    });

    public readonly constants = {
        folders: lazy({
            mockServerTests: () => this.support.makeRelativeFilePath("Unit/MockServer"),
            types: () => "Types",
            exceptions: () => "Exceptions",
            src: () => "src",
            protobuf: () => "proto",
            serializationTests: () => this.support.makeRelativeFilePath("Unit/Serialization"),
            project: () =>
                this.support.makeRelativeFilePath(
                    join(
                        this.constants.folders.sourceFiles,
                        this.support.makeRelativeFilePath(this.names.files.project)
                    )
                ),
            sourceFiles: () => this.support.makeRelativeFilePath(this.constants.folders.src),
            coreFiles: () =>
                this.support.makeRelativeFilePath(
                    join(
                        this.constants.folders.project,
                        this.support.makeRelativeFilePath(this.constants.defaults.core)
                    )
                ),
            publicCoreFiles: () =>
                this.support.makeRelativeFilePath(
                    join(
                        this.constants.folders.project,
                        this.support.makeRelativeFilePath(this.constants.defaults.core),
                        this.support.makeRelativeFilePath(this.constants.defaults.publicCore)
                    )
                ),
            testFiles: () =>
                this.support.makeRelativeFilePath(
                    join(
                        this.constants.folders.sourceFiles,
                        this.support.makeRelativeFilePath(this.names.files.testProject)
                    )
                )
        }),

        formatting: lazy({
            indent: () => "    "
        }),

        defaults: lazy({
            core: () => "Core",
            publicCore: () => "Public",
            version: () => "0.0.0"
        })
    };

    /**
     * Lazily-initialized namespace paths for organizing generated C# code.
     *
     * This object defines the namespace hierarchy used throughout the generated SDK:
     * - `root`: The top-level namespace for all generated code
     * - `core`: Internal implementation details and utilities (e.g., {root}.Core)
     * - `test`: Testing utilities and fixtures
     * - `testUtils`: Helper methods for tests
     * - `mockServerTest`: Mock server testing infrastructure
     * - `publicCore`: Public core utilities exposed to SDK users
     * - `asyncCore`: Asynchronous API utilities (websockets, streaming)
     * - `publicCoreTest`: Tests for public core functionality
     * - `asIsTestUtils`: Test utilities that preserve original casing
     * - `publicCoreClasses`: Location for core classes based on rootNamespaceForCoreClasses setting
     *
     * Namespaces are canonicalized through the NameRegistry to avoid conflicts with generated types.
     * All namespace paths are lazy-evaluated and cached on first access.
     */
    public readonly namespaces = lazy({
        /** The top-level root namespace for all generated SDK code (e.g., "Acme.MyApi"). */
        root: (): string => this.settings.namespace,
        /** Internal Core namespace for SDK implementation details and utilities ({root}.Core). */
        core: (): string => `${this.namespaces.root}.Core`,
        /** Test namespace for all test-related code, canonicalized to avoid conflicts ({root}.Test). */
        test: (): string => this.registry.canonicalizeNamespace(`${this.namespaces.root}.Test`),
        /** Test utilities namespace for helper methods and fixtures ({root}.Test.Utils). */
        testUtils: (): string => `${this.namespaces.test}.Utils`,
        /** Mock server test namespace for mock server testing infrastructure ({root}.Test.Unit.MockServer). */
        mockServerTest: (): string => `${this.namespaces.test}.Unit.MockServer`,
        /** Public Core namespace, same as root for publicly exposed core utilities. */
        publicCore: (): string => this.namespaces.root,
        /** Async Core namespace for asynchronous APIs like websockets and streaming ({root}.Core.Async). */
        asyncCore: (): string => `${this.namespaces.core}.Async`,
        /** Public Core test namespace for testing public core functionality ({root}.Test.PublicCore). */
        publicCoreTest: (): string => `${this.namespaces.root}.Test.PublicCore`,
        /** Test utilities namespace that preserves original casing ({root}.Test.Utils). */
        asIsTestUtils: (): string => `${this.namespaces.root}.Test.Utils`,
        /** Namespace for public core classes; either root or core based on rootNamespaceForCoreClasses setting. */
        publicCoreClasses: (): string =>
            this.settings.rootNamespaceForCoreClasses ? this.namespaces.root : this.namespaces.core,
        /** Implicit namespaces are namespaces that are assumed to be automatically imported into the generated code. */
        implicit: (): Set<string> =>
            new Set([
                "System",
                "System.Collections.Generic",
                "System.IO",
                "System.Linq",
                "System.Threading",
                "System.Threading.Tasks",
                "System.Net.Http"
            ])
    });

    /**
     * Lazily-initialized names for key generated classes and identifiers.
  
     *
     * Names are computed using naming conventions (camelCase, upperFirst) and can be
     * overridden via custom configuration. All names are lazy-evaluated and cached.
     */
    public readonly names = {
        classes: lazy({
            /** The name of the base API exception class (e.g., "AcmeWidgetsApiException"). */
            baseApiException: (): string =>
                this.settings.baseApiExceptionClassName || `${this.names.project.clientPrefix}ApiException`,
            /** The name of the base exception class for all SDK exceptions (e.g., "AcmeWidgetsException"). */
            baseException: (): string =>
                this.settings.baseExceptionClassName || `${this.names.project.clientPrefix}Exception`,
            /** The name of the main internal SDK client class (e.g., "AcmeWidgetsClient"). */
            rootClient: (): string => this.settings.clientClassName || `${this.names.project.clientPrefix}Client`,
            /** The name of the client class used in documentation snippets and examples. */
            rootClientForSnippets: (): string => this.settings.exportedClientClassName || this.names.classes.rootClient,
            /** The name for custom pagination classes (e.g., "AcmeWidgetsPager"), alphanumeric only. */
            customPager: (): string =>
                this.settings.customPagerName || `${this.names.project.packageId.replace(/[^a-zA-Z0-9]/g, "")}Pager`,
            /** The name for the environment configuration class (e.g., "AcmeWidgetsEnvironment"). */
            environment: (): string =>
                this.settings.environmentClassName || `${this.names.project.clientPrefix}Environment`
        }),
        project: lazy({
            /** The computed client name derived from organization and workspace in camelCase (e.g., "AcmeWidgets"). */
            client: () =>
                upperFirst(camelCase(`${this.generatorConfig.organization}_${this.generatorConfig.workspaceName}`)),
            /** The prefix used for client-related classes, customizable via config or defaults to clientName. */
            clientPrefix: () =>
                this.settings.exportedClientClassName || this.settings.clientClassName || this.names.project.client,
            /** The NuGet package identifier for the generated SDK, defaults to root namespace if not specified. */
            packageId: () => this.settings.packageId || this.namespaces.root
        }),
        files: lazy({
            /* the name of the project */
            project: () => this.namespaces.root,
            /* the name of the test project */
            testProject: () => `${this.namespaces.root}.Test`
        }),
        methods: lazy({
            mockOauth: () => "MockOAuthEndpoint",
            getAccessTokenAsync: () => "GetAccessTokenAsync"
        }),
        variables: lazy({
            client: () => "client",
            response: () => "response",
            httpRequest: () => "httpRequest",
            sendRequest: () => "sendRequest",
            responseBody: () => "responseBody",
            query: () => "_query",
            headers: () => "_headers"
        }),
        parameters: lazy({
            cancellationToken: () => "cancellationToken",
            requestOptions: () => "options",
            idempotentOptions: () => "options"
        })
    };

    /**
     * Lazily-initialized C# type references for core SDK classes and utilities.
     *
     * This object provides type references for all core infrastructure classes used in the
     * generated SDK. These references are used throughout code generation to ensure consistent
     * type usage and proper namespace imports.
     *
     * ## Categories of Types:
     *
     * ### Request/Response Handling:
     * - `FormRequest`, `JsonRequest`: Request builders for different content types
     * - `ClientOptions`, `RequestOptions`: Configuration objects for API calls
     * - `RawClient`, `RawGrpcClient`: Low-level HTTP/gRPC clients
     * - `Headers`: HTTP header management
     *
     * ### Client Infrastructure:
     * - `RootClient`, `RootClientForSnippets`: Main SDK client classes
     * - `TestClient`: Testing infrastructure
     * - `AsyncApi`: Asynchronous API support (websockets, streaming)
     *
     * ### Error Handling:
     * - `BaseException`, `BaseApiException`: Exception hierarchy
     * - `ExceptionInterceptor`, `ExceptionHandler`: Exception processing
     *
     * ### Serialization:
     * - `EnumSerializer`, `StringEnumSerializer`: Enum serialization
     * - `DateTimeSerializer`: DateTime handling
     * - `JsonUtils`: JSON utilities
     * - `OneOfSerializer`: Union type serialization
     * - `CollectionItemSerializer`: Collection element serialization
     * - `ProtoConverter`, `ProtoAnyMapper`: Protocol buffer conversion
     *
     * ### Pagination:
     * - `Pager`: Base pagination interface
     * - `CustomPagerClass`: Custom pagination implementation
     * - `OffsetPager`: Offset-based pagination
     * - `CursorPager`: Cursor-based pagination
     * - `CustomPagerFactory`, `CustomPagerContext`: Pagination utilities
     *
     * ### Additional Properties:
     * - `AdditionalProperties`: Mutable additional properties
     * - `ReadOnlyAdditionalProperties`: Immutable additional properties
     *
     * ### Other Utilities:
     * - `Version`: SDK version information
     * - `ValueConvert`: Value conversion utilities
     * - `FileParameter`: File upload support
     * - `Constants`: SDK constants
     * - `Environments`: Environment configuration
     * - `Extensions`: Extension methods
     * - `OAuthTokenProvider`: OAuth authentication
     * - `QueryBuilder`: Query string building
     * - `IStringEnum`, `StringEnum`: String-based enum support
     *
     * ## Usage Patterns:
     *
     * ### Non-Generic Types (cached):
     * ```typescript
     * const clientType = generation.types.RootClient; // Returns cached ClassReference
     * ```
     *
     * ### Generic Types (evaluated per call):
     * ```typescript
     * const pager = generation.types.Pager(itemType); // Returns new ClassReference each time
     * const asyncApi = generation.types.AsyncApi(messageType);
     * ```
     *
     * All type references include proper namespace information and are registered with
     * the NameRegistry to ensure correct imports in generated code.
     */
    public readonly types = lazy({
        /** Core infrastructure type for building multipart/form-data requests */
        FormRequest: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("FormRequest")
            }),
        /** Configuration options for the SDK client (base URL, headers, timeout, etc.) */
        ClientOptions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("ClientOptions"),
                namespace: this.namespaces.publicCoreClasses
            }),
        /** Low-level HTTP client wrapper for making raw API calls */
        RawClient: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("RawClient")
            }),
        /** Per-request configuration options (headers, timeout overrides, etc.) */
        RequestOptions: () =>
            this.csharp.classReference({
                namespace: this.namespaces.publicCoreClasses,
                origin: this.model.staticExplicit("RequestOptions")
            }),
        /** Interface for per-request configuration options */
        RequestOptionsInterface: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("IRequestOptions")
            }),
        /** Core infrastructure type for building JSON requests */
        JsonRequest: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("JsonRequest")
            }),
        /** SDK version metadata class */
        Version: () =>
            this.csharp.classReference({
                namespace: this.namespaces.publicCore,
                origin: this.model.staticExplicit("Version")
            }),
        /** Utility for converting values between different representations */
        ValueConvert: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("ValueConvert")
            }),
        /** Wrapper for file upload parameters in multipart requests */
        FileParameter: () =>
            this.csharp.classReference({
                namespace: this.namespaces.publicCore,
                origin: this.model.staticExplicit("FileParameter")
            }),
        /** HTTP header management utilities */
        Headers: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("Headers")
            }),
        /** HTTP header value management utilities */
        HeaderValue: () =>
            this.csharp.classReference({
                namespace: this.namespaces.core,
                origin: this.model.staticExplicit("HeaderValue")
            }),
        /** The main SDK client class (for code generation) */
        RootClient: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.rootClient),
                namespace: this.namespaces.root
            }),
        /** The main SDK client class (for documentation snippets) */
        RootClientForSnippets: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.rootClientForSnippets),
                namespace: this.namespaces.root
            }),
        /** Base exception class for API errors (HTTP 4xx/5xx responses) */
        BaseApiException: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.baseApiException),
                namespace: this.namespaces.publicCoreClasses
            }),
        /** Base exception class for all SDK exceptions */
        BaseException: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.baseException),
                namespace: this.namespaces.publicCoreClasses
            }),
        /** Interface for intercepting and processing exceptions */
        ExceptionInterceptor: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("IExceptionInterceptor"),
                namespace: this.namespaces.core
            }),
        /** Utility for handling and transforming exceptions */
        ExceptionHandler: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("ExceptionHandler"),
                namespace: this.namespaces.core
            }),
        /** Utility for mapping Protocol Buffer Any types */
        ProtoAnyMapper: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("ProtoAnyMapper"),
                namespace: this.namespaces.core
            }),
        /** SDK-wide constants */
        Constants: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("Constants"),
                namespace: this.namespaces.core
            }),
        /** JSON serializer for enum types */
        EnumSerializer: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("EnumSerializer"),
                namespace: this.namespaces.core
            }),
        /** JSON serializer for DateTime types */
        DateTimeSerializer: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("DateTimeSerializer"),
                namespace: this.namespaces.core
            }),
        /** Utility methods for JSON serialization/deserialization */
        JsonUtils: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("JsonUtils"),
                namespace: this.namespaces.core
            }),
        /** Factory for creating custom pagination instances */
        CustomPagerFactory: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(`${this.names.classes.customPager}Factory`),
                namespace: this.namespaces.core
            }),
        /** Context object for custom pagination state */
        CustomPagerContext: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(`${this.names.classes.customPager}Context`),
                namespace: this.namespaces.core
            }),
        /** Environment configuration class (base URLs for different environments) */
        Environments: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.environment),
                namespace: this.namespaces.publicCoreClasses
            }),
        /** Test client for testing infrastructure */
        TestClient: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("TestClient"),
                namespace: this.namespaces.test
            }),
        /** Base class for mock server tests */
        BaseMockServerTest: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("BaseMockServerTest"),
                namespace: this.namespaces.mockServerTest
            }),
        /** Request options with idempotency key support */
        IdempotentRequestOptions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("IdempotentRequestOptions"),
                namespace: this.namespaces.publicCoreClasses
            }),
        /** Interface for idempotent request options */
        IdempotentRequestOptionsInterface: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("IIdempotentRequestOptions"),
                namespace: this.namespaces.core
            }),
        /** Interface for string-based enum types */
        IStringEnum: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("IStringEnum"),
                namespace: this.namespaces.core
            }),
        /** Configuration options for asynchronous APIs (websockets, streaming) */
        AsyncApiOptions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("AsyncApiOptions"),
                namespace: `${this.namespaces.asyncCore}.Models`
            }),
        /** Query string builder utility */
        QueryBuilder: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("Query"),
                namespace: this.namespaces.asyncCore
            }),
        /** OAuth token provider for authentication */
        OAuthTokenProvider: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("OAuthTokenProvider"),
                namespace: this.namespaces.core
            }),
        /** Converter for Protocol Buffer types */
        ProtoConverter: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("ProtoConverter"),
                namespace: this.namespaces.core
            }),
        /** Low-level gRPC client wrapper */
        RawGrpcClient: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("RawGrpcClient"),
                namespace: this.namespaces.core
            }),
        /** Extension methods for common operations */
        Extensions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("Extensions"),
                namespace: this.namespaces.core
            }),
        /** Request options for gRPC calls */
        GrpcRequestOptions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("GrpcRequestOptions"),
                namespace: this.namespaces.root
            }),
        /** Configuration options for gRPC channels */
        GrpcChannelOptions: () =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("GrpcChannelOptions"),
                namespace: "Grpc.Net.Client"
            }),
        /**
         * Generic string-based enum wrapper type.
         * @param genericType - The specific enum type to wrap (optional)
         */
        StringEnum: (genericType?: ast.Type | ast.ClassReference) =>
            this.csharp.classReference({
                origin: this.model.staticExplicit("StringEnum"),
                namespace: this.namespaces.core,
                generics: genericType ? [genericType] : undefined
            }),
        /**
         * Generic asynchronous API wrapper for websockets and streaming.
         * @param genericType - The message type for the async API
         */
        AsyncApi: (genericType: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("AsyncApi"),
                namespace: this.namespaces.asyncCore,
                generics: [genericType]
            });
        },
        /**
         * Generic event wrapper for asynchronous APIs.
         * @param genericType - The event payload type
         */
        AsyncEvent: (genericType: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("Event"),
                namespace: `${this.namespaces.asyncCore}.Events`,
                generics: [genericType]
            });
        },
        /**
         * JSON serializer for string-based enum types.
         * @param enumClassReference - The enum type to serialize
         */
        StringEnumSerializer: (enumClassReference: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("StringEnumSerializer"),
                namespace: this.namespaces.core,
                generics: [enumClassReference]
            });
        },
        /**
         * Custom pagination class for iterating over paged results.
         * @param itemType - The type of items in each page
         */
        CustomPagerClass: (itemType: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit(this.names.classes.customPager),
                namespace: this.namespaces.core,
                generics: [itemType]
            });
        },
        /**
         * Generic pager interface for pagination support.
         * @param itemType - The type of items being paginated
         */
        Pager: (itemType: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("Pager"),
                namespace: this.namespaces.core,
                generics: [itemType]
            });
        },
        /**
         * Offset-based pagination implementation.
         * Supports paginating through results using numeric offsets.
         *
         * @param requestType - The type of the pagination request
         * @param requestOptionsType - The type of request options
         * @param responseType - The type of the pagination response
         * @param offsetType - The type of the offset (usually int or long)
         * @param stepType - The type of the step/page size (usually int)
         * @param itemType - The type of items in the paginated results
         */
        OffsetPager: ({
            requestType,
            requestOptionsType,
            responseType,
            offsetType,
            stepType,
            itemType
        }: {
            requestType: ast.Type | ast.TypeParameter;
            requestOptionsType: ast.Type | ast.TypeParameter;
            responseType: ast.Type | ast.TypeParameter;
            offsetType: ast.Type | ast.TypeParameter;
            stepType: ast.Type | ast.TypeParameter;
            itemType: ast.Type | ast.TypeParameter;
        }): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("OffsetPager"),
                namespace: this.namespaces.core,
                generics: [requestType, requestOptionsType, responseType, offsetType, stepType, itemType]
            });
        },
        /**
         * Cursor-based pagination implementation.
         * Supports paginating through results using opaque cursor tokens.
         *
         * @param requestType - The type of the pagination request
         * @param requestOptionsType - The type of request options
         * @param responseType - The type of the pagination response
         * @param cursorType - The type of the cursor token (usually string)
         * @param itemType - The type of items in the paginated results
         */
        CursorPager: ({
            requestType,
            requestOptionsType,
            responseType,
            cursorType,
            itemType
        }: {
            requestType: ast.Type | ast.TypeParameter;
            requestOptionsType: ast.Type | ast.TypeParameter;
            responseType: ast.Type | ast.TypeParameter;
            cursorType: ast.Type | ast.TypeParameter;
            itemType: ast.Type | ast.TypeParameter;
        }): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("CursorPager"),
                namespace: this.namespaces.core,
                generics: [requestType, requestOptionsType, responseType, cursorType, itemType]
            });
        },
        /**
         * Custom JSON serializer for collection items.
         * Wraps items in a collection with a specific serializer implementation.
         *
         * @param itemType - The type of items in the collection
         * @param serializer - The serializer class to use for each item
         * @returns A ClassReference for CollectionItemSerializer<TItem, TSerializer>
         */
        CollectionItemSerializer: (
            itemType: ast.ClassReference,
            serializer: ast.ClassReference
        ): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("CollectionItemSerializer"),
                namespace: this.namespaces.core,
                generics: [itemType, serializer]
            });
        },
        /**
         * JSON serializer for union/OneOf types.
         * Handles discriminated and undiscriminated union serialization.
         *
         * @param oneof - The union type to serialize
         * @returns A ClassReference for OneOfSerializer<TOneOf>
         */
        OneOfSerializer: (oneof: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("OneOfSerializer"),
                namespace: this.namespaces.core,
                generics: [oneof]
            });
        },
        /**
         * Mutable dictionary for additional/extra properties on objects.
         * Allows setting arbitrary key-value pairs beyond defined properties.
         *
         * @param genericType - The value type for additional properties (defaults to object if not specified)
         * @returns A ClassReference for AdditionalProperties or AdditionalProperties<T>
         */
        AdditionalProperties: (genericType?: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("AdditionalProperties"),
                namespace: this.namespaces.publicCore,
                generics: genericType ? [genericType] : undefined
            });
        },
        /**
         * Immutable read-only dictionary for additional/extra properties on objects.
         * Provides read-only access to arbitrary key-value pairs beyond defined properties.
         *
         * @param genericType - The value type for additional properties (defaults to object if not specified)
         * @returns A ClassReference for ReadOnlyAdditionalProperties or ReadOnlyAdditionalProperties<T>
         */
        ReadOnlyAdditionalProperties: (genericType?: ast.Type | ast.ClassReference): ast.ClassReference => {
            return this.csharp.classReference({
                origin: this.model.staticExplicit("ReadOnlyAdditionalProperties"),
                namespace: this.namespaces.publicCore,
                generics: genericType ? [genericType] : undefined
            });
        }
    });

    /** This is called (once) before any generator actually starts to generate code.
     * It offers a last-chance to validate or modify the generation before certain things are fixed in place.
     * If this returns false, the generation should be aborted.
     */
    public initialize(): boolean {
        return this.initializers.implicitNamespaces;
    }

    /** One-time initializers that are called before any generator actually starts to generate code. */
    public readonly initializers = lazy({
        implicitNamespaces: () => {
            // add all the implict namespaces
            for (const namespace of this.namespaces.implicit) {
                this.registry.addImplicitNamespace(namespace);
            }
            return true;
        }
    });
}
