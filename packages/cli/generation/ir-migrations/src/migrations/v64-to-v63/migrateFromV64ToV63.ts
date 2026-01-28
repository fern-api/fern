import { GeneratorName } from "@fern-api/configuration-loader";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V64_TO_V63_MIGRATION: IrMigration<
    IrVersions.V64.ir.IntermediateRepresentation,
    IrVersions.V63.ir.IntermediateRepresentation
> = {
    laterVersion: "v64",
    earlierVersion: "v63",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) => ir as unknown as IrVersions.V63.ir.IntermediateRepresentation,
    migrateBackwards: (
        v64: IrVersions.V64.IntermediateRepresentation
    ): IrVersions.V63.ir.IntermediateRepresentation => {
        // V64 added ListType/SetType/MapType wrappers with min/max validations.
        // V63 expects plain TypeReferences for list/set, so we need to unwrap them.

        // Since TypeReferences appear throughout the IR in types, services, errors, etc.,
        // we need to recursively transform all of them.
        return {
            ...v64,
            auth: convertApiAuth(v64.auth),
            headers: v64.headers.map(convertHttpHeader),
            idempotencyHeaders: v64.idempotencyHeaders.map(convertHttpHeader),
            pathParameters: v64.pathParameters.map(
                (param) =>
                    ({
                        ...param,
                        valueType: convertTypeReference(param.valueType)
                    }) as IrVersions.V63.http.PathParameter
            ),
            variables: v64.variables.map(
                (variable) =>
                    ({
                        ...variable,
                        type: convertTypeReference(variable.type)
                    }) as IrVersions.V63.variables.VariableDeclaration
            ),
            types: Object.fromEntries(
                Object.entries(v64.types).map(([key, typeDeclaration]) => [
                    key,
                    convertTypeDeclaration(typeDeclaration)
                ])
            ),
            services: Object.fromEntries(
                Object.entries(v64.services).map(([key, service]) => [key, convertHttpService(service)])
            ),
            errors: Object.fromEntries(
                Object.entries(v64.errors).map(([key, error]) => [key, convertErrorDeclaration(error)])
            ),
            webhookGroups: mapValues(v64.webhookGroups, (webhookGroup) => convertWebhookGroup(webhookGroup))
        } as IrVersions.V63.ir.IntermediateRepresentation;
    }
};

function convertApiAuth(auth: IrVersions.V64.ApiAuth): IrVersions.V63.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme))
    } as IrVersions.V63.ApiAuth;
}

function convertAuthScheme(scheme: IrVersions.V64.AuthScheme): IrVersions.V63.AuthScheme {
    return IrVersions.V64.AuthScheme._visit<IrVersions.V63.AuthScheme>(scheme, {
        basic: (basic): IrVersions.V63.AuthScheme => IrVersions.V63.AuthScheme.basic(basic),
        bearer: (bearer): IrVersions.V63.AuthScheme => IrVersions.V63.AuthScheme.bearer(bearer),
        header: (header): IrVersions.V63.AuthScheme =>
            IrVersions.V63.AuthScheme.header({
                ...header,
                valueType: convertTypeReference(header.valueType)
            }),
        oauth: (oauth): IrVersions.V63.AuthScheme =>
            IrVersions.V63.AuthScheme.oauth(oauth as unknown as IrVersions.V63.auth.OAuthScheme),
        inferred: (inferred): IrVersions.V63.AuthScheme =>
            IrVersions.V63.AuthScheme.inferred(inferred as unknown as IrVersions.V63.auth.InferredAuthScheme),
        _other: (): IrVersions.V63.AuthScheme => {
            throw new Error("Unknown AuthScheme");
        }
    });
}

function convertHttpHeader(header: IrVersions.V64.http.HttpHeader): IrVersions.V63.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    } as IrVersions.V63.http.HttpHeader;
}

function convertWebhookGroup(webhookGroup: IrVersions.V64.WebhookGroup): IrVersions.V63.webhooks.WebhookGroup {
    return webhookGroup.map((webhook) => convertWebhook(webhook));
}

