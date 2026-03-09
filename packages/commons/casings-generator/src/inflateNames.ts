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

type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

type DeepReplace<T, From, To> =
    IsExact<T, From> extends true
        ? To
        : IsExact<T, From | undefined> extends true
          ? To | undefined
          : // biome-ignore lint/suspicious/noExplicitAny: necessary for function detection in type utility
            T extends (...args: any[]) => any // eslint-disable-line @typescript-eslint/no-explicit-any
            ? T
            : T extends Array<infer Item>
              ? Array<DeepReplace<Item, From, To>>
              : T extends object
                ? { [K in keyof T]: DeepReplace<T[K], From, To> }
                : T;

export type NormalizedIR<T> = DeepReplace<T, NameOrString, Name>;

// ---------------------------------------------------------------------------
// Core inflation helpers
// ---------------------------------------------------------------------------

export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: FullCasingsGenerator): Name;
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: CasingsGenerator): NameOrString;
export function inflateNameOrString(nameOrString: NameOrString, casingsGenerator: CasingsGenerator): NameOrString {
    if (typeof nameOrString === "string") {
        return casingsGenerator.generateName(nameOrString);
    }
    return nameOrString;
}

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

export function inflateNameAndWireValue(
    nwv: NameAndWireValue,
    casingsGenerator: FullCasingsGenerator
): NameAndWireValue;
export function inflateNameAndWireValue(nwv: NameAndWireValue, casingsGenerator: CasingsGenerator): NameAndWireValue;
export function inflateNameAndWireValue(nwv: NameAndWireValue, casingsGenerator: CasingsGenerator): NameAndWireValue {
    return {
        ...nwv,
        name: inflateNameOrString(nwv.name, casingsGenerator)
    };
}

