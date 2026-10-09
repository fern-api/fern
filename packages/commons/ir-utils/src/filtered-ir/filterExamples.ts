import { isNonNullish } from "@fern-api/core-utils";
import {
    ExampleContainer,
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
    ExampleHeader,
    ExampleInlinedRequestBodyProperty,
    ExampleKeyValuePair,
    ExampleNamedType,
    ExampleObjectProperty,
    ExamplePathParameter,
    ExampleQueryParameter,
    ExampleRequestBody,
    ExampleResponse,
    ExampleSingleUnionTypeProperties,
    ExampleType,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    FernIr,
    TypeReference,
    V2HttpEndpointExamples,
    V2SchemaExamples
} from "@fern-api/ir-sdk";

import { IdGenerator } from "../utils/IdGenerator.js";
import { getWireValue } from "../utils/namesUtils.js";
import { FilteredIr } from "./FilteredIr.js";

/**
 * Drops `jsonExample` keys that are not in the audience-filtered property list.
 */
function filterJsonExampleObjectKeys(jsonExample: unknown, allowedKeys: Set<string>): unknown {
    if (jsonExample == null || typeof jsonExample !== "object" || Array.isArray(jsonExample)) {
        return jsonExample;
    }
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(jsonExample as Record<string, unknown>)) {
        if (allowedKeys.has(key)) {
            filtered[key] = value;
        }
    }
    return filtered;
}

function filterExampleSingleUnionTypeProperties({
    filteredIr,
    singleUnionTypeProperties
}: {
    filteredIr: FilteredIr;
    singleUnionTypeProperties: FernIr.ExampleSingleUnionTypeProperties;
}): FernIr.ExampleSingleUnionTypeProperties | undefined {
    return singleUnionTypeProperties._visit<ExampleSingleUnionTypeProperties | undefined>({
        samePropertiesAsObject: (s) => {
            const filteredObject = filteredIr.hasTypeId(s.typeId)
                ? {
                      ...s,
                      object: {
                          ...s.object,
                          properties: s.object.properties
                              .filter((p) =>
                                  filteredIr.hasProperty(p.originalTypeDeclaration.typeId, getWireValue(p.name))
                              )
                              .map((p) => ({
                                  ...p,
                                  value: filterExampleTypeReference({ filteredIr, exampleTypeReference: p.value })
                              }))
                              .filter((p): p is ExampleObjectProperty => p.value !== undefined)
                      }
                  }
                : undefined;
            return filteredObject !== undefined
                ? FernIr.ExampleSingleUnionTypeProperties.samePropertiesAsObject(filteredObject)
                : undefined;
        },
        singleProperty: (s) => {
            const filteredProperty = filterExampleTypeReference({ filteredIr, exampleTypeReference: s });
            return filteredProperty !== undefined
                ? FernIr.ExampleSingleUnionTypeProperties.singleProperty(filteredProperty)
                : undefined;
        },
        noProperties: () => singleUnionTypeProperties,
        _other: () => {
            throw new Error("Received unknown type for example.");
        }
    });
}

