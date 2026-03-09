import { generatorsYml } from "@fern-api/configuration";
import {
    type AliasTypeDeclaration,
    type ApiAuth,
    type ApiVersionScheme,
    type AuthScheme,
    type Constants,
    type ContainerType,
    type DeclaredErrorName,
    type DeclaredTypeName,
    dynamic,
    type EnumTypeDeclaration,
    type EnumValue,
    type EnvironmentsConfig,
    type ErrorDeclaration,
    type ErrorDiscriminationStrategy,
    type ExampleCodeSample,
    type ExampleContainer,
    type ExampleEndpointCall,
    type ExampleEndpointSuccessResponse,
    type ExampleError,
    type ExampleInlinedRequestBody,
    type ExampleObjectType,
    type ExamplePathParameter,
    type ExampleRequestBody,
    type ExampleResponse,
    type ExampleSingleUnionTypeProperties,
    type ExampleType,
    type ExampleTypeReference,
    type ExampleTypeShape,
    type ExampleUnionType,
    type ExampleWebhookCall,
    type ExampleWebSocketMessageBody,
    type ExampleWebSocketSession,
    type FernFilepath,
    type FileProperty,
    type FileUploadRequest,
    type HttpEndpoint,
    type HttpHeader,
    type HttpRequestBody,
    type HttpResponse,
    type HttpResponseBody,
    type HttpService,
    type InlinedRequestBody,
    type IntermediateRepresentation,
    type JsonResponse,
    type Name,
    type NameAndWireValue,
    type NameOrString,
    type NonStreamHttpResponseBody,
    type OAuthAccessTokenRequestProperties,
    type OAuthAccessTokenResponseProperties,
    type OAuthConfiguration,
    type OAuthRefreshEndpoint,
    type OAuthRefreshTokenRequestProperties,
    type OAuthTokenEndpoint,
    type ObjectProperty,
    type ObjectTypeDeclaration,
    type Package,
    type Pagination,
    type PathParameter,
    type PropertyPathItem,
    type ProtobufService,
    type ProtobufType,
    type QueryParameter,
    type RequestProperty,
    type ResolvedTypeReference,
    type ResponseProperty,
    type SdkRequest,
    type SdkRequestBodyType,
    type ServerVariable,
    type SingleUnionType,
    type Source,
    type StreamingResponse,
    type Subpackage,
    type Transport,
    type Type,
    type TypeDeclaration,
    type TypeReference,
    type UndiscriminatedUnionTypeDeclaration,
    type UnionTypeDeclaration,
    type VariableDeclaration,
    type Webhook,
    type WebhookGroup,
    type WebhookPayload,
    type WebhookSignatureVerification,
    type WebSocketChannel,
    type WebSocketMessage
} from "@fern-api/ir-sdk";

import { type CasingsGenerator, constructCasingsGenerator, type FullCasingsGenerator } from "./CasingsGenerator.js";

// ---------------------------------------------------------------------------
// NormalizedIR type utility
// ---------------------------------------------------------------------------

/**
 * Returns true if A and B are exactly the same type.
 */
type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/**
 * Recursively replaces all occurrences of From with To throughout a type.
 */
type DeepReplace<T, From, To> =
    IsExact<T, From> extends true
        ? To
        : T extends Array<infer Item>
          ? Array<DeepReplace<Item, From, To>>
          : T extends object
            ? { [K in keyof T]: DeepReplace<T[K], From, To> }
            : T;

/**
 * Converts all NameOrString fields to Name throughout an IR type.
 * After inflation, every NameOrString is guaranteed to be a full Name object.
 */
export type NormalizedIR<T> = DeepReplace<T, NameOrString, Name>;

// ---------------------------------------------------------------------------
// Core inflation helpers
// ---------------------------------------------------------------------------

/**
 * Inflates a single NameOrString to a full Name.
 * If the value is already a Name object, returns it as-is.
 * If it is a string, computes all casings using the CasingsGenerator.
 *
 * Detection: typeof nameOrString === "string" is the marker.
 */
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: FullCasingsGenerator): Name;
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: CasingsGenerator): NameOrString;
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: CasingsGenerator): NameOrString {
    if (typeof nameOrString === "string") {
        return casingsGenerator.generateName(nameOrString);
    }
    return nameOrString;
}

/**
 * Inflates an optional NameOrString to a Name or undefined.
 */
export function inflateOptionalNameOrString(
    nameOrString: NameOrString | undefined,
    casingsGenerator: FullCasingsGenerator
): Name | undefined;
export function inflateOptionalNameOrString(
    nameOrString: NameOrString | undefined,
    casingsGenerator: CasingsGenerator
): NameOrString | undefined;
export function inflateOptionalNameOrString(
    nameOrString: NameOrString | undefined,
    casingsGenerator: CasingsGenerator
): NameOrString | undefined {
    if (nameOrString == null) {
        return undefined;
    }
    return inflateNameOrString(nameOrString, casingsGenerator);
}

/**
 * Inflates a NameAndWireValue (where name may be a string) to one with a full Name.
 */
export function inflateNameAndWireValue(
    nwv: NameAndWireValue,
    casingsGenerator: FullCasingsGenerator
): NameAndWireValue & { name: Name };
export function inflateNameAndWireValue(nwv: NameAndWireValue, casingsGenerator: CasingsGenerator): NameAndWireValue;
export function inflateNameAndWireValue(nwv: NameAndWireValue, casingsGenerator: CasingsGenerator): NameAndWireValue {
    return {
        ...nwv,
        name: inflateNameOrString(nwv.name, casingsGenerator)
    };
}

/**
 * Inflates a FernFilepath (where parts may be strings) to one with full Names.
 */
export function inflateFernFilepath(
    fp: FernFilepath,
    casingsGenerator: FullCasingsGenerator
): FernFilepath & { allParts: Name[]; packagePath: Name[]; file: Name | undefined };
export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: CasingsGenerator): FernFilepath;
export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: CasingsGenerator): FernFilepath {
    return {
        allParts: fp.allParts.map((n) => inflateNameOrString(n, casingsGenerator)),
        packagePath: fp.packagePath.map((n) => inflateNameOrString(n, casingsGenerator)),
        file: inflateOptionalNameOrString(fp.file, casingsGenerator)
    };
}

// ---------------------------------------------------------------------------
// IR-level inflation
// ---------------------------------------------------------------------------

/**
 * Creates a CasingsGenerator configured from IR metadata fields.
 * The returned generator produces full Name objects with all casings.
 * Used by generators and migration code to inflate slim Names.
 */
export function createCasingsGeneratorForInflation(ir: {
    smartCasing?: boolean | undefined;
    generationLanguage?: string | undefined;
}): FullCasingsGenerator {
    return constructCasingsGenerator({
        generationLanguage: ir.generationLanguage as generatorsYml.GenerationLanguage | undefined,
        keywords: undefined,
        smartCasing: ir.smartCasing ?? false
    });
}

