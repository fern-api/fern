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
    ExampleTypeShape
} from "@fern-api/ir-sdk";

import { FilteredIr } from "./filtered-ir/FilteredIr";

function filterExampleSingleUnionTypeProperties({
    filteredIr,
    singleUnionTypeProperties
}: {
    filteredIr: FilteredIr;
    singleUnionTypeProperties: ExampleSingleUnionTypeProperties;
}): ExampleSingleUnionTypeProperties | undefined {
    return singleUnionTypeProperties._visit<ExampleSingleUnionTypeProperties | undefined>({
        samePropertiesAsObject: (s) => {
            const filteredObject = filteredIr.hasTypeId(s.typeId)
                ? {
                      ...s,
                      object: {
                          properties: s.object.properties
                              .filter((p) => filteredIr.hasProperty(p.originalTypeDeclaration.typeId, p.name.wireValue))
                              .map((p) => ({
                                  ...p,
                                  value: filterExampleTypeReference({ filteredIr, exampleTypeReference: p.value })
                              }))
                              .filter((p): p is ExampleObjectProperty => p.value !== undefined)
                      }
                  }
                : undefined;
            return filteredObject !== undefined
                ? ExampleSingleUnionTypeProperties.samePropertiesAsObject(filteredObject)
                : undefined;
        },
        singleProperty: (s) => {
            const filteredProperty = filterExampleTypeReference({ filteredIr, exampleTypeReference: s });
            return filteredProperty !== undefined
                ? ExampleSingleUnionTypeProperties.singleProperty(filteredProperty)
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
                map: (m) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.map({
                            ...m,
                            map: m.map
                                .map((v) => {
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
                                .filter((t): t is ExampleKeyValuePair => t !== undefined)
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
                      object: (o) => ({
                          ...exampleTypeReference,
                          shape: ExampleTypeReferenceShape.named({
                              ...n,
                              shape: ExampleTypeShape.object({
                                  ...o,
                                  properties: o.properties
                                      .filter((p) =>
                                          filteredIr.hasProperty(p.originalTypeDeclaration.typeId, p.name.wireValue)
                                      )
                                      .map((p) => ({
                                          ...p,
                                          value: filterExampleTypeReference({
                                              filteredIr,
                                              exampleTypeReference: p.value
                                          })
                                      }))
                                      .filter((p): p is ExampleObjectProperty => p.value !== undefined)
                              })
                          })
                      }),
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
    queryParameters
}: {
    filteredIr: FilteredIr;
    queryParameters: ExampleQueryParameter[];
}): ExampleQueryParameter[] {
    return queryParameters
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
    requestBody
}: {
    filteredIr: FilteredIr;
    requestBody: ExampleRequestBody;
}): ExampleRequestBody | undefined {
    return requestBody._visit<ExampleRequestBody | undefined>({
        inlinedRequestBody: (inlined) => {
            return {
                ...requestBody,
                properties: inlined.properties
                    .filter((p) =>
                        p.originalTypeDeclaration
                            ? filteredIr.hasProperty(p.originalTypeDeclaration.typeId, p.name.wireValue)
                            : true
                    )
                    .map((property) => {
                        const filteredProperty = filterExampleTypeReference({
                            filteredIr,
                            exampleTypeReference: property.value
                        });
                        return filteredProperty !== undefined
                            ? {
                                  ...property,
                                  value: filteredProperty
                              }
                            : undefined;
                    })
                    .filter((property): property is ExampleInlinedRequestBodyProperty => property !== undefined)
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
    example
}: {
    filteredIr: FilteredIr;
    example: ExampleEndpointCall;
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
        queryParameters: filterExampleQueryParameters({ filteredIr, queryParameters: example.queryParameters }),
        request:
            example.request !== undefined
                ? filterExampleRequestBody({ filteredIr, requestBody: example.request })
                : undefined,
        response: filterExampleResponse({ filteredIr, response: example.response })
    };
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
        object: (o) => ({
            ...exampleType,
            shape: ExampleTypeShape.object({
                ...o,
                properties: o.properties
                    .filter((p) => filteredIr.hasProperty(p.originalTypeDeclaration.typeId, p.name.wireValue))
                    .map((p) => ({
                        ...p,
                        value: filterExampleTypeReference({ filteredIr, exampleTypeReference: p.value })
                    }))
                    .filter((p): p is ExampleObjectProperty => p.value !== undefined)
            })
        }),
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