function filterExampleTypeReference({
    filteredIr,
    exampleTypeReference
}: {
    filteredIr: FilteredIr;
    exampleTypeReference: ExampleTypeReference;
}): ExampleTypeReference | undefined {
    return exampleTypeReference.shape._visit<ExampleTypeReference | undefined>({
        primitive: () => exampleTypeReference,
        container: (c) =>
            c._visit<ExampleTypeReference | undefined>({
                list: (l) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.list({
                            ...l,
                            list: l.list
                                .map((t) => filterExampleTypeReference({ filteredIr, exampleTypeReference: t }))
                                .filter((t): t is ExampleTypeReference => t !== undefined)
                        })
                    )
                }),
                set: (s) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.set({
                            ...s,
                            set: s.set
                                .map((t) => filterExampleTypeReference({ filteredIr, exampleTypeReference: t }))
                                .filter((t): t is ExampleTypeReference => t !== undefined)
                        })
                    )
                }),
                optional: (o) => {
                    const filteredOptionalTypReference =
                        o.optional != null
                            ? filterExampleTypeReference({ filteredIr, exampleTypeReference: o.optional })
                            : undefined;
                    return filteredOptionalTypReference != null
                        ? {
                              ...exampleTypeReference,
                              shape: ExampleTypeReferenceShape.container(
                                  ExampleContainer.optional({
                                      optional: filteredOptionalTypReference,
                                      valueType: o.valueType
                                  })
                              )
                          }
                        : undefined;
                },
                nullable: (n) => {
                    const filteredNullableTypReference =
                        n.nullable != null
                            ? filterExampleTypeReference({ filteredIr, exampleTypeReference: n.nullable })
                            : undefined;
                    return filteredNullableTypReference != null
                        ? {
                              ...exampleTypeReference,
                              shape: ExampleTypeReferenceShape.container(
                                  ExampleContainer.nullable({
                                      nullable: filteredNullableTypReference,
                                      valueType: n.valueType
                                  })
                              )
                          }
                        : undefined;
                },
                map: (m) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.map({
                            ...m,
                            map: m.map
                                .map((v: ExampleKeyValuePair) => {
                                    const filteredKey = filterExampleTypeReference({
                                        filteredIr,
                                        exampleTypeReference: v.key
                                    });
                                    const filteredValue = filterExampleTypeReference({
                                        filteredIr,
                                        exampleTypeReference: v.value
                                    });
                                    return filteredKey !== undefined && filteredValue !== undefined
                                        ? { key: filteredKey, value: filteredValue }
                                        : undefined;
                                })
                                .filter(
                                    (t: ExampleKeyValuePair | undefined): t is ExampleKeyValuePair => t !== undefined
                                )
                        })
                    )
                }),
                // This is just a primitive, don't do anything
                literal: () => exampleTypeReference,
                _other: () => {
                    throw new Error("Received unknown type for example.");
                }
            }),
        // If the type is allowed filter it's properties and return
        // Otherwise just return null
        named: (n: ExampleNamedType) =>
            filteredIr.hasTypeId(n.typeName.typeId)
                ? n.shape._visit<ExampleTypeReference | undefined>({
                      alias: (a) => {
                          const filteredAlias = filterExampleTypeReference({
                              filteredIr,
                              exampleTypeReference: a.value
                          });
                          return filteredAlias !== undefined
                              ? {
                                    ...exampleTypeReference,
                                    shape: ExampleTypeReferenceShape.named({
                                        ...n,
                                        shape: ExampleTypeShape.alias({ ...a, value: filteredAlias })
                                    })
                                }
                              : undefined;
                      },
                      enum: (e) => ({
                          ...exampleTypeReference,
                          shape: ExampleTypeReferenceShape.named({ ...n, shape: ExampleTypeShape.enum(e) })
                      }),
                      object: (o) => {
                          const filteredProperties = o.properties
                              .filter((p) =>
                                  filteredIr.hasProperty(p.originalTypeDeclaration.typeId, getWireValue(p.name))
                              )
                              .map((p) => ({
                                  ...p,
                                  value: filterExampleTypeReference({
                                      filteredIr,
                                      exampleTypeReference: p.value
                                  })
                              }))
                              .filter((p): p is ExampleObjectProperty => p.value !== undefined);
                          const allowedKeys = new Set(filteredProperties.map((p) => getWireValue(p.name)));
                          return {
                              ...exampleTypeReference,
                              jsonExample: filterJsonExampleObjectKeys(exampleTypeReference.jsonExample, allowedKeys),
                              shape: ExampleTypeReferenceShape.named({
                                  ...n,
                                  shape: ExampleTypeShape.object({
                                      ...o,
                                      properties: filteredProperties
                                  })
                              })
                          };
                      },
                      union: (u) => {
                          const filteredUnion = filterExampleSingleUnionTypeProperties({
                              filteredIr,
                              singleUnionTypeProperties: u.singleUnionType.shape
                          });
                          return filteredUnion !== undefined
                              ? {
                                    ...exampleTypeReference,
                                    shape: ExampleTypeReferenceShape.named({
                                        ...n,
                                        shape: ExampleTypeShape.union({
                                            ...u,
                                            singleUnionType: { ...u.singleUnionType, shape: filteredUnion }
                                        })
                                    })
                                }
                              : undefined;
                      },
                      undiscriminatedUnion: (u) => {
                          const filteredUnion = filterExampleTypeReference({
                              filteredIr,
                              exampleTypeReference: u.singleUnionType
                          });
                          return filteredUnion !== undefined
                              ? {
                                    ...exampleTypeReference,
                                    shape: ExampleTypeReferenceShape.named({
                                        ...n,
                                        shape: ExampleTypeShape.undiscriminatedUnion({
                                            ...u,
                                            singleUnionType: filteredUnion
                                        })
                                    })
                                }
                              : undefined;
                      },
                      _other: () => {
                          throw new Error("Received unknown type for example.");
                      }
                  })
                : undefined,
        unknown: () => exampleTypeReference,
        _other: () => exampleTypeReference
    });
}

