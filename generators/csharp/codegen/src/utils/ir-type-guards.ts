/**
 * TYPE GUARDS FOR @fern-fern/ir-sdk
 *
 * This file contains runtime type guards for validating objects from the core IR SDK.
 *
 * ============================================================================================
 * INSTRUCTIONS FOR UPDATING THIS FILE WHEN @fern-fern/ir-sdk PACKAGE IS UPDATED:
 * ============================================================================================
 *
 * 1. LOCATE INTERFACE DEFINITIONS:
 *    - All interfaces are in: node_modules/@fern-fern/ir-sdk/api/resources/
 *    - Key directories: commons, types, http, websocket, errors, examples, auth, etc.
 *    - Import types directly from "@fern-fern/ir-sdk/api" (NOT from /api/resources/...)
 *
 * 2. STANDARD INTERFACE TYPEGUARDS:
 *    - For each interface, create a typeguard that checks REQUIRED fields only
 *    - Use this structure:
 *      InterfaceName: (value: unknown): value is InterfaceName =>
 *          isObject(value) &&
 *          "requiredProp1" in value &&
 *          "requiredProp2" in value &&
 *          typeof value.requiredProp1 === "string" &&
 *          Array.isArray(value.requiredProp2)
 *
 * 3. CHECK ORDERING (IMPORTANT):
 *    - First: ALL property presence checks ("prop" in value)
 *    - Then: ALL type validation checks (typeof, Array.isArray, is.OtherType)
 *    - This ordering improves performance and readability
 *
 * 4. TYPE CHECKS TO USE:
 *    - Primitives: typeof value.prop === "string" | "number" | "boolean"
 *    - Arrays: Array.isArray(value.prop)
 *    - Records/Objects: isObject(value.prop)
 *    - Other interfaces: is.OtherInterface(value.prop)
 *
 * 5. DISCRIMINATED UNIONS:
 *    - Found in namespace declarations within interface files
 *    - Pattern: Interface extends ParentInterface and has a literal "type" property
 *    - Example from SDK:
 *        export declare namespace AuthScheme {
 *            interface Bearer extends BearerAuthScheme {
 *                type: "bearer";
 *            }
 *        }
 *    - Structure as nested objects (NOT flat strings):
 *      AuthScheme: {
 *          Bearer: (value: unknown): value is AuthScheme.Bearer =>
 *              is.BearerAuthScheme(value) && "type" in value && value.type === "bearer",
 *          Basic: (value: unknown): value is AuthScheme.Basic =>
 *              is.BasicAuthScheme(value) && "type" in value && value.type === "basic"
 *      }
 *
 * 6. PARENT INTERFACE VALIDATION:
 *    - For union variants, ALWAYS check the parent interface first
 *    - DO NOT check interfaces ending in "_Utils" - these only contain visitor patterns
 *    - Example: AuthScheme.Bearer extends BearerAuthScheme, so check is.BearerAuthScheme(value)
 *
 * 7. OPTIMIZATION RULES:
 *    - For union variants: Use parent interface check (e.g., is.BearerAuthScheme(value))
 *    - DO NOT add redundant isObject(value) after a parent check
 *    - Parent checks already include isObject validation
 *    - This reduces unnecessary checks and improves performance
 *
 * 8. SPECIAL CASES TO EXCLUDE:
 *    - Skip "_Utils" interfaces (e.g., AuthScheme_Utils) - they only have _visit methods
 *    - Skip generatorExec types unless they're explicitly needed
 *    - Some types may have "_" suffix (e.g., Object_, File_) - keep the underscore
 *
 * 9. CATEGORIZATION:
 *    - Group typeguards logically:
 *      • Common/Base Types (Name, SafeAndUnsafeString, etc.)
 *      • Type Declarations (AliasTypeDeclaration, ObjectTypeDeclaration, etc.)
 *      • HTTP/Request/Response (HttpEndpoint, HttpRequest, HttpResponse, etc.)
 *      • Auth-Related (ApiAuth, AuthScheme, etc.)
 *      • WebSocket (WebSocketChannel, etc.)
 *      • Errors (ErrorDeclaration, etc.)
 *      • Examples (ExampleType, ExampleEndpointCall, etc.)
 *      • Environment (EnvironmentBaseUrlWithId, etc.)
 *      • Other categories as needed
 *      • Discriminated Unions (at the end, alphabetically sorted)
 *
 * 10. IMPORTS:
 *     - Import ALL types used in typeguards at the top
 *     - Use format: import { TypeName } from "@fern-fern/ir-sdk/api"
 *     - Keep imports alphabetically sorted for maintainability
 *
 * 11. VERIFICATION:
 *     - After updating, run linter to check for errors
 *     - Ensure all imported types are exported from @fern-fern/ir-sdk/api
 *     - Test that no TypeScript compilation errors occur
 *     - Check that union variants properly extend their parent interfaces
 *
 * 12. COMMON PITFALLS TO AVOID:
 *     - DON'T use flat string keys for union variants (e.g., "AuthScheme.Bearer")
 *     - DON'T validate _Utils interfaces - they're not real data structures
 *     - DON'T include isObject() after a parent interface check in unions
 *     - DON'T mix up property presence checks and type checks - keep them separate
 *     - DON'T forget to check parent interface for union variants
 *
 * CURRENT STATS: 184 standard typeguards, 183 discriminated union variants (91 with parent validation)
 * ============================================================================================
 */

import {
    AliasTypeDeclaration,
    ApiAuth,
    // Discriminated union types
    ApiDefinitionSource,
    ApiVersionScheme,
    AuthScheme,
    AutogeneratedEndpointExample,
    Availability,
    Base64Type,
    BaseAuthScheme,
    BasicAuthScheme,
    BasicAuthValues,
    BearerAuthScheme,
    BearerAuthValues,
    BigIntegerType,
    BooleanType,
    BytesRequest,
    BytesResponse,
    Constants,
    ContainerType,
    CsharpProtobufFileOptions,
    CursorPagination,
    CustomPagination,
    DateTimeType,
    DateType,
    Declaration,
    DeclaredErrorName,
    DeclaredServiceName,
    DeclaredTypeName,
    DoubleType,
    DoubleValidationRules,
    Encoding,
    EndpointReference,
    EnumTypeDeclaration,
    EnumTypeReference,
    EnumValue,
    Environments,
    ErrorDeclaration,
    ErrorDeclarationDiscriminantValue,
    ErrorDiscriminationStrategy,
    EscapedString,
    ExampleAliasType,
    ExampleCodeSample,
    ExampleCodeSampleLanguage,
    ExampleCodeSampleSdk,
    ExampleContainer,
    ExampleDatetime,
    ExampleEndpointCall,
    ExampleEndpointErrorResponse,
    ExampleEndpointSuccessResponse,
    ExampleEnumType,
    ExampleError,
    ExampleHeader,
    ExampleInlinedRequestBody,
    ExampleInlinedRequestBodyProperty,
    ExampleKeyValuePair,
    ExampleListContainer,
    ExampleLiteralContainer,
    ExampleMapContainer,
    ExampleNamedType,
    ExampleNullableContainer,
    ExampleObjectProperty,
    ExampleObjectType,
    ExampleObjectTypeWithTypeId,
    ExampleOptionalContainer,
    ExamplePathParameter,
    ExamplePrimitive,
    ExampleQueryParameter,
    ExampleQueryParameterShape,
    ExampleRequestBody,
    ExampleResponse,
    ExampleServerSideEvent,
    ExampleSetContainer,
    ExampleSingleUnionType,
    ExampleSingleUnionTypeProperties,
    ExampleType,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    ExampleUndiscriminatedUnionType,
    ExampleUnionType,
    ExampleWebhookCall,
    ExampleWebSocketMessage,
    ExampleWebSocketMessageBody,
    ExampleWebSocketSession,
    FernFilepath,
    FileDownloadResponse,
    FileProperty,
    FilePropertyArray,
    FilePropertySingle,
    Filesystem,
    FileUploadBodyProperty,
    FileUploadRequest,
    FileUploadRequestProperty,
    FloatType,
    GrpcTransport,
    generatorExec,
    HeaderAuthScheme,
    HeaderAuthValues,
    HttpEndpoint,
    HttpEndpointSource,
    HttpHeader,
    HttpPath,
    HttpPathPart,
    HttpRequestBody,
    HttpRequestBodyReference,
    HttpResponse,
    HttpResponseBody,
    HttpService,
    InferredAuthenticatedRequestHeader,
    InferredAuthScheme,
    InferredAuthSchemeTokenEndpoint,
    InlinedRequestBody,
    InlinedRequestBodyProperty,
    InlinedWebhookPayload,
    InlinedWebhookPayloadProperty,
    InlinedWebSocketMessageBody,
    InlinedWebSocketMessageBodyProperty,
    IntegerType,
    IntegerValidationRules,
    IntermediateRepresentation,
    JsonEncoding,
    JsonResponse,
    JsonResponseBody,
    JsonResponseBodyWithProperty,
    JsonStreamChunk,
    Literal,
    LongType,
    MapType,
    Name,
    NameAndWireValue,
    NamedType,
    NamedTypeDefault,
    NonStreamHttpResponseBody,
    OAuthAccessTokenRequestProperties,
    OAuthAccessTokenResponseProperties,
    OAuthClientCredentials,
    OAuthConfiguration,
    OAuthRefreshEndpoint,
    OAuthRefreshTokenRequestProperties,
    OAuthScheme,
    OAuthTokenEndpoint,
    OAuthValues,
    ObjectProperty,
    ObjectTypeDeclaration,
    OffsetPagination,
    Package,
    Pagination,
    PathParameter,
    PrimitiveTypeV2,
    PropertyPathItem,
    ProtobufFile,
    ProtobufFileOptions,
    ProtobufService,
    ProtobufType,
    ProtoEncoding,
    ProtoSource,
    ProtoSourceInfo,
    PublishingConfig,
    PublishTarget,
    QueryParameter,
    ReadmeConfig,
    ReadmeCustomSection,
    RequestProperty,
    RequestPropertyValue,
    ResolvedNamedType,
    ResolvedTypeReference,
    ResponseError,
    ResponseProperty,
    SafeAndUnsafeString,
    SdkConfig,
    SdkRequest,
    SdkRequestBodyType,
    SdkRequestShape,
    SdkRequestWrapper,
    ServiceTypeReferenceInfo,
    SingleUnionType,
    SingleUnionTypeProperty,
    Source,
    SourceConfig,
    SseStreamChunk,
    StreamingResponse,
    StreamParameterResponse,
    StringType,
    StringValidationRules,
    Subpackage,
    TextResponse,
    TextStreamChunk,
    Transport,
    Type,
    TypeDeclaration,
    TypeReference,
    Uint64Type,
    UintType,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration,
    UserAgent,
    UserDefinedProtobufType,
    UserSpecifiedEndpointExample,
    UuidType,
    V2AuthValues,
    V2EndpointLocation,
    V2HttpEndpointCodeSample,
    V2HttpEndpointExample,
    V2HttpEndpointExamples,
    V2HttpEndpointRequest,
    V2HttpEndpointResponse,
    V2HttpEndpointResponseBody,
    V2HttpRequestBodies,
    V2HttpResponses,
    V2SchemaExamples,
    V2WebhookExample,
    V2WebhookExamples,
    V2WebSocketEndpointLocation,
    V2WebSocketMessageExample,
    V2WebSocketSessionExample,
    V2WebSocketSessionExamples,
    VariableDeclaration,
    Webhook,
    WebhookPayload,
    WebhookPayloadReference,
    WebSocketChannel,
    WebSocketMessage,
    WebSocketMessageBody,
    WebSocketMessageBodyReference,
    WellKnownProtobufType,
    WithContentType,
    WithDocs,
    WithDocsAndAvailability,
    WithJsonExample,
    WithV2Examples
} from "@fern-fern/ir-sdk/api";