export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: FullCasingsGenerator): FernFilepath;
export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: CasingsGenerator): FernFilepath;
export function inflateFernFilepath(fp: FernFilepath, casingsGenerator: CasingsGenerator): FernFilepath {
    return {
        allParts: fp.allParts.map((n) => inflateNameOrString(n, casingsGenerator)),
        packagePath: fp.packagePath.map((n) => inflateNameOrString(n, casingsGenerator)),
        file: inflateOptionalNameOrString(fp.file, casingsGenerator)
    };
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function mapRecord<V, R>(record: Record<string, V>, fn: (value: V) => R): Record<string, R> {
    const result: Record<string, R> = {};
    for (const [k, v] of Object.entries(record)) {
        result[k] = fn(v);
    }
    return result;
}

// ---------------------------------------------------------------------------
// IR-level inflation
// ---------------------------------------------------------------------------

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

export function inflateIrNames(
    ir: IntermediateRepresentation,
    opts?: {
        generationLanguage?: generatorsYml.GenerationLanguage;
        keywords?: string[];
        smartCasing?: boolean;
    }
): NormalizedIR<IntermediateRepresentation>;
export function inflateIrNames(
    ir: IntermediateRepresentation,
    opts?: {
        generationLanguage?: generatorsYml.GenerationLanguage;
        keywords?: string[];
        smartCasing?: boolean;
    }
): IntermediateRepresentation {
    const cg = constructCasingsGenerator({
        generationLanguage:
            opts?.generationLanguage ??
            (ir.generationLanguage as generatorsYml.GenerationLanguage | undefined) ??
            undefined,
        keywords: opts?.keywords ?? undefined,
        smartCasing: opts?.smartCasing ?? ir.smartCasing ?? false
    });

    return inflateIr(ir, cg);
}

export function inflateDynamicIrNames(
    ir: dynamic.DynamicIntermediateRepresentation
): NormalizedIR<dynamic.DynamicIntermediateRepresentation>;
export function inflateDynamicIrNames(
    ir: dynamic.DynamicIntermediateRepresentation
): dynamic.DynamicIntermediateRepresentation {
    const cg = constructCasingsGenerator({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false
    });
    return inflateDynamicIr(ir, cg);
}

// ---------------------------------------------------------------------------
// Main IR inflation -- constructs new objects, no mutation
// ---------------------------------------------------------------------------

function inflateIr(ir: IntermediateRepresentation, cg: FullCasingsGenerator) {
    return {
        ...ir,
        apiName: inflateNameOrString(ir.apiName, cg),
        apiVersion: ir.apiVersion != null ? inflateApiVersionScheme(ir.apiVersion, cg) : undefined,
        auth: inflateApiAuth(ir.auth, cg),
        headers: ir.headers.map((h) => inflateHttpHeader(h, cg)),
        idempotencyHeaders: ir.idempotencyHeaders.map((h) => inflateHttpHeader(h, cg)),
        types: mapRecord(ir.types, (td) => inflateTypeDeclaration(td, cg)),
        services: mapRecord(ir.services, (s) => inflateHttpService(s, cg)),
        webhookGroups: mapRecord(ir.webhookGroups, (g) => inflateWebhookGroup(g, cg)),
        websocketChannels:
            ir.websocketChannels != null
                ? mapRecord(ir.websocketChannels, (ch) => inflateWebSocketChannel(ch, cg))
                : undefined,
        errors: mapRecord(ir.errors, (e) => inflateErrorDeclaration(e, cg)),
        subpackages: mapRecord(ir.subpackages, (s) => inflateSubpackage(s, cg)),
        rootPackage: inflatePackage(ir.rootPackage, cg),
        constants: inflateConstants(ir.constants, cg),
        environments: ir.environments != null ? inflateEnvironmentsConfig(ir.environments, cg) : undefined,
        pathParameters: ir.pathParameters.map((p) => inflatePathParameter(p, cg)),
        errorDiscriminationStrategy: inflateErrorDiscriminationStrategy(ir.errorDiscriminationStrategy, cg),
        variables: ir.variables.map((v) => inflateVariableDeclaration(v, cg)),
        dynamic: ir.dynamic != null ? inflateDynamicIr(ir.dynamic, cg) : undefined
    };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function inflateApiAuth(auth: ApiAuth, cg: FullCasingsGenerator) {
    return {
        ...auth,
        schemes: auth.schemes.map((s) => inflateAuthScheme(s, cg))
    };
}

function inflateAuthScheme(scheme: AuthScheme, cg: FullCasingsGenerator) {
    switch (scheme.type) {
        case "bearer":
            return { ...scheme, token: inflateNameOrString(scheme.token, cg) };
        case "basic":
            return {
                ...scheme,
                username: inflateNameOrString(scheme.username, cg),
                password: inflateNameOrString(scheme.password, cg)
            };
        case "header":
            return {
                ...scheme,
                name: inflateNameAndWireValue(scheme.name, cg),
                valueType: inflateTypeReference(scheme.valueType, cg)
            };
        case "oauth":
            return { ...scheme, configuration: inflateOAuthConfiguration(scheme.configuration, cg) };
        default:
            return scheme;
    }
}

function inflateOAuthConfiguration(config: OAuthConfiguration, cg: FullCasingsGenerator) {
    if (config.type === "clientCredentials") {
        return {
            ...config,
            tokenEndpoint: inflateOAuthTokenEndpoint(config.tokenEndpoint, cg),
            refreshEndpoint:
                config.refreshEndpoint != null ? inflateOAuthRefreshEndpoint(config.refreshEndpoint, cg) : undefined
        };
    }
    return config;
}

function inflateOAuthTokenEndpoint(endpoint: OAuthTokenEndpoint, cg: FullCasingsGenerator) {
    return {
        ...endpoint,
        requestProperties: inflateOAuthAccessTokenRequestProperties(endpoint.requestProperties, cg),
        responseProperties: inflateOAuthResponseProperties(endpoint.responseProperties, cg)
    };
}

function inflateOAuthRefreshEndpoint(endpoint: OAuthRefreshEndpoint, cg: FullCasingsGenerator) {
    return {
        ...endpoint,
        requestProperties: inflateOAuthRefreshTokenRequestProperties(endpoint.requestProperties, cg),
        responseProperties: inflateOAuthResponseProperties(endpoint.responseProperties, cg)
    };
}

function inflateOAuthAccessTokenRequestProperties(props: OAuthAccessTokenRequestProperties, cg: FullCasingsGenerator) {
    return {
        ...props,
        clientId: inflateRequestProperty(props.clientId, cg),
        clientSecret: inflateRequestProperty(props.clientSecret, cg),
        scopes: props.scopes != null ? inflateRequestProperty(props.scopes, cg) : undefined,
        customProperties: (props.customProperties ?? []).map((p) => inflateRequestProperty(p, cg))
    };
}

function inflateOAuthRefreshTokenRequestProperties(
    props: OAuthRefreshTokenRequestProperties,
    cg: FullCasingsGenerator
) {
    return {
        ...props,
        refreshToken: inflateRequestProperty(props.refreshToken, cg)
    };
}

function inflateOAuthResponseProperties(props: OAuthAccessTokenResponseProperties, cg: FullCasingsGenerator) {
    return {
        ...props,
        accessToken: inflateResponseProperty(props.accessToken, cg),
        expiresIn: props.expiresIn != null ? inflateResponseProperty(props.expiresIn, cg) : undefined,
        refreshToken: props.refreshToken != null ? inflateResponseProperty(props.refreshToken, cg) : undefined
    };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

function inflateTypeDeclaration(td: TypeDeclaration, cg: FullCasingsGenerator) {
    return {
        ...td,
        name: inflateDeclaredTypeName(td.name, cg),
        shape: inflateTypeShape(td.shape, cg),
        source: td.source != null ? inflateTypeDeclarationSource(td.source, cg) : undefined,
        autogeneratedExamples: (td.autogeneratedExamples ?? []).map((ex) => inflateExampleType(ex, cg)),
        userProvidedExamples: (td.userProvidedExamples ?? []).map((ex) => inflateExampleType(ex, cg))
    };
}

function inflateDeclaredTypeName(dtn: DeclaredTypeName, cg: FullCasingsGenerator) {
    return {
        ...dtn,
        name: inflateNameOrString(dtn.name, cg),
        fernFilepath: inflateFernFilepath(dtn.fernFilepath, cg)
    };
}

function inflateTypeShape(shape: Type, cg: FullCasingsGenerator) {
    switch (shape.type) {
        case "alias":
            return {
                ...shape,
                aliasOf: inflateTypeReference(shape.aliasOf, cg),
                resolvedType: inflateResolvedTypeReference(shape.resolvedType, cg)
            };
        case "enum":
            return {
                ...shape,
                default: shape.default != null ? inflateEnumValue(shape.default, cg) : undefined,
                values: (shape.values ?? []).map((v) => inflateEnumValue(v, cg))
            };
        case "object":
            return {
                ...shape,
                extends: shape.extends.map((ext) => inflateDeclaredTypeName(ext, cg)),
                properties: shape.properties.map((p) => inflateObjectProperty(p, cg)),
                extendedProperties: (shape.extendedProperties ?? []).map((p) => inflateObjectProperty(p, cg))
            };
        case "union":
            return {
                ...shape,
                discriminant: inflateNameAndWireValue(shape.discriminant, cg),
                extends: shape.extends.map((ext) => inflateDeclaredTypeName(ext, cg)),
                baseProperties: shape.baseProperties.map((p) => inflateObjectProperty(p, cg)),
                types: shape.types.map((t) => inflateSingleUnionType(t, cg))
            };
        case "undiscriminatedUnion":
            return {
                ...shape,
                members: (shape.members ?? []).map((m) => ({
                    ...m,
                    type: inflateTypeReference(m.type, cg)
                }))
            };
    }
}

function inflateAliasTypeDeclaration(alias: AliasTypeDeclaration, cg: FullCasingsGenerator) {
    return {
        ...alias,
        aliasOf: inflateTypeReference(alias.aliasOf, cg),
        resolvedType: inflateResolvedTypeReference(alias.resolvedType, cg)
    };
}

function inflateResolvedTypeReference(resolved: ResolvedTypeReference, cg: FullCasingsGenerator) {
    switch (resolved.type) {
        case "named":
            return { ...resolved, name: inflateDeclaredTypeName(resolved.name, cg) };
        case "container":
            return { ...resolved, container: inflateContainerType(resolved.container, cg) };
        default:
            return resolved;
    }
}

function inflateTypeReference(tr: TypeReference, cg: FullCasingsGenerator): TypeReference {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (tr.type) {
        case "named":
            return {
                ...tr,
                name: inflateNameOrString(tr.name, cg),
                fernFilepath: inflateFernFilepath(tr.fernFilepath, cg),
                default:
                    tr.default != null
                        ? { ...tr.default, name: inflateNameAndWireValue(tr.default.name, cg) }
                        : tr.default
            };
        case "container":
            return { ...tr, container: inflateContainerType(tr.container, cg) };
        default:
            return tr;
    }
}

function inflateContainerType(ct: ContainerType, cg: FullCasingsGenerator): ContainerType {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (ct.type) {
        case "list":
            return { ...ct, list: inflateTypeReference(ct.list, cg) };
        case "nullable":
            return { ...ct, nullable: inflateTypeReference(ct.nullable, cg) };
        case "optional":
            return { ...ct, optional: inflateTypeReference(ct.optional, cg) };
        case "set":
            return { ...ct, set: inflateTypeReference(ct.set, cg) };
        case "map":
            return {
                ...ct,
                keyType: inflateTypeReference(ct.keyType, cg),
                valueType: inflateTypeReference(ct.valueType, cg)
            };
        default:
            return ct;
    }
}

function inflateEnumTypeDeclaration(enumDecl: EnumTypeDeclaration, cg: FullCasingsGenerator) {
    return {
        ...enumDecl,
        default: enumDecl.default != null ? inflateEnumValue(enumDecl.default, cg) : undefined,
        values: (enumDecl.values ?? []).map((v) => inflateEnumValue(v, cg))
    };
}

function inflateEnumValue(ev: EnumValue, cg: FullCasingsGenerator) {
    return { ...ev, name: inflateNameAndWireValue(ev.name, cg) };
}

function inflateObjectTypeDeclaration(obj: ObjectTypeDeclaration, cg: FullCasingsGenerator) {
    return {
        ...obj,
        extends: (obj.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
        properties: (obj.properties ?? []).map((p) => inflateObjectProperty(p, cg)),
        extendedProperties: (obj.extendedProperties ?? []).map((p) => inflateObjectProperty(p, cg))
    };
}

function inflateObjectProperty(prop: ObjectProperty, cg: FullCasingsGenerator) {
    return {
        ...prop,
        name: inflateNameAndWireValue(prop.name, cg),
        valueType: inflateTypeReference(prop.valueType, cg)
    };
}

function inflateUnionTypeDeclaration(union: UnionTypeDeclaration, cg: FullCasingsGenerator) {
    return {
        ...union,
        discriminant: inflateNameAndWireValue(union.discriminant, cg),
        extends: (union.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
        types: (union.types ?? []).map((sut) => inflateSingleUnionType(sut, cg)),
        baseProperties: (union.baseProperties ?? []).map((p) => inflateObjectProperty(p, cg))
    };
}

function inflateSingleUnionType(sut: SingleUnionType, cg: FullCasingsGenerator) {
    const base = {
        ...sut,
        discriminantValue: inflateNameAndWireValue(sut.discriminantValue, cg)
    };
    if (sut.shape == null) {
        return base;
    }
    switch (sut.shape.propertiesType) {
        case "samePropertiesAsObject":
            return {
                ...base,
                shape: {
                    ...sut.shape,
                    name: inflateNameOrString(sut.shape.name, cg),
                    fernFilepath: inflateFernFilepath(sut.shape.fernFilepath, cg)
                }
            };
        case "singleProperty":
            return {
                ...base,
                shape: {
                    ...sut.shape,
                    name: inflateNameAndWireValue(sut.shape.name, cg),
                    type: inflateTypeReference(sut.shape.type, cg)
                }
            };
        default:
            return base;
    }
}

function inflateUndiscriminatedUnionTypeDeclaration(
    uuDecl: UndiscriminatedUnionTypeDeclaration,
    cg: FullCasingsGenerator
) {
    return {
        ...uuDecl,
        members: (uuDecl.members ?? []).map((m) => ({
            ...m,
            type: inflateTypeReference(m.type, cg)
        }))
    };
}

// ---------------------------------------------------------------------------
// HTTP Services and Endpoints
// ---------------------------------------------------------------------------

function inflateHttpService(service: HttpService, cg: FullCasingsGenerator) {
    return {
        ...service,
        name: {
            ...service.name,
            fernFilepath: inflateFernFilepath(service.name.fernFilepath, cg)
        },
        endpoints: (service.endpoints ?? []).map((ep) => inflateHttpEndpoint(ep, cg)),
        headers: (service.headers ?? []).map((h) => inflateHttpHeader(h, cg)),
        pathParameters: (service.pathParameters ?? []).map((p) => inflatePathParameter(p, cg)),
        transport: service.transport != null ? inflateTransport(service.transport, cg) : undefined
    };
}

function inflateHttpEndpoint(ep: HttpEndpoint, cg: FullCasingsGenerator) {
    return {
        ...ep,
        name: inflateNameOrString(ep.name, cg),
        headers: (ep.headers ?? []).map((h) => inflateHttpHeader(h, cg)),
        responseHeaders: (ep.responseHeaders ?? []).map((h) => inflateHttpHeader(h, cg)),
        pathParameters: (ep.pathParameters ?? []).map((p) => inflatePathParameter(p, cg)),
        allPathParameters: (ep.allPathParameters ?? []).map((p) => inflatePathParameter(p, cg)),
        queryParameters: (ep.queryParameters ?? []).map((qp) => inflateQueryParameter(qp, cg)),
        requestBody: ep.requestBody != null ? inflateHttpRequestBody(ep.requestBody, cg) : undefined,
        v2RequestBodies:
            ep.v2RequestBodies != null
                ? {
                      ...ep.v2RequestBodies,
                      requestBodies: (ep.v2RequestBodies.requestBodies ?? []).map((b) => inflateHttpRequestBody(b, cg))
                  }
                : undefined,
        sdkRequest: ep.sdkRequest != null ? inflateSdkRequest(ep.sdkRequest, cg) : undefined,
        response: ep.response != null ? inflateHttpResponse(ep.response, cg) : undefined,
        v2Responses:
            ep.v2Responses != null
                ? {
                      ...ep.v2Responses,
                      responses: (ep.v2Responses.responses ?? []).map((r) => inflateHttpResponse(r, cg))
                  }
                : undefined,
        errors: (ep.errors ?? []).map((err) => ({
            ...err,
            error: inflateDeclaredErrorName(err.error, cg)
        })),
        pagination: ep.pagination != null ? inflatePagination(ep.pagination, cg) : undefined,
        userSpecifiedExamples: (ep.userSpecifiedExamples ?? []).map((ex) => ({
            ...ex,
            example: ex.example != null ? inflateExampleEndpointCall(ex.example, cg) : undefined,
            codeSamples: (ex.codeSamples ?? []).map((cs) => inflateExampleCodeSample(cs, cg))
        })),
        autogeneratedExamples: (ep.autogeneratedExamples ?? []).map((ex) => ({
            ...ex,
            example: inflateExampleEndpointCall(ex.example, cg)
        })),
        transport: ep.transport != null ? inflateTransport(ep.transport, cg) : undefined
    };
}

function inflateTransport(transport: Transport, cg: FullCasingsGenerator) {
    if (transport.type === "grpc") {
        return { ...transport, service: inflateProtobufService(transport.service, cg) };
    }
    return transport;
}

function inflateProtobufService(ps: ProtobufService, cg: FullCasingsGenerator) {
    return { ...ps, name: inflateNameOrString(ps.name, cg) };
}

function inflateHttpHeader(header: HttpHeader, cg: FullCasingsGenerator) {
    return {
        ...header,
        name: inflateNameAndWireValue(header.name, cg),
        valueType: inflateTypeReference(header.valueType, cg)
    };
}

function inflatePathParameter(param: PathParameter, cg: FullCasingsGenerator) {
    return {
        ...param,
        name: inflateNameOrString(param.name, cg),
        valueType: inflateTypeReference(param.valueType, cg)
    };
}

function inflateQueryParameter(qp: QueryParameter, cg: FullCasingsGenerator) {
    return {
        ...qp,
        name: inflateNameAndWireValue(qp.name, cg),
        valueType: inflateTypeReference(qp.valueType, cg)
    };
}

function inflateHttpRequestBody(body: HttpRequestBody, cg: FullCasingsGenerator) {
    switch (body.type) {
        case "inlinedRequestBody":
            return {
                ...body,
                name: inflateNameOrString(body.name, cg),
                extends: (body.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
                properties: (body.properties ?? []).map((p) => ({
                    ...p,
                    name: inflateNameAndWireValue(p.name, cg),
                    valueType: inflateTypeReference(p.valueType, cg)
                })),
                extendedProperties: (body.extendedProperties ?? []).map((p) => inflateObjectProperty(p, cg))
            };
        case "reference":
            return { ...body, requestBodyType: inflateTypeReference(body.requestBodyType, cg) };
        case "fileUpload":
            return {
                ...body,
                name: inflateNameOrString(body.name, cg),
                properties: (body.properties ?? []).map((prop) => {
                    if (prop.type === "file") {
                        return { ...prop, value: inflateFileProperty(prop.value, cg) };
                    } else if (prop.type === "bodyProperty") {
                        return {
                            ...prop,
                            name: inflateNameAndWireValue(prop.name, cg),
                            valueType: inflateTypeReference(prop.valueType, cg)
                        };
                    }
                    return prop;
                })
            };
        default:
            return body;
    }
}

function inflateInlinedRequestBody(irb: InlinedRequestBody, cg: FullCasingsGenerator) {
    return {
        ...irb,
        name: inflateNameOrString(irb.name, cg),
        extends: (irb.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
        properties: (irb.properties ?? []).map((p) => ({
            ...p,
            name: inflateNameAndWireValue(p.name, cg),
            valueType: inflateTypeReference(p.valueType, cg)
        })),
        extendedProperties: (irb.extendedProperties ?? []).map((p) => inflateObjectProperty(p, cg))
    };
}

function inflateFileUploadRequest(fur: FileUploadRequest, cg: FullCasingsGenerator) {
    return {
        ...fur,
        name: inflateNameOrString(fur.name, cg),
        properties: (fur.properties ?? []).map((prop) => {
            if (prop.type === "file") {
                return { ...prop, value: inflateFileProperty(prop.value, cg) };
            } else if (prop.type === "bodyProperty") {
                return {
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    valueType: inflateTypeReference(prop.valueType, cg)
                };
            }
            return prop;
        })
    };
}

function inflateFileProperty(fp: FileProperty, cg: FullCasingsGenerator) {
    return { ...fp, key: inflateNameAndWireValue(fp.key, cg) };
}

function inflateSdkRequest(sdkReq: SdkRequest, cg: FullCasingsGenerator) {
    const base = {
        ...sdkReq,
        requestParameterName: inflateNameOrString(sdkReq.requestParameterName, cg),
        streamParameter: sdkReq.streamParameter != null ? inflateRequestProperty(sdkReq.streamParameter, cg) : undefined
    };
    if (sdkReq.shape == null) {
        return base;
    }
    if (sdkReq.shape.type === "wrapper") {
        return {
            ...base,
            shape: {
                ...sdkReq.shape,
                wrapperName: inflateNameOrString(sdkReq.shape.wrapperName, cg),
                bodyKey: inflateNameOrString(sdkReq.shape.bodyKey, cg)
            }
        };
    }
    if (sdkReq.shape.type === "justRequestBody") {
        return {
            ...base,
            shape: {
                ...sdkReq.shape,
                value: inflateSdkRequestBodyType(sdkReq.shape.value, cg)
            }
        };
    }
    return base;
}

function inflateSdkRequestBodyType(bodyType: SdkRequestBodyType, cg: FullCasingsGenerator) {
    if (bodyType.type === "typeReference") {
        return { ...bodyType, requestBodyType: inflateTypeReference(bodyType.requestBodyType, cg) };
    }
    return bodyType;
}

function inflateHttpResponse(resp: HttpResponse, cg: FullCasingsGenerator) {
    return {
        ...resp,
        body: resp.body != null ? inflateHttpResponseBody(resp.body, cg) : undefined
    };
}

function inflateHttpResponseBody(body: HttpResponseBody, cg: FullCasingsGenerator) {
    switch (body.type) {
        case "json":
            return { ...body, value: inflateJsonResponse(body.value, cg) };
        case "streaming":
            return { ...body, value: inflateStreamingResponse(body.value, cg) };
        case "streamParameter":
            return {
                ...body,
                nonStreamResponse: inflateNonStreamHttpResponseBody(body.nonStreamResponse, cg),
                streamResponse: inflateStreamingResponse(body.streamResponse, cg)
            };
        default:
            return body;
    }
}

function inflateNonStreamHttpResponseBody(body: NonStreamHttpResponseBody, cg: FullCasingsGenerator) {
    if (body.type === "json") {
        return { ...body, value: inflateJsonResponse(body.value, cg) };
    }
    return body;
}

function inflateJsonResponse(json: JsonResponse, cg: FullCasingsGenerator) {
    switch (json.type) {
        case "response":
            return { ...json, responseBodyType: inflateTypeReference(json.responseBodyType, cg) };
        case "nestedPropertyAsResponse":
            return {
                ...json,
                responseBodyType: inflateTypeReference(json.responseBodyType, cg),
                responseProperty:
                    json.responseProperty != null ? inflateObjectProperty(json.responseProperty, cg) : undefined
            };
        default:
            return json;
    }
}

function inflateStreamingResponse(sr: StreamingResponse, cg: FullCasingsGenerator) {
    if (sr.type === "json" || sr.type === "sse") {
        return { ...sr, payload: inflateTypeReference(sr.payload, cg) };
    }
    return sr;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function inflatePagination(pagination: Pagination, cg: FullCasingsGenerator) {
    switch (pagination.type) {
        case "cursor":
            return {
                ...pagination,
                page: inflateRequestProperty(pagination.page, cg),
                next: inflateResponseProperty(pagination.next, cg),
                results: inflateResponseProperty(pagination.results, cg)
            };
        case "offset":
            return {
                ...pagination,
                page: inflateRequestProperty(pagination.page, cg),
                results: inflateResponseProperty(pagination.results, cg),
                hasNextPage:
                    pagination.hasNextPage != null ? inflateResponseProperty(pagination.hasNextPage, cg) : undefined,
                step: pagination.step != null ? inflateRequestProperty(pagination.step, cg) : undefined
            };
        case "custom":
            return { ...pagination, results: inflateResponseProperty(pagination.results, cg) };
        case "uri":
            return {
                ...pagination,
                nextUri: inflateResponseProperty(pagination.nextUri, cg),
                results: inflateResponseProperty(pagination.results, cg)
            };
        case "path":
            return {
                ...pagination,
                nextPath: inflateResponseProperty(pagination.nextPath, cg),
                results: inflateResponseProperty(pagination.results, cg)
            };
    }
}

function inflateRequestProperty(rp: RequestProperty, cg: FullCasingsGenerator) {
    const inflatedPropertyPath = (rp.propertyPath ?? []).map((item) => inflatePropertyPathItem(item, cg));
    if (rp.property == null) {
        return { ...rp, propertyPath: inflatedPropertyPath };
    }
    switch (rp.property.type) {
        case "query":
            return {
                ...rp,
                propertyPath: inflatedPropertyPath,
                property: {
                    ...rp.property,
                    name: inflateNameAndWireValue(rp.property.name, cg),
                    valueType: inflateTypeReference(rp.property.valueType, cg)
                }
            };
        case "body":
            return {
                ...rp,
                propertyPath: inflatedPropertyPath,
                property: {
                    ...rp.property,
                    name: inflateNameAndWireValue(rp.property.name, cg),
                    valueType: inflateTypeReference(rp.property.valueType, cg)
                }
            };
        default:
            return { ...rp, propertyPath: inflatedPropertyPath };
    }
}

function inflateResponseProperty(rp: ResponseProperty, cg: FullCasingsGenerator) {
    return {
        ...rp,
        propertyPath: (rp.propertyPath ?? []).map((item) => inflatePropertyPathItem(item, cg)),
        property: inflateObjectProperty(rp.property, cg)
    };
}

function inflatePropertyPathItem(item: PropertyPathItem, cg: FullCasingsGenerator) {
    return {
        ...item,
        name: inflateNameOrString(item.name, cg),
        type: inflateTypeReference(item.type, cg)
    };
}

// ---------------------------------------------------------------------------
// Examples
// ---------------------------------------------------------------------------

function inflateExampleEndpointCall(ex: ExampleEndpointCall, cg: FullCasingsGenerator) {
    return {
        ...ex,
        name: ex.name != null ? inflateNameOrString(ex.name, cg) : undefined,
        rootPathParameters: (ex.rootPathParameters ?? []).map((pp) => inflateExamplePathParameter(pp, cg)),
        servicePathParameters: (ex.servicePathParameters ?? []).map((pp) => inflateExamplePathParameter(pp, cg)),
        endpointPathParameters: (ex.endpointPathParameters ?? []).map((pp) => inflateExamplePathParameter(pp, cg)),
        serviceHeaders: (ex.serviceHeaders ?? []).map((h) => ({
            ...h,
            name: inflateNameAndWireValue(h.name, cg)
        })),
        endpointHeaders: (ex.endpointHeaders ?? []).map((h) => ({
            ...h,
            name: inflateNameAndWireValue(h.name, cg)
        })),
        queryParameters: (ex.queryParameters ?? []).map((qp) => ({
            ...qp,
            name: inflateNameAndWireValue(qp.name, cg)
        })),
        request: ex.request != null ? inflateExampleRequestBody(ex.request, cg) : undefined,
        response: inflateExampleResponse(ex.response, cg)
    };
}

function inflateExamplePathParameter(pp: ExamplePathParameter, cg: FullCasingsGenerator) {
    return {
        ...pp,
        name: inflateNameOrString(pp.name, cg),
        value: inflateExampleTypeReference(pp.value, cg)
    };
}

function inflateExampleRequestBody(body: ExampleRequestBody, cg: FullCasingsGenerator) {
    switch (body.type) {
        case "inlinedRequestBody": {
            const inflated = inflateExampleInlinedRequestBody(body, cg);
            return { ...body, properties: inflated.properties, extraProperties: inflated.extraProperties };
        }
        case "reference": {
            const inflated = inflateExampleTypeReference(body, cg);
            return { ...body, shape: inflated.shape };
        }
        default:
            return body;
    }
}

function inflateExampleInlinedRequestBody(body: ExampleInlinedRequestBody, cg: FullCasingsGenerator) {
    return {
        ...body,
        properties: (body.properties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg),
            originalTypeDeclaration:
                prop.originalTypeDeclaration != null
                    ? inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                    : undefined
        })),
        extraProperties: (body.extraProperties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg)
        }))
    };
}

function inflateExampleResponse(resp: ExampleResponse, cg: FullCasingsGenerator) {
    if (resp.type === "ok") {
        return { ...resp, value: inflateExampleEndpointSuccessResponse(resp.value, cg) };
    }
    if (resp.type === "error") {
        return {
            ...resp,
            error: inflateDeclaredErrorName(resp.error, cg),
            body: resp.body != null ? inflateExampleTypeReference(resp.body, cg) : undefined
        };
    }
    return resp;
}

function inflateExampleEndpointSuccessResponse(resp: ExampleEndpointSuccessResponse, cg: FullCasingsGenerator) {
    switch (resp.type) {
        case "body":
            return {
                ...resp,
                value: resp.value != null ? inflateExampleTypeReference(resp.value, cg) : undefined
            };
        case "stream":
            return {
                ...resp,
                value: (resp.value ?? []).map((item) => inflateExampleTypeReference(item, cg))
            };
        case "sse":
            return {
                ...resp,
                value: (resp.value ?? []).map((evt) => ({
                    ...evt,
                    data: inflateExampleTypeReference(evt.data, cg)
                }))
            };
        default:
            return resp;
    }
}

function inflateExampleCodeSample(cs: ExampleCodeSample, cg: FullCasingsGenerator) {
    if (cs.name != null) {
        return { ...cs, name: inflateNameOrString(cs.name, cg) };
    }
    return cs;
}

function inflateExampleType(ex: ExampleType, cg: FullCasingsGenerator) {
    return {
        ...ex,
        name: ex.name != null ? inflateNameOrString(ex.name, cg) : undefined,
        shape: inflateExampleTypeShape(ex.shape, cg)
    };
}

function inflateExampleTypeShape(shape: ExampleTypeShape, cg: FullCasingsGenerator): ExampleTypeShape {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (shape.type) {
        case "alias":
            return { ...shape, value: inflateExampleTypeReference(shape.value, cg) };
        case "enum":
            return { ...shape, value: inflateNameAndWireValue(shape.value, cg) };
        case "object":
            return {
                ...shape,
                properties: (shape.properties ?? []).map((prop) => ({
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    value: inflateExampleTypeReference(prop.value, cg),
                    originalTypeDeclaration: inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                })),
                extraProperties: (shape.extraProperties ?? []).map((prop) => ({
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    value: inflateExampleTypeReference(prop.value, cg)
                }))
            };
        case "union":
            return {
                ...shape,
                discriminant: inflateNameAndWireValue(shape.discriminant, cg),
                singleUnionType: {
                    ...shape.singleUnionType,
                    wireDiscriminantValue: inflateNameAndWireValue(shape.singleUnionType.wireDiscriminantValue, cg),
                    shape: inflateExampleSingleUnionTypeProperties(shape.singleUnionType.shape, cg)
                },
                extendProperties: (shape.extendProperties ?? []).map((prop) => ({
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    value: inflateExampleTypeReference(prop.value, cg),
                    originalTypeDeclaration: inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                })),
                baseProperties: (shape.baseProperties ?? []).map((prop) => ({
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    value: inflateExampleTypeReference(prop.value, cg)
                }))
            };
        case "undiscriminatedUnion":
            return { ...shape, singleUnionType: inflateExampleTypeReference(shape.singleUnionType, cg) };
    }
}

function inflateExampleObjectType(obj: ExampleObjectType, cg: FullCasingsGenerator) {
    return {
        ...obj,
        properties: (obj.properties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg),
            originalTypeDeclaration:
                prop.originalTypeDeclaration != null
                    ? inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                    : undefined
        })),
        extraProperties: (obj.extraProperties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg)
        }))
    };
}