function filterExamplePathParameters({
    filteredIr,
    pathParameters
}: {
    filteredIr: FilteredIr;
    pathParameters: ExamplePathParameter[];
}): ExamplePathParameter[] {
    return pathParameters
        .map((param) => {
            const filteredParam = filterExampleTypeReference({ filteredIr, exampleTypeReference: param.value });
            return filteredParam !== undefined
                ? {
                      ...param,
                      value: filteredParam
                  }
                : undefined;
        })
        .filter((param): param is ExamplePathParameter => param !== undefined);
}

function filterExampleQueryParameters({
    filteredIr,
    queryParameters,
    endpointId
}: {
    filteredIr: FilteredIr;
    queryParameters: ExampleQueryParameter[];
    endpointId: string | undefined;
}): ExampleQueryParameter[] {
    return queryParameters
        .filter(
            (queryParameter) =>
                endpointId == null || filteredIr.hasQueryParameter(endpointId, getWireValue(queryParameter.name))
        )
        .map((queryParameter) => {
            const filteredQueryParameter = filterExampleTypeReference({
                filteredIr,
                exampleTypeReference: queryParameter.value
            });
            return filteredQueryParameter !== undefined
                ? {
                      ...queryParameter,
                      value: filteredQueryParameter
                  }
                : undefined;
        })
        .filter((queryParameter): queryParameter is ExampleQueryParameter => queryParameter !== undefined);
}

function filterExampleHeader({
    filteredIr,
    headers
}: {
    filteredIr: FilteredIr;
    headers: ExampleHeader[];
}): ExampleHeader[] {
    return headers
        .map((header) => {
            const filteredHeader = filterExampleTypeReference({ filteredIr, exampleTypeReference: header.value });
            return filteredHeader !== undefined
                ? {
                      ...header,
                      value: filteredHeader
                  }
                : undefined;
        })
        .filter((header): header is ExampleHeader => header !== undefined);
}

function filterExampleRequestBody({
    filteredIr,
    requestBody,
    endpointId
}: {
    filteredIr: FilteredIr;
    requestBody: ExampleRequestBody;
    endpointId: string | undefined;
}): ExampleRequestBody | undefined {
    return requestBody._visit<ExampleRequestBody | undefined>({
        inlinedRequestBody: (inlined) => {
            const filteredProperties = inlined.properties
                .filter((p) => {
                    const wireName = getWireValue(p.name);
                    if (p.originalTypeDeclaration == null) {
                        return endpointId != null ? filteredIr.hasRequestProperty(endpointId, wireName) : true;
                    }
                    return filteredIr.hasProperty(p.originalTypeDeclaration.typeId, wireName);
                })
                .map((property: ExampleInlinedRequestBodyProperty) => {
                    const filteredValue = filterExampleTypeReference({
                        filteredIr,
                        exampleTypeReference: property.value
                    });
                    return filteredValue !== undefined ? { ...property, value: filteredValue } : undefined;
                })
                .filter((property): property is ExampleInlinedRequestBodyProperty => property !== undefined);
            const allowedKeys = new Set(filteredProperties.map((p) => getWireValue(p.name)));
            return {
                ...requestBody,
                jsonExample: filterJsonExampleObjectKeys(inlined.jsonExample, allowedKeys),
                properties: filteredProperties
            };
        },
        reference: (reference) => {
            const filteredReference = filterExampleTypeReference({ filteredIr, exampleTypeReference: reference });
            return filteredReference !== undefined ? ExampleRequestBody.reference(filteredReference) : undefined;
        },
        _other: () => {
            throw new Error("Received unknown type for example.");
        }
    });
}