/**
 * Inflates all NameOrString fields in an IntermediateRepresentation.
 *
 * This function explicitly walks the IR object graph field by field,
 * visiting every NameOrString property as defined in the IR YAML type schema.
 * NO recursion or key-name guessing -- every field is visited by its exact path.
 *
 * Uses smartCasing and generationLanguage from the IR metadata to configure
 * the CasingsGenerator for correct casing computation.
 *
 * Used by:
 * - The v66->v65 migration (to restore full Names for older generators)
 * - CLI code that needs full Names after reading v66 IR
 * - Generators that adopt v66 IR (to inflate Names at deserialization time)
 */
export function inflateIrNames(
    ir: IntermediateRepresentation,
    opts?: {
        generationLanguage?: generatorsYml.GenerationLanguage;
        keywords?: string[];
        smartCasing?: boolean;
    }
): NormalizedIR<IntermediateRepresentation> {
    const cg = constructCasingsGenerator({
        generationLanguage:
            opts?.generationLanguage ??
            (ir.generationLanguage as generatorsYml.GenerationLanguage | undefined) ??
            undefined,
        keywords: opts?.keywords ?? undefined,
        smartCasing: opts?.smartCasing ?? ir.smartCasing ?? false
    });

    inflateIrInPlace(ir, cg);
    return ir as NormalizedIR<IntermediateRepresentation>;
}

/**
 * Inflates all NameOrString fields in a DynamicIntermediateRepresentation (or any object).
 *
 * This is useful for test utilities that load dynamic IR fixtures from JSON files,
 * where Name fields may be serialized as strings (NameOrString).
 * Uses default casings settings (no generation language, no smart casing).
 */
export function inflateDynamicIrNames(
    ir: dynamic.DynamicIntermediateRepresentation
): dynamic.DynamicIntermediateRepresentation {
    const cg = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });
    inflateDynamicIrInPlace(ir, cg);
    return ir;
}

// ---------------------------------------------------------------------------
// Explicit IR visitors -- no recursion, every NameOrString field visited by path
// ---------------------------------------------------------------------------

/**
 * Mutates the IR in place, inflating every NameOrString field.
 * Each field is visited explicitly based on the IR YAML type schema.
 */
