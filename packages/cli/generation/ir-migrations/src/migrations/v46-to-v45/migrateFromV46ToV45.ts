import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V46_TO_V45_MIGRATION: IrMigration<
    IrVersions.V46.ir.IntermediateRepresentation,
    IrVersions.V45.ir.IntermediateRepresentation
> = {
    laterVersion: "v46",
    earlierVersion: "v45",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.21.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.21.0",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.16.0",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: "0.9.0",
        [GeneratorName.JAVA_SDK]: "0.10.0",
        [GeneratorName.JAVA_SPRING]: "0.9.0",
        [GeneratorName.PYTHON_FASTAPI]: "0.10.1",
        [GeneratorName.PYTHON_PYDANTIC]: "0.9.1",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "2.9.9",
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V45.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v46): IrVersions.V45.ir.IntermediateRepresentation => {
        return {
            ...v46,
            types: Object.fromEntries(
                Object.entries(v46.types).map(([typeId, typeDeclaration]) => [
                    typeId,
                    { ...typeDeclaration, examples: convertExampleTypes(typeDeclaration.examples) }
                ])
            ),
            services: Object.fromEntries(
                Object.entries(v46.services).map(([serviceId, service]) => [
                    serviceId,
                    {
                        ...service,
                        endpoints: service.endpoints.map((endpoint) => ({
                            ...endpoint,
                            examples: convertEndpointExamples(endpoint.examples)
                        }))
                    }
                ])
            ),
            websocketChannels:
                v46.websocketChannels != null
                    ? Object.fromEntries(
                          Object.entries(v46.websocketChannels).map(([channelId, channel]) => [
                              channelId,
                              {
                                  ...channel,
                                  examples: convertWebsocketExamples(channel.examples)
                              }
                          ])
                      )
                    : undefined,
            errors: Object.fromEntries(
                Object.entries(v46.errors).map(([errorId, error]) => [
                    errorId,
                    {
                        ...error,
                        examples: error.examples.map((example) => ({
                            ...example,
                            shape: convertExampleTypeReference(example.shape)
                        }))
                    }
                ])
            )
        };
    }
};

function convertExampleTypeReference(v46ETR: IrVersions.V46.ExampleTypeReference): IrVersions.V45.ExampleTypeReference {
    return v46ETR.shape._visit<IrVersions.V45.ExampleTypeReference>({
        container: (container) => ({
            ...v46ETR,
            shape: container._visit<IrVersions.V45.ExampleTypeReferenceShape>({
                list: (listValues) =>
                    IrVersions.V45.ExampleTypeReferenceShape.container(
                        IrVersions.V45.ExampleContainer.list(listValues.map((lv) => convertExampleTypeReference(lv)))
                    ),
                set: (setValues) =>
                    IrVersions.V45.ExampleTypeReferenceShape.container(
                        IrVersions.V45.ExampleContainer.set(setValues.map((sv) => convertExampleTypeReference(sv)))
                    ),
                map: (mapValues) =>
                    IrVersions.V45.ExampleTypeReferenceShape.container(
                        IrVersions.V45.ExampleContainer.map(
                            mapValues.map((mv) => ({
                                key: convertExampleTypeReference(mv.key),
                                value: convertExampleTypeReference(mv.value)
                            }))
                        )
                    ),
                optional: (value) =>
                    IrVersions.V45.ExampleTypeReferenceShape.container(
                        IrVersions.V45.ExampleContainer.optional(
                            value != null ? convertExampleTypeReference(value) : undefined
                        )
                    ),
                literal: (value) =>
                    IrVersions.V45.ExampleTypeReferenceShape.primitive(
                        value._visit<IrVersions.V45.ExamplePrimitive>({
                            string: (str) => IrVersions.V45.ExamplePrimitive.string(str),
                            integer: (num) => IrVersions.V45.ExamplePrimitive.integer(num),
                            double: (num) => IrVersions.V45.ExamplePrimitive.double(num),
                            long: (num) => IrVersions.V45.ExamplePrimitive.long(num),
                            boolean: (bool) => IrVersions.V45.ExamplePrimitive.boolean(bool),
                            datetime: (date) => IrVersions.V45.ExamplePrimitive.datetime(date),
                            date: (date) => IrVersions.V45.ExamplePrimitive.date(date),
                            uuid: (uuid) => IrVersions.V45.ExamplePrimitive.uuid(uuid),
                            _other: (value) => {
                                throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                            }
                        })
                    ),
                _other: (value) => {
                    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                }
            })
        }),
        named: (named) => ({
            ...v46ETR,
            shape: IrVersions.V45.ExampleTypeReferenceShape.named({
                ...named,
                shape: convertExampleTypeShape(named.shape)
            })
        }),
        primitive: (primitive) => ({
            ...v46ETR,
            shape: IrVersions.V45.ExampleTypeReferenceShape.primitive(
                primitive._visit<IrVersions.V45.ExamplePrimitive>({
                    string: (str) => IrVersions.V45.ExamplePrimitive.string(str),
                    integer: (num) => IrVersions.V45.ExamplePrimitive.integer(num),
                    double: (num) => IrVersions.V45.ExamplePrimitive.double(num),
                    long: (num) => IrVersions.V45.ExamplePrimitive.long(num),
                    boolean: (bool) => IrVersions.V45.ExamplePrimitive.boolean(bool),
                    datetime: (date) => IrVersions.V45.ExamplePrimitive.datetime(date),
                    date: (date) => IrVersions.V45.ExamplePrimitive.date(date),
                    uuid: (uuid) => IrVersions.V45.ExamplePrimitive.uuid(uuid),
                    _other: (value) => {
                        throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                    }
                })
            )
        }),
        unknown: (value) => ({ ...v46ETR, shape: IrVersions.V45.ExampleTypeReferenceShape.unknown(value) }),
        _other: (value) => {
            throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
        }
    });
}

