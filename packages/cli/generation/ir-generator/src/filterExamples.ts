import {
    ExampleContainer,
    ExampleEndpointCall,
    ExampleInlinedRequestBodyProperty,
    ExampleKeyValuePair,
    ExampleNamedType,
    ExampleObjectProperty,
    ExamplePathParameter,
    ExampleRequestBody,
    ExampleResponse,
    ExampleSingleUnionTypeProperties,
    ExampleType,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    NameAndWireValue
} from "@fern-api/ir-sdk";
import { FilteredIr } from "./filtered-ir/FilteredIr";

function filterExampleSingleUnionTypeProperties(
    filteredIr: FilteredIr,
    singleUnionTypeProperties: ExampleSingleUnionTypeProperties
): ExampleSingleUnionTypeProperties | undefined {
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
                                  value: filterExampleTypeReference(filteredIr, p.value)
                              }))
                              .filter((p) => p.value !== undefined) as ExampleObjectProperty[]
                      }
                  }
                : undefined;
            return filteredObject !== undefined
                ? ExampleSingleUnionTypeProperties.samePropertiesAsObject(filteredObject)
                : undefined;
        },
        singleProperty: (s) => {
            const filteredProperty = filterExampleTypeReference(filteredIr, s);
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

function filterExampleTypeReference(
    filteredIr: FilteredIr,
    exampleTypeReference: ExampleTypeReference
): ExampleTypeReference | undefined {
    return exampleTypeReference.shape._visit<ExampleTypeReference | undefined>({
        primitive: () => exampleTypeReference,
        container: (c) =>
            c._visit<ExampleTypeReference | undefined>({
                list: (l) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.list(
                            l
                                .map((t) => filterExampleTypeReference(filteredIr, t))
                                .filter((t) => t !== undefined) as ExampleTypeReference[]
                        )
                    )
                }),
                set: (s) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.set(
                            s
                                .map((t) => filterExampleTypeReference(filteredIr, t))
                                .filter((t) => t !== undefined) as ExampleTypeReference[]
                        )
                    )
                }),
                optional: (o) => {
                    const innerOption = o !== undefined ? filterExampleTypeReference(filteredIr, o) : o;
                    return innerOption !== undefined
                        ? {
                              ...exampleTypeReference,
                              shape: ExampleTypeReferenceShape.container(ExampleContainer.optional(innerOption))
                          }
                        : undefined;
                },
                map: (m) => ({
                    ...exampleTypeReference,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.map(
                            m
                                .map((v) => {
                                    const filteredKey = filterExampleTypeReference(filteredIr, v.key);
                                    const filteredValue = filterExampleTypeReference(filteredIr, v.value);
                                    return filteredKey !== undefined && filteredValue !== undefined
                                        ? { key: filteredKey, value: filteredValue }
                                        : undefined;
                                })
                                .filter((t) => t !== undefined) as ExampleKeyValuePair[]
                        )
                    )
                }),
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
                          const filteredAlias = filterExampleTypeReference(filteredIr, a.value);
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
                                          value: filterExampleTypeReference(filteredIr, p.value)
                                      }))
                                      .filter((p) => p.value !== undefined) as ExampleObjectProperty[]
                              })
                          })
                      }),
                      union: (u) => {
                          const filteredUnion = filterExampleSingleUnionTypeProperties(
                              filteredIr,
                              u.singleUnionType.shape
                          );
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
                          const filteredUnion = filterExampleTypeReference(filteredIr, u.singleUnionType);
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

function filterExamplePathParameters(
    filteredIr: FilteredIr,
    pathParameters: ExamplePathParameter[]
): ExamplePathParameter[] {
    return pathParameters
        .map((param) => {
            const filteredParam = filterExampleTypeReference(filteredIr, param.value);
            return filteredParam !== undefined
                ? {
                      ...param,
                      value: filteredParam
                  }
                : undefined;
        })
        .filter((param) => param !== undefined) as ExamplePathParameter[];
}

interface ExampleHeaderOrQuery {
    name: NameAndWireValue;
    value: ExampleTypeReference;
}

function filterExampleHeaderOrQuery(filteredIr: FilteredIr, headers: ExampleHeaderOrQuery[]): ExampleHeaderOrQuery[] {
    return headers
        .map((header) => {
            const filteredHeader = filterExampleTypeReference(filteredIr, header.value);
            return filteredHeader !== undefined
                ? {
                      ...header,
                      value: filteredHeader
                  }
                : undefined;
        })
        .filter((header) => header !== undefined) as ExampleHeaderOrQuery[];
}

function filterExampleRequestBody(
    filteredIr: FilteredIr,
    requestBody: ExampleRequestBody
): ExampleRequestBody | undefined {
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
                        const filteredProperty = filterExampleTypeReference(filteredIr, property.value);
                        return filteredProperty !== undefined
                            ? {
                                  ...property,
                                  value: filteredProperty
                              }
                            : undefined;
                    })
                    .filter((property) => property !== undefined) as ExampleInlinedRequestBodyProperty[]
            };
        },
        reference: (reference) => {
            const filteredReference = filterExampleTypeReference(filteredIr, reference);
            return filteredReference !== undefined ? ExampleRequestBody.reference(filteredReference) : undefined;
        },
        _other: () => {
            throw new Error("Received unknown type for example.");
        }
    });
}

function filterExampleResponse(filteredIr: FilteredIr, response: ExampleResponse): ExampleResponse {
    return {
        ...response,
        body: response.body !== undefined ? filterExampleTypeReference(filteredIr, response.body) : undefined
    };
}

export function filterEndpointExample(filteredIr: FilteredIr, example: ExampleEndpointCall): ExampleEndpointCall {
    return {
        ...example,
        rootPathParameters: filterExamplePathParameters(filteredIr, example.rootPathParameters),
        servicePathParameters: filterExamplePathParameters(filteredIr, example.servicePathParameters),
        endpointPathParameters: filterExamplePathParameters(filteredIr, example.endpointPathParameters),
        serviceHeaders: filterExampleHeaderOrQuery(filteredIr, example.serviceHeaders),
        endpointHeaders: filterExampleHeaderOrQuery(filteredIr, example.endpointHeaders),
        queryParameters: filterExampleHeaderOrQuery(filteredIr, example.queryParameters),
        request: example.request !== undefined ? filterExampleRequestBody(filteredIr, example.request) : undefined,
        response: filterExampleResponse(filteredIr, example.response)
    };
}

export function filterExampleType(filteredIr: FilteredIr, exampleType: ExampleType): ExampleType | undefined {
    return exampleType.shape._visit<ExampleType | undefined>({
        alias: (a) => {
            const filteredAlias = filterExampleTypeReference(filteredIr, a.value);
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
                    .map((p) => ({ ...p, value: filterExampleTypeReference(filteredIr, p.value) }))
                    .filter((p) => p.value !== undefined) as ExampleObjectProperty[]
            })
        }),
        union: (u) => {
            const filteredUnion = filterExampleSingleUnionTypeProperties(filteredIr, u.singleUnionType.shape);
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
            const filteredUnion = filterExampleTypeReference(filteredIr, u.singleUnionType);
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