function filterExampleResponse({
    filteredIr,
    response
}: {
    filteredIr: FilteredIr;
    response: ExampleResponse;
}): ExampleResponse {
    return response._visit<ExampleResponse>({
        ok: (ok) =>
            ok._visit<ExampleResponse>({
                body: (exampleTypeReference) =>
                    ExampleResponse.ok(
                        ExampleEndpointSuccessResponse.body(
                            exampleTypeReference != null
                                ? filterExampleTypeReference({ filteredIr, exampleTypeReference })
                                : undefined
                        )
                    ),
                stream: (stream) =>
                    ExampleResponse.ok(
                        ExampleEndpointSuccessResponse.stream(
                            stream
                                .map((exampleTypeReference) =>
                                    filterExampleTypeReference({ filteredIr, exampleTypeReference })
                                )
                                .filter(isNonNullish)
                        )
                    ),
                sse: (events) =>
                    ExampleResponse.ok(
                        ExampleEndpointSuccessResponse.sse(
                            events
                                .map(({ event, data }) => {
                                    const filteredData = filterExampleTypeReference({
                                        filteredIr,
                                        exampleTypeReference: data
                                    });
                                    return filteredData !== undefined ? { event, data: filteredData } : undefined;
                                })
                                .filter(isNonNullish)
                        )
                    ),
                _other: ({ type }) => {
                    throw new Error(`Received unknown type for OK example: ${type}`);
                }
            }),
        error: ({ error, body }) =>
            ExampleResponse.error({
                error,
                body: body != null ? filterExampleTypeReference({ filteredIr, exampleTypeReference: body }) : undefined
            }),
        _other: ({ type }) => {
            throw new Error(`Received unknown type for example: ${type}`);
        }
    });
}

export function filterEndpointExample({
    filteredIr,
    example,
    endpointId
}: {
    filteredIr: FilteredIr;
    example: ExampleEndpointCall;
    endpointId?: string;
}): ExampleEndpointCall {
    return {
        ...example,
        rootPathParameters: filterExamplePathParameters({ filteredIr, pathParameters: example.rootPathParameters }),
        servicePathParameters: filterExamplePathParameters({
            filteredIr,
            pathParameters: example.servicePathParameters
        }),
        endpointPathParameters: filterExamplePathParameters({
            filteredIr,
            pathParameters: example.endpointPathParameters
        }),
        serviceHeaders: filterExampleHeader({ filteredIr, headers: example.serviceHeaders }),
        endpointHeaders: filterExampleHeader({ filteredIr, headers: example.endpointHeaders }),
        queryParameters: filterExampleQueryParameters({
            filteredIr,
            queryParameters: example.queryParameters,
            endpointId
        }),
        request:
            example.request !== undefined
                ? filterExampleRequestBody({ filteredIr, requestBody: example.request, endpointId })
                : undefined,
        response: filterExampleResponse({ filteredIr, response: example.response })
    };
}

/**
 * Filters an inline webhook payload example by `hasWebhookPayloadProperty`. Inline payloads
 * aren't registered as regular types in the filter graph, and the IR converter emits these
 * examples in two forms (`container.map<unknown>` and `named.object`), so we handle both.
 */
export function filterWebhookExamplePayload({
    filteredIr,
    payload,
    webhookId
}: {
    filteredIr: FilteredIr;
    payload: ExampleTypeReference;
    webhookId: string | undefined;
}): ExampleTypeReference {
    if (webhookId == null) {
        return payload;
    }
    const isAllowed = (wireName: string) => filteredIr.hasWebhookPayloadProperty(webhookId, wireName);

    if (payload.shape.type === "named" && payload.shape.shape.type === "object") {
        const named = payload.shape;
        const objectShape = named.shape;
        if (objectShape.type !== "object") {
            return payload;
        }
        const filteredProperties = objectShape.properties.filter((p) => isAllowed(getWireValue(p.name)));
        const allowedKeys = new Set(filteredProperties.map((p) => getWireValue(p.name)));
        return {
            ...payload,
            jsonExample: filterJsonExampleObjectKeys(payload.jsonExample, allowedKeys),
            shape: ExampleTypeReferenceShape.named({
                ...named,
                shape: ExampleTypeShape.object({ ...objectShape, properties: filteredProperties })
            })
        };
    }

    if (payload.shape.type === "container" && payload.shape.container.type === "map") {
        const mapContainer = payload.shape.container;
        const filteredEntries = mapContainer.map.filter((entry) => {
            const keyJson = entry.key.jsonExample;
            return typeof keyJson === "string" && isAllowed(keyJson);
        });
        const allowedKeys = new Set(
            filteredEntries
                .map((entry) => entry.key.jsonExample)
                .filter((key): key is string => typeof key === "string")
        );
        return {
            ...payload,
            jsonExample: filterJsonExampleObjectKeys(payload.jsonExample, allowedKeys),
            shape: ExampleTypeReferenceShape.container(ExampleContainer.map({ ...mapContainer, map: filteredEntries }))
        };
    }

    return payload;
}