function inflateExampleUnionType(union: ExampleUnionType, cg: FullCasingsGenerator) {
    return {
        ...union,
        discriminant: inflateNameAndWireValue(union.discriminant, cg),
        singleUnionType:
            union.singleUnionType != null
                ? {
                      ...union.singleUnionType,
                      wireDiscriminantValue: inflateNameAndWireValue(union.singleUnionType.wireDiscriminantValue, cg),
                      shape: inflateExampleSingleUnionTypeProperties(union.singleUnionType.shape, cg)
                  }
                : undefined,
        extendProperties: (union.extendProperties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg),
            originalTypeDeclaration:
                prop.originalTypeDeclaration != null
                    ? inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                    : undefined
        })),
        baseProperties: (union.baseProperties ?? []).map((prop) => ({
            ...prop,
            name: inflateNameAndWireValue(prop.name, cg),
            value: inflateExampleTypeReference(prop.value, cg)
        }))
    };
}

function inflateExampleSingleUnionTypeProperties(
    sutProps: ExampleSingleUnionTypeProperties,
    cg: FullCasingsGenerator
): ExampleSingleUnionTypeProperties {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (sutProps.type) {
        case "samePropertiesAsObject":
            return {
                ...sutProps,
                object: {
                    ...sutProps.object,
                    properties: (sutProps.object.properties ?? []).map((prop) => ({
                        ...prop,
                        name: inflateNameAndWireValue(prop.name, cg),
                        value: inflateExampleTypeReference(prop.value, cg),
                        originalTypeDeclaration: inflateDeclaredTypeName(prop.originalTypeDeclaration, cg)
                    })),
                    extraProperties: (sutProps.object.extraProperties ?? []).map((prop) => ({
                        ...prop,
                        name: inflateNameAndWireValue(prop.name, cg),
                        value: inflateExampleTypeReference(prop.value, cg)
                    }))
                }
            };
        case "singleProperty": {
            const inflatedRef = inflateExampleTypeReference(sutProps, cg);
            return { ...sutProps, shape: inflatedRef.shape };
        }
        default:
            return sutProps;
    }
}

