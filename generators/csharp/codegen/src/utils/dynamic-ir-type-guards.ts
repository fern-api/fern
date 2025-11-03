/**
 * TYPE GUARDS FOR @fern-api/dynamic-ir-sdk
 *
 * This file contains runtime type guards for validating objects from the Dynamic IR SDK.
 *
 * ============================================================================================
 * INSTRUCTIONS FOR UPDATING THIS FILE WHEN @fern-api/dynamic-ir-sdk PACKAGE IS UPDATED:
 * ============================================================================================
 *
 * 1. LOCATE INTERFACE DEFINITIONS:
 *    - All interfaces are in: node_modules/@fern-api/dynamic-ir-sdk/api/resources/dynamic/
 *    - ONLY include types from the `dynamic` namespace (FernIr.dynamic.*)
 *    - EXCLUDE types from `generatorExec` namespace - they are NOT in FernIr.dynamic
 *
 * 2. STANDARD INTERFACE TYPEGUARDS:
 *    - For each interface, create a typeguard that checks REQUIRED fields only
 *    - Use this structure:
 *      InterfaceName: (value: unknown): value is FernIr.dynamic.InterfaceName =>
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
 *    - Found in files like Auth.d.ts, Request.d.ts, etc.
 *    - Pattern: "export type UnionName = UnionName.Variant1 | UnionName.Variant2"
 *              "export declare namespace UnionName { interface Variant1 extends ParentInterface { type: "variant1" } }"
 *    - Structure as nested objects:
 *      UnionName: {
 *          Variant1: (value: unknown): value is FernIr.dynamic.UnionName.Variant1 =>
 *              is.ParentInterface(value) && "type" in value && value.type === "variant1",
 *          Variant2: (value: unknown): value is FernIr.dynamic.UnionName.Variant2 =>
 *              is.ParentInterface(value) && "type" in value && value.type === "variant2"
 *      }
 *
 * 6. OPTIMIZATION RULES:
 *    - For union variants: Use parent interface check (e.g., is.BasicAuth(value))
 *    - DO NOT add redundant isObject(value) after a parent check
 *    - Parent checks already include isObject validation
 *
 * 7. CATEGORIZATION:
 *    - Group typeguards by their location in the SDK:
 *      • Common Types (from /resources/dynamic/resources/commons/)
 *      • Auth Types (from /resources/dynamic/resources/auth/)
 *      • Environment Types (from /resources/dynamic/resources/environment/)
 *      • Types Types (from /resources/dynamic/resources/types/)
 *      • Endpoints Types (from /resources/dynamic/resources/endpoints/)
 *      • IR Types (from /resources/dynamic/resources/ir/)
 *      • Variables Types (from /resources/dynamic/resources/variables/)
 *      • Snippets Types (from /resources/dynamic/resources/snippets/)
 *      • Discriminated Unions (at the end)
 *
 * 8. NAMING CONVENTIONS:
 *    - Use exact interface names from the SDK
 *    - For interfaces ending in underscore (e.g., Error_), keep the underscore
 *    - For discriminated unions, use PascalCase variant names from the namespace
 *
 * 9. VERIFICATION:
 *    - After updating, run linter to check for errors
 *    - Ensure all FernIr.dynamic.* types are exported from the SDK
 *    - Test that no TypeScript compilation errors occur
 *
 * CURRENT STATS: 51 standard typeguards, 10 discriminated unions (34 variants)
 * ============================================================================================
 */

import { FernIr } from "@fern-api/dynamic-ir-sdk";

const isObject = (value: unknown): value is object =>
    value != null && typeof value === "object" && !Array.isArray(value);