function convertExampleObjectType(v46EOT: IrVersions.V46.ExampleObjectType): IrVersions.V45.ExampleObjectType {
    return {
        ...v46EOT,
        properties: v46EOT.properties.map((property) => ({
            ...property,
            value: convertExampleTypeReference(property.value)
        }))
    };
}

function convertExampleTypeShape(v46ETS: IrVersions.V46.ExampleTypeShape): IrVersions.V45.ExampleTypeShape {
    if (v46ETS.type === "alias") {
        return IrVersions.V45.ExampleTypeShape.alias({
            value: convertExampleTypeReference(v46ETS.value)
        });
    } else if (v46ETS.type === "object") {
        return IrVersions.V45.ExampleTypeShape.object(convertExampleObjectType(v46ETS));
    } else if (v46ETS.type === "union") {
        return IrVersions.V45.ExampleTypeShape.union({
            ...v46ETS,
            singleUnionType: {
                ...v46ETS.singleUnionType,
                shape: v46ETS.singleUnionType.shape._visit<IrVersions.V45.ExampleSingleUnionTypeProperties>({
                    samePropertiesAsObject: (obj) =>
                        IrVersions.V45.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                            ...obj,
                            object: convertExampleObjectType(obj.object)
                        }),
                    singleProperty: (sp) =>
                        IrVersions.V45.ExampleSingleUnionTypeProperties.singleProperty(convertExampleTypeReference(sp)),
                    noProperties: () => IrVersions.V45.ExampleSingleUnionTypeProperties.noProperties(),
                    _other: (value) => {
                        throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                    }
                })
            }
        });
    } else if (v46ETS.type === "undiscriminatedUnion") {
        return IrVersions.V45.ExampleTypeShape.undiscriminatedUnion({
            ...v46ETS,
            singleUnionType: convertExampleTypeReference(v46ETS.singleUnionType)
        });
    }
    return IrVersions.V45.ExampleTypeShape.enum(v46ETS);
}

function convertExampleTypes(v46ETs: IrVersions.V46.ExampleType[]): IrVersions.V45.ExampleType[] {
    return v46ETs.map((et) => ({
        ...et,
        shape: convertExampleTypeShape(et.shape)
    }));
}

function convertPathParameters(v46PPs: IrVersions.V46.ExamplePathParameter[]): IrVersions.V45.ExamplePathParameter[] {
    return v46PPs.map((pp) => ({
        ...pp,
        value: convertExampleTypeReference(pp.value)
    }));
}