function inflateExampleTypeReference(etr: ExampleTypeReference, cg: FullCasingsGenerator): ExampleTypeReference {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (etr.shape.type) {
        case "named":
            return {
                ...etr,
                shape: {
                    ...etr.shape,
                    typeName: inflateDeclaredTypeName(etr.shape.typeName, cg),
                    shape: inflateExampleTypeShape(etr.shape.shape, cg)
                }
            };
        case "container":
            return {
                ...etr,
                shape: {
                    ...etr.shape,
                    container: inflateExampleContainer(etr.shape.container, cg)
                }
            };
        case "primitive":
        case "unknown":
            return { ...etr, shape: { ...etr.shape } };
    }
}

function inflateExampleContainer(container: ExampleContainer, cg: FullCasingsGenerator): ExampleContainer {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (container.type) {
        case "list":
            return {
                ...container,
                itemType: inflateTypeReference(container.itemType, cg),
                list: (container.list ?? []).map((item) => inflateExampleTypeReference(item, cg))
            };
        case "set":
            return {
                ...container,
                itemType: inflateTypeReference(container.itemType, cg),
                set: (container.set ?? []).map((item) => inflateExampleTypeReference(item, cg))
            };
        case "optional":
            return {
                ...container,
                valueType: inflateTypeReference(container.valueType, cg),
                optional: container.optional != null ? inflateExampleTypeReference(container.optional, cg) : undefined
            };
        case "nullable":
            return {
                ...container,
                valueType: inflateTypeReference(container.valueType, cg),
                nullable: container.nullable != null ? inflateExampleTypeReference(container.nullable, cg) : undefined
            };
        case "map":
            return {
                ...container,
                keyType: inflateTypeReference(container.keyType, cg),
                valueType: inflateTypeReference(container.valueType, cg),
                map: (container.map ?? []).map((pair) => ({
                    ...pair,
                    key: inflateExampleTypeReference(pair.key, cg),
                    value: inflateExampleTypeReference(pair.value, cg)
                }))
            };
        case "literal":
            return { ...container };
    }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

function inflateErrorDeclaration(ed: ErrorDeclaration, cg: FullCasingsGenerator) {
    return {
        ...ed,
        name: inflateDeclaredErrorName(ed.name, cg),
        discriminantValue: inflateNameAndWireValue(ed.discriminantValue, cg),
        type: ed.type != null ? inflateTypeReference(ed.type, cg) : undefined,
        examples: (ed.examples ?? []).map((ex) => inflateExampleError(ex, cg)),
        headers: (ed.headers ?? []).map((h) => inflateHttpHeader(h, cg))
    };
}

function inflateDeclaredErrorName(den: DeclaredErrorName, cg: FullCasingsGenerator) {
    return {
        ...den,
        name: inflateNameOrString(den.name, cg),
        fernFilepath: inflateFernFilepath(den.fernFilepath, cg)
    };
}

function inflateExampleError(ex: ExampleError, cg: FullCasingsGenerator) {
    return {
        ...ex,
        name: ex.name != null ? inflateNameOrString(ex.name, cg) : undefined,
        shape: inflateExampleTypeReference(ex.shape, cg)
    };
}

// ---------------------------------------------------------------------------
// Environments
// ---------------------------------------------------------------------------

function inflateEnvironmentsConfig(config: EnvironmentsConfig, cg: FullCasingsGenerator) {
    if (config.environments == null) {
        return config;
    }
    switch (config.environments.type) {
        case "singleBaseUrl":
            return {
                ...config,
                environments: {
                    ...config.environments,
                    environments: (config.environments.environments ?? []).map((env) => ({
                        ...env,
                        name: inflateNameOrString(env.name, cg),
                        urlVariables: (env.urlVariables ?? []).map((sv) => inflateServerVariable(sv, cg))
                    }))
                }
            };
        case "multipleBaseUrls":
            return {
                ...config,
                environments: {
                    ...config.environments,
                    baseUrls: (config.environments.baseUrls ?? []).map((bu) => ({
                        ...bu,
                        name: inflateNameOrString(bu.name, cg)
                    })),
                    environments: (config.environments.environments ?? []).map((env) => ({
                        ...env,
                        name: inflateNameOrString(env.name, cg)
                    }))
                }
            };
    }
}

function inflateServerVariable(sv: ServerVariable, cg: FullCasingsGenerator) {
    return { ...sv, name: inflateNameOrString(sv.name, cg) };
}

// ---------------------------------------------------------------------------
// Packages / Subpackages
// ---------------------------------------------------------------------------

function inflatePackage(pkg: Package, cg: FullCasingsGenerator) {
    return { ...pkg, fernFilepath: inflateFernFilepath(pkg.fernFilepath, cg) };
}

function inflateSubpackage(sub: Subpackage, cg: FullCasingsGenerator) {
    return {
        ...sub,
        fernFilepath: inflateFernFilepath(sub.fernFilepath, cg),
        name: inflateNameOrString(sub.name, cg)
    };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

function inflateConstants(constants: Constants, cg: FullCasingsGenerator) {
    return {
        ...constants,
        errorInstanceIdKey: inflateNameAndWireValue(constants.errorInstanceIdKey, cg)
    };
}

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

function inflateVariableDeclaration(v: VariableDeclaration, cg: FullCasingsGenerator) {
    return {
        ...v,
        name: inflateNameOrString(v.name, cg),
        type: inflateTypeReference(v.type, cg)
    };
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

function inflateWebhookGroup(group: WebhookGroup, cg: FullCasingsGenerator) {
    if (!Array.isArray(group)) {
        return group;
    }
    return group.map((wh) => inflateWebhook(wh, cg));
}

function inflateWebhook(wh: Webhook, cg: FullCasingsGenerator) {
    return {
        ...wh,
        name: inflateNameOrString(wh.name, cg),
        headers: (wh.headers ?? []).map((h) => inflateHttpHeader(h, cg)),
        payload: inflateWebhookPayload(wh.payload, cg),
        signatureVerification:
            wh.signatureVerification != null
                ? inflateWebhookSignatureVerification(wh.signatureVerification, cg)
                : undefined,
        examples: (wh.examples ?? []).map((ex) => inflateExampleWebhookCall(ex, cg))
    };
}

function inflateWebhookPayload(payload: WebhookPayload, cg: FullCasingsGenerator) {
    if (payload.type === "inlinedPayload") {
        return {
            ...payload,
            name: inflateNameOrString(payload.name, cg),
            extends: (payload.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
            properties: (payload.properties ?? []).map((prop) => ({
                ...prop,
                name: inflateNameAndWireValue(prop.name, cg),
                valueType: inflateTypeReference(prop.valueType, cg)
            }))
        };
    }
    if (payload.type === "reference") {
        return { ...payload, payloadType: inflateTypeReference(payload.payloadType, cg) };
    }
    return payload;
}

function inflateWebhookSignatureVerification(sv: WebhookSignatureVerification, cg: FullCasingsGenerator) {
    if (sv.type === "hmac") {
        return {
            ...sv,
            signatureHeaderName: inflateNameAndWireValue(sv.signatureHeaderName, cg),
            timestamp:
                sv.timestamp != null
                    ? { ...sv.timestamp, headerName: inflateNameAndWireValue(sv.timestamp.headerName, cg) }
                    : undefined
        };
    }
    if (sv.type === "asymmetric") {
        return {
            ...sv,
            signatureHeaderName: inflateNameAndWireValue(sv.signatureHeaderName, cg),
            timestamp:
                sv.timestamp != null
                    ? { ...sv.timestamp, headerName: inflateNameAndWireValue(sv.timestamp.headerName, cg) }
                    : undefined,
            keySource:
                sv.keySource != null && sv.keySource.type === "jwks" && sv.keySource.keyIdHeader != null
                    ? {
                          ...sv.keySource,
                          keyIdHeader: inflateNameAndWireValue(sv.keySource.keyIdHeader, cg)
                      }
                    : sv.keySource
        };
    }
    return sv;
}

function inflateExampleWebhookCall(ex: ExampleWebhookCall, cg: FullCasingsGenerator) {
    return {
        ...ex,
        name: ex.name != null ? inflateNameOrString(ex.name, cg) : undefined,
        payload: inflateExampleTypeReference(ex.payload, cg)
    };
}

// ---------------------------------------------------------------------------
// WebSocket Channels
// ---------------------------------------------------------------------------

function inflateWebSocketChannel(channel: WebSocketChannel, cg: FullCasingsGenerator) {
    return {
        ...channel,
        name: inflateNameOrString(channel.name, cg),
        headers: (channel.headers ?? []).map((h) => inflateHttpHeader(h, cg)),
        queryParameters: (channel.queryParameters ?? []).map((qp) => inflateQueryParameter(qp, cg)),
        pathParameters: (channel.pathParameters ?? []).map((p) => inflatePathParameter(p, cg)),
        messages: (channel.messages ?? []).map((msg) => inflateWebSocketMessage(msg, cg)),
        examples: (channel.examples ?? []).map((ex) => inflateExampleWebSocketSession(ex, cg))
    };
}

function inflateWebSocketMessage(msg: WebSocketMessage, cg: FullCasingsGenerator) {
    if (msg.body == null) {
        return msg;
    }
    if (msg.body.type === "inlinedBody") {
        return {
            ...msg,
            body: {
                ...msg.body,
                name: inflateNameOrString(msg.body.name, cg),
                extends: (msg.body.extends ?? []).map((ext) => inflateDeclaredTypeName(ext, cg)),
                properties: (msg.body.properties ?? []).map((prop) => ({
                    ...prop,
                    name: inflateNameAndWireValue(prop.name, cg),
                    valueType: inflateTypeReference(prop.valueType, cg)
                }))
            }
        };
    }
    if (msg.body.type === "reference") {
        return {
            ...msg,
            body: {
                ...msg.body,
                bodyType: inflateTypeReference(msg.body.bodyType, cg)
            }
        };
    }
    return msg;
}

function inflateExampleWebSocketSession(ex: ExampleWebSocketSession, cg: FullCasingsGenerator) {
    return {
        ...ex,
        name: ex.name != null ? inflateNameOrString(ex.name, cg) : undefined,
        pathParameters: (ex.pathParameters ?? []).map((pp) => inflateExamplePathParameter(pp, cg)),
        headers: (ex.headers ?? []).map((h) => ({
            ...h,
            name: inflateNameAndWireValue(h.name, cg)
        })),
        queryParameters: (ex.queryParameters ?? []).map((qp) => ({
            ...qp,
            name: inflateNameAndWireValue(qp.name, cg)
        })),
        messages: (ex.messages ?? []).map((msg) => ({
            ...msg,
            body: inflateExampleWebSocketMessageBody(msg.body, cg)
        }))
    };
}

function inflateExampleWebSocketMessageBody(body: ExampleWebSocketMessageBody, cg: FullCasingsGenerator) {
    switch (body.type) {
        case "inlinedBody": {
            const inflated = inflateExampleInlinedRequestBody(body, cg);
            return { ...body, properties: inflated.properties, extraProperties: inflated.extraProperties };
        }
        case "reference": {
            const inflated = inflateExampleTypeReference(body, cg);
            return { ...body, shape: inflated.shape };
        }
        default:
            return body;
    }
}

// ---------------------------------------------------------------------------
// ErrorDiscriminationStrategy
// ---------------------------------------------------------------------------

function inflateErrorDiscriminationStrategy(strategy: ErrorDiscriminationStrategy, cg: FullCasingsGenerator) {
    if (strategy.type === "property") {
        return {
            ...strategy,
            discriminant: inflateNameAndWireValue(strategy.discriminant, cg),
            contentProperty: inflateNameAndWireValue(strategy.contentProperty, cg)
        };
    }
    return strategy;
}

// ---------------------------------------------------------------------------
// ApiVersionScheme
// ---------------------------------------------------------------------------

function inflateApiVersionScheme(scheme: ApiVersionScheme, cg: FullCasingsGenerator) {
    if (scheme.type === "header") {
        return {
            ...scheme,
            header: inflateHttpHeader(scheme.header, cg),
            value: inflateEnumTypeDeclaration(scheme.value, cg)
        };
    }
    return scheme;
}

// ---------------------------------------------------------------------------
// Proto types (Source on TypeDeclaration)
// ---------------------------------------------------------------------------

function inflateTypeDeclarationSource(source: Source, cg: FullCasingsGenerator) {
    if (source.type === "proto") {
        return { ...source, value: inflateProtobufType(source.value, cg) };
    }
    return source;
}

function inflateProtobufType(pt: ProtobufType, cg: FullCasingsGenerator) {
    if (pt.type === "userDefined") {
        return { ...pt, name: inflateNameOrString(pt.name, cg) };
    }
    return pt;
}

// ---------------------------------------------------------------------------
// Dynamic IR -- constructs new objects (no mutation)
// ---------------------------------------------------------------------------

function inflateDynamicIr(dynIr: dynamic.DynamicIntermediateRepresentation, cg: FullCasingsGenerator) {
    return {
        ...dynIr,
        types: mapRecord(dynIr.types ?? {}, (nt) => inflateDynamicNamedType(nt, cg)),
        endpoints: mapRecord(dynIr.endpoints ?? {}, (ep) => inflateDynamicEndpoint(ep, cg)),
        environments: dynIr.environments != null ? inflateDynamicEnvironmentsConfig(dynIr.environments, cg) : undefined,
        headers: (dynIr.headers ?? []).map((h) => inflateDynamicNamedParameter(h, cg)),
        pathParameters: (dynIr.pathParameters ?? []).map((p) => inflateDynamicNamedParameter(p, cg)),
        variables: (dynIr.variables ?? []).map((v) => inflateDynamicVariableDeclaration(v, cg))
    };
}

function inflateDynamicDeclaration(decl: dynamic.Declaration, cg: FullCasingsGenerator) {
    return {
        ...decl,
        name: inflateNameOrString(decl.name, cg),
        fernFilepath: inflateDynamicFernFilepath(decl.fernFilepath, cg)
    };
}

function inflateDynamicFernFilepath(fp: dynamic.FernFilepath, cg: FullCasingsGenerator) {
    return {
        allParts: (fp.allParts ?? []).map((n: NameOrString) => inflateNameOrString(n, cg)),
        packagePath: (fp.packagePath ?? []).map((n: NameOrString) => inflateNameOrString(n, cg)),
        file: fp.file != null ? inflateNameOrString(fp.file, cg) : undefined
    };
}

function inflateDynamicNameAndWireValue(nwv: dynamic.NameAndWireValue, cg: FullCasingsGenerator) {
    return { ...nwv, name: inflateNameOrString(nwv.name, cg) };
}

function inflateDynamicNamedParameter(param: dynamic.NamedParameter, cg: FullCasingsGenerator) {
    return { ...param, name: inflateDynamicNameAndWireValue(param.name, cg) };
}

function inflateDynamicNamedType(nt: dynamic.NamedType, cg: FullCasingsGenerator) {
    switch (nt.type) {
        case "alias":
            return { ...nt, declaration: inflateDynamicDeclaration(nt.declaration, cg) };
        case "enum":
            return {
                ...nt,
                declaration: inflateDynamicDeclaration(nt.declaration, cg),
                values: (nt.values ?? []).map((val) => inflateDynamicNameAndWireValue(val, cg))
            };
        case "object":
            return {
                ...nt,
                declaration: inflateDynamicDeclaration(nt.declaration, cg),
                properties: (nt.properties ?? []).map((prop) => inflateDynamicNamedParameter(prop, cg))
            };
        case "discriminatedUnion":
            return {
                ...nt,
                declaration: inflateDynamicDeclaration(nt.declaration, cg),
                discriminant: inflateDynamicNameAndWireValue(nt.discriminant, cg),
                types: mapRecord(nt.types ?? {}, (sut) => inflateDynamicSingleDiscriminatedUnionType(sut, cg))
            };
        case "undiscriminatedUnion":
            return { ...nt, declaration: inflateDynamicDeclaration(nt.declaration, cg) };
    }
}

function inflateDynamicSingleDiscriminatedUnionType(
    sut: dynamic.SingleDiscriminatedUnionType,
    cg: FullCasingsGenerator
) {
    return {
        ...sut,
        discriminantValue: inflateDynamicNameAndWireValue(sut.discriminantValue, cg),
        properties: (sut.properties ?? []).map((prop) => inflateDynamicNamedParameter(prop, cg))
    };
}

function inflateDynamicEndpoint(ep: dynamic.Endpoint, cg: FullCasingsGenerator) {
    return {
        ...ep,
        auth: ep.auth != null ? inflateDynamicAuth(ep.auth, cg) : undefined,
        declaration: inflateDynamicDeclaration(ep.declaration, cg),
        request: inflateDynamicRequest(ep.request, cg)
    };
}

function inflateDynamicAuth(auth: dynamic.Auth, cg: FullCasingsGenerator) {
    switch (auth.type) {
        case "basic":
            return {
                ...auth,
                username: inflateNameOrString(auth.username, cg),
                password: inflateNameOrString(auth.password, cg)
            };
        case "bearer":
            return { ...auth, token: inflateNameOrString(auth.token, cg) };
        case "header":
            return { ...auth, header: inflateDynamicNamedParameter(auth.header, cg) };
        case "oauth":
            return {
                ...auth,
                clientId: inflateNameOrString(auth.clientId, cg),
                clientSecret: inflateNameOrString(auth.clientSecret, cg)
            };
        default:
            return auth;
    }
}

function inflateDynamicRequest(request: dynamic.Request, cg: FullCasingsGenerator) {
    switch (request.type) {
        case "body":
            return {
                ...request,
                pathParameters: (request.pathParameters ?? []).map((p) => inflateDynamicNamedParameter(p, cg))
            };
        case "inlined":
            return {
                ...request,
                declaration: inflateDynamicDeclaration(request.declaration, cg),
                pathParameters: (request.pathParameters ?? []).map((p) => inflateDynamicNamedParameter(p, cg)),
                queryParameters: (request.queryParameters ?? []).map((p) => inflateDynamicNamedParameter(p, cg)),
                headers: (request.headers ?? []).map((h) => inflateDynamicNamedParameter(h, cg)),
                body: request.body != null ? inflateDynamicInlinedRequestBody(request.body, cg) : undefined
            };
    }
}

function inflateDynamicInlinedRequestBody(body: dynamic.InlinedRequestBody, cg: FullCasingsGenerator) {
    switch (body.type) {
        case "properties":
            return {
                ...body,
                value: Array.isArray(body.value)
                    ? body.value.map((param) => inflateDynamicNamedParameter(param, cg))
                    : body.value
            };
        case "referenced":
            return { ...body, bodyKey: inflateNameOrString(body.bodyKey, cg) };
        case "fileUpload":
            return {
                ...body,
                properties: (body.properties ?? []).map((prop) => {
                    switch (prop.type) {
                        case "file":
                        case "fileArray":
                            return { ...prop, name: inflateNameOrString(prop.name, cg) };
                        case "bodyProperty":
                            return { ...prop, name: { ...prop.name, name: inflateNameOrString(prop.name.name, cg) } };
                        default:
                            return prop;
                    }
                })
            };
    }
}

function inflateDynamicVariableDeclaration(v: dynamic.VariableDeclaration, cg: FullCasingsGenerator) {
    return { ...v, name: inflateNameOrString(v.name, cg) };
}

function inflateDynamicEnvironmentsConfig(config: dynamic.EnvironmentsConfig, cg: FullCasingsGenerator) {
    if (config.environments == null) {
        return config;
    }
    switch (config.environments.type) {
        case "singleBaseUrl":
            return {
                ...config,
                environments: {
                    ...config.environments,
                    environments: (config.environments.environments ?? []).map((env) => ({
                        ...env,
                        name: inflateNameOrString(env.name, cg)
                    }))
                }
            };
        case "multipleBaseUrls":
            return {
                ...config,
                environments: {
                    ...config.environments,
                    baseUrls: (config.environments.baseUrls ?? []).map((bu) => ({
                        ...bu,
                        name: inflateNameOrString(bu.name, cg)
                    })),
                    environments: (config.environments.environments ?? []).map((env) => ({
                        ...env,
                        name: inflateNameOrString(env.name, cg)
                    }))
                }
            };
    }
}