const isObject = (value: unknown): value is object =>
    value != null && typeof value === "object" && !Array.isArray(value);

export const is = {
    // Base types with proper validation
    SafeAndUnsafeString: (value: unknown): value is SafeAndUnsafeString =>
        isObject(value) &&
        "safeName" in value &&
        "unsafeName" in value &&
        typeof value.safeName === "string" &&
        typeof value.unsafeName === "string",
    Name: (value: unknown): value is Name =>
        isObject(value) &&
        "originalName" in value &&
        "pascalCase" in value &&
        "camelCase" in value &&
        "snakeCase" in value &&
        "screamingSnakeCase" in value &&
        typeof value.originalName === "string" &&
        is.SafeAndUnsafeString(value.pascalCase) &&
        is.SafeAndUnsafeString(value.camelCase) &&
        is.SafeAndUnsafeString(value.snakeCase) &&
        is.SafeAndUnsafeString(value.screamingSnakeCase),
    NameAndWireValue: (value: unknown): value is NameAndWireValue =>
        isObject(value) &&
        "wireValue" in value &&
        "name" in value &&
        typeof value.wireValue === "string" &&
        is.Name(value.name),
    // Type Declarations
    TypeDeclaration: (value: unknown): value is TypeDeclaration =>
        isObject(value) &&
        "name" in value &&
        "shape" in value &&
        "autogeneratedExamples" in value &&
        "userProvidedExamples" in value &&
        "referencedTypes" in value &&
        "inline" in value &&
        "availability" in value &&
        Array.isArray(value.autogeneratedExamples) &&
        Array.isArray(value.userProvidedExamples) &&
        "docs" in value,
    ObjectTypeDeclaration: (value: unknown): value is ObjectTypeDeclaration =>
        isObject(value) &&
        "extends" in value &&
        "properties" in value &&
        "extraProperties" in value &&
        Array.isArray(value.extends) &&
        Array.isArray(value.properties) &&
        typeof value.extraProperties === "boolean",
    EnumTypeDeclaration: (value: unknown): value is EnumTypeDeclaration =>
        isObject(value) && "values" in value && Array.isArray(value.values),

    UnionTypeDeclaration: (value: unknown): value is UnionTypeDeclaration =>
        isObject(value) &&
        "discriminant" in value &&
        "extends" in value &&
        "types" in value &&
        "baseProperties" in value &&
        is.NameAndWireValue(value.discriminant) &&
        Array.isArray(value.extends) &&
        Array.isArray(value.types) &&
        Array.isArray(value.baseProperties),
    AliasTypeDeclaration: (value: unknown): value is AliasTypeDeclaration =>
        isObject(value) && "aliasOf" in value && "resolvedType" in value,

    ObjectProperty: (value: unknown): value is ObjectProperty =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        "docs" in value,
    // HTTP Types
    HttpEndpoint: (value: unknown): value is HttpEndpoint =>
        isObject(value) &&
        "id" in value &&
        "name" in value &&
        "method" in value &&
        "headers" in value &&
        "path" in value &&
        "fullPath" in value &&
        "pathParameters" in value &&
        "allPathParameters" in value &&
        "queryParameters" in value &&
        "errors" in value &&
        "auth" in value &&
        "idempotent" in value &&
        "userSpecifiedExamples" in value &&
        "autogeneratedExamples" in value &&
        "availability" in value &&
        typeof value.id === "string" &&
        typeof value.method === "string" &&
        Array.isArray(value.headers) &&
        Array.isArray(value.pathParameters) &&
        Array.isArray(value.allPathParameters) &&
        Array.isArray(value.queryParameters) &&
        typeof value.auth === "boolean" &&
        typeof value.idempotent === "boolean" &&
        Array.isArray(value.userSpecifiedExamples) &&
        Array.isArray(value.autogeneratedExamples) &&
        "docs" in value,
    HttpService: (value: unknown): value is HttpService =>
        isObject(value) &&
        "name" in value &&
        "basePath" in value &&
        "endpoints" in value &&
        "headers" in value &&
        "pathParameters" in value &&
        is.HttpPath(value.basePath) &&
        Array.isArray(value.endpoints) &&
        Array.isArray(value.headers) &&
        Array.isArray(value.pathParameters),
    HttpHeader: (value: unknown): value is HttpHeader =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        "docs" in value,
    HttpResponse: (value: unknown): value is HttpResponse => isObject(value),

    HttpPath: (value: unknown): value is HttpPath =>
        isObject(value) &&
        "head" in value &&
        "parts" in value &&
        typeof value.head === "string" &&
        Array.isArray(value.parts),
    HttpPathPart: (value: unknown): value is HttpPathPart =>
        isObject(value) &&
        "pathParameter" in value &&
        "tail" in value &&
        typeof value.pathParameter === "string" &&
        typeof value.tail === "string",
    PathParameter: (value: unknown): value is PathParameter =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "location" in value &&
        is.Name(value.name) &&
        typeof value.location === "string" &&
        "docs" in value,
    QueryParameter: (value: unknown): value is QueryParameter =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "allowMultiple" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        typeof value.allowMultiple === "boolean" &&
        "docs" in value,
    InlinedRequestBody: (value: unknown): value is InlinedRequestBody =>
        isObject(value) &&
        "name" in value &&
        "extends" in value &&
        "properties" in value &&
        "extraProperties" in value &&
        is.Name(value.name) &&
        Array.isArray(value.extends) &&
        Array.isArray(value.properties) &&
        typeof value.extraProperties === "boolean" &&
        "docs" in value,
    InlinedRequestBodyProperty: (value: unknown): value is InlinedRequestBodyProperty =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        "docs" in value,
    SdkRequest: (value: unknown): value is SdkRequest =>
        isObject(value) && "requestParameterName" in value && is.Name(value.requestParameterName) && "shape" in value,

    // WebSocket Types
    WebSocketChannel: (value: unknown): value is WebSocketChannel =>
        isObject(value) &&
        "name" in value &&
        "path" in value &&
        "auth" in value &&
        "headers" in value &&
        "queryParameters" in value &&
        "pathParameters" in value &&
        "messages" in value &&
        "examples" in value &&
        "availability" in value &&
        is.HttpPath(value.path) &&
        typeof value.auth === "boolean" &&
        Array.isArray(value.headers) &&
        Array.isArray(value.queryParameters) &&
        Array.isArray(value.pathParameters) &&
        Array.isArray(value.messages) &&
        Array.isArray(value.examples) &&
        "docs" in value,
    WebSocketMessage: (value: unknown): value is WebSocketMessage =>
        isObject(value) &&
        "type" in value &&
        "origin" in value &&
        "body" in value &&
        "availability" in value &&
        typeof value.type === "string" &&
        typeof value.origin === "string" &&
        "docs" in value,
    // Example Types (Original)
    ExampleType: (value: unknown): value is ExampleType =>
        isObject(value) && "shape" in value && "jsonExample" in value && "docs" in value,

    ExampleObjectType: (value: unknown): value is ExampleObjectType =>
        isObject(value) && "properties" in value && Array.isArray(value.properties),

    ExampleObjectProperty: (value: unknown): value is ExampleObjectProperty =>
        isObject(value) &&
        "name" in value &&
        "value" in value &&
        is.NameAndWireValue(value.name) &&
        is.ExampleTypeReference(value.value),
    ExampleEndpointCall: (value: unknown): value is ExampleEndpointCall =>
        isObject(value) &&
        "url" in value &&
        "rootPathParameters" in value &&
        "servicePathParameters" in value &&
        "endpointPathParameters" in value &&
        "serviceHeaders" in value &&
        "endpointHeaders" in value &&
        "queryParameters" in value &&
        "response" in value &&
        typeof value.url === "string" &&
        Array.isArray(value.rootPathParameters) &&
        Array.isArray(value.servicePathParameters) &&
        Array.isArray(value.endpointPathParameters) &&
        Array.isArray(value.serviceHeaders) &&
        Array.isArray(value.endpointHeaders) &&
        Array.isArray(value.queryParameters) &&
        "docs" in value,
    ExampleHeader: (value: unknown): value is ExampleHeader =>
        isObject(value) &&
        "name" in value &&
        "value" in value &&
        is.NameAndWireValue(value.name) &&
        is.ExampleTypeReference(value.value),
    ExamplePathParameter: (value: unknown): value is ExamplePathParameter =>
        isObject(value) && "name" in value && is.Name(value.name) && "value" in value,

    ExampleQueryParameter: (value: unknown): value is ExampleQueryParameter =>
        isObject(value) &&
        "name" in value &&
        "value" in value &&
        is.NameAndWireValue(value.name) &&
        is.ExampleTypeReference(value.value),
    ExampleTypeReference: (value: unknown): value is ExampleTypeReference =>
        isObject(value) && "shape" in value && "jsonExample" in value,

    ExampleNamedType: (value: unknown): value is ExampleNamedType =>
        isObject(value) && "typeName" in value && "shape" in value,

    // Common/Base Types
    WithDocs: (value: unknown): value is WithDocs => isObject(value) && "docs" in value,

    WithDocsAndAvailability: (value: unknown): value is WithDocsAndAvailability =>
        isObject(value) && "docs" in value && "availability" in value,

    Declaration: (value: unknown): value is Declaration =>
        isObject(value) && "docs" in value && "availability" in value,

    Availability: (value: unknown): value is Availability =>
        isObject(value) && "status" in value && typeof value.status === "string",

    FernFilepath: (value: unknown): value is FernFilepath =>
        isObject(value) &&
        "allParts" in value &&
        "packagePath" in value &&
        Array.isArray(value.allParts) &&
        Array.isArray(value.packagePath),
    // Error Types
    ErrorDeclaration: (value: unknown): value is ErrorDeclaration =>
        isObject(value) &&
        "name" in value &&
        "discriminantValue" in value &&
        "statusCode" in value &&
        "examples" in value &&
        is.NameAndWireValue(value.discriminantValue) &&
        typeof value.statusCode === "number" &&
        Array.isArray(value.examples) &&
        "docs" in value,
    // Auth Types (Original)
    BearerAuthScheme: (value: unknown): value is BearerAuthScheme =>
        isObject(value) && "token" in value && is.Name(value.token) && "docs" in value && "availability" in value,

    BasicAuthScheme: (value: unknown): value is BasicAuthScheme =>
        isObject(value) &&
        "username" in value &&
        "password" in value &&
        "docs" in value &&
        is.Name(value.username) &&
        is.Name(value.password) &&
        "availability" in value,
    HeaderAuthScheme: (value: unknown): value is HeaderAuthScheme =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "docs" in value &&
        is.NameAndWireValue(value.name) &&
        "availability" in value,
    OAuthScheme: (value: unknown): value is OAuthScheme =>
        isObject(value) && "configuration" in value && "docs" in value && "availability" in value,

    // Webhook Types
    Webhook: (value: unknown): value is Webhook =>
        isObject(value) &&
        "id" in value &&
        "name" in value &&
        "method" in value &&
        "headers" in value &&
        "payload" in value &&
        "availability" in value &&
        typeof value.id === "string" &&
        typeof value.method === "string" &&
        Array.isArray(value.headers) &&
        "docs" in value,
    InlinedWebhookPayload: (value: unknown): value is InlinedWebhookPayload =>
        isObject(value) &&
        "name" in value &&
        "extends" in value &&
        "properties" in value &&
        is.Name(value.name) &&
        Array.isArray(value.extends) &&
        Array.isArray(value.properties),
    // Variable Types
    VariableDeclaration: (value: unknown): value is VariableDeclaration =>
        isObject(value) &&
        "id" in value &&
        "name" in value &&
        "type" in value &&
        typeof value.id === "string" &&
        is.Name(value.name) &&
        "docs" in value,
    // Additional IR Configuration Types
    ApiAuth: (value: unknown): value is ApiAuth =>
        isObject(value) &&
        "requirement" in value &&
        "schemes" in value &&
        typeof value.requirement === "string" &&
        Array.isArray(value.schemes) &&
        "docs" in value,
    ReadmeConfig: (value: unknown): value is ReadmeConfig => isObject(value),

    ReadmeCustomSection: (value: unknown): value is ReadmeCustomSection =>
        isObject(value) &&
        "title" in value &&
        "language" in value &&
        "content" in value &&
        typeof value.title === "string" &&
        typeof value.language === "string" &&
        typeof value.content === "string",
    SourceConfig: (value: unknown): value is SourceConfig =>
        isObject(value) && "sources" in value && Array.isArray(value.sources),

    ServiceTypeReferenceInfo: (value: unknown): value is ServiceTypeReferenceInfo =>
        isObject(value) &&
        "typesReferencedOnlyByService" in value &&
        "sharedTypes" in value &&
        isObject(value.typesReferencedOnlyByService) &&
        Array.isArray(value.sharedTypes),
    UserAgent: (value: unknown): value is UserAgent =>
        isObject(value) &&
        "header" in value &&
        "value" in value &&
        typeof value.header === "string" &&
        typeof value.value === "string",
    // Primitive Type Declarations
    StringType: (value: unknown): value is StringType => isObject(value),
    IntegerType: (value: unknown): value is IntegerType => isObject(value),
    LongType: (value: unknown): value is LongType => isObject(value),
    DoubleType: (value: unknown): value is DoubleType => isObject(value),
    FloatType: (value: unknown): value is FloatType => isObject(value),
    BooleanType: (value: unknown): value is BooleanType => isObject(value),
    DateTimeType: (value: unknown): value is DateTimeType => isObject(value),
    DateType: (value: unknown): value is DateType => isObject(value),
    UuidType: (value: unknown): value is UuidType => isObject(value),
    Base64Type: (value: unknown): value is Base64Type => isObject(value),
    BigIntegerType: (value: unknown): value is BigIntegerType => isObject(value),
    UintType: (value: unknown): value is UintType => isObject(value),
    Uint64Type: (value: unknown): value is Uint64Type => isObject(value),

    MapType: (value: unknown): value is MapType => isObject(value) && "keyType" in value && "valueType" in value,

    // Validation Rules
    StringValidationRules: (value: unknown): value is StringValidationRules => isObject(value),
    IntegerValidationRules: (value: unknown): value is IntegerValidationRules => isObject(value),
    DoubleValidationRules: (value: unknown): value is DoubleValidationRules => isObject(value),

    // Response Body Types
    JsonResponseBody: (value: unknown): value is JsonResponseBody =>
        isObject(value) && "responseBodyType" in value && "docs" in value,

    JsonResponseBodyWithProperty: (value: unknown): value is JsonResponseBodyWithProperty =>
        isObject(value) && "responseBodyType" in value && "docs" in value,

    TextResponse: (value: unknown): value is TextResponse => isObject(value) && "docs" in value,

    BytesResponse: (value: unknown): value is BytesResponse => isObject(value) && "docs" in value,

    // Streaming Types
    JsonStreamChunk: (value: unknown): value is JsonStreamChunk =>
        isObject(value) && "payload" in value && "docs" in value,

    SseStreamChunk: (value: unknown): value is SseStreamChunk =>
        isObject(value) && "payload" in value && "docs" in value,

    TextStreamChunk: (value: unknown): value is TextStreamChunk => isObject(value) && "docs" in value,

    StreamParameterResponse: (value: unknown): value is StreamParameterResponse =>
        isObject(value) && "nonStreamResponse" in value && "streamResponse" in value,

    // Pagination Types
    CursorPagination: (value: unknown): value is CursorPagination =>
        isObject(value) &&
        "page" in value &&
        "next" in value &&
        "results" in value &&
        is.RequestProperty(value.page) &&
        is.ResponseProperty(value.next) &&
        is.ResponseProperty(value.results),
    OffsetPagination: (value: unknown): value is OffsetPagination =>
        isObject(value) &&
        "page" in value &&
        "results" in value &&
        is.RequestProperty(value.page) &&
        is.ResponseProperty(value.results),
    CustomPagination: (value: unknown): value is CustomPagination =>
        isObject(value) && "results" in value && is.ResponseProperty(value.results),

    RequestProperty: (value: unknown): value is RequestProperty => isObject(value) && "property" in value,

    ResponseProperty: (value: unknown): value is ResponseProperty => isObject(value) && "property" in value,

    // OAuth Types
    OAuthAccessTokenRequestProperties: (value: unknown): value is OAuthAccessTokenRequestProperties =>
        isObject(value) &&
        "clientId" in value &&
        "clientSecret" in value &&
        is.RequestProperty(value.clientId) &&
        is.RequestProperty(value.clientSecret),
    OAuthClientCredentials: (value: unknown): value is OAuthClientCredentials =>
        isObject(value) && "tokenEndpoint" in value && is.OAuthTokenEndpoint(value.tokenEndpoint),

    // Additional Auth Types
    BaseAuthScheme: (value: unknown): value is BaseAuthScheme =>
        isObject(value) && "key" in value && typeof value.key === "string" && "docs" in value,

    InferredAuthScheme: (value: unknown): value is InferredAuthScheme =>
        isObject(value) &&
        "tokenEndpoint" in value &&
        "docs" in value &&
        is.InferredAuthSchemeTokenEndpoint(value.tokenEndpoint) &&
        "availability" in value,
    // Additional Common Types
    PropertyPathItem: (value: unknown): value is PropertyPathItem =>
        isObject(value) && "name" in value && is.Name(value.name) && "type" in value,

    WithJsonExample: (value: unknown): value is WithJsonExample => isObject(value) && "jsonExample" in value,

    WithContentType: (value: unknown): value is WithContentType => isObject(value) && "contentType" in value,

    WithV2Examples: (value: unknown): value is WithV2Examples => isObject(value) && "v2Examples" in value,

    EscapedString: (value: unknown): value is EscapedString =>
        isObject(value) && "original" in value && typeof value.original === "string",

    // Additional Type-Related Interfaces
    EnumValue: (value: unknown): value is EnumValue =>
        isObject(value) &&
        "name" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        "docs" in value,
    SingleUnionType: (value: unknown): value is SingleUnionType =>
        isObject(value) &&
        "discriminantValue" in value &&
        "shape" in value &&
        is.NameAndWireValue(value.discriminantValue) &&
        "docs" in value,
    SingleUnionTypeProperty: (value: unknown): value is SingleUnionTypeProperty =>
        isObject(value) && "name" in value && is.NameAndWireValue(value.name) && "type" in value,

    UndiscriminatedUnionTypeDeclaration: (value: unknown): value is UndiscriminatedUnionTypeDeclaration =>
        isObject(value) && "members" in value && Array.isArray(value.members),

    UndiscriminatedUnionMember: (value: unknown): value is UndiscriminatedUnionMember =>
        isObject(value) && "type" in value && "docs" in value,

    // Declared Names
    DeclaredTypeName: (value: unknown): value is DeclaredTypeName =>
        isObject(value) &&
        "typeId" in value &&
        "fernFilepath" in value &&
        "name" in value &&
        typeof value.typeId === "string" &&
        is.FernFilepath(value.fernFilepath) &&
        is.Name(value.name),
    DeclaredServiceName: (value: unknown): value is DeclaredServiceName =>
        isObject(value) && "fernFilepath" in value && is.FernFilepath(value.fernFilepath),

    DeclaredErrorName: (value: unknown): value is DeclaredErrorName =>
        isObject(value) &&
        "errorId" in value &&
        "fernFilepath" in value &&
        "name" in value &&
        typeof value.errorId === "string" &&
        is.FernFilepath(value.fernFilepath) &&
        is.Name(value.name),
    // File Upload/Download
    FileUploadRequest: (value: unknown): value is FileUploadRequest =>
        isObject(value) &&
        "name" in value &&
        "properties" in value &&
        is.Name(value.name) &&
        Array.isArray(value.properties) &&
        "docs" in value,
    FileDownloadResponse: (value: unknown): value is FileDownloadResponse => isObject(value) && "docs" in value,

    SdkRequestWrapper: (value: unknown): value is SdkRequestWrapper =>
        isObject(value) &&
        "wrapperName" in value &&
        "bodyKey" in value &&
        is.Name(value.wrapperName) &&
        is.Name(value.bodyKey),
    BytesRequest: (value: unknown): value is BytesRequest =>
        isObject(value) && "isOptional" in value && typeof value.isOptional === "boolean" && "docs" in value,

    NamedType: (value: unknown): value is NamedType =>
        isObject(value) &&
        "typeId" in value &&
        "fernFilepath" in value &&
        "name" in value &&
        typeof value.typeId === "string" &&
        is.FernFilepath(value.fernFilepath) &&
        is.Name(value.name),
    ResolvedNamedType: (value: unknown): value is ResolvedNamedType =>
        isObject(value) && "name" in value && "shape" in value,

    FileUploadBodyProperty: (value: unknown): value is FileUploadBodyProperty =>
        isObject(value) &&
        "name" in value &&
        "valueType" in value &&
        "availability" in value &&
        is.NameAndWireValue(value.name) &&
        "docs" in value,
    // IR Types
    IntermediateRepresentation: (value: unknown): value is IntermediateRepresentation =>
        isObject(value) &&
        "apiName" in value &&
        "auth" in value &&
        "types" in value &&
        "headers" in value &&
        "idempotencyHeaders" in value &&
        "services" in value &&
        "webhookGroups" in value &&
        "errors" in value &&
        "subpackages" in value &&
        "rootPackage" in value &&
        "constants" in value &&
        "pathParameters" in value &&
        "errorDiscriminationStrategy" in value &&
        "sdkConfig" in value &&
        "variables" in value &&
        "serviceTypeReferenceInfo" in value &&
        is.Name(value.apiName) &&
        isObject(value.types) &&
        Array.isArray(value.headers) &&
        Array.isArray(value.idempotencyHeaders) &&
        isObject(value.services) &&
        isObject(value.webhookGroups) &&
        isObject(value.errors) &&
        isObject(value.subpackages) &&
        is.Package(value.rootPackage) &&
        is.Constants(value.constants) &&
        Array.isArray(value.pathParameters) &&
        is.SdkConfig(value.sdkConfig) &&
        Array.isArray(value.variables) &&
        is.ServiceTypeReferenceInfo(value.serviceTypeReferenceInfo),
    Package: (value: unknown): value is Package =>
        isObject(value) &&
        "fernFilepath" in value &&
        "types" in value &&
        "errors" in value &&
        "subpackages" in value &&
        "hasEndpointsInTree" in value &&
        is.FernFilepath(value.fernFilepath) &&
        Array.isArray(value.types) &&
        Array.isArray(value.errors) &&
        Array.isArray(value.subpackages) &&
        typeof value.hasEndpointsInTree === "boolean" &&
        "docs" in value,
    Subpackage: (value: unknown): value is Subpackage =>
        isObject(value) &&
        "name" in value &&
        "fernFilepath" in value &&
        "types" in value &&
        "errors" in value &&
        "subpackages" in value &&
        "hasEndpointsInTree" in value &&
        is.Name(value.name) &&
        is.FernFilepath(value.fernFilepath) &&
        Array.isArray(value.types) &&
        Array.isArray(value.errors) &&
        Array.isArray(value.subpackages) &&
        typeof value.hasEndpointsInTree === "boolean" &&
        "docs" in value,
    Constants: (value: unknown): value is Constants =>
        isObject(value) && "errorInstanceIdKey" in value && is.NameAndWireValue(value.errorInstanceIdKey),

    SdkConfig: (value: unknown): value is SdkConfig =>
        isObject(value) &&
        "isAuthMandatory" in value &&
        "hasStreamingEndpoints" in value &&
        "hasPaginatedEndpoints" in value &&
        "hasFileDownloadEndpoints" in value &&
        typeof value.isAuthMandatory === "boolean" &&
        typeof value.hasStreamingEndpoints === "boolean" &&
        typeof value.hasPaginatedEndpoints === "boolean" &&
        typeof value.hasFileDownloadEndpoints === "boolean" &&
        "platformHeaders" in value,
    // Generator Config Types
    GeneratorConfig: (value: unknown): value is generatorExec.GeneratorConfig =>
        isObject(value) &&
        "dryRun" in value &&
        "irFilepath" in value &&
        "output" in value &&
        "workspaceName" in value &&
        "organization" in value &&
        "customConfig" in value &&
        "environment" in value &&
        "whitelabel" in value &&
        "writeUnitTests" in value &&
        "generateOauthClients" in value &&
        typeof value.dryRun === "boolean" &&
        typeof value.irFilepath === "string" &&
        typeof value.workspaceName === "string" &&
        typeof value.organization === "string" &&
        typeof value.whitelabel === "boolean" &&
        typeof value.writeUnitTests === "boolean" &&
        typeof value.generateOauthClients === "boolean",
    // ===== NEW ADDITIONS FROM 6 CATEGORIES =====

    // Example-Related Types (36 interfaces)
    AutogeneratedEndpointExample: (value: unknown): value is AutogeneratedEndpointExample =>
        isObject(value) && "example" in value && is.ExampleEndpointCall(value.example),

    UserSpecifiedEndpointExample: (value: unknown): value is UserSpecifiedEndpointExample => isObject(value),

    ExampleAliasType: (value: unknown): value is ExampleAliasType =>
        isObject(value) && "value" in value && is.ExampleTypeReference(value.value),

    ExampleEnumType: (value: unknown): value is ExampleEnumType =>
        isObject(value) && "value" in value && is.NameAndWireValue(value.value),

    ExampleUnionType: (value: unknown): value is ExampleUnionType =>
        isObject(value) &&
        "discriminant" in value &&
        is.NameAndWireValue(value.discriminant) &&
        "singleUnionType" in value,
    ExampleSingleUnionType: (value: unknown): value is ExampleSingleUnionType => isObject(value) && "shape" in value,

    ExampleUndiscriminatedUnionType: (value: unknown): value is ExampleUndiscriminatedUnionType =>
        isObject(value) && "singleUnionType" in value,

    ExampleObjectTypeWithTypeId: (value: unknown): value is ExampleObjectTypeWithTypeId =>
        isObject(value) &&
        "typeId" in value &&
        "object" in value &&
        typeof value.typeId === "string" &&
        is.ExampleObjectType(value.object),
    ExampleListContainer: (value: unknown): value is ExampleListContainer =>
        isObject(value) && "list" in value && Array.isArray(value.list),

    ExampleSetContainer: (value: unknown): value is ExampleSetContainer =>
        isObject(value) && "set" in value && Array.isArray(value.set),

    ExampleMapContainer: (value: unknown): value is ExampleMapContainer =>
        isObject(value) && "map" in value && Array.isArray(value.map),

    ExampleOptionalContainer: (value: unknown): value is ExampleOptionalContainer =>
        isObject(value) && "optional" in value,

    ExampleNullableContainer: (value: unknown): value is ExampleNullableContainer =>
        isObject(value) && "nullable" in value,

    ExampleLiteralContainer: (value: unknown): value is ExampleLiteralContainer =>
        isObject(value) && "literal" in value,

    ExampleKeyValuePair: (value: unknown): value is ExampleKeyValuePair =>
        isObject(value) &&
        "key" in value &&
        "value" in value &&
        is.ExampleTypeReference(value.key) &&
        is.ExampleTypeReference(value.value),
    ExampleError: (value: unknown): value is ExampleError => isObject(value) && "name" in value && "body" in value,

    ExampleEndpointErrorResponse: (value: unknown): value is ExampleEndpointErrorResponse =>
        isObject(value) && "error" in value,

    ExampleDatetime: (value: unknown): value is ExampleDatetime =>
        isObject(value) && "datetime" in value && typeof value.datetime === "string",

    ExampleInlinedRequestBody: (value: unknown): value is ExampleInlinedRequestBody =>
        isObject(value) && "properties" in value && Array.isArray(value.properties),

    ExampleInlinedRequestBodyProperty: (value: unknown): value is ExampleInlinedRequestBodyProperty =>
        isObject(value) &&
        "name" in value &&
        "value" in value &&
        is.NameAndWireValue(value.name) &&
        is.ExampleTypeReference(value.value),
    ExampleWebhookCall: (value: unknown): value is ExampleWebhookCall => isObject(value) && "payload" in value,

    ExampleWebSocketMessage: (value: unknown): value is ExampleWebSocketMessage =>
        isObject(value) && "type" in value && typeof value.type === "string" && "body" in value,

    ExampleWebSocketSession: (value: unknown): value is ExampleWebSocketSession =>
        isObject(value) && "messages" in value && Array.isArray(value.messages),

    ExampleServerSideEvent: (value: unknown): value is ExampleServerSideEvent =>
        isObject(value) && "event" in value && typeof value.event === "string" && "data" in value,

    ExampleCodeSampleLanguage: (value: unknown): value is ExampleCodeSampleLanguage =>
        isObject(value) &&
        "language" in value &&
        "code" in value &&
        typeof value.language === "string" &&
        typeof value.code === "string",
    ExampleCodeSampleSdk: (value: unknown): value is ExampleCodeSampleSdk =>
        isObject(value) &&
        "sdk" in value &&
        "code" in value &&
        typeof value.sdk === "string" &&
        typeof value.code === "string",
    V2HttpEndpointExample: (value: unknown): value is V2HttpEndpointExample =>
        isObject(value) && "id" in value && typeof value.id === "string",

    V2HttpEndpointExamples: (value: unknown): value is V2HttpEndpointExamples =>
        isObject(value) && "examples" in value && Array.isArray(value.examples),

    V2HttpEndpointRequest: (value: unknown): value is V2HttpEndpointRequest => isObject(value),

    V2HttpEndpointResponse: (value: unknown): value is V2HttpEndpointResponse => isObject(value),

    V2HttpEndpointCodeSample: (value: unknown): value is V2HttpEndpointCodeSample =>
        isObject(value) &&
        "language" in value &&
        "code" in value &&
        typeof value.language === "string" &&
        typeof value.code === "string",
    V2SchemaExamples: (value: unknown): value is V2SchemaExamples => isObject(value),

    V2WebSocketMessageExample: (value: unknown): value is V2WebSocketMessageExample =>
        isObject(value) && "type" in value && typeof value.type === "string",

    V2WebSocketSessionExample: (value: unknown): value is V2WebSocketSessionExample =>
        isObject(value) && "messages" in value && Array.isArray(value.messages),

    V2WebSocketSessionExamples: (value: unknown): value is V2WebSocketSessionExamples =>
        isObject(value) && "examples" in value && Array.isArray(value.examples),

    V2WebhookExample: (value: unknown): value is V2WebhookExample => isObject(value) && "payload" in value,

    V2WebhookExamples: (value: unknown): value is V2WebhookExamples =>
        isObject(value) && "examples" in value && Array.isArray(value.examples),

    // Auth-Related Types (9 interfaces)
    BasicAuthValues: (value: unknown): value is BasicAuthValues =>
        isObject(value) &&
        "username" in value &&
        "password" in value &&
        typeof value.username === "string" &&
        typeof value.password === "string",
    BearerAuthValues: (value: unknown): value is BearerAuthValues =>
        isObject(value) && "token" in value && typeof value.token === "string",

    HeaderAuthValues: (value: unknown): value is HeaderAuthValues =>
        isObject(value) && "header" in value && typeof value.header === "string",

    OAuthValues: (value: unknown): value is OAuthValues =>
        isObject(value) && "accessToken" in value && typeof value.accessToken === "string",

    InferredAuthSchemeTokenEndpoint: (value: unknown): value is InferredAuthSchemeTokenEndpoint =>
        isObject(value) &&
        "endpoint" in value &&
        "authenticatedRequestHeaders" in value &&
        is.EndpointReference(value.endpoint) &&
        Array.isArray(value.authenticatedRequestHeaders),
    InferredAuthenticatedRequestHeader: (value: unknown): value is InferredAuthenticatedRequestHeader =>
        isObject(value) && "header" in value,

    OAuthAccessTokenResponseProperties: (value: unknown): value is OAuthAccessTokenResponseProperties =>
        isObject(value) && "accessToken" in value && is.ResponseProperty(value.accessToken),

    OAuthRefreshEndpoint: (value: unknown): value is OAuthRefreshEndpoint =>
        isObject(value) && "endpointReference" in value && is.EndpointReference(value.endpointReference),

    OAuthRefreshTokenRequestProperties: (value: unknown): value is OAuthRefreshTokenRequestProperties =>
        isObject(value) && "refreshToken" in value && is.RequestProperty(value.refreshToken),

    OAuthTokenEndpoint: (value: unknown): value is OAuthTokenEndpoint =>
        isObject(value) &&
        "endpointReference" in value &&
        "requestProperties" in value &&
        "responseProperties" in value &&
        is.EndpointReference(value.endpointReference) &&
        is.OAuthAccessTokenRequestProperties(value.requestProperties) &&
        is.OAuthAccessTokenResponseProperties(value.responseProperties),
    // Encoding/Streaming Types (4 interfaces)
    Encoding: (value: unknown): value is Encoding => isObject(value),
    JsonEncoding: (value: unknown): value is JsonEncoding => isObject(value),
    ProtoEncoding: (value: unknown): value is ProtoEncoding => isObject(value),

    // File/WebSocket/Webhook Types (9 interfaces)
    FilePropertyArray: (value: unknown): value is FilePropertyArray =>
        isObject(value) && "key" in value && is.NameAndWireValue(value.key),

    FilePropertySingle: (value: unknown): value is FilePropertySingle =>
        isObject(value) && "key" in value && is.NameAndWireValue(value.key),

    Filesystem: (value: unknown): value is Filesystem =>
        isObject(value) && "name" in value && typeof value.name === "string",

    InlinedWebSocketMessageBody: (value: unknown): value is InlinedWebSocketMessageBody =>
        isObject(value) && "properties" in value && Array.isArray(value.properties),

    InlinedWebSocketMessageBodyProperty: (value: unknown): value is InlinedWebSocketMessageBodyProperty =>
        isObject(value) && "name" in value && is.NameAndWireValue(value.name) && "valueType" in value,

    InlinedWebhookPayloadProperty: (value: unknown): value is InlinedWebhookPayloadProperty =>
        isObject(value) && "name" in value && is.NameAndWireValue(value.name) && "valueType" in value,

    WebSocketMessageBodyReference: (value: unknown): value is WebSocketMessageBodyReference =>
        isObject(value) && "bodyType" in value,

    WebhookPayloadReference: (value: unknown): value is WebhookPayloadReference =>
        isObject(value) && "payloadType" in value,

    // HTTP/Request/Response Types (7 interfaces)
    HttpRequestBodyReference: (value: unknown): value is HttpRequestBodyReference =>
        isObject(value) && "requestBodyType" in value,

    ResponseError: (value: unknown): value is ResponseError => isObject(value) && "error" in value,

    V2EndpointLocation: (value: unknown): value is V2EndpointLocation =>
        isObject(value) &&
        "method" in value &&
        "path" in value &&
        typeof value.method === "string" &&
        typeof value.path === "string",
    V2WebSocketEndpointLocation: (value: unknown): value is V2WebSocketEndpointLocation =>
        isObject(value) && "path" in value && typeof value.path === "string",

    V2HttpRequestBodies: (value: unknown): value is V2HttpRequestBodies => isObject(value),

    V2HttpResponses: (value: unknown): value is V2HttpResponses => isObject(value),

    EndpointReference: (value: unknown): value is EndpointReference =>
        isObject(value) &&
        "endpointId" in value &&
        "serviceId" in value &&
        typeof value.endpointId === "string" &&
        typeof value.serviceId === "string",
    EnumTypeReference: (value: unknown): value is EnumTypeReference =>
        isObject(value) && "enumTypeId" in value && typeof value.enumTypeId === "string",

    // Protobuf/GRPC Types (9 interfaces)
    CsharpProtobufFileOptions: (value: unknown): value is CsharpProtobufFileOptions =>
        isObject(value) && "namespace" in value && typeof value.namespace === "string",

    GrpcTransport: (value: unknown): value is GrpcTransport =>
        isObject(value) && "service" in value && is.ProtobufService(value.service),

    ProtoSource: (value: unknown): value is ProtoSource =>
        isObject(value) && "file" in value && is.ProtobufFile(value.file),

    ProtoSourceInfo: (value: unknown): value is ProtoSourceInfo => isObject(value),

    ProtobufFile: (value: unknown): value is ProtobufFile =>
        isObject(value) && "filepath" in value && typeof value.filepath === "string",

    ProtobufFileOptions: (value: unknown): value is ProtobufFileOptions => isObject(value),

    ProtobufService: (value: unknown): value is ProtobufService =>
        isObject(value) &&
        "name" in value &&
        "file" in value &&
        typeof value.name === "string" &&
        is.ProtobufFile(value.file),
    UserDefinedProtobufType: (value: unknown): value is UserDefinedProtobufType =>
        isObject(value) &&
        "typeName" in value &&
        "file" in value &&
        typeof value.typeName === "string" &&
        is.ProtobufFile(value.file),
    // Discriminated Union Variants

    // AuthScheme
    AuthScheme: {
        Bearer: (value: unknown): value is AuthScheme.Bearer =>
            is.BearerAuthScheme(value) && "type" in value && value.type === "bearer",
        Basic: (value: unknown): value is AuthScheme.Basic =>
            is.BasicAuthScheme(value) && "type" in value && value.type === "basic",
        Header: (value: unknown): value is AuthScheme.Header =>
            is.HeaderAuthScheme(value) && "type" in value && value.type === "header",
        Oauth: (value: unknown): value is AuthScheme.Oauth =>
            is.OAuthScheme(value) && "type" in value && value.type === "oauth",
        Inferred: (value: unknown): value is AuthScheme.Inferred =>
            is.InferredAuthScheme(value) && "type" in value && value.type === "inferred"
    },

    // OAuthConfiguration
    OAuthConfiguration: {
        ClientCredentials: (value: unknown): value is OAuthConfiguration.ClientCredentials =>
            is.OAuthClientCredentials(value) && "type" in value && value.type === "clientCredentials"
    },

    // Environments
    Environments: {
        SingleBaseUrl: (value: unknown): value is Environments.SingleBaseUrl =>
            isObject(value) && "type" in value && value.type === "singleBaseUrl",
        MultipleBaseUrls: (value: unknown): value is Environments.MultipleBaseUrls =>
            isObject(value) && "type" in value && value.type === "multipleBaseUrls"
    },

    // ErrorDeclarationDiscriminantValue
    ErrorDeclarationDiscriminantValue: {
        Property: (value: unknown): value is ErrorDeclarationDiscriminantValue.Property =>
            is.NameAndWireValue(value) && "type" in value && value.type === "property",
        StatusCode: (value: unknown): value is ErrorDeclarationDiscriminantValue.StatusCode =>
            isObject(value) && "type" in value && value.type === "statusCode"
    },

    // V2AuthValues
    V2AuthValues: {
        Basic: (value: unknown): value is V2AuthValues.Basic =>
            is.BasicAuthValues(value) && "type" in value && value.type === "basic",
        Bearer: (value: unknown): value is V2AuthValues.Bearer =>
            is.BearerAuthValues(value) && "type" in value && value.type === "bearer",
        Header: (value: unknown): value is V2AuthValues.Header =>
            is.HeaderAuthValues(value) && "type" in value && value.type === "header",
        Oauth: (value: unknown): value is V2AuthValues.Oauth =>
            is.OAuthValues(value) && "type" in value && value.type === "oauth"
    },

    // V2HttpEndpointResponseBody
    V2HttpEndpointResponseBody: {
        Error_: (value: unknown): value is V2HttpEndpointResponseBody.Error_ =>
            isObject(value) && "type" in value && value.type === "error",
        Json: (value: unknown): value is V2HttpEndpointResponseBody.Json =>
            isObject(value) && "type" in value && value.type === "json",
        Stream: (value: unknown): value is V2HttpEndpointResponseBody.Stream =>
            isObject(value) && "type" in value && value.type === "stream"
    },

    // ExampleCodeSample
    ExampleCodeSample: {
        Language: (value: unknown): value is ExampleCodeSample.Language =>
            is.ExampleCodeSampleLanguage(value) && "type" in value && value.type === "language",
        Sdk: (value: unknown): value is ExampleCodeSample.Sdk =>
            is.ExampleCodeSampleSdk(value) && "type" in value && value.type === "sdk"
    },

    // ExampleEndpointSuccessResponse
    ExampleEndpointSuccessResponse: {
        Body: (value: unknown): value is ExampleEndpointSuccessResponse.Body =>
            isObject(value) && "type" in value && value.type === "body",
        Stream: (value: unknown): value is ExampleEndpointSuccessResponse.Stream =>
            isObject(value) && "type" in value && value.type === "stream",
        Sse: (value: unknown): value is ExampleEndpointSuccessResponse.Sse =>
            isObject(value) && "type" in value && value.type === "sse"
    },

    // ExampleQueryParameterShape
    ExampleQueryParameterShape: {
        Single: (value: unknown): value is ExampleQueryParameterShape.Single =>
            isObject(value) && "type" in value && value.type === "single",
        Exploded: (value: unknown): value is ExampleQueryParameterShape.Exploded =>
            isObject(value) && "type" in value && value.type === "exploded",
        CommaSeparated: (value: unknown): value is ExampleQueryParameterShape.CommaSeparated =>
            isObject(value) && "type" in value && value.type === "commaSeparated"
    },

    // ExampleRequestBody
    ExampleRequestBody: {
        InlinedRequestBody: (value: unknown): value is ExampleRequestBody.InlinedRequestBody =>
            is.ExampleInlinedRequestBody(value) && "type" in value && value.type === "inlinedRequestBody",
        Reference: (value: unknown): value is ExampleRequestBody.Reference =>
            is.ExampleTypeReference(value) && "type" in value && value.type === "reference"
    },

    // ExampleResponse
    ExampleResponse: {
        Ok: (value: unknown): value is ExampleResponse.Ok => isObject(value) && "type" in value && value.type === "ok",
        Error_: (value: unknown): value is ExampleResponse.Error_ =>
            is.ExampleEndpointErrorResponse(value) && "type" in value && value.type === "error"
    },

    // FileProperty
    FileProperty: {
        File_: (value: unknown): value is FileProperty.File_ =>
            is.FilePropertySingle(value) && "type" in value && value.type === "file",
        FileArray: (value: unknown): value is FileProperty.FileArray =>
            is.FilePropertyArray(value) && "type" in value && value.type === "fileArray"
    },

    // FileUploadRequestProperty
    FileUploadRequestProperty: {
        File_: (value: unknown): value is FileUploadRequestProperty.File_ =>
            isObject(value) && "type" in value && value.type === "file",
        BodyProperty: (value: unknown): value is FileUploadRequestProperty.BodyProperty =>
            is.FileUploadBodyProperty(value) && "type" in value && value.type === "bodyProperty"
    },

    // HttpEndpointSource
    HttpEndpointSource: {
        Proto: (value: unknown): value is HttpEndpointSource.Proto =>
            is.ProtoSourceInfo(value) && "type" in value && value.type === "proto",
        Openapi: (value: unknown): value is HttpEndpointSource.Openapi =>
            isObject(value) && "type" in value && value.type === "openapi",
        Openrpc: (value: unknown): value is HttpEndpointSource.Openrpc =>
            isObject(value) && "type" in value && value.type === "openrpc"
    },

    // HttpRequestBody
    HttpRequestBody: {
        InlinedRequestBody: (value: unknown): value is HttpRequestBody.InlinedRequestBody =>
            is.InlinedRequestBody(value) && "type" in value && value.type === "inlinedRequestBody",
        Reference: (value: unknown): value is HttpRequestBody.Reference =>
            is.HttpRequestBodyReference(value) && "type" in value && value.type === "reference",
        FileUpload: (value: unknown): value is HttpRequestBody.FileUpload =>
            is.FileUploadRequest(value) && "type" in value && value.type === "fileUpload",
        Bytes: (value: unknown): value is HttpRequestBody.Bytes =>
            is.BytesRequest(value) && "type" in value && value.type === "bytes"
    },

    // HttpResponseBody
    HttpResponseBody: {
        Json: (value: unknown): value is HttpResponseBody.Json =>
            isObject(value) && "type" in value && value.type === "json",
        FileDownload: (value: unknown): value is HttpResponseBody.FileDownload =>
            is.FileDownloadResponse(value) && "type" in value && value.type === "fileDownload",
        Text: (value: unknown): value is HttpResponseBody.Text =>
            is.TextResponse(value) && "type" in value && value.type === "text",
        Bytes: (value: unknown): value is HttpResponseBody.Bytes =>
            is.BytesResponse(value) && "type" in value && value.type === "bytes",
        Streaming: (value: unknown): value is HttpResponseBody.Streaming =>
            isObject(value) && "type" in value && value.type === "streaming",
        StreamParameter: (value: unknown): value is HttpResponseBody.StreamParameter =>
            is.StreamParameterResponse(value) && "type" in value && value.type === "streamParameter"
    },

    // JsonResponse
    JsonResponse: {
        Response: (value: unknown): value is JsonResponse.Response =>
            is.JsonResponseBody(value) && "type" in value && value.type === "response",
        NestedPropertyAsResponse: (value: unknown): value is JsonResponse.NestedPropertyAsResponse =>
            is.JsonResponseBodyWithProperty(value) && "type" in value && value.type === "nestedPropertyAsResponse"
    },

    // NonStreamHttpResponseBody
    NonStreamHttpResponseBody: {
        Json: (value: unknown): value is NonStreamHttpResponseBody.Json =>
            isObject(value) && "type" in value && value.type === "json",
        FileDownload: (value: unknown): value is NonStreamHttpResponseBody.FileDownload =>
            is.FileDownloadResponse(value) && "type" in value && value.type === "fileDownload",
        Text: (value: unknown): value is NonStreamHttpResponseBody.Text =>
            is.TextResponse(value) && "type" in value && value.type === "text",
        Bytes: (value: unknown): value is NonStreamHttpResponseBody.Bytes =>
            is.BytesResponse(value) && "type" in value && value.type === "bytes"
    },

    // Pagination
    Pagination: {
        Cursor: (value: unknown): value is Pagination.Cursor =>
            is.CursorPagination(value) && "type" in value && value.type === "cursor",
        Offset: (value: unknown): value is Pagination.Offset =>
            is.OffsetPagination(value) && "type" in value && value.type === "offset",
        Custom: (value: unknown): value is Pagination.Custom =>
            is.CustomPagination(value) && "type" in value && value.type === "custom"
    },

    // RequestPropertyValue
    RequestPropertyValue: {
        Query: (value: unknown): value is RequestPropertyValue.Query =>
            is.QueryParameter(value) && "type" in value && value.type === "query",
        Body: (value: unknown): value is RequestPropertyValue.Body =>
            is.ObjectProperty(value) && "type" in value && value.type === "body"
    },

    // SdkRequestBodyType
    SdkRequestBodyType: {
        TypeReference: (value: unknown): value is SdkRequestBodyType.TypeReference =>
            is.HttpRequestBodyReference(value) && "type" in value && value.type === "typeReference",
        Bytes: (value: unknown): value is SdkRequestBodyType.Bytes =>
            is.BytesRequest(value) && "type" in value && value.type === "bytes"
    },

    // SdkRequestShape
    SdkRequestShape: {
        JustRequestBody: (value: unknown): value is SdkRequestShape.JustRequestBody =>
            isObject(value) && "type" in value && value.type === "justRequestBody",
        Wrapper: (value: unknown): value is SdkRequestShape.Wrapper =>
            is.SdkRequestWrapper(value) && "type" in value && value.type === "wrapper"
    },

    // StreamingResponse
    StreamingResponse: {
        Json: (value: unknown): value is StreamingResponse.Json =>
            is.JsonStreamChunk(value) && "type" in value && value.type === "json",
        Text: (value: unknown): value is StreamingResponse.Text =>
            is.TextStreamChunk(value) && "type" in value && value.type === "text",
        Sse: (value: unknown): value is StreamingResponse.Sse =>
            is.SseStreamChunk(value) && "type" in value && value.type === "sse"
    },

    // Transport
    Transport: {
        Http: (value: unknown): value is Transport.Http => isObject(value) && "type" in value && value.type === "http",
        Grpc: (value: unknown): value is Transport.Grpc =>
            is.GrpcTransport(value) && "type" in value && value.type === "grpc"
    },

    // ApiDefinitionSource
    ApiDefinitionSource: {
        Proto: (value: unknown): value is ApiDefinitionSource.Proto =>
            is.ProtoSource(value) && "type" in value && value.type === "proto",
        Openapi: (value: unknown): value is ApiDefinitionSource.Openapi =>
            isObject(value) && "type" in value && value.type === "openapi"
    },

    // ApiVersionScheme
    ApiVersionScheme: {
        Header: (value: unknown): value is ApiVersionScheme.Header =>
            isObject(value) && "type" in value && value.type === "header"
    },

    // ErrorDiscriminationStrategy
    ErrorDiscriminationStrategy: {
        StatusCode: (value: unknown): value is ErrorDiscriminationStrategy.StatusCode =>
            isObject(value) && "type" in value && value.type === "statusCode",
        Property: (value: unknown): value is ErrorDiscriminationStrategy.Property =>
            isObject(value) && "type" in value && value.type === "property"
    },

    // ProtobufType
    ProtobufType: {
        WellKnown: (value: unknown): value is ProtobufType.WellKnown =>
            isObject(value) && "type" in value && value.type === "wellKnown",
        UserDefined: (value: unknown): value is ProtobufType.UserDefined =>
            is.UserDefinedProtobufType(value) && "type" in value && value.type === "userDefined"
    },

    // WellKnownProtobufType
    WellKnownProtobufType: {
        Any: (value: unknown): value is WellKnownProtobufType.Any =>
            isObject(value) && "type" in value && value.type === "any",
        Api: (value: unknown): value is WellKnownProtobufType.Api =>
            isObject(value) && "type" in value && value.type === "api",
        BoolValue: (value: unknown): value is WellKnownProtobufType.BoolValue =>
            isObject(value) && "type" in value && value.type === "boolValue",
        BytesValue: (value: unknown): value is WellKnownProtobufType.BytesValue =>
            isObject(value) && "type" in value && value.type === "bytesValue",
        DoubleValue: (value: unknown): value is WellKnownProtobufType.DoubleValue =>
            isObject(value) && "type" in value && value.type === "doubleValue",
        Duration: (value: unknown): value is WellKnownProtobufType.Duration =>
            isObject(value) && "type" in value && value.type === "duration",
        Empty: (value: unknown): value is WellKnownProtobufType.Empty =>
            isObject(value) && "type" in value && value.type === "empty",
        Enum: (value: unknown): value is WellKnownProtobufType.Enum =>
            isObject(value) && "type" in value && value.type === "enum",
        EnumValue: (value: unknown): value is WellKnownProtobufType.EnumValue =>
            isObject(value) && "type" in value && value.type === "enumValue",
        Field: (value: unknown): value is WellKnownProtobufType.Field =>
            isObject(value) && "type" in value && value.type === "field",
        FieldCardinality: (value: unknown): value is WellKnownProtobufType.FieldCardinality =>
            isObject(value) && "type" in value && value.type === "fieldCardinality",
        FieldKind: (value: unknown): value is WellKnownProtobufType.FieldKind =>
            isObject(value) && "type" in value && value.type === "fieldKind",
        FieldMask: (value: unknown): value is WellKnownProtobufType.FieldMask =>
            isObject(value) && "type" in value && value.type === "fieldMask",
        FloatValue: (value: unknown): value is WellKnownProtobufType.FloatValue =>
            isObject(value) && "type" in value && value.type === "floatValue",
        Int32Value: (value: unknown): value is WellKnownProtobufType.Int32Value =>
            isObject(value) && "type" in value && value.type === "int32Value",
        Int64Value: (value: unknown): value is WellKnownProtobufType.Int64Value =>
            isObject(value) && "type" in value && value.type === "int64Value",
        ListValue: (value: unknown): value is WellKnownProtobufType.ListValue =>
            isObject(value) && "type" in value && value.type === "listValue",
        Method: (value: unknown): value is WellKnownProtobufType.Method =>
            isObject(value) && "type" in value && value.type === "method",
        Mixin: (value: unknown): value is WellKnownProtobufType.Mixin =>
            isObject(value) && "type" in value && value.type === "mixin",
        NullValue: (value: unknown): value is WellKnownProtobufType.NullValue =>
            isObject(value) && "type" in value && value.type === "nullValue",
        Option: (value: unknown): value is WellKnownProtobufType.Option =>
            isObject(value) && "type" in value && value.type === "option",
        SourceContext: (value: unknown): value is WellKnownProtobufType.SourceContext =>
            isObject(value) && "type" in value && value.type === "sourceContext",
        StringValue: (value: unknown): value is WellKnownProtobufType.StringValue =>
            isObject(value) && "type" in value && value.type === "stringValue",
        Struct: (value: unknown): value is WellKnownProtobufType.Struct =>
            isObject(value) && "type" in value && value.type === "struct",
        Syntax: (value: unknown): value is WellKnownProtobufType.Syntax =>
            isObject(value) && "type" in value && value.type === "syntax",
        Timestamp: (value: unknown): value is WellKnownProtobufType.Timestamp =>
            isObject(value) && "type" in value && value.type === "timestamp",
        Type: (value: unknown): value is WellKnownProtobufType.Type =>
            isObject(value) && "type" in value && value.type === "type",
        Uint32Value: (value: unknown): value is WellKnownProtobufType.Uint32Value =>
            isObject(value) && "type" in value && value.type === "uint32Value",
        Uint64Value: (value: unknown): value is WellKnownProtobufType.Uint64Value =>
            isObject(value) && "type" in value && value.type === "uint64Value",
        Value: (value: unknown): value is WellKnownProtobufType.Value =>
            isObject(value) && "type" in value && value.type === "value"
    },

    // PublishTarget
    PublishTarget: {
        Postman: (value: unknown): value is PublishTarget.Postman =>
            isObject(value) && "type" in value && value.type === "postman",
        Npm: (value: unknown): value is PublishTarget.Npm => isObject(value) && "type" in value && value.type === "npm",
        Maven: (value: unknown): value is PublishTarget.Maven =>
            isObject(value) && "type" in value && value.type === "maven",
        Pypi: (value: unknown): value is PublishTarget.Pypi =>
            isObject(value) && "type" in value && value.type === "pypi"
    },

    // PublishingConfig
    PublishingConfig: {
        Github: (value: unknown): value is PublishingConfig.Github =>
            isObject(value) && "type" in value && value.type === "github",
        Direct: (value: unknown): value is PublishingConfig.Direct =>
            isObject(value) && "type" in value && value.type === "direct",
        Filesystem: (value: unknown): value is PublishingConfig.Filesystem =>
            is.Filesystem(value) && "type" in value && value.type === "filesystem"
    },

    // ContainerType
    ContainerType: {
        List: (value: unknown): value is ContainerType.List =>
            isObject(value) && "type" in value && value.type === "list",
        Map: (value: unknown): value is ContainerType.Map =>
            is.MapType(value) && "type" in value && value.type === "map",
        Nullable: (value: unknown): value is ContainerType.Nullable =>
            isObject(value) && "type" in value && value.type === "nullable",
        Optional: (value: unknown): value is ContainerType.Optional =>
            isObject(value) && "type" in value && value.type === "optional",
        Set: (value: unknown): value is ContainerType.Set => isObject(value) && "type" in value && value.type === "set",
        Literal: (value: unknown): value is ContainerType.Literal =>
            isObject(value) && "type" in value && value.type === "literal"
    },

    // ExampleContainer
    ExampleContainer: {
        List: (value: unknown): value is ExampleContainer.List =>
            is.ExampleListContainer(value) && "type" in value && value.type === "list",
        Set: (value: unknown): value is ExampleContainer.Set =>
            is.ExampleSetContainer(value) && "type" in value && value.type === "set",
        Optional: (value: unknown): value is ExampleContainer.Optional =>
            is.ExampleOptionalContainer(value) && "type" in value && value.type === "optional",
        Nullable: (value: unknown): value is ExampleContainer.Nullable =>
            is.ExampleNullableContainer(value) && "type" in value && value.type === "nullable",
        Map: (value: unknown): value is ExampleContainer.Map =>
            is.ExampleMapContainer(value) && "type" in value && value.type === "map",
        Literal: (value: unknown): value is ExampleContainer.Literal =>
            is.ExampleLiteralContainer(value) && "type" in value && value.type === "literal"
    },

    // ExamplePrimitive
    ExamplePrimitive: {
        Integer: (value: unknown): value is ExamplePrimitive.Integer =>
            isObject(value) && "type" in value && value.type === "integer",
        Long: (value: unknown): value is ExamplePrimitive.Long =>
            isObject(value) && "type" in value && value.type === "long",
        Uint: (value: unknown): value is ExamplePrimitive.Uint =>
            isObject(value) && "type" in value && value.type === "uint",
        Uint64: (value: unknown): value is ExamplePrimitive.Uint64 =>
            isObject(value) && "type" in value && value.type === "uint64",
        Float: (value: unknown): value is ExamplePrimitive.Float =>
            isObject(value) && "type" in value && value.type === "float",
        Double: (value: unknown): value is ExamplePrimitive.Double =>
            isObject(value) && "type" in value && value.type === "double",
        Boolean: (value: unknown): value is ExamplePrimitive.Boolean =>
            isObject(value) && "type" in value && value.type === "boolean",
        String: (value: unknown): value is ExamplePrimitive.String =>
            isObject(value) && "type" in value && value.type === "string",
        Date_: (value: unknown): value is ExamplePrimitive.Date_ =>
            isObject(value) && "type" in value && value.type === "date",
        Datetime: (value: unknown): value is ExamplePrimitive.Datetime =>
            is.ExampleDatetime(value) && "type" in value && value.type === "datetime",
        Uuid: (value: unknown): value is ExamplePrimitive.Uuid =>
            isObject(value) && "type" in value && value.type === "uuid",
        Base64: (value: unknown): value is ExamplePrimitive.Base64 =>
            isObject(value) && "type" in value && value.type === "base64",
        BigInteger: (value: unknown): value is ExamplePrimitive.BigInteger =>
            isObject(value) && "type" in value && value.type === "bigInteger"
    },

    // ExampleSingleUnionTypeProperties
    ExampleSingleUnionTypeProperties: {
        SamePropertiesAsObject: (value: unknown): value is ExampleSingleUnionTypeProperties.SamePropertiesAsObject =>
            is.ExampleObjectTypeWithTypeId(value) && "type" in value && value.type === "samePropertiesAsObject",
        SingleProperty: (value: unknown): value is ExampleSingleUnionTypeProperties.SingleProperty =>
            is.ExampleTypeReference(value) && "type" in value && value.type === "singleProperty",
        NoProperties: (value: unknown): value is ExampleSingleUnionTypeProperties.NoProperties =>
            isObject(value) && "type" in value && value.type === "noProperties"
    },

    // ExampleTypeReferenceShape
    ExampleTypeReferenceShape: {
        Primitive: (value: unknown): value is ExampleTypeReferenceShape.Primitive =>
            isObject(value) && "type" in value && value.type === "primitive",
        Container: (value: unknown): value is ExampleTypeReferenceShape.Container =>
            isObject(value) && "type" in value && value.type === "container",
        Unknown: (value: unknown): value is ExampleTypeReferenceShape.Unknown =>
            isObject(value) && "type" in value && value.type === "unknown",
        Named: (value: unknown): value is ExampleTypeReferenceShape.Named =>
            is.ExampleNamedType(value) && "type" in value && value.type === "named"
    },

    // ExampleTypeShape
    ExampleTypeShape: {
        Alias: (value: unknown): value is ExampleTypeShape.Alias =>
            is.ExampleAliasType(value) && "type" in value && value.type === "alias",
        Enum: (value: unknown): value is ExampleTypeShape.Enum =>
            is.ExampleEnumType(value) && "type" in value && value.type === "enum",
        Object_: (value: unknown): value is ExampleTypeShape.Object_ =>
            is.ExampleObjectType(value) && "type" in value && value.type === "object",
        Union: (value: unknown): value is ExampleTypeShape.Union =>
            is.ExampleUnionType(value) && "type" in value && value.type === "union",
        UndiscriminatedUnion: (value: unknown): value is ExampleTypeShape.UndiscriminatedUnion =>
            is.ExampleUndiscriminatedUnionType(value) && "type" in value && value.type === "undiscriminatedUnion"
    },

    // Literal
    Literal: {
        String: (value: unknown): value is Literal.String =>
            isObject(value) && "type" in value && value.type === "string",
        Boolean: (value: unknown): value is Literal.Boolean =>
            isObject(value) && "type" in value && value.type === "boolean"
    },

    // NamedTypeDefault
    NamedTypeDefault: {
        Enum: (value: unknown): value is NamedTypeDefault.Enum =>
            is.EnumValue(value) && "type" in value && value.type === "enum"
    },

    // PrimitiveTypeV2
    PrimitiveTypeV2: {
        Integer: (value: unknown): value is PrimitiveTypeV2.Integer =>
            is.IntegerType(value) && "type" in value && value.type === "integer",
        Long: (value: unknown): value is PrimitiveTypeV2.Long =>
            is.LongType(value) && "type" in value && value.type === "long",
        Uint: (value: unknown): value is PrimitiveTypeV2.Uint =>
            is.UintType(value) && "type" in value && value.type === "uint",
        Uint64: (value: unknown): value is PrimitiveTypeV2.Uint64 =>
            is.Uint64Type(value) && "type" in value && value.type === "uint64",
        Float: (value: unknown): value is PrimitiveTypeV2.Float =>
            is.FloatType(value) && "type" in value && value.type === "float",
        Double: (value: unknown): value is PrimitiveTypeV2.Double =>
            is.DoubleType(value) && "type" in value && value.type === "double",
        Boolean: (value: unknown): value is PrimitiveTypeV2.Boolean =>
            is.BooleanType(value) && "type" in value && value.type === "boolean",
        String: (value: unknown): value is PrimitiveTypeV2.String =>
            is.StringType(value) && "type" in value && value.type === "string",
        Date_: (value: unknown): value is PrimitiveTypeV2.Date_ =>
            is.DateType(value) && "type" in value && value.type === "date",
        DateTime: (value: unknown): value is PrimitiveTypeV2.DateTime =>
            is.DateTimeType(value) && "type" in value && value.type === "dateTime",
        Uuid: (value: unknown): value is PrimitiveTypeV2.Uuid =>
            is.UuidType(value) && "type" in value && value.type === "uuid",
        Base64: (value: unknown): value is PrimitiveTypeV2.Base64 =>
            is.Base64Type(value) && "type" in value && value.type === "base64",
        BigInteger: (value: unknown): value is PrimitiveTypeV2.BigInteger =>
            is.BigIntegerType(value) && "type" in value && value.type === "bigInteger"
    },

    // ResolvedTypeReference
    ResolvedTypeReference: {
        Container: (value: unknown): value is ResolvedTypeReference.Container =>
            isObject(value) && "type" in value && value.type === "container",
        Named: (value: unknown): value is ResolvedTypeReference.Named =>
            is.ResolvedNamedType(value) && "type" in value && value.type === "named",
        Primitive: (value: unknown): value is ResolvedTypeReference.Primitive =>
            isObject(value) && "type" in value && value.type === "primitive",
        Unknown: (value: unknown): value is ResolvedTypeReference.Unknown =>
            isObject(value) && "type" in value && value.type === "unknown"
    },

    // Source
    Source: {
        Proto: (value: unknown): value is Source.Proto => isObject(value) && "type" in value && value.type === "proto"
    },

    // Type
    Type: {
        Alias: (value: unknown): value is Type.Alias =>
            is.AliasTypeDeclaration(value) && "type" in value && value.type === "alias",
        Enum: (value: unknown): value is Type.Enum =>
            is.EnumTypeDeclaration(value) && "type" in value && value.type === "enum",
        Object_: (value: unknown): value is Type.Object_ =>
            is.ObjectTypeDeclaration(value) && "type" in value && value.type === "object",
        Union: (value: unknown): value is Type.Union =>
            is.UnionTypeDeclaration(value) && "type" in value && value.type === "union",
        UndiscriminatedUnion: (value: unknown): value is Type.UndiscriminatedUnion =>
            is.UndiscriminatedUnionTypeDeclaration(value) && "type" in value && value.type === "undiscriminatedUnion"
    },

    // TypeReference
    TypeReference: {
        Container: (value: unknown): value is TypeReference.Container =>
            isObject(value) && "type" in value && value.type === "container",
        Named: (value: unknown): value is TypeReference.Named =>
            is.NamedType(value) && "type" in value && value.type === "named",
        Primitive: (value: unknown): value is TypeReference.Primitive =>
            isObject(value) && "type" in value && value.type === "primitive",
        Unknown: (value: unknown): value is TypeReference.Unknown =>
            isObject(value) && "type" in value && value.type === "unknown"
    },

    // WebhookPayload
    WebhookPayload: {
        InlinedPayload: (value: unknown): value is WebhookPayload.InlinedPayload =>
            is.InlinedWebhookPayload(value) && "type" in value && value.type === "inlinedPayload",
        Reference: (value: unknown): value is WebhookPayload.Reference =>
            is.WebhookPayloadReference(value) && "type" in value && value.type === "reference"
    },

    // ExampleWebSocketMessageBody
    ExampleWebSocketMessageBody: {
        InlinedBody: (value: unknown): value is ExampleWebSocketMessageBody.InlinedBody =>
            is.ExampleInlinedRequestBody(value) && "type" in value && value.type === "inlinedBody",
        Reference: (value: unknown): value is ExampleWebSocketMessageBody.Reference =>
            is.ExampleTypeReference(value) && "type" in value && value.type === "reference"
    },

    // WebSocketMessageBody
    WebSocketMessageBody: {
        InlinedBody: (value: unknown): value is WebSocketMessageBody.InlinedBody =>
            is.InlinedWebSocketMessageBody(value) && "type" in value && value.type === "inlinedBody",
        Reference: (value: unknown): value is WebSocketMessageBody.Reference =>
            is.WebSocketMessageBodyReference(value) && "type" in value && value.type === "reference"
    }
};