function convertWebhook(webhook: IrVersions.V64.Webhook): IrVersions.V63.webhooks.Webhook {
    return {
        ...webhook,
        headers: webhook.headers.map(convertHttpHeader),
        payload: convertWebhookPayload(webhook.payload)
    } as IrVersions.V63.webhooks.Webhook;
}

function convertWebhookPayload(payload: IrVersions.V64.WebhookPayload): IrVersions.V63.webhooks.WebhookPayload {
    return IrVersions.V64.WebhookPayload._visit<IrVersions.V63.webhooks.WebhookPayload>(payload, {
        inlinedPayload: (inlined): IrVersions.V63.webhooks.WebhookPayload =>
            IrVersions.V63.WebhookPayload.inlinedPayload({
                ...inlined,
                properties: inlined.properties.map(
                    (prop) =>
                        ({
                            ...prop,
                            valueType: convertTypeReference(prop.valueType)
                        }) as IrVersions.V63.webhooks.InlinedWebhookPayloadProperty
                )
            }),
        reference: (ref): IrVersions.V63.webhooks.WebhookPayload =>
            IrVersions.V63.WebhookPayload.reference({
                ...ref,
                payloadType: convertTypeReference(ref.payloadType)
            }),
        _other: (): IrVersions.V63.webhooks.WebhookPayload => {
            throw new Error("Unknown WebhookPayload");
        }
    });
}

function convertObjectProperty(prop: IrVersions.V64.types.ObjectProperty): IrVersions.V63.types.ObjectProperty {
    return {
        ...prop,
        valueType: convertTypeReference(prop.valueType)
    } as IrVersions.V63.types.ObjectProperty;
}

function convertTypeDeclaration(
    typeDeclaration: IrVersions.V64.types.TypeDeclaration
): IrVersions.V63.types.TypeDeclaration {
    return {
        ...typeDeclaration,
        shape: IrVersions.V64.types.Type._visit(typeDeclaration.shape, {
            object: (obj) =>
                IrVersions.V63.types.Type.object({
                    ...obj,
                    properties: obj.properties.map(convertObjectProperty),
                    extendedProperties: obj.extendedProperties?.map(convertObjectProperty)
                }),
            union: (union) =>
                IrVersions.V63.types.Type.union({
                    ...union,
                    baseProperties: union.baseProperties.map(convertObjectProperty),
                    types: union.types.map((singleUnionType) => ({
                        ...singleUnionType,
                        shape: IrVersions.V64.types.SingleUnionTypeProperties._visit<IrVersions.V63.types.SingleUnionTypeProperties>(
                            singleUnionType.shape,
                            {
                                samePropertiesAsObject: (typeId): IrVersions.V63.types.SingleUnionTypeProperties =>
                                    IrVersions.V63.types.SingleUnionTypeProperties.samePropertiesAsObject(typeId),
                                singleProperty: (prop): IrVersions.V63.types.SingleUnionTypeProperties =>
                                    IrVersions.V63.types.SingleUnionTypeProperties.singleProperty({
                                        ...prop,
                                        type: convertTypeReference(prop.type)
                                    }),
                                noProperties: (): IrVersions.V63.types.SingleUnionTypeProperties =>
                                    IrVersions.V63.types.SingleUnionTypeProperties.noProperties(),
                                _other: (): IrVersions.V63.types.SingleUnionTypeProperties => {
                                    throw new Error("Unknown SingleUnionTypeProperties");
                                }
                            }
                        )
                    }))
                }),
            enum: (e) => IrVersions.V63.types.Type.enum(e),
            alias: (alias) =>
                IrVersions.V63.types.Type.alias({
                    ...alias,
                    aliasOf: convertTypeReference(alias.aliasOf),
                    resolvedType: convertResolvedTypeReference(alias.resolvedType)
                }),
            undiscriminatedUnion: (union) =>
                IrVersions.V63.types.Type.undiscriminatedUnion({
                    ...union,
                    members: union.members.map((member) => ({
                        ...member,
                        type: convertTypeReference(member.type)
                    }))
                }),
            _other: () => typeDeclaration.shape as unknown as IrVersions.V63.types.Type
        })
    } as unknown as IrVersions.V63.types.TypeDeclaration;
}