export function filterExampleType({
    filteredIr,
    exampleType
}: {
    filteredIr: FilteredIr;
    exampleType: ExampleType;
}): ExampleType | undefined {
    return exampleType.shape._visit<ExampleType | undefined>({
        alias: (a) => {
            const filteredAlias = filterExampleTypeReference({ filteredIr, exampleTypeReference: a.value });
            return filteredAlias !== undefined
                ? { ...exampleType, shape: ExampleTypeShape.alias({ ...a, value: filteredAlias }) }
                : undefined;
        },
        enum: () => exampleType,
        object: (o) => {
            const filteredProperties = o.properties
                .filter((p) => filteredIr.hasProperty(p.originalTypeDeclaration.typeId, getWireValue(p.name)))
                .map((p) => ({
                    ...p,
                    value: filterExampleTypeReference({ filteredIr, exampleTypeReference: p.value })
                }))
                .filter((p): p is ExampleObjectProperty => p.value !== undefined);
            const allowedKeys = new Set(filteredProperties.map((p) => getWireValue(p.name)));
            return {
                ...exampleType,
                jsonExample: filterJsonExampleObjectKeys(exampleType.jsonExample, allowedKeys),
                shape: ExampleTypeShape.object({ ...o, properties: filteredProperties })
            };
        },
        union: (u) => {
            const filteredUnion = filterExampleSingleUnionTypeProperties({
                filteredIr,
                singleUnionTypeProperties: u.singleUnionType.shape
            });
            return filteredUnion !== undefined
                ? {
                      ...exampleType,
                      shape: ExampleTypeShape.union({
                          ...u,
                          singleUnionType: { ...u.singleUnionType, shape: filteredUnion }
                      })
                  }
                : undefined;
        },
        undiscriminatedUnion: (u) => {
            const filteredUnion = filterExampleTypeReference({ filteredIr, exampleTypeReference: u.singleUnionType });
            return filteredUnion !== undefined
                ? {
                      ...exampleType,
                      shape: ExampleTypeShape.undiscriminatedUnion({
                          ...u,
                          singleUnionType: filteredUnion
                      })
                  }
                : undefined;
        },
        _other: () => {
            throw new Error("Received unknown type for example.");
        }
    });
}

// v2 example scrubbers
//
// v2 examples are raw `unknown` JSON payloads (unlike the typed V1 example trees above), so
// they need a separate top-level-key scrubbing pass when an audience filter is active.
// Nested objects are left alone because the v2 shapes don't carry the nested types we'd need.

type KeyPredicate = (key: string) => boolean;

function stripTopLevelKeysFromJsonExample(value: unknown, isAllowed: KeyPredicate): unknown {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return value;
    }
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
        if (isAllowed(key)) {
            out[key] = v;
        }
    }
    return out;
}

function scrubV2SchemaExampleMap(map: Record<string, unknown>, isAllowed: KeyPredicate): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(map).map(([name, value]) => [name, stripTopLevelKeysFromJsonExample(value, isAllowed)])
    );
}

export function scrubV2SchemaExamples(
    v2Examples: V2SchemaExamples | undefined,
    isAllowed: KeyPredicate
): V2SchemaExamples | undefined {
    if (v2Examples == null) {
        return v2Examples;
    }
    return {
        userSpecifiedExamples: scrubV2SchemaExampleMap(v2Examples.userSpecifiedExamples, isAllowed),
        autogeneratedExamples: scrubV2SchemaExampleMap(v2Examples.autogeneratedExamples, isAllowed)
    };
}