function convertHeaders(v46Hs: IrVersions.V46.ExampleHeader[]): IrVersions.V45.ExampleHeader[] {
    return v46Hs.map((h) => ({
        ...h,
        value: convertExampleTypeReference(h.value)
    }));
}

function convertQueryParameters(
    v46QPs: IrVersions.V46.ExampleQueryParameter[]
): IrVersions.V45.ExampleQueryParameter[] {
    return v46QPs.map((qp) => ({
        ...qp,
        value: convertExampleTypeReference(qp.value)
    }));
}

function convertEndpointExamples(v46ETs: IrVersions.V46.HttpEndpointExample[]): IrVersions.V45.HttpEndpointExample[] {
    return v46ETs.map((et) => {
        const bones: IrVersions.V45.ExampleEndpointCall = {
            ...et,
            rootPathParameters: convertPathParameters(et.rootPathParameters),
            servicePathParameters: convertPathParameters(et.servicePathParameters),
            endpointPathParameters: convertPathParameters(et.endpointPathParameters),
            serviceHeaders: convertHeaders(et.serviceHeaders),
            endpointHeaders: convertHeaders(et.endpointHeaders),
            queryParameters: convertQueryParameters(et.queryParameters),
            request: et.request?._visit<IrVersions.V45.ExampleRequestBody>({
                inlinedRequestBody: (value) =>
                    IrVersions.V45.ExampleRequestBody.inlinedRequestBody({
                        ...value,
                        properties: value.properties.map((prop) => ({
                            ...prop,
                            value: convertExampleTypeReference(prop.value)
                        }))
                    }),
                reference: (value) => IrVersions.V45.ExampleRequestBody.reference(convertExampleTypeReference(value)),
                _other: (value) => {
                    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                }
            }),
            response: et.response._visit<IrVersions.V45.ExampleResponse>({
                ok: (value) =>
                    IrVersions.V45.ExampleResponse.ok(
                        value._visit<IrVersions.V45.ExampleEndpointSuccessResponse>({
                            body: (value) =>
                                IrVersions.V45.ExampleEndpointSuccessResponse.body(
                                    value != null ? convertExampleTypeReference(value) : undefined
                                ),
                            stream: (value) =>
                                IrVersions.V45.ExampleEndpointSuccessResponse.stream(
                                    value.map(convertExampleTypeReference)
                                ),
                            sse: (value) =>
                                IrVersions.V45.ExampleEndpointSuccessResponse.sse(
                                    value.map((v) => ({ ...v, data: convertExampleTypeReference(v.data) }))
                                ),
                            _other: (value) => {
                                throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                            }
                        })
                    ),
                error: (value) =>
                    IrVersions.V45.ExampleResponse.error({
                        ...value,
                        body: value.body != null ? convertExampleTypeReference(value.body) : undefined
                    }),
                _other: (value) => {
                    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                }
            })
        };
        return et._visit<IrVersions.V45.HttpEndpointExample>({
            userProvided: () => IrVersions.V45.HttpEndpointExample.userProvided(bones),
            generated: () => IrVersions.V45.HttpEndpointExample.generated(bones),
            _other: (value) => {
                throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
            }
        });
    });
}

function convertWebsocketExamples(
    v46ETs: IrVersions.V46.ExampleWebSocketSession[]
): IrVersions.V45.ExampleWebSocketSession[] {
    return v46ETs.map((et) => ({
        ...et,
        pathParameters: convertPathParameters(et.pathParameters),
        headers: convertHeaders(et.headers),
        queryParameters: convertQueryParameters(et.queryParameters),
        messages: et.messages.map((m) => ({
            ...m,
            body: m.body._visit<IrVersions.V45.ExampleWebSocketMessageBody>({
                inlinedBody: (value) =>
                    IrVersions.V45.ExampleWebSocketMessageBody.inlinedBody({
                        ...value,
                        properties: value.properties.map((prop) => ({
                            ...prop,
                            value: convertExampleTypeReference(prop.value)
                        }))
                    }),
                reference: (value) =>
                    IrVersions.V45.ExampleWebSocketMessageBody.reference(convertExampleTypeReference(value)),
                _other: (value) => {
                    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
                }
            })
        }))
    }));
}