function convertResolvedTypeReference(
    resolvedType: IrVersions.V64.types.ResolvedTypeReference
): IrVersions.V63.types.ResolvedTypeReference {
    return IrVersions.V64.types.ResolvedTypeReference._visit<IrVersions.V63.types.ResolvedTypeReference>(resolvedType, {
        container: (container): IrVersions.V63.types.ResolvedTypeReference =>
            IrVersions.V63.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: (named): IrVersions.V63.types.ResolvedTypeReference =>
            IrVersions.V63.types.ResolvedTypeReference.named(named),
        primitive: (primitive): IrVersions.V63.types.ResolvedTypeReference =>
            IrVersions.V63.types.ResolvedTypeReference.primitive(primitive),
        unknown: (): IrVersions.V63.types.ResolvedTypeReference => IrVersions.V63.types.ResolvedTypeReference.unknown(),
        _other: (): IrVersions.V63.types.ResolvedTypeReference =>
            resolvedType as unknown as IrVersions.V63.types.ResolvedTypeReference
    });
}

function convertHttpService(service: IrVersions.V64.http.HttpService): IrVersions.V63.http.HttpService {
    return {
        ...service,
        headers: service.headers.map((header) => ({
            ...header,
            valueType: convertTypeReference(header.valueType)
        })),
        pathParameters: service.pathParameters.map((param) => ({
            ...param,
            valueType: convertTypeReference(param.valueType)
        })),
        endpoints: service.endpoints.map((endpoint) => convertHttpEndpoint(endpoint))
    } as unknown as IrVersions.V63.http.HttpService;
}

function convertHttpEndpoint(endpoint: IrVersions.V64.http.HttpEndpoint): IrVersions.V63.http.HttpEndpoint {
    return {
        ...endpoint,
        headers: endpoint.headers.map((header) => ({
            ...header,
            valueType: convertTypeReference(header.valueType)
        })),
        pathParameters: endpoint.pathParameters.map((param) => ({
            ...param,
            valueType: convertTypeReference(param.valueType)
        })),
        queryParameters: endpoint.queryParameters.map((param) => ({
            ...param,
            valueType: convertTypeReference(param.valueType)
        })),
        requestBody: endpoint.requestBody ? convertHttpRequestBody(endpoint.requestBody) : undefined,
        response: endpoint.response ? convertHttpResponse(endpoint.response) : undefined
    } as unknown as IrVersions.V63.http.HttpEndpoint;
}