export const is = {
    // Common Types
    FernFilepath: (value: unknown): value is FernIr.dynamic.FernFilepath =>
        isObject(value) &&
        "allParts" in value &&
        "packagePath" in value &&
        Array.isArray(value.allParts) &&
        Array.isArray(value.packagePath),
    Name: (value: unknown): value is FernIr.dynamic.Name =>
        isObject(value) &&
        "originalName" in value &&
        "camelCase" in value &&
        "pascalCase" in value &&
        "snakeCase" in value &&
        "screamingSnakeCase" in value &&
        typeof value.originalName === "string",
    NameAndWireValue: (value: unknown): value is FernIr.dynamic.NameAndWireValue =>
        isObject(value) && "wireValue" in value && "name" in value && typeof value.wireValue === "string",
    SafeAndUnsafeString: (value: unknown): value is FernIr.dynamic.SafeAndUnsafeString =>
        isObject(value) &&
        "unsafeName" in value &&
        "safeName" in value &&
        typeof value.unsafeName === "string" &&
        typeof value.safeName === "string",
    WithDocs: (value: unknown): value is FernIr.dynamic.WithDocs => isObject(value),

    // Auth Types
    BasicAuth: (value: unknown): value is FernIr.dynamic.BasicAuth =>
        isObject(value) && "username" in value && "password" in value,
    BasicAuthValues: (value: unknown): value is FernIr.dynamic.BasicAuthValues =>
        isObject(value) &&
        "username" in value &&
        "password" in value &&
        typeof value.username === "string" &&
        typeof value.password === "string",
    BearerAuth: (value: unknown): value is FernIr.dynamic.BearerAuth => isObject(value) && "token" in value,
    BearerAuthValues: (value: unknown): value is FernIr.dynamic.BearerAuthValues =>
        isObject(value) && "token" in value && typeof value.token === "string",
    HeaderAuth: (value: unknown): value is FernIr.dynamic.HeaderAuth => isObject(value) && "header" in value,
    HeaderAuthValues: (value: unknown): value is FernIr.dynamic.HeaderAuthValues => isObject(value),
    InferredAuth: (value: unknown): value is FernIr.dynamic.InferredAuth => isObject(value),
    InferredAuthValues: (value: unknown): value is FernIr.dynamic.InferredAuthValues => isObject(value),
    OAuth: (value: unknown): value is FernIr.dynamic.OAuth =>
        isObject(value) && "clientId" in value && "clientSecret" in value,
    OAuthValues: (value: unknown): value is FernIr.dynamic.OAuthValues =>
        isObject(value) &&
        "clientId" in value &&
        "clientSecret" in value &&
        typeof value.clientId === "string" &&
        typeof value.clientSecret === "string",

    // Environment Types
    EnvironmentBaseUrlWithId: (value: unknown): value is FernIr.dynamic.EnvironmentBaseUrlWithId =>
        isObject(value) && "id" in value && "name" in value,
    EnvironmentsConfig: (value: unknown): value is FernIr.dynamic.EnvironmentsConfig =>
        isObject(value) && "environments" in value,
    MultipleBaseUrlsEnvironment: (value: unknown): value is FernIr.dynamic.MultipleBaseUrlsEnvironment =>
        isObject(value) && "id" in value && "name" in value && "urls" in value && isObject(value.urls),
    MultipleBaseUrlsEnvironments: (value: unknown): value is FernIr.dynamic.MultipleBaseUrlsEnvironments =>
        isObject(value) &&
        "baseUrls" in value &&
        "environments" in value &&
        Array.isArray(value.baseUrls) &&
        Array.isArray(value.environments),
    SingleBaseUrlEnvironment: (value: unknown): value is FernIr.dynamic.SingleBaseUrlEnvironment =>
        isObject(value) && "id" in value && "name" in value && "url" in value,
    SingleBaseUrlEnvironments: (value: unknown): value is FernIr.dynamic.SingleBaseUrlEnvironments =>
        isObject(value) && "environments" in value && Array.isArray(value.environments),

    // Types Types
    AliasType: (value: unknown): value is FernIr.dynamic.AliasType =>
        isObject(value) && "declaration" in value && "typeReference" in value,
    DiscriminatedUnionType: (value: unknown): value is FernIr.dynamic.DiscriminatedUnionType =>
        isObject(value) &&
        "declaration" in value &&
        "discriminant" in value &&
        "types" in value &&
        isObject(value.types),
    EnumType: (value: unknown): value is FernIr.dynamic.EnumType =>
        isObject(value) && "declaration" in value && "values" in value && Array.isArray(value.values),
    MapType: (value: unknown): value is FernIr.dynamic.MapType => isObject(value) && "key" in value && "value" in value,
    NamedParameter: (value: unknown): value is FernIr.dynamic.NamedParameter =>
        isObject(value) && "name" in value && "typeReference" in value,
    ObjectType: (value: unknown): value is FernIr.dynamic.ObjectType =>
        isObject(value) && "declaration" in value && "properties" in value && Array.isArray(value.properties),
    SingleDiscriminatedUnionTypeNoProperties: (
        value: unknown
    ): value is FernIr.dynamic.SingleDiscriminatedUnionTypeNoProperties =>
        isObject(value) && "discriminantValue" in value,
    SingleDiscriminatedUnionTypeObject: (value: unknown): value is FernIr.dynamic.SingleDiscriminatedUnionTypeObject =>
        isObject(value) &&
        "typeId" in value &&
        "discriminantValue" in value &&
        "properties" in value &&
        Array.isArray(value.properties),
    SingleDiscriminatedUnionTypeSingleProperty: (
        value: unknown
    ): value is FernIr.dynamic.SingleDiscriminatedUnionTypeSingleProperty =>
        isObject(value) && "typeReference" in value && "discriminantValue" in value,
    UndiscriminatedUnionType: (value: unknown): value is FernIr.dynamic.UndiscriminatedUnionType =>
        isObject(value) && "declaration" in value && "types" in value && Array.isArray(value.types),

    // Endpoints Types
    BodyRequest: (value: unknown): value is FernIr.dynamic.BodyRequest => isObject(value),
    Endpoint: (value: unknown): value is FernIr.dynamic.Endpoint =>
        isObject(value) && "declaration" in value && "location" in value && "request" in value && "response" in value,
    EndpointExample: (value: unknown): value is FernIr.dynamic.EndpointExample =>
        isObject(value) && "id" in value && typeof value.id === "string",
    EndpointLocation: (value: unknown): value is FernIr.dynamic.EndpointLocation =>
        isObject(value) && "method" in value && "path" in value && typeof value.path === "string",
    FileUploadRequestBody: (value: unknown): value is FernIr.dynamic.FileUploadRequestBody =>
        isObject(value) && "properties" in value && Array.isArray(value.properties),
    InlinedRequest: (value: unknown): value is FernIr.dynamic.InlinedRequest =>
        isObject(value) && "declaration" in value,
    InlinedRequestMetadata: (value: unknown): value is FernIr.dynamic.InlinedRequestMetadata =>
        isObject(value) &&
        "includePathParameters" in value &&
        "onlyPathParameters" in value &&
        typeof value.includePathParameters === "boolean" &&
        typeof value.onlyPathParameters === "boolean",
    ReferencedRequestBody: (value: unknown): value is FernIr.dynamic.ReferencedRequestBody =>
        isObject(value) && "bodyKey" in value && "bodyType" in value,

    // IR Types
    DynamicIntermediateRepresentation: (value: unknown): value is FernIr.dynamic.DynamicIntermediateRepresentation =>
        isObject(value) &&
        "version" in value &&
        "types" in value &&
        "endpoints" in value &&
        isObject(value.types) &&
        isObject(value.endpoints),
    GeneratorConfig: (value: unknown): value is FernIr.dynamic.GeneratorConfig =>
        isObject(value) &&
        "apiName" in value &&
        "organization" in value &&
        "outputConfig" in value &&
        typeof value.apiName === "string" &&
        typeof value.organization === "string",
    GoPublishInfo: (value: unknown): value is FernIr.dynamic.GoPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "repoUrl" in value &&
        typeof value.version === "string" &&
        typeof value.repoUrl === "string",
    MavenPublishInfo: (value: unknown): value is FernIr.dynamic.MavenPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "coordinate" in value &&
        typeof value.version === "string" &&
        typeof value.coordinate === "string",
    NpmPublishInfo: (value: unknown): value is FernIr.dynamic.NpmPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "packageName" in value &&
        typeof value.version === "string" &&
        typeof value.packageName === "string",
    NugetPublishInfo: (value: unknown): value is FernIr.dynamic.NugetPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "packageName" in value &&
        typeof value.version === "string" &&
        typeof value.packageName === "string",
    PypiPublishInfo: (value: unknown): value is FernIr.dynamic.PypiPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "packageName" in value &&
        typeof value.version === "string" &&
        typeof value.packageName === "string",
    RubyGemsPublishInfo: (value: unknown): value is FernIr.dynamic.RubyGemsPublishInfo =>
        isObject(value) &&
        "version" in value &&
        "packageName" in value &&
        typeof value.version === "string" &&
        typeof value.packageName === "string",

    // Variables Types
    VariableDeclaration: (value: unknown): value is FernIr.dynamic.VariableDeclaration =>
        isObject(value) && "id" in value && "name" in value && "typeReference" in value && typeof value.id === "string",

    // Snippets Types
    EndpointSnippetRequest: (value: unknown): value is FernIr.dynamic.EndpointSnippetRequest =>
        isObject(value) && "endpoint" in value,
    EndpointSnippetResponse: (value: unknown): value is FernIr.dynamic.EndpointSnippetResponse =>
        isObject(value) && "snippet" in value && typeof value.snippet === "string",
    Error_: (value: unknown): value is FernIr.dynamic.Error_ =>
        isObject(value) && "severity" in value && "message" in value && typeof value.message === "string",

    // Discriminated Unions
    Auth: {
        Basic: (value: unknown): value is FernIr.dynamic.Auth.Basic =>
            is.BasicAuth(value) && "type" in value && value.type === "basic",
        Bearer: (value: unknown): value is FernIr.dynamic.Auth.Bearer =>
            is.BearerAuth(value) && "type" in value && value.type === "bearer",
        Header: (value: unknown): value is FernIr.dynamic.Auth.Header =>
            is.HeaderAuth(value) && "type" in value && value.type === "header",
        Inferred: (value: unknown): value is FernIr.dynamic.Auth.Inferred =>
            is.InferredAuth(value) && "type" in value && value.type === "inferred",
        Oauth: (value: unknown): value is FernIr.dynamic.Auth.Oauth =>
            is.OAuth(value) && "type" in value && value.type === "oauth"
    },

    AuthValues: {
        Basic: (value: unknown): value is FernIr.dynamic.AuthValues.Basic =>
            is.BasicAuthValues(value) && "type" in value && value.type === "basic",
        Bearer: (value: unknown): value is FernIr.dynamic.AuthValues.Bearer =>
            is.BearerAuthValues(value) && "type" in value && value.type === "bearer",
        Header: (value: unknown): value is FernIr.dynamic.AuthValues.Header =>
            is.HeaderAuthValues(value) && "type" in value && value.type === "header",
        Inferred: (value: unknown): value is FernIr.dynamic.AuthValues.Inferred =>
            is.InferredAuthValues(value) && "type" in value && value.type === "inferred",
        Oauth: (value: unknown): value is FernIr.dynamic.AuthValues.Oauth =>
            is.OAuthValues(value) && "type" in value && value.type === "oauth"
    },

    Environments: {
        MultipleBaseUrls: (value: unknown): value is FernIr.dynamic.Environments.MultipleBaseUrls =>
            is.MultipleBaseUrlsEnvironments(value) && "type" in value && value.type === "multipleBaseUrls",
        SingleBaseUrl: (value: unknown): value is FernIr.dynamic.Environments.SingleBaseUrl =>
            is.SingleBaseUrlEnvironments(value) && "type" in value && value.type === "singleBaseUrl"
    },

    FileUploadRequestBodyProperty: {
        BodyProperty: (value: unknown): value is FernIr.dynamic.FileUploadRequestBodyProperty.BodyProperty =>
            is.NamedParameter(value) && "type" in value && value.type === "bodyProperty",
        FileArray: (value: unknown): value is FernIr.dynamic.FileUploadRequestBodyProperty.FileArray =>
            is.NameAndWireValue(value) && "type" in value && value.type === "fileArray",
        File_: (value: unknown): value is FernIr.dynamic.FileUploadRequestBodyProperty.File_ =>
            is.NameAndWireValue(value) && "type" in value && value.type === "file"
    },

    InlinedRequestBody: {
        FileUpload: (value: unknown): value is FernIr.dynamic.InlinedRequestBody.FileUpload =>
            is.FileUploadRequestBody(value) && "type" in value && value.type === "fileUpload",
        Referenced: (value: unknown): value is FernIr.dynamic.InlinedRequestBody.Referenced =>
            is.ReferencedRequestBody(value) && "type" in value && value.type === "referenced"
    },

    AnyNamedType: (value: unknown): value is FernIr.dynamic.NamedType =>
        is.NamedType.Alias(value) ||
        is.NamedType.DiscriminatedUnion(value) ||
        is.NamedType.Enum(value) ||
        is.NamedType.Object_(value) ||
        is.NamedType.UndiscriminatedUnion(value),

    NamedType: {
        Alias: (value: unknown): value is FernIr.dynamic.NamedType.Alias =>
            is.AliasType(value) && "type" in value && value.type === "alias",
        DiscriminatedUnion: (value: unknown): value is FernIr.dynamic.NamedType.DiscriminatedUnion =>
            is.DiscriminatedUnionType(value) && "type" in value && value.type === "discriminatedUnion",
        Enum: (value: unknown): value is FernIr.dynamic.NamedType.Enum =>
            is.EnumType(value) && "type" in value && value.type === "enum",
        Object_: (value: unknown): value is FernIr.dynamic.NamedType.Object_ =>
            is.ObjectType(value) && "type" in value && value.type === "object",
        UndiscriminatedUnion: (value: unknown): value is FernIr.dynamic.NamedType.UndiscriminatedUnion =>
            is.UndiscriminatedUnionType(value) && "type" in value && value.type === "undiscriminatedUnion"
    },

    PublishInfo: {
        Go: (value: unknown): value is FernIr.dynamic.PublishInfo.Go =>
            is.GoPublishInfo(value) && "type" in value && value.type === "go",
        Maven: (value: unknown): value is FernIr.dynamic.PublishInfo.Maven =>
            is.MavenPublishInfo(value) && "type" in value && value.type === "maven",
        Npm: (value: unknown): value is FernIr.dynamic.PublishInfo.Npm =>
            is.NpmPublishInfo(value) && "type" in value && value.type === "npm",
        Nuget: (value: unknown): value is FernIr.dynamic.PublishInfo.Nuget =>
            is.NugetPublishInfo(value) && "type" in value && value.type === "nuget",
        Pypi: (value: unknown): value is FernIr.dynamic.PublishInfo.Pypi =>
            is.PypiPublishInfo(value) && "type" in value && value.type === "pypi",
        Rubygems: (value: unknown): value is FernIr.dynamic.PublishInfo.Rubygems =>
            is.RubyGemsPublishInfo(value) && "type" in value && value.type === "rubygems"
    },

    Request: {
        Body: (value: unknown): value is FernIr.dynamic.Request.Body =>
            is.BodyRequest(value) && "type" in value && value.type === "body",
        Inlined: (value: unknown): value is FernIr.dynamic.Request.Inlined =>
            is.InlinedRequest(value) && "type" in value && value.type === "inlined"
    },

    SingleDiscriminatedUnionType: {
        NoProperties: (value: unknown): value is FernIr.dynamic.SingleDiscriminatedUnionType.NoProperties =>
            is.SingleDiscriminatedUnionTypeNoProperties(value) && "type" in value && value.type === "noProperties",
        SamePropertiesAsObject: (
            value: unknown
        ): value is FernIr.dynamic.SingleDiscriminatedUnionType.SamePropertiesAsObject =>
            is.SingleDiscriminatedUnionTypeObject(value) && "type" in value && value.type === "samePropertiesAsObject",
        SingleProperty: (value: unknown): value is FernIr.dynamic.SingleDiscriminatedUnionType.SingleProperty =>
            is.SingleDiscriminatedUnionTypeSingleProperty(value) && "type" in value && value.type === "singleProperty"
    },

    TypeReference: {
        Map: (value: unknown): value is FernIr.dynamic.TypeReference.Map =>
            is.MapType(value) && "type" in value && value.type === "map"
    }
};