function inflateIrInPlace(ir: IntermediateRepresentation, cg: FullCasingsGenerator): void {
    // IntermediateRepresentation.apiName
    ir.apiName = inflateNameOrString(ir.apiName, cg);

    // auth: ApiAuth
    inflateApiAuth(ir.auth, cg);

    // headers: HttpHeader[]
    for (const header of ir.headers ?? []) {
        inflateHttpHeader(header, cg);
    }

    // idempotencyHeaders: HttpHeader[]
    for (const header of ir.idempotencyHeaders ?? []) {
        inflateHttpHeader(header, cg);
    }

    // types: Record<TypeId, TypeDeclaration>
    for (const typeDecl of Object.values(ir.types ?? {})) {
        inflateTypeDeclaration(typeDecl, cg);
    }

    // services: Record<ServiceId, HttpService>
    for (const service of Object.values(ir.services ?? {})) {
        inflateHttpService(service, cg);
    }

    // webhookGroups: Record<WebhookGroupId, WebhookGroup>
    for (const group of Object.values(ir.webhookGroups ?? {})) {
        inflateWebhookGroup(group, cg);
    }

    // websocketChannels: Record<WebSocketChannelId, WebSocketChannel>
    for (const channel of Object.values(ir.websocketChannels ?? {})) {
        inflateWebSocketChannel(channel, cg);
    }

    // errors: Record<ErrorId, ErrorDeclaration>
    for (const errorDecl of Object.values(ir.errors ?? {})) {
        inflateErrorDeclaration(errorDecl, cg);
    }

    // subpackages: Record<SubpackageId, Subpackage>
    for (const subpackage of Object.values(ir.subpackages ?? {})) {
        inflateSubpackage(subpackage, cg);
    }

    // rootPackage: Package
    if (ir.rootPackage != null) {
        inflatePackage(ir.rootPackage, cg);
    }

    // environments: EnvironmentsConfig
    if (ir.environments != null) {
        inflateEnvironmentsConfig(ir.environments, cg);
    }

    // pathParameters: PathParameter[]
    for (const param of ir.pathParameters ?? []) {
        inflatePathParameter(param, cg);
    }

    // errorDiscriminationStrategy
    if (ir.errorDiscriminationStrategy != null) {
        inflateErrorDiscriminationStrategy(ir.errorDiscriminationStrategy, cg);
    }

    // constants: Constants
    if (ir.constants != null) {
        inflateConstants(ir.constants, cg);
    }

    // variables: VariableDeclaration[]
    for (const variable of ir.variables ?? []) {
        inflateVariableDeclaration(variable, cg);
    }

    // apiVersion: ApiVersionScheme
    if (ir.apiVersion != null) {
        inflateApiVersionScheme(ir.apiVersion, cg);
    }

    // dynamic: DynamicIntermediateRepresentation
    if (ir.dynamic != null) {
        inflateDynamicIrInPlace(ir.dynamic, cg);
    }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function inflateApiAuth(auth: ApiAuth | undefined, cg: FullCasingsGenerator): void {
    if (auth == null) {
        return;
    }
    for (const scheme of auth.schemes ?? []) {
        inflateAuthScheme(scheme, cg);
    }
}

function inflateAuthScheme(scheme: AuthScheme, cg: FullCasingsGenerator): void {
    if (scheme == null) {
        return;
    }
    switch (scheme.type) {
        case "bearer":
            scheme.token = inflateNameOrString(scheme.token, cg);
            break;
        case "basic":
            scheme.username = inflateNameOrString(scheme.username, cg);
            scheme.password = inflateNameOrString(scheme.password, cg);
            break;
        case "header":
            inflateNameAndWireValueInPlace(scheme.name, cg);
            break;
        case "oauth":
            inflateOAuthScheme(scheme.configuration, cg);
            break;
    }
}

function inflateOAuthScheme(config: OAuthConfiguration | undefined, cg: FullCasingsGenerator): void {
    if (config == null) {
        return;
    }
    if (config.type === "clientCredentials") {
        inflateOAuthTokenEndpoint(config.tokenEndpoint, cg);
        inflateOAuthRefreshEndpoint(config.refreshEndpoint, cg);
    }
}

function inflateOAuthTokenEndpoint(endpoint: OAuthTokenEndpoint | undefined, cg: FullCasingsGenerator): void {
    if (endpoint == null) {
        return;
    }
    inflateOAuthAccessTokenRequestProperties(endpoint.requestProperties, cg);
    inflateOAuthResponseProperties(endpoint.responseProperties, cg);
}

function inflateOAuthRefreshEndpoint(endpoint: OAuthRefreshEndpoint | undefined, cg: FullCasingsGenerator): void {
    if (endpoint == null) {
        return;
    }
    inflateOAuthRefreshTokenRequestProperties(endpoint.requestProperties, cg);
    inflateOAuthResponseProperties(endpoint.responseProperties, cg);
}

function inflateOAuthAccessTokenRequestProperties(
    props: OAuthAccessTokenRequestProperties | undefined,
    cg: FullCasingsGenerator
): void {
    if (props == null) {
        return;
    }
    inflateRequestProperty(props.clientId, cg);
    inflateRequestProperty(props.clientSecret, cg);
    inflateRequestProperty(props.scopes, cg);
    for (const customProp of props.customProperties ?? []) {
        inflateRequestProperty(customProp, cg);
    }
}

function inflateOAuthRefreshTokenRequestProperties(
    props: OAuthRefreshTokenRequestProperties | undefined,
    cg: FullCasingsGenerator
): void {
    if (props == null) {
        return;
    }
    inflateRequestProperty(props.refreshToken, cg);
}

function inflateOAuthResponseProperties(
    props: OAuthAccessTokenResponseProperties | undefined,
    cg: FullCasingsGenerator
): void {
    if (props == null) {
        return;
    }
    inflateResponseProperty(props.accessToken, cg);
    inflateResponseProperty(props.expiresIn, cg);
    inflateResponseProperty(props.refreshToken, cg);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

function inflateTypeDeclaration(td: TypeDeclaration, cg: FullCasingsGenerator): void {
    inflateDeclaredTypeName(td.name, cg);
    inflateTypeShape(td.shape, cg);
    inflateTypeDeclarationSource(td.source, cg);
    for (const ex of td.autogeneratedExamples ?? []) {
        inflateExampleType(ex, cg);
    }
    for (const ex of td.userProvidedExamples ?? []) {
        inflateExampleType(ex, cg);
    }
}

function inflateDeclaredTypeName(dtn: DeclaredTypeName | undefined, cg: FullCasingsGenerator): void {
    if (dtn == null) {
        return;
    }
    dtn.name = inflateNameOrString(dtn.name, cg);
    inflateFernFilepathInPlace(dtn.fernFilepath, cg);
}

function inflateTypeShape(shape: Type | undefined, cg: FullCasingsGenerator): void {
    if (shape == null) {
        return;
    }
    switch (shape.type) {
        case "alias":
            inflateAliasTypeDeclaration(shape, cg);
            break;
        case "enum":
            inflateEnumTypeDeclaration(shape, cg);
            break;
        case "object":
            inflateObjectTypeDeclaration(shape, cg);
            break;
        case "union":
            inflateUnionTypeDeclaration(shape, cg);
            break;
        case "undiscriminatedUnion":
            inflateUndiscriminatedUnionTypeDeclaration(shape, cg);
            break;
    }
}

function inflateAliasTypeDeclaration(alias: AliasTypeDeclaration, cg: FullCasingsGenerator): void {
    inflateTypeReference(alias.aliasOf, cg);
    inflateResolvedTypeReference(alias.resolvedType, cg);
}

function inflateResolvedTypeReference(resolved: ResolvedTypeReference | undefined, cg: FullCasingsGenerator): void {
    if (resolved == null) {
        return;
    }
    if (resolved.type === "named") {
        inflateDeclaredTypeName(resolved.name, cg);
    } else if (resolved.type === "container") {
        inflateContainerType(resolved.container, cg);
    }
}

function inflateTypeReference(tr: TypeReference | undefined, cg: FullCasingsGenerator): void {
    if (tr == null) {
        return;
    }
    switch (tr.type) {
        case "named":
            tr.name = inflateNameOrString(tr.name, cg);
            inflateFernFilepathInPlace(tr.fernFilepath, cg);
            if (tr.default != null && tr.default.type === "enum") {
                inflateEnumValue(tr.default, cg);
            }
            break;
        case "container":
            inflateContainerType(tr.container, cg);
            break;
    }
}

function inflateContainerType(ct: ContainerType | undefined, cg: FullCasingsGenerator): void {
    if (ct == null) {
        return;
    }
    switch (ct.type) {
        case "list":
            inflateTypeReference(ct.list, cg);
            break;
        case "nullable":
            inflateTypeReference(ct.nullable, cg);
            break;
        case "optional":
            inflateTypeReference(ct.optional, cg);
            break;
        case "set":
            inflateTypeReference(ct.set, cg);
            break;
        case "map":
            inflateTypeReference(ct.keyType, cg);
            inflateTypeReference(ct.valueType, cg);
            break;
    }
}

function inflateEnumTypeDeclaration(enumDecl: EnumTypeDeclaration, cg: FullCasingsGenerator): void {
    if (enumDecl.default != null) {
        inflateEnumValue(enumDecl.default, cg);
    }
    for (const val of enumDecl.values ?? []) {
        inflateEnumValue(val, cg);
    }
}

function inflateEnumValue(ev: EnumValue | undefined, cg: FullCasingsGenerator): void {
    if (ev == null) {
        return;
    }
    inflateNameAndWireValueInPlace(ev.name, cg);
}

function inflateObjectTypeDeclaration(obj: ObjectTypeDeclaration, cg: FullCasingsGenerator): void {
    for (const ext of obj.extends ?? []) {
        inflateDeclaredTypeName(ext, cg);
    }
    for (const prop of obj.properties ?? []) {
        inflateObjectProperty(prop, cg);
    }
    for (const prop of obj.extendedProperties ?? []) {
        inflateObjectProperty(prop, cg);
    }
}

function inflateObjectProperty(prop: ObjectProperty | undefined, cg: FullCasingsGenerator): void {
    if (prop == null) {
        return;
    }
    inflateNameAndWireValueInPlace(prop.name, cg);
    inflateTypeReference(prop.valueType, cg);
}

function inflateUnionTypeDeclaration(union: UnionTypeDeclaration, cg: FullCasingsGenerator): void {
    inflateNameAndWireValueInPlace(union.discriminant, cg);
    for (const ext of union.extends ?? []) {
        inflateDeclaredTypeName(ext, cg);
    }
    for (const sut of union.types ?? []) {
        inflateSingleUnionType(sut, cg);
    }
    for (const prop of union.baseProperties ?? []) {
        inflateObjectProperty(prop, cg);
    }
}

function inflateSingleUnionType(sut: SingleUnionType, cg: FullCasingsGenerator): void {
    inflateNameAndWireValueInPlace(sut.discriminantValue, cg);
    if (sut.shape != null) {
        switch (sut.shape.propertiesType) {
            case "samePropertiesAsObject":
                inflateDeclaredTypeName(sut.shape, cg);
                break;
            case "singleProperty":
                inflateNameAndWireValueInPlace(sut.shape.name, cg);
                inflateTypeReference(sut.shape.type, cg);
                break;
        }
    }
}

function inflateUndiscriminatedUnionTypeDeclaration(
    uuDecl: UndiscriminatedUnionTypeDeclaration,
    cg: FullCasingsGenerator
): void {
    for (const member of uuDecl.members ?? []) {
        inflateTypeReference(member.type, cg);
    }
}

// ---------------------------------------------------------------------------
// HTTP Services and Endpoints
// ---------------------------------------------------------------------------

function inflateHttpService(service: HttpService, cg: FullCasingsGenerator): void {
    if (service.name != null) {
        inflateFernFilepathInPlace(service.name.fernFilepath, cg);
    }
    for (const endpoint of service.endpoints ?? []) {
        inflateHttpEndpoint(endpoint, cg);
    }
    for (const header of service.headers ?? []) {
        inflateHttpHeader(header, cg);
    }
    for (const param of service.pathParameters ?? []) {
        inflatePathParameter(param, cg);
    }
    inflateTransport(service.transport, cg);
}

function inflateHttpEndpoint(ep: HttpEndpoint, cg: FullCasingsGenerator): void {
    ep.name = inflateNameOrString(ep.name, cg);

    for (const header of ep.headers ?? []) {
        inflateHttpHeader(header, cg);
    }
    for (const header of ep.responseHeaders ?? []) {
        inflateHttpHeader(header, cg);
    }
    for (const param of ep.pathParameters ?? []) {
        inflatePathParameter(param, cg);
    }
    for (const param of ep.allPathParameters ?? []) {
        inflatePathParameter(param, cg);
    }
    for (const qp of ep.queryParameters ?? []) {
        inflateQueryParameter(qp, cg);
    }

    inflateHttpRequestBody(ep.requestBody, cg);

    if (ep.v2RequestBodies?.requestBodies != null) {
        for (const body of ep.v2RequestBodies.requestBodies) {
            inflateHttpRequestBody(body, cg);
        }
    }

    inflateSdkRequest(ep.sdkRequest, cg);
    inflateHttpResponse(ep.response, cg);

    if (ep.v2Responses?.responses != null) {
        for (const resp of ep.v2Responses.responses) {
            inflateHttpResponse(resp, cg);
        }
    }

    for (const err of ep.errors ?? []) {
        if (err.error != null) {
            inflateDeclaredErrorName(err.error, cg);
        }
    }

    inflatePagination(ep.pagination, cg);

    for (const ex of ep.userSpecifiedExamples ?? []) {
        inflateExampleEndpointCall(ex.example, cg);
        for (const cs of ex.codeSamples ?? []) {
            inflateExampleCodeSample(cs, cg);
        }
    }
    for (const ex of ep.autogeneratedExamples ?? []) {
        inflateExampleEndpointCall(ex.example, cg);
    }

    inflateTransport(ep.transport, cg);
}

function inflateTransport(transport: Transport | undefined, cg: FullCasingsGenerator): void {
    if (transport == null) {
        return;
    }
    if (transport.type === "grpc") {
        inflateProtobufService(transport.service, cg);
    }
}

function inflateProtobufService(ps: ProtobufService | undefined, cg: FullCasingsGenerator): void {
    if (ps == null) {
        return;
    }
    ps.name = inflateNameOrString(ps.name, cg);
}

function inflateHttpHeader(header: HttpHeader | undefined, cg: FullCasingsGenerator): void {
    if (header == null) {
        return;
    }
    inflateNameAndWireValueInPlace(header.name, cg);
    inflateTypeReference(header.valueType, cg);
}

function inflatePathParameter(param: PathParameter | undefined, cg: FullCasingsGenerator): void {
    if (param == null) {
        return;
    }
    param.name = inflateNameOrString(param.name, cg);
    inflateTypeReference(param.valueType, cg);
}

function inflateQueryParameter(qp: QueryParameter | undefined, cg: FullCasingsGenerator): void {
    if (qp == null) {
        return;
    }
    inflateNameAndWireValueInPlace(qp.name, cg);
    inflateTypeReference(qp.valueType, cg);
}

function inflateHttpRequestBody(body: HttpRequestBody | undefined, cg: FullCasingsGenerator): void {
    if (body == null) {
        return;
    }
    switch (body.type) {
        case "inlinedRequestBody":
            inflateInlinedRequestBody(body, cg);
            break;
        case "reference":
            inflateTypeReference(body.requestBodyType, cg);
            break;
        case "fileUpload":
            inflateFileUploadRequest(body, cg);
            break;
    }
}

function inflateInlinedRequestBody(irb: InlinedRequestBody, cg: FullCasingsGenerator): void {
    irb.name = inflateNameOrString(irb.name, cg);
    for (const ext of irb.extends ?? []) {
        inflateDeclaredTypeName(ext, cg);
    }
    for (const prop of irb.properties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateTypeReference(prop.valueType, cg);
    }
    for (const prop of irb.extendedProperties ?? []) {
        inflateObjectProperty(prop, cg);
    }
}

function inflateFileUploadRequest(fur: FileUploadRequest, cg: FullCasingsGenerator): void {
    fur.name = inflateNameOrString(fur.name, cg);
    for (const prop of fur.properties ?? []) {
        if (prop.type === "file") {
            inflateFileProperty(prop.value, cg);
        } else if (prop.type === "bodyProperty") {
            inflateNameAndWireValueInPlace(prop.name, cg);
            inflateTypeReference(prop.valueType, cg);
        }
    }
}

function inflateFileProperty(fp: FileProperty | undefined, cg: FullCasingsGenerator): void {
    if (fp == null) {
        return;
    }
    inflateNameAndWireValueInPlace(fp.key, cg);
}

function inflateSdkRequest(sdkReq: SdkRequest | undefined, cg: FullCasingsGenerator): void {
    if (sdkReq == null) {
        return;
    }
    sdkReq.requestParameterName = inflateNameOrString(sdkReq.requestParameterName, cg);

    if (sdkReq.shape != null) {
        if (sdkReq.shape.type === "wrapper") {
            sdkReq.shape.wrapperName = inflateNameOrString(sdkReq.shape.wrapperName, cg);
            sdkReq.shape.bodyKey = inflateNameOrString(sdkReq.shape.bodyKey, cg);
        } else if (sdkReq.shape.type === "justRequestBody") {
            inflateSdkRequestBodyType(sdkReq.shape.value, cg);
        }
    }

    inflateRequestProperty(sdkReq.streamParameter, cg);
}

function inflateSdkRequestBodyType(bodyType: SdkRequestBodyType | undefined, cg: FullCasingsGenerator): void {
    if (bodyType == null) {
        return;
    }
    if (bodyType.type === "typeReference") {
        inflateTypeReference(bodyType.requestBodyType, cg);
    }
}

function inflateHttpResponse(resp: HttpResponse | undefined, cg: FullCasingsGenerator): void {
    if (resp == null || resp.body == null) {
        return;
    }
    inflateHttpResponseBody(resp.body, cg);
}

function inflateHttpResponseBody(body: HttpResponseBody | undefined, cg: FullCasingsGenerator): void {
    if (body == null) {
        return;
    }
    switch (body.type) {
        case "json":
            inflateJsonResponse(body.value, cg);
            break;
        case "streaming":
            inflateStreamingResponse(body.value, cg);
            break;
        case "streamParameter":
            if (body.nonStreamResponse != null) {
                inflateNonStreamHttpResponseBody(body.nonStreamResponse, cg);
            }
            if (body.streamResponse != null) {
                inflateStreamingResponse(body.streamResponse, cg);
            }
            break;
    }
}

function inflateNonStreamHttpResponseBody(body: NonStreamHttpResponseBody | undefined, cg: FullCasingsGenerator): void {
    if (body == null) {
        return;
    }
    if (body.type === "json") {
        inflateJsonResponse(body.value, cg);
    }
}

function inflateJsonResponse(json: JsonResponse | undefined, cg: FullCasingsGenerator): void {
    if (json == null) {
        return;
    }
    switch (json.type) {
        case "response":
            inflateTypeReference(json.responseBodyType, cg);
            break;
        case "nestedPropertyAsResponse":
            inflateTypeReference(json.responseBodyType, cg);
            inflateObjectProperty(json.responseProperty, cg);
            break;
    }
}

function inflateStreamingResponse(sr: StreamingResponse | undefined, cg: FullCasingsGenerator): void {
    if (sr == null) {
        return;
    }
    if (sr.type === "json" || sr.type === "sse") {
        inflateTypeReference(sr.payload, cg);
    }
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function inflatePagination(pagination: Pagination | undefined, cg: FullCasingsGenerator): void {
    if (pagination == null) {
        return;
    }
    switch (pagination.type) {
        case "cursor":
            inflateRequestProperty(pagination.page, cg);
            inflateResponseProperty(pagination.next, cg);
            inflateResponseProperty(pagination.results, cg);
            break;
        case "offset":
            inflateRequestProperty(pagination.page, cg);
            inflateResponseProperty(pagination.results, cg);
            inflateResponseProperty(pagination.hasNextPage, cg);
            inflateRequestProperty(pagination.step, cg);
            break;
        case "custom":
            inflateResponseProperty(pagination.results, cg);
            break;
        case "uri":
            inflateResponseProperty(pagination.nextUri, cg);
            inflateResponseProperty(pagination.results, cg);
            break;
        case "path":
            inflateResponseProperty(pagination.nextPath, cg);
            inflateResponseProperty(pagination.results, cg);
            break;
    }
}

function inflateRequestProperty(rp: RequestProperty | undefined, cg: FullCasingsGenerator): void {
    if (rp == null) {
        return;
    }
    for (const item of rp.propertyPath ?? []) {
        inflatePropertyPathItem(item, cg);
    }
    if (rp.property != null) {
        if (rp.property.type === "query") {
            inflateQueryParameter(rp.property, cg);
        } else if (rp.property.type === "body") {
            inflateObjectProperty(rp.property, cg);
        }
    }
}

function inflateResponseProperty(rp: ResponseProperty | undefined, cg: FullCasingsGenerator): void {
    if (rp == null) {
        return;
    }
    for (const item of rp.propertyPath ?? []) {
        inflatePropertyPathItem(item, cg);
    }
    inflateObjectProperty(rp.property, cg);
}

function inflatePropertyPathItem(item: PropertyPathItem | undefined, cg: FullCasingsGenerator): void {
    if (item == null) {
        return;
    }
    item.name = inflateNameOrString(item.name, cg);
    inflateTypeReference(item.type, cg);
}

// ---------------------------------------------------------------------------
// Examples
// ---------------------------------------------------------------------------

function inflateExampleEndpointCall(ex: ExampleEndpointCall | undefined, cg: FullCasingsGenerator): void {
    if (ex == null) {
        return;
    }
    if (ex.name != null) {
        ex.name = inflateNameOrString(ex.name, cg);
    }

    for (const pp of ex.rootPathParameters ?? []) {
        inflateExamplePathParameter(pp, cg);
    }
    for (const pp of ex.servicePathParameters ?? []) {
        inflateExamplePathParameter(pp, cg);
    }
    for (const pp of ex.endpointPathParameters ?? []) {
        inflateExamplePathParameter(pp, cg);
    }

    for (const h of ex.serviceHeaders ?? []) {
        inflateNameAndWireValueInPlace(h.name, cg);
    }
    for (const h of ex.endpointHeaders ?? []) {
        inflateNameAndWireValueInPlace(h.name, cg);
    }

    for (const qp of ex.queryParameters ?? []) {
        inflateNameAndWireValueInPlace(qp.name, cg);
    }

    inflateExampleRequestBody(ex.request, cg);
    inflateExampleResponse(ex.response, cg);
}

function inflateExamplePathParameter(pp: ExamplePathParameter | undefined, cg: FullCasingsGenerator): void {
    if (pp == null) {
        return;
    }
    pp.name = inflateNameOrString(pp.name, cg);
    inflateExampleTypeReference(pp.value, cg);
}

function inflateExampleRequestBody(body: ExampleRequestBody | undefined, cg: FullCasingsGenerator): void {
    if (body == null) {
        return;
    }
    if (body.type === "inlinedRequestBody") {
        inflateExampleInlinedRequestBody(body, cg);
    } else if (body.type === "reference") {
        inflateExampleTypeReference(body, cg);
    }
}

function inflateExampleInlinedRequestBody(body: ExampleInlinedRequestBody | undefined, cg: FullCasingsGenerator): void {
    if (body == null) {
        return;
    }
    for (const prop of body.properties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
        if (prop.originalTypeDeclaration != null) {
            inflateDeclaredTypeName(prop.originalTypeDeclaration, cg);
        }
    }
    for (const prop of body.extraProperties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
    }
}

function inflateExampleResponse(resp: ExampleResponse | undefined, cg: FullCasingsGenerator): void {
    if (resp == null) {
        return;
    }
    if (resp.type === "ok") {
        inflateExampleEndpointSuccessResponse(resp.value, cg);
    } else if (resp.type === "error") {
        if (resp.error != null) {
            inflateDeclaredErrorName(resp.error, cg);
        }
        inflateExampleTypeReference(resp.body, cg);
    }
}

function inflateExampleEndpointSuccessResponse(
    resp: ExampleEndpointSuccessResponse | undefined,
    cg: FullCasingsGenerator
): void {
    if (resp == null) {
        return;
    }
    switch (resp.type) {
        case "body":
            if (resp.value != null) {
                inflateExampleTypeReference(resp.value, cg);
            }
            break;
        case "stream":
            for (const item of resp.value ?? []) {
                inflateExampleTypeReference(item, cg);
            }
            break;
        case "sse":
            for (const evt of resp.value ?? []) {
                inflateExampleTypeReference(evt.data, cg);
            }
            break;
    }
}

function inflateExampleCodeSample(cs: ExampleCodeSample | undefined, cg: FullCasingsGenerator): void {
    if (cs == null) {
        return;
    }
    if (cs.name != null) {
        cs.name = inflateNameOrString(cs.name, cg);
    }
}

function inflateExampleType(ex: ExampleType | undefined, cg: FullCasingsGenerator): void {
    if (ex == null) {
        return;
    }
    if (ex.name != null) {
        ex.name = inflateNameOrString(ex.name, cg);
    }
    inflateExampleTypeShape(ex.shape, cg);
}

function inflateExampleTypeShape(shape: ExampleTypeShape | undefined, cg: FullCasingsGenerator): void {
    if (shape == null) {
        return;
    }
    switch (shape.type) {
        case "alias":
            inflateExampleTypeReference(shape.value, cg);
            break;
        case "enum":
            inflateNameAndWireValueInPlace(shape.value, cg);
            break;
        case "object":
            inflateExampleObjectType(shape, cg);
            break;
        case "union":
            inflateExampleUnionType(shape, cg);
            break;
        case "undiscriminatedUnion":
            inflateExampleTypeReference(shape.singleUnionType, cg);
            break;
    }
}

function inflateExampleObjectType(obj: ExampleObjectType, cg: FullCasingsGenerator): void {
    for (const prop of obj.properties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
        if (prop.originalTypeDeclaration != null) {
            inflateDeclaredTypeName(prop.originalTypeDeclaration, cg);
        }
    }
    for (const prop of obj.extraProperties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
    }
}

function inflateExampleUnionType(union: ExampleUnionType, cg: FullCasingsGenerator): void {
    inflateNameAndWireValueInPlace(union.discriminant, cg);
    if (union.singleUnionType != null) {
        inflateNameAndWireValueInPlace(union.singleUnionType.wireDiscriminantValue, cg);
        inflateExampleSingleUnionTypeProperties(union.singleUnionType.shape, cg);
    }
    for (const prop of union.extendProperties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
        if (prop.originalTypeDeclaration != null) {
            inflateDeclaredTypeName(prop.originalTypeDeclaration, cg);
        }
    }
    for (const prop of union.baseProperties ?? []) {
        inflateNameAndWireValueInPlace(prop.name, cg);
        inflateExampleTypeReference(prop.value, cg);
    }
}

function inflateExampleSingleUnionTypeProperties(
    shape: ExampleSingleUnionTypeProperties | undefined,
    cg: FullCasingsGenerator
): void {
    if (shape == null) {
        return;
    }
    switch (shape.type) {
        case "samePropertiesAsObject":
            inflateExampleObjectType(shape.object, cg);
            break;
        case "singleProperty":
            inflateExampleTypeReference(shape, cg);
            break;
    }
}

function inflateExampleTypeReference(etr: ExampleTypeReference | undefined, cg: FullCasingsGenerator): void {
    if (etr == null || etr.shape == null) {
        return;
    }
    switch (etr.shape.type) {
        case "named":
            if (etr.shape.typeName != null) {
                inflateDeclaredTypeName(etr.shape.typeName, cg);
            }
            inflateExampleTypeShape(etr.shape.shape, cg);
            break;
        case "container":
            inflateExampleContainer(etr.shape.container, cg);
            break;
    }
}

function inflateExampleContainer(container: ExampleContainer | undefined, cg: FullCasingsGenerator): void {
    if (container == null) {
        return;
    }
    switch (container.type) {
        case "list":
            for (const item of container.list ?? []) {
                inflateExampleTypeReference(item, cg);
            }
            break;
        case "set":
            for (const item of container.set ?? []) {
                inflateExampleTypeReference(item, cg);
            }
            break;
        case "optional":
            inflateExampleTypeReference(container.optional, cg);
            break;
        case "nullable":
            inflateExampleTypeReference(container.nullable, cg);
            break;
        case "map":
            for (const pair of container.map ?? []) {
                inflateExampleTypeReference(pair.key, cg);
                inflateExampleTypeReference(pair.value, cg);
            }
            break;
    }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

function inflateErrorDeclaration(ed: ErrorDeclaration, cg: FullCasingsGenerator): void {
    inflateDeclaredErrorName(ed.name, cg);
    inflateNameAndWireValueInPlace(ed.discriminantValue, cg);
    inflateTypeReference(ed.type, cg);
    for (const ex of ed.examples ?? []) {
        inflateExampleError(ex, cg);
    }
    for (const header of ed.headers ?? []) {
        inflateHttpHeader(header, cg);
    }
}

function inflateDeclaredErrorName(den: DeclaredErrorName | undefined, cg: FullCasingsGenerator): void {
    if (den == null) {
        return;
    }
    den.name = inflateNameOrString(den.name, cg);
    inflateFernFilepathInPlace(den.fernFilepath, cg);
}

function inflateExampleError(ex: ExampleError | undefined, cg: FullCasingsGenerator): void {
    if (ex == null) {
        return;
    }
    if (ex.name != null) {
        ex.name = inflateNameOrString(ex.name, cg);
    }
    inflateExampleTypeReference(ex.shape, cg);
}

// ---------------------------------------------------------------------------
// Environments
// ---------------------------------------------------------------------------

function inflateEnvironmentsConfig(config: EnvironmentsConfig | undefined, cg: FullCasingsGenerator): void {
    if (config == null || config.environments == null) {
        return;
    }
    switch (config.environments.type) {
        case "singleBaseUrl":
            for (const env of config.environments.environments ?? []) {
                env.name = inflateNameOrString(env.name, cg);
                for (const sv of env.urlVariables ?? []) {
                    inflateServerVariable(sv, cg);
                }
            }
            break;
        case "multipleBaseUrls":
            for (const bu of config.environments.baseUrls ?? []) {
                bu.name = inflateNameOrString(bu.name, cg);
            }
            for (const env of config.environments.environments ?? []) {
                env.name = inflateNameOrString(env.name, cg);
            }
            break;
    }
}

function inflateServerVariable(sv: ServerVariable | undefined, cg: FullCasingsGenerator): void {
    if (sv == null) {
        return;
    }
    sv.name = inflateNameOrString(sv.name, cg);
}

// ---------------------------------------------------------------------------
// Packages / Subpackages
// ---------------------------------------------------------------------------

function inflatePackage(pkg: Package | undefined, cg: FullCasingsGenerator): void {
    if (pkg == null) {
        return;
    }
    inflateFernFilepathInPlace(pkg.fernFilepath, cg);
}

function inflateSubpackage(sub: Subpackage, cg: FullCasingsGenerator): void {
    inflatePackage(sub, cg);
    sub.name = inflateNameOrString(sub.name, cg);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

function inflateConstants(constants: Constants | undefined, cg: FullCasingsGenerator): void {
    if (constants == null) {
        return;
    }
    inflateNameAndWireValueInPlace(constants.errorInstanceIdKey, cg);
}

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

function inflateVariableDeclaration(v: VariableDeclaration | undefined, cg: FullCasingsGenerator): void {
    if (v == null) {
        return;
    }
    v.name = inflateNameOrString(v.name, cg);
    inflateTypeReference(v.type, cg);
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

function inflateWebhookGroup(group: WebhookGroup, cg: FullCasingsGenerator): void {
    if (!Array.isArray(group)) {
        return;
    }
    for (const webhook of group) {
        inflateWebhook(webhook, cg);
    }
}

function inflateWebhook(wh: Webhook, cg: FullCasingsGenerator): void {
    wh.name = inflateNameOrString(wh.name, cg);

    for (const header of wh.headers ?? []) {
        inflateHttpHeader(header, cg);
    }

    inflateWebhookPayload(wh.payload, cg);

    inflateWebhookSignatureVerification(wh.signatureVerification, cg);

    for (const ex of wh.examples ?? []) {
        inflateExampleWebhookCall(ex, cg);
    }
}

function inflateWebhookPayload(payload: WebhookPayload | undefined, cg: FullCasingsGenerator): void {
    if (payload == null) {
        return;
    }
    if (payload.type === "inlinedPayload") {
        payload.name = inflateNameOrString(payload.name, cg);
        for (const ext of payload.extends ?? []) {
            inflateDeclaredTypeName(ext, cg);
        }
        for (const prop of payload.properties ?? []) {
            inflateNameAndWireValueInPlace(prop.name, cg);
            inflateTypeReference(prop.valueType, cg);
        }
    } else if (payload.type === "reference") {
        inflateTypeReference(payload.payloadType, cg);
    }
}

function inflateWebhookSignatureVerification(
    sv: WebhookSignatureVerification | undefined,
    cg: FullCasingsGenerator
): void {
    if (sv == null) {
        return;
    }
    if (sv.type === "hmac") {
        inflateNameAndWireValueInPlace(sv.signatureHeaderName, cg);
        if (sv.timestamp != null) {
            inflateNameAndWireValueInPlace(sv.timestamp.headerName, cg);
        }
    } else if (sv.type === "asymmetric") {
        inflateNameAndWireValueInPlace(sv.signatureHeaderName, cg);
        if (sv.timestamp != null) {
            inflateNameAndWireValueInPlace(sv.timestamp.headerName, cg);
        }
        if (sv.keySource?.type === "jwks" && sv.keySource.keyIdHeader != null) {
            inflateNameAndWireValueInPlace(sv.keySource.keyIdHeader, cg);
        }
    }
}

function inflateExampleWebhookCall(ex: ExampleWebhookCall | undefined, cg: FullCasingsGenerator): void {
    if (ex == null) {
        return;
    }
    if (ex.name != null) {
        ex.name = inflateNameOrString(ex.name, cg);
    }
    inflateExampleTypeReference(ex.payload, cg);
}

// ---------------------------------------------------------------------------
// WebSocket Channels
// ---------------------------------------------------------------------------

function inflateWebSocketChannel(channel: WebSocketChannel, cg: FullCasingsGenerator): void {
    channel.name = inflateNameOrString(channel.name, cg);

    for (const header of channel.headers ?? []) {
        inflateHttpHeader(header, cg);
    }
    for (const qp of channel.queryParameters ?? []) {
        inflateQueryParameter(qp, cg);
    }
    for (const param of channel.pathParameters ?? []) {
        inflatePathParameter(param, cg);
    }
    for (const msg of channel.messages ?? []) {
        inflateWebSocketMessage(msg, cg);
    }
    for (const ex of channel.examples ?? []) {
        inflateExampleWebSocketSession(ex, cg);
    }
}

function inflateWebSocketMessage(msg: WebSocketMessage | undefined, cg: FullCasingsGenerator): void {
    if (msg == null) {
        return;
    }
    if (msg.body != null) {
        if (msg.body.type === "inlinedBody") {
            msg.body.name = inflateNameOrString(msg.body.name, cg);
            for (const ext of msg.body.extends ?? []) {
                inflateDeclaredTypeName(ext, cg);
            }
            for (const prop of msg.body.properties ?? []) {
                inflateNameAndWireValueInPlace(prop.name, cg);
                inflateTypeReference(prop.valueType, cg);
            }
        } else if (msg.body.type === "reference") {
            inflateTypeReference(msg.body.bodyType, cg);
        }
    }
}

function inflateExampleWebSocketSession(ex: ExampleWebSocketSession | undefined, cg: FullCasingsGenerator): void {
    if (ex == null) {
        return;
    }
    if (ex.name != null) {
        ex.name = inflateNameOrString(ex.name, cg);
    }

    for (const pp of ex.pathParameters ?? []) {
        inflateExamplePathParameter(pp, cg);
    }
    for (const h of ex.headers ?? []) {
        inflateNameAndWireValueInPlace(h.name, cg);
    }
    for (const qp of ex.queryParameters ?? []) {
        inflateNameAndWireValueInPlace(qp.name, cg);
    }
    for (const msg of ex.messages ?? []) {
        inflateExampleWebSocketMessageBody(msg.body, cg);
    }
}

function inflateExampleWebSocketMessageBody(
    body: ExampleWebSocketMessageBody | undefined,
    cg: FullCasingsGenerator
): void {
    if (body == null) {
        return;
    }
    if (body.type === "inlinedBody") {
        inflateExampleInlinedRequestBody(body, cg);
    } else if (body.type === "reference") {
        inflateExampleTypeReference(body, cg);
    }
}

// ---------------------------------------------------------------------------
// ErrorDiscriminationStrategy
// ---------------------------------------------------------------------------

function inflateErrorDiscriminationStrategy(strategy: ErrorDiscriminationStrategy, cg: FullCasingsGenerator): void {
    if (strategy == null) {
        return;
    }
    if (strategy.type === "property") {
        inflateNameAndWireValueInPlace(strategy.discriminant, cg);
        inflateNameAndWireValueInPlace(strategy.contentProperty, cg);
    }
}

// ---------------------------------------------------------------------------
// ApiVersionScheme
// ---------------------------------------------------------------------------

function inflateApiVersionScheme(scheme: ApiVersionScheme | undefined, cg: FullCasingsGenerator): void {
    if (scheme == null) {
        return;
    }
    if (scheme.type === "header") {
        inflateHttpHeader(scheme.header, cg);
        inflateEnumTypeDeclaration(scheme.value, cg);
    }
}

// ---------------------------------------------------------------------------
// Proto types (Source on TypeDeclaration)
// ---------------------------------------------------------------------------

function inflateTypeDeclarationSource(source: Source | undefined, cg: FullCasingsGenerator): void {
    if (source == null) {
        return;
    }
    if (source.type === "proto") {
        inflateProtobufType(source.value, cg);
    }
}

function inflateProtobufType(pt: ProtobufType | undefined, cg: FullCasingsGenerator): void {
    if (pt == null) {
        return;
    }
    if (pt.type === "userDefined") {
        pt.name = inflateNameOrString(pt.name, cg);
    }
}

// ---------------------------------------------------------------------------
// Dynamic IR -- explicit visitor
// ---------------------------------------------------------------------------

function inflateDynamicIrInPlace(
    dynIr: dynamic.DynamicIntermediateRepresentation | undefined,
    cg: FullCasingsGenerator
): void {
    if (dynIr == null) {
        return;
    }

    for (const namedType of Object.values(dynIr.types ?? {})) {
        inflateDynamicNamedType(namedType, cg);
    }

    for (const endpoint of Object.values(dynIr.endpoints ?? {})) {
        inflateDynamicEndpoint(endpoint, cg);
    }

    if (dynIr.environments != null) {
        inflateDynamicEnvironmentsConfig(dynIr.environments, cg);
    }

    for (const param of dynIr.headers ?? []) {
        inflateDynamicNamedParameter(param, cg);
    }

    for (const param of dynIr.pathParameters ?? []) {
        inflateDynamicNamedParameter(param, cg);
    }

    for (const v of dynIr.variables ?? []) {
        inflateDynamicVariableDeclaration(v, cg);
    }
}

function inflateDynamicDeclaration(decl: dynamic.Declaration | undefined, cg: FullCasingsGenerator): void {
    if (decl == null) {
        return;
    }
    decl.name = inflateNameOrString(decl.name, cg);
    inflateDynamicFernFilepathInPlace(decl.fernFilepath, cg);
}

function inflateDynamicFernFilepathInPlace(fp: dynamic.FernFilepath | undefined, cg: FullCasingsGenerator): void {
    if (fp == null) {
        return;
    }
    fp.allParts = (fp.allParts ?? []).map((n: NameOrString) => inflateNameOrString(n, cg));
    fp.packagePath = (fp.packagePath ?? []).map((n: NameOrString) => inflateNameOrString(n, cg));
    if (fp.file != null) {
        fp.file = inflateNameOrString(fp.file, cg);
    }
}

function inflateDynamicNameAndWireValueInPlace(
    nwv: dynamic.NameAndWireValue | undefined,
    cg: FullCasingsGenerator
): void {
    if (nwv == null) {
        return;
    }
    nwv.name = inflateNameOrString(nwv.name, cg);
}

function inflateDynamicNamedParameter(param: dynamic.NamedParameter | undefined, cg: FullCasingsGenerator): void {
    if (param == null) {
        return;
    }
    inflateDynamicNameAndWireValueInPlace(param.name, cg);
}

function inflateDynamicNamedType(nt: dynamic.NamedType | undefined, cg: FullCasingsGenerator): void {
    if (nt == null) {
        return;
    }
    switch (nt.type) {
        case "alias":
            inflateDynamicDeclaration(nt.declaration, cg);
            break;
        case "enum":
            inflateDynamicDeclaration(nt.declaration, cg);
            for (const val of nt.values ?? []) {
                inflateDynamicNameAndWireValueInPlace(val, cg);
            }
            break;
        case "object":
            inflateDynamicDeclaration(nt.declaration, cg);
            for (const prop of nt.properties ?? []) {
                inflateDynamicNamedParameter(prop, cg);
            }
            break;
        case "discriminatedUnion":
            inflateDynamicDeclaration(nt.declaration, cg);
            inflateDynamicNameAndWireValueInPlace(nt.discriminant, cg);
            for (const sut of Object.values(nt.types ?? {})) {
                inflateDynamicSingleDiscriminatedUnionType(sut, cg);
            }
            break;
        case "undiscriminatedUnion":
            inflateDynamicDeclaration(nt.declaration, cg);
            break;
    }
}

function inflateDynamicSingleDiscriminatedUnionType(
    sut: dynamic.SingleDiscriminatedUnionType | undefined,
    cg: FullCasingsGenerator
): void {
    if (sut == null) {
        return;
    }
    inflateDynamicNameAndWireValueInPlace(sut.discriminantValue, cg);
    for (const prop of sut.properties ?? []) {
        inflateDynamicNamedParameter(prop, cg);
    }
}

function inflateDynamicEndpoint(ep: dynamic.Endpoint | undefined, cg: FullCasingsGenerator): void {
    if (ep == null) {
        return;
    }
    inflateDynamicAuth(ep.auth, cg);
    inflateDynamicDeclaration(ep.declaration, cg);
    inflateDynamicRequest(ep.request, cg);
}

function inflateDynamicAuth(auth: dynamic.Auth | undefined, cg: FullCasingsGenerator): void {
    if (auth == null) {
        return;
    }
    switch (auth.type) {
        case "basic":
            auth.username = inflateNameOrString(auth.username, cg);
            auth.password = inflateNameOrString(auth.password, cg);
            break;
        case "bearer":
            auth.token = inflateNameOrString(auth.token, cg);
            break;
        case "header":
            inflateDynamicNamedParameter(auth.header, cg);
            break;
        case "oauth":
            auth.clientId = inflateNameOrString(auth.clientId, cg);
            auth.clientSecret = inflateNameOrString(auth.clientSecret, cg);
            break;
    }
}

function inflateDynamicRequest(request: dynamic.Request | undefined, cg: FullCasingsGenerator): void {
    if (request == null) {
        return;
    }
    switch (request.type) {
        case "body":
            for (const param of request.pathParameters ?? []) {
                inflateDynamicNamedParameter(param, cg);
            }
            break;
        case "inlined":
            inflateDynamicDeclaration(request.declaration, cg);
            for (const param of request.pathParameters ?? []) {
                inflateDynamicNamedParameter(param, cg);
            }
            for (const param of request.queryParameters ?? []) {
                inflateDynamicNamedParameter(param, cg);
            }
            for (const param of request.headers ?? []) {
                inflateDynamicNamedParameter(param, cg);
            }
            inflateDynamicInlinedRequestBody(request.body, cg);
            break;
    }
}

function inflateDynamicInlinedRequestBody(
    body: dynamic.InlinedRequestBody | undefined,
    cg: FullCasingsGenerator
): void {
    if (body == null) {
        return;
    }
    switch (body.type) {
        case "properties":
            if (Array.isArray(body.value)) {
                for (const param of body.value) {
                    inflateDynamicNamedParameter(param, cg);
                }
            }
            break;
        case "referenced":
            body.bodyKey = inflateNameOrString(body.bodyKey, cg);
            break;
        case "fileUpload":
            for (const prop of body.properties ?? []) {
                switch (prop.type) {
                    case "file":
                    case "fileArray":
                        inflateDynamicNameAndWireValueInPlace(prop, cg);
                        break;
                    case "bodyProperty":
                        inflateDynamicNamedParameter(prop, cg);
                        break;
                }
            }
            break;
    }
}

function inflateDynamicVariableDeclaration(v: dynamic.VariableDeclaration | undefined, cg: FullCasingsGenerator): void {
    if (v == null) {
        return;
    }
    v.name = inflateNameOrString(v.name, cg);
}

function inflateDynamicEnvironmentsConfig(
    config: dynamic.EnvironmentsConfig | undefined,
    cg: FullCasingsGenerator
): void {
    if (config == null || config.environments == null) {
        return;
    }
    switch (config.environments.type) {
        case "singleBaseUrl":
            for (const env of config.environments.environments ?? []) {
                env.name = inflateNameOrString(env.name, cg);
            }
            break;
        case "multipleBaseUrls":
            for (const bu of config.environments.baseUrls ?? []) {
                bu.name = inflateNameOrString(bu.name, cg);
            }
            for (const env of config.environments.environments ?? []) {
                env.name = inflateNameOrString(env.name, cg);
            }
            break;
    }
}

// ---------------------------------------------------------------------------
// In-place mutation helpers for FernFilepath and NameAndWireValue
// ---------------------------------------------------------------------------

function inflateFernFilepathInPlace(fp: FernFilepath | undefined, cg: FullCasingsGenerator): void {
    if (fp == null) {
        return;
    }
    fp.allParts = (fp.allParts ?? []).map((n: NameOrString) => inflateNameOrString(n, cg));
    fp.packagePath = (fp.packagePath ?? []).map((n: NameOrString) => inflateNameOrString(n, cg));
    if (fp.file != null) {
        fp.file = inflateNameOrString(fp.file, cg);
    }
}

function inflateNameAndWireValueInPlace(nwv: NameAndWireValue | undefined, cg: FullCasingsGenerator): void {
    if (nwv == null) {
        return;
    }
    nwv.name = inflateNameOrString(nwv.name, cg);
}