function convertHttpRequestBody(requestBody: IrVersions.V64.http.HttpRequestBody): IrVersions.V63.http.HttpRequestBody {
    return IrVersions.V64.http.HttpRequestBody._visit(requestBody, {
        inlinedRequestBody: (inlined) =>
            IrVersions.V63.http.HttpRequestBody.inlinedRequestBody({
                ...inlined,
                properties: inlined.properties.map(convertObjectProperty),
                extendedProperties: inlined.extendedProperties?.map(convertObjectProperty)
            }),
        reference: (ref) =>
            IrVersions.V63.http.HttpRequestBody.reference({
                ...ref,
                requestBodyType: convertTypeReference(ref.requestBodyType)
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V63.http.HttpRequestBody.fileUpload({
                ...fileUpload,
                properties: fileUpload.properties.map((prop) =>
                    IrVersions.V64.http.FileUploadRequestProperty._visit(prop, {
                        file: (file) => IrVersions.V63.http.FileUploadRequestProperty.file(file),
                        bodyProperty: (bodyProp) =>
                            IrVersions.V63.http.FileUploadRequestProperty.bodyProperty({
                                ...bodyProp,
                                valueType: convertTypeReference(bodyProp.valueType)
                            }),
                        _other: () => prop as unknown as IrVersions.V63.http.FileUploadRequestProperty
                    })
                )
            }),
        bytes: (bytes) => IrVersions.V63.http.HttpRequestBody.bytes(bytes),
        _other: () => requestBody as unknown as IrVersions.V63.http.HttpRequestBody
    });
}

function convertHttpResponse(response: IrVersions.V64.http.HttpResponse): IrVersions.V63.http.HttpResponse {
    if (response.body?.type === "json") {
        return {
            ...response,
            body: {
                ...response.body,
                value: {
                    ...response.body.value,
                    responseBodyType: convertTypeReference(response.body.value.responseBodyType)
                }
            }
        } as unknown as IrVersions.V63.http.HttpResponse;
    }
    return response as unknown as IrVersions.V63.http.HttpResponse;
}

function convertErrorDeclaration(
    error: IrVersions.V64.errors.ErrorDeclaration
): IrVersions.V63.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type ? convertTypeReference(error.type) : undefined
    } as unknown as IrVersions.V63.errors.ErrorDeclaration;
}

function convertTypeReference(typeReference: IrVersions.V64.types.TypeReference): IrVersions.V63.types.TypeReference {
    return IrVersions.V64.types.TypeReference._visit<IrVersions.V63.types.TypeReference>(typeReference, {
        container: (container): IrVersions.V63.types.TypeReference =>
            IrVersions.V63.types.TypeReference.container(convertContainerType(container)),
        named: (named): IrVersions.V63.types.TypeReference => IrVersions.V63.types.TypeReference.named(named),
        primitive: (primitive): IrVersions.V63.types.TypeReference =>
            IrVersions.V63.types.TypeReference.primitive(primitive),
        unknown: (): IrVersions.V63.types.TypeReference => IrVersions.V63.types.TypeReference.unknown(),
        _other: (): IrVersions.V63.types.TypeReference => {
            throw new Error("Unknown TypeReference: " + typeReference.type);
        }
    });
}

function convertContainerType(containerType: IrVersions.V64.types.ContainerType): IrVersions.V63.types.ContainerType {
    return IrVersions.V64.types.ContainerType._visit<IrVersions.V63.types.ContainerType>(containerType, {
        list: (listType): IrVersions.V63.types.ContainerType => {
            // v64: listType is {list: TypeReference, minItems?, maxItems?}
            // v63: expects just TypeReference directly (no wrapper)
            return IrVersions.V63.types.ContainerType.list(convertTypeReference(listType.list));
        },
        set: (setType): IrVersions.V63.types.ContainerType => {
            // v64: setType is {set: TypeReference, minItems?, maxItems?}
            // v63: expects just TypeReference directly (no wrapper)
            return IrVersions.V63.types.ContainerType.set(convertTypeReference(setType.set));
        },
        map: (mapType): IrVersions.V63.types.ContainerType => {
            // v64: mapType has {keyType, valueType, minProperties?, maxProperties?}
            // v63: expects {keyType, valueType} only (no validation fields)
            return IrVersions.V63.types.ContainerType.map({
                keyType: convertTypeReference(mapType.keyType),
                valueType: convertTypeReference(mapType.valueType)
            });
        },
        optional: (itemType): IrVersions.V63.types.ContainerType => {
            return IrVersions.V63.types.ContainerType.optional(convertTypeReference(itemType));
        },
        nullable: (itemType): IrVersions.V63.types.ContainerType => {
            return IrVersions.V63.types.ContainerType.nullable(convertTypeReference(itemType));
        },
        literal: (literal): IrVersions.V63.types.ContainerType => {
            return IrVersions.V63.types.ContainerType.literal(literal);
        },
        _other: (): IrVersions.V63.types.ContainerType => {
            throw new Error("Unknown ContainerType: " + containerType.type);
        }
    });
}