/** Peels containers (optional, nullable, list, set) to the canonical `IrGraph` type id, if any. */
export function getNamedTypeIdFromTypeReference(typeReference: TypeReference): string | undefined {
    return typeReference._visit<string | undefined>({
        named: (declaredTypeName) => IdGenerator.generateTypeId(declaredTypeName),
        container: (container) =>
            container._visit<string | undefined>({
                optional: (inner) => getNamedTypeIdFromTypeReference(inner),
                nullable: (inner) => getNamedTypeIdFromTypeReference(inner),
                list: (inner) => getNamedTypeIdFromTypeReference(inner),
                set: (inner) => getNamedTypeIdFromTypeReference(inner),
                map: () => undefined,
                literal: () => undefined,
                _other: () => undefined
            }),
        primitive: () => undefined,
        unknown: () => undefined,
        _other: () => undefined
    });
}

/**
 * Scrubs the endpoint-level `v2Examples` block. Shapes we can't disambiguate (file uploads,
 * byte bodies, streaming responses) are left untouched.
 */
export function scrubV2HttpEndpointExamples({
    v2Examples,
    requestBodyIsAllowed,
    responseBodyIsAllowed,
    queryParameterIsAllowed
}: {
    v2Examples: V2HttpEndpointExamples | undefined;
    requestBodyIsAllowed: KeyPredicate;
    responseBodyIsAllowed: KeyPredicate;
    queryParameterIsAllowed: KeyPredicate;
}): V2HttpEndpointExamples | undefined {
    if (v2Examples == null) {
        return v2Examples;
    }
    const scrubExampleMap = (
        examples: Record<string, FernIr.V2HttpEndpointExample>
    ): Record<string, FernIr.V2HttpEndpointExample> => {
        return Object.fromEntries(
            Object.entries(examples).map(([name, example]) => [
                name,
                {
                    ...example,
                    request:
                        example.request != null
                            ? {
                                  ...example.request,
                                  requestBody: stripTopLevelKeysFromJsonExample(
                                      example.request.requestBody,
                                      requestBodyIsAllowed
                                  ),
                                  queryParameters:
                                      example.request.queryParameters != null
                                          ? Object.fromEntries(
                                                Object.entries(example.request.queryParameters).filter(([key]) =>
                                                    queryParameterIsAllowed(key)
                                                )
                                            )
                                          : example.request.queryParameters
                              }
                            : example.request,
                    response:
                        example.response?.body != null
                            ? {
                                  ...example.response,
                                  body: scrubV2HttpEndpointResponseBody(example.response.body, responseBodyIsAllowed)
                              }
                            : example.response
                }
            ])
        );
    };
    return {
        userSpecifiedExamples: scrubExampleMap(v2Examples.userSpecifiedExamples),
        autogeneratedExamples: scrubExampleMap(v2Examples.autogeneratedExamples)
    };
}

function scrubV2HttpEndpointResponseBody(
    body: FernIr.V2HttpEndpointResponseBody,
    responseBodyIsAllowed: KeyPredicate
): FernIr.V2HttpEndpointResponseBody {
    return body._visit<FernIr.V2HttpEndpointResponseBody>({
        json: (value) =>
            FernIr.V2HttpEndpointResponseBody.json(stripTopLevelKeysFromJsonExample(value, responseBodyIsAllowed)),
        error: (value) => FernIr.V2HttpEndpointResponseBody.error(value),
        stream: (value) => FernIr.V2HttpEndpointResponseBody.stream(value),
        _other: () => body
    });
}

/** Scrubs `v2Examples` on a webhook by dropping top-level payload keys excluded by the filter. */
export function scrubV2WebhookExamples(
    v2Examples: FernIr.V2WebhookExamples | undefined,
    isAllowed: KeyPredicate
): FernIr.V2WebhookExamples | undefined {
    if (v2Examples == null) {
        return v2Examples;
    }
    const scrubExampleMap = (
        examples: Record<string, FernIr.V2WebhookExample>
    ): Record<string, FernIr.V2WebhookExample> => {
        return Object.fromEntries(
            Object.entries(examples).map(([name, example]) => [
                name,
                {
                    ...example,
                    payload: stripTopLevelKeysFromJsonExample(example.payload, isAllowed)
                }
            ])
        );
    };
    return {
        userSpecifiedExamples: scrubExampleMap(v2Examples.userSpecifiedExamples),
        autogeneratedExamples: scrubExampleMap(v2Examples.autogeneratedExamples)
    };
}
