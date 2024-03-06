import { assertNever, Examples } from "@fern-api/core-utils";
import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ExampleContainer,
    ExampleObjectProperty,
    ExampleObjectTypeWithTypeId,
    ExamplePathParameter,
    ExamplePrimitive,
    ExampleRequestBody,
    ExampleResponse,
    ExampleSingleUnionType,
    ExampleSingleUnionTypeProperties,
    ExampleType,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    HttpEndpoint,
    HttpEndpointExample,
    HttpHeader,
    HttpRequestBody,
    HttpResponse,
    InlinedRequestBody,
    IntermediateRepresentation,
    JsonResponse,
    JsonResponseBody,
    JsonResponseBodyWithProperty,
    Literal,
    MapType,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveType,
    ResponseError,
    SingleUnionType,
    SingleUnionTypeProperty,
    StreamingResponse,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";

interface HttpParameterExample {
    name: NameAndWireValue;
    value: ExampleTypeReference;
}

export class ExampleGenerator {
    // Typing is a convenience to match the typing within generateIntermediateRepresentation.ts
    ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
    private typeExamples: Map<TypeId, ExampleType>;
    private types: Map<TypeId, TypeDeclaration>;
    private MAX_EXAMPLE_DEPTH = 2;
    public flattenedProperties: Map<TypeId, ExampleObjectProperty[]>;

    constructor(ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">) {
        this.ir = ir;

        this.types = new Map();
        for (const type of Object.values(ir.types)) {
            this.types.set(type.name.typeId, type);
        }

        // Visit each type, if there's an example stash it
        // We expect examples to be complete here, given that `fern check` checks for required properties
        // within the provided examples
        this.typeExamples = new Map();
        for (const [typeId, type] of Object.entries(this.ir.types)) {
            const examples = type.examples;
            if (examples && examples.length > 0) {
                this.typeExamples.set(typeId, examples[0]!);
            }
        }

        this.flattenedProperties = new Map();
        for (const typeId of this.types.keys()) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }
    }

    private convertPropertyToExampleProperty(
        originalType: DeclaredTypeName,
        property: ObjectProperty
    ): ExampleObjectProperty {
        return {
            name: property.name,
            value: this.generateExampleTypeReference(property.valueType, 0),
            originalTypeDeclaration: originalType
        };
    }

    private getFlattenedProperties(typeId: TypeId): ExampleObjectProperty[] {
        const td = this.types.get(typeId);
        return td === undefined
            ? []
            : this.flattenedProperties.get(typeId) ??
                  td.shape._visit<ExampleObjectProperty[]>({
                      alias: (atd: AliasTypeDeclaration) => {
                          return atd.aliasOf._visit<ExampleObjectProperty[]>({
                              container: () => [],
                              named: (dtn: DeclaredTypeName) => this.getFlattenedProperties(dtn.typeId),
                              primitive: () => [],
                              unknown: () => [],
                              _other: () => []
                          });
                      },
                      enum: () => {
                          this.flattenedProperties.set(typeId, []);
                          return [];
                      },
                      object: (otd: ObjectTypeDeclaration) => {
                          const props = [
                              ...otd.properties.map((prop) => this.convertPropertyToExampleProperty(td.name, prop)),
                              ...otd.extends.flatMap((eo) => this.getFlattenedProperties(eo.typeId))
                          ];
                          this.flattenedProperties.set(typeId, props);
                          return props;
                      },
                      union: (utd: UnionTypeDeclaration) => {
                          const props = [
                              ...utd.baseProperties.map((prop) => this.convertPropertyToExampleProperty(td.name, prop)),
                              ...utd.extends.flatMap((eo) => this.getFlattenedProperties(eo.typeId))
                          ];
                          this.flattenedProperties.set(typeId, props);
                          return props;
                      },
                      undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) => {
                          this.flattenedProperties.set(typeId, []);
                          return [];
                      },
                      _other: () => {
                          throw new Error("Attempting to type declaration for an unknown type.");
                      }
                  });
    }

    public enrichWithExamples(): Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> {
        for (const [_, service] of Object.entries(this.ir.services)) {
            // Visit each endpoint, if there's an example, complete it, if not make one from scratch
            service.endpoints = service.endpoints.map((endpoint) => {
                // We want to go in here and autogenerate the examples only if there is not
                // already an autogenerated example in the IR. Since the data is randomized, we'd
                // be making loads of unnecessary changes every time otherwise.
                const generatedExamples = endpoint.examples.filter((ex) => ex.exampleType === "generated");
                if (generatedExamples.length > 0) {
                    return endpoint;
                }

                const providedExamples = endpoint.examples.filter((ex) => ex.exampleType === "userProvided");
                return {
                    ...endpoint,
                    // We should take advantage of union types here to generate multiple examples per
                    // member type per endpoint, but likely not in the first iteration.
                    examples: providedExamples.concat(
                        this.generateEndpointExamples(
                            endpoint,
                            this.ir.pathParameters,
                            service.pathParameters,
                            service.headers
                        )
                    )
                };
            });
        }
        return this.ir;
    }

    // This is the main multi-plexing function, the order of preference when creating an example is:
    // 1. User provided example off the endpoint
    // 2. User provided example off the object type definition
    // 3. An autogenerated example
    private getExampleWithoutResponse(
        endpoint: HttpEndpoint,
        rootPathParameters: PathParameter[],
        servicePathParameters: PathParameter[],
        serviceHeaders: HttpHeader[]
    ): Omit<HttpEndpointExample, "response" | "type" | "_visit" | "exampleType"> {
        const examples = endpoint.examples;
        return {
            url: endpoint.path.head,
            rootPathParameters: rootPathParameters.map((p) =>
                this.generatePathParameterExample({
                    pathParameter: p,
                    maybePathParameterExample: examples
                        .flatMap((example) => example.rootPathParameters)
                        .find((rp) => rp.name === p.name)
                })
            ),
            servicePathParameters: servicePathParameters.map((p) =>
                this.generatePathParameterExample({
                    pathParameter: p,
                    maybePathParameterExample: examples
                        .flatMap((example) => example.servicePathParameters)
                        .find((sp) => sp.name === p.name)
                })
            ),
            endpointPathParameters: endpoint.pathParameters.map((p) =>
                this.generatePathParameterExample({
                    pathParameter: p,
                    maybePathParameterExample: examples
                        .flatMap((example) => example.endpointPathParameters)
                        .find((sp) => sp.name === p.name)
                })
            ),
            serviceHeaders: serviceHeaders.map((h) =>
                this.generateHttpParameterExample({
                    parameter: h,
                    maybeParameterExample: examples
                        .flatMap((example) => example.serviceHeaders)
                        .find((sh) => sh.name === h.name)
                })
            ),
            endpointHeaders: endpoint.headers.map((h) =>
                this.generateHttpParameterExample({
                    parameter: h,
                    maybeParameterExample: examples
                        .flatMap((example) => example.endpointHeaders)
                        .find((sh) => sh.name === h.name)
                })
            ),
            queryParameters: endpoint.queryParameters.map((q) =>
                this.generateHttpParameterExample({
                    parameter: q,
                    maybeParameterExample: examples
                        .flatMap((example) => example.queryParameters)
                        .find((qp) => qp.name === q.name)
                })
            ),
            request:
                endpoint.requestBody !== undefined
                    ? this.generateRequestBodyExample({
                          requestBody: endpoint.requestBody,
                          maybeExampleRequest: examples
                              .map((example) => example.request)
                              .filter((example) => example != null)[0]
                      })
                    : undefined,
            name: undefined,
            codeSamples: undefined,
            docs: undefined
        };
    }

    private generateEndpointExamples(
        endpoint: HttpEndpoint,
        rootPathParameters: PathParameter[],
        servicePathParameters: PathParameter[],
        serviceHeaders: HttpHeader[]
    ): HttpEndpointExample[] {
        // We should generate the success v. error examples in a more intelligent way, just not now...
        // Here we generate a response example for each error, and one for the success case,
        // but there's no corralation between request and response really.

        // TODO: if there's a complete example, we should probably just return that, though that's just duplicative of the provided examples.
        return [
            HttpEndpointExample.generated({
                ...this.getExampleWithoutResponse(endpoint, rootPathParameters, servicePathParameters, serviceHeaders),
                response: this.generateSuccessResponseExample({
                    response: endpoint.response,
                    maybeResponse: endpoint.examples.map((example) => example.response)[0]
                })
            }),
            ...endpoint.errors.map((e) =>
                HttpEndpointExample.generated({
                    ...this.getExampleWithoutResponse(
                        endpoint,
                        rootPathParameters,
                        servicePathParameters,
                        serviceHeaders
                    ),
                    response: this.generateErrorResponseExample(e)
                })
            )
        ];
    }

    private generatePathParameterExample({
        pathParameter,
        maybePathParameterExample
    }: {
        pathParameter: PathParameter;
        maybePathParameterExample: ExamplePathParameter | undefined;
    }): ExamplePathParameter {
        return (
            maybePathParameterExample ?? {
                name: pathParameter.name,
                value: this.generateExampleTypeReference(pathParameter.valueType, 0)
            }
        );
    }

    private generateHttpParameterExample({
        parameter,
        maybeParameterExample
    }: {
        parameter: { name: NameAndWireValue; valueType: TypeReference };
        maybeParameterExample: HttpParameterExample | undefined;
    }): HttpParameterExample {
        return (
            maybeParameterExample ?? {
                name: parameter.name,
                value: this.generateExampleTypeReference(parameter.valueType, 0)
            }
        );
    }

    private generateInlinedRequestBodyExample(requestBody: InlinedRequestBody): ExampleRequestBody {
        const exampleProperties = [
            ...new Set([
                ...requestBody.properties.map((prop) => ({
                    name: prop.name,
                    value: this.generateExampleTypeReference(prop.valueType, 0),
                    originalTypeDeclaration: undefined
                })),
                ...requestBody.extends.flatMap((eo) => this.flattenedProperties.get(eo.typeId) ?? [])
            ])
        ];
        return ExampleRequestBody.inlinedRequestBody({
            jsonExample: new Map(exampleProperties.map((prop) => [prop.name.wireValue, prop.value.jsonExample])),
            properties: exampleProperties
        });
    }

    private generateRequestBodyExample({
        requestBody,
        maybeExampleRequest
    }: {
        requestBody: HttpRequestBody;
        maybeExampleRequest: ExampleRequestBody | undefined;
    }): ExampleRequestBody | undefined {
        return (
            maybeExampleRequest ??
            requestBody._visit<ExampleRequestBody | undefined>({
                inlinedRequestBody: (value) => this.generateInlinedRequestBodyExample(value),
                reference: (value) =>
                    ExampleRequestBody.reference(this.generateExampleTypeReference(value.requestBodyType, 0)),
                fileUpload: () => undefined,
                bytes: () => undefined,
                _other: () => undefined
            })
        );
    }

    private generateSuccessResponseExample({
        response,
        maybeResponse
    }: {
        response: HttpResponse | undefined;
        maybeResponse: ExampleResponse | undefined;
    }): ExampleResponse {
        return (
            maybeResponse ??
            ExampleResponse.ok({
                body: response?._visit<ExampleTypeReference>({
                    json: (jsonResponse: JsonResponse) =>
                        jsonResponse._visit<ExampleTypeReference>({
                            response: (jsonResponseBody: JsonResponseBody) =>
                                this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0),
                            nestedPropertyAsResponse: (jsonResponseBody: JsonResponseBodyWithProperty) => {
                                if (jsonResponseBody.responseProperty !== undefined) {
                                    return this.generateExampleTypeReference(
                                        jsonResponseBody.responseProperty.valueType,
                                        0
                                    );
                                }
                                return this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0);
                            },
                            _other: () => this.generateExampleUnknown({})
                        }),
                    fileDownload: () => this.generateExamplePrimitive({ primitiveType: PrimitiveType.Base64 }),
                    text: () => this.generateExamplePrimitive({ primitiveType: PrimitiveType.String }),
                    streaming: (streamingResponse: StreamingResponse) =>
                        streamingResponse.dataEventType._visit<ExampleTypeReference>({
                            json: (type: TypeReference) => this.generateExampleTypeReference(type, 0),
                            text: () => this.generateExamplePrimitive({ primitiveType: PrimitiveType.String }),
                            _other: () => this.generateExampleUnknown({})
                        }),
                    _other: () => this.generateExampleUnknown({})
                })
            })
        );
    }

    private generateErrorResponseExample(responseError: ResponseError): ExampleResponse {
        return ExampleResponse.error({
            error: responseError.error,
            body: undefined
        });
    }

    private generateExampleType(typeDeclaration: TypeDeclaration, depth: number): ExampleType | ExampleType[] | null {
        const example = this.typeExamples.get(typeDeclaration.name.typeId);
        if (example != null) {
            return example;
        }
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.generateExampleTypeForAlias(typeDeclaration.shape, depth);
            case "enum":
                return this.generateExampleTypeForEnum(typeDeclaration.shape);
            case "object":
                return this.generateExampleTypeForObject(typeDeclaration.name);
            // For both union types, we generate an example for each member of the union.
            // unless it's a property of a larger class, then we just pick the first example.
            case "union":
                return this.generateExampleTypeForUnion(typeDeclaration.shape, depth);
            case "undiscriminatedUnion":
                return this.generateExampleTypeForUndiscriminatedUnion(typeDeclaration.shape);
            default:
                assertNever(typeDeclaration.shape);
        }
    }

    private generateExampleTypeForAlias(aliasDeclaration: AliasTypeDeclaration, depth: number): ExampleType | null {
        const exampleTypeReference = this.generateExampleTypeReference(aliasDeclaration.aliasOf, depth);
        return this.newNamelessExampleType({
            jsonExample: exampleTypeReference.jsonExample,
            shape: ExampleTypeShape.alias({
                value: exampleTypeReference
            })
        });
    }

    private generateExampleTypeForEnum(enumDeclaration: EnumTypeDeclaration): ExampleType | null {
        if (enumDeclaration.values.length === 0 || enumDeclaration.values[0] == null) {
            return null;
        }
        const exampleEnumValue = enumDeclaration.values[0];
        return this.newNamelessExampleType({
            jsonExample: exampleEnumValue.name.wireValue,
            shape: ExampleTypeShape.enum({
                value: exampleEnumValue.name
            })
        });
    }

    private generateExampleTypeForObject(declaredTypeName: DeclaredTypeName): ExampleType | null {
        const providedExample = this.typeExamples.get(declaredTypeName.typeId);
        const exampleProperties = this.flattenedProperties.get(declaredTypeName.typeId);
        return (
            providedExample ??
            this.newNamelessExampleType({
                jsonExample:
                    exampleProperties === undefined
                        ? {}
                        : new Map(exampleProperties.map((prop) => [prop.name.wireValue, prop.value.jsonExample])),
                shape: ExampleTypeShape.object({
                    properties: exampleProperties ?? []
                })
            })
        );
    }

    private generateSingleUnionType(type: SingleUnionType, depth: number): ExampleSingleUnionType {
        return {
            wireDiscriminantValue: type.discriminantValue,
            shape: type.shape._visit<ExampleSingleUnionTypeProperties>({
                samePropertiesAsObject: (dtn: DeclaredTypeName) => {
                    const objectDeclaration = this.types.get(dtn.typeId);
                    if (objectDeclaration === undefined || objectDeclaration.shape.type !== "object") {
                        return ExampleSingleUnionTypeProperties.noProperties();
                    }
                    return ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                        typeId: dtn.typeId,
                        object: {
                            properties: this.flattenedProperties.get(dtn.typeId) ?? []
                        }
                    });
                },
                singleProperty: (sutp: SingleUnionTypeProperty) =>
                    ExampleSingleUnionTypeProperties.singleProperty(
                        this.generateExampleTypeReference(sutp.type, depth + 1)
                    ),
                noProperties: () => ExampleSingleUnionTypeProperties.noProperties(),
                _other: () => ExampleSingleUnionTypeProperties.noProperties()
            })
        };
    }

    private generateExampleTypeForUnion(unionDeclaration: UnionTypeDeclaration, depth: number): ExampleType[] | null {
        return unionDeclaration.types.map((member) => {
            const singleUnionType = this.generateSingleUnionType(member, depth);
            // eslint-disable-next-line @typescript-eslint/ban-types
            const unionExampleProperties = singleUnionType.shape._visit<Object>({
                samePropertiesAsObject: (ex: ExampleObjectTypeWithTypeId) =>
                    new Map(ex.object.properties.map((prop) => [prop.name.wireValue, prop.value.jsonExample])),
                // eslint-disable-next-line @typescript-eslint/ban-types
                singleProperty: (ex: ExampleTypeReference) => ex.jsonExample as Object,
                noProperties: () => {
                    return {};
                },
                _other: () => {
                    return {};
                }
            });
            const unionExample = {
                [unionDeclaration.discriminant.wireValue]: member.discriminantValue.wireValue,
                ...unionExampleProperties
            };
            return this.newNamelessExampleType({
                jsonExample: unionExample,
                shape: ExampleTypeShape.union({
                    discriminant: unionDeclaration.discriminant,
                    singleUnionType
                })
            });
        });
    }

    private generateExampleTypeForUndiscriminatedUnion(
        undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration
    ): ExampleType[] | null {
        return undiscriminatedUnionDeclaration.members.map((member, index) => {
            const memberExample = this.generateExampleTypeReference(member.type, 0);
            return this.newNamelessExampleType({
                jsonExample: memberExample.jsonExample,
                shape: ExampleTypeShape.undiscriminatedUnion({
                    index,
                    singleUnionType: memberExample
                })
            });
        });
    }

    private generateExampleTypeReference(typeReference: TypeReference, depth: number): ExampleTypeReference {
        switch (typeReference.type) {
            case "container":
                return this.generateExampleContainer(typeReference.container, depth);
            case "named":
                return this.generateExampleNamed(typeReference, depth);
            case "primitive":
                return this.generateExamplePrimitive({ primitiveType: typeReference.primitive });
            case "unknown":
                return this.generateExampleUnknown({});
            default:
                assertNever(typeReference);
        }
    }

    private generateExampleNamed(name: DeclaredTypeName, depth: number): ExampleTypeReference {
        const typeDeclaration = this.resolveType(name);
        const exampleType = this.generateExampleType(typeDeclaration, depth);
        const singleExample = exampleType instanceof Array ? exampleType[0] : exampleType;

        if (singleExample == null) {
            throw new Error(`internal error: failed to generate example type with id: ${name.typeId}`);
        }
        return {
            jsonExample: singleExample.jsonExample,
            shape: ExampleTypeReferenceShape.named({
                typeName: name,
                shape: singleExample.shape
            })
        };
    }

    private generateExampleContainer(containerType: ContainerType, depth: number): ExampleTypeReference {
        switch (containerType.type) {
            case "list":
                return this.generateExampleTypeReferenceList(containerType.list, depth + 1);
            case "map":
                return this.generateExampleTypeReferenceMap(containerType, depth + 1);
            case "optional":
                return this.generateExampleTypeReference(containerType.optional, depth + 1);
            case "set":
                return this.generateExampleTypeReferenceSet(containerType.set, depth + 1);
            case "literal":
                return this.generateExampleTypeReferenceLiteral(containerType.literal);
            default:
                assertNever(containerType);
        }
    }

    private generateExampleTypeReferenceList(typeReference: TypeReference, depth: number): ExampleTypeReference {
        if (this.exceedsMaxDepth(depth)) {
            return this.generateExampleUnknown({});
        }
        const exampleTypeReference = this.generateExampleTypeReference(typeReference, depth);
        return {
            jsonExample: [exampleTypeReference.jsonExample],
            shape: ExampleTypeReferenceShape.container(ExampleContainer.list([exampleTypeReference]))
        };
    }

    private generateExampleTypeReferenceMap(mapType: MapType, depth: number): ExampleTypeReference {
        const exampleTypeReferenceKey = this.generateExampleTypeReference(mapType.keyType, depth);
        const exampleTypeReferenceValue = this.generateExampleTypeReference(mapType.valueType, depth);
        const jsonExampleMapKey = this.jsonExampleToMapKey(exampleTypeReferenceKey.jsonExample);
        return {
            jsonExample: {
                [jsonExampleMapKey]: exampleTypeReferenceValue.jsonExample
            },
            shape: ExampleTypeReferenceShape.container(
                ExampleContainer.map([
                    {
                        key: exampleTypeReferenceKey,
                        value: exampleTypeReferenceValue
                    }
                ])
            )
        };
    }

    private jsonExampleToMapKey(jsonExample: unknown): string | number {
        if (typeof jsonExample === "number") {
            return 42;
        }
        return "string";
    }

    private generateExampleTypeReferenceSet(typeReference: TypeReference, depth: number): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference, depth);
        return {
            jsonExample: [exampleTypeReference.jsonExample],
            shape: ExampleTypeReferenceShape.container(ExampleContainer.set([exampleTypeReference]))
        };
    }

    private generateExampleTypeReferenceLiteral(literal: Literal): ExampleTypeReference {
        switch (literal.type) {
            case "boolean":
                return {
                    jsonExample: `${literal.boolean}`,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(literal.boolean))
                };
            case "string":
                return {
                    jsonExample: `"${literal.string}"`,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: literal.string }))
                };
            default:
                assertNever(literal);
        }
    }

    // We should consolidate this logic with this, but given the types are so different it's a bit cumbersome
    // https://github.com/fern-api/fern/blob/master/packages/cli/openapi-parser/src/schema/examples/ExampleTypeFactory.ts#L486-L560
    private generateExamplePrimitive({
        primitiveType,
        example
    }: {
        primitiveType: PrimitiveType;
        example?: unknown | undefined;
    }): ExampleTypeReference {
        switch (primitiveType) {
            case "STRING": {
                const exString = example != null && typeof example === "string" ? example : Examples.STRING;
                return {
                    jsonExample: exString,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: exString }))
                };
            }
            case "INTEGER": {
                const exInt = example != null && typeof example === "number" ? example : Examples.INT;
                return {
                    jsonExample: exInt,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(exInt))
                };
            }
            case "DOUBLE": {
                const exDouble = example != null && typeof example === "number" ? example : Examples.DOUBLE;
                return {
                    jsonExample: exDouble,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(exDouble))
                };
            }
            case "BOOLEAN": {
                const exBool = example != null && typeof example === "boolean" ? example : Examples.BOOLEAN;
                return {
                    jsonExample: exBool,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(exBool))
                };
            }
            case "LONG": {
                const exLong = example != null && typeof example === "number" ? example : Examples.INT64;
                return {
                    jsonExample: exLong,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(exLong))
                };
            }
            case "DATE_TIME": {
                const exDateTime = example != null && typeof example === "string" ? example : Examples.DATE_TIME;
                return {
                    jsonExample: exDateTime,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.datetime(new Date(exDateTime)))
                };
            }
            case "UUID": {
                const exUuid = example != null && typeof example === "string" ? example : Examples.UUID;
                return {
                    jsonExample: exUuid,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.uuid(exUuid))
                };
            }
            case "DATE": {
                const exDate = example != null && typeof example === "string" ? example : Examples.DATE;
                return {
                    jsonExample: exDate,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.date(exDate))
                };
            }
            case "BASE_64": {
                const exB64 = example != null && typeof example === "string" ? example : Examples.BASE64;
                return {
                    jsonExample: exB64,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: exB64 }))
                };
            }
            default:
                assertNever(primitiveType);
        }
    }

    private generateExampleUnknown({
        name,
        isParameter = false
    }: {
        name?: string;
        isParameter?: boolean;
    }): ExampleTypeReference {
        const value: unknown = isParameter ? name ?? "string" : { key: "value" };
        return {
            jsonExample: value,
            shape: ExampleTypeReferenceShape.unknown(value)
        };
    }

    private resolveType(name: DeclaredTypeName): TypeDeclaration {
        const typeDeclaration = this.ir.types[name.typeId];
        if (typeDeclaration == null) {
            throw new Error(`internal error: could not resolve type with id: ${name.typeId}`);
        }
        return typeDeclaration;
    }

    private newNamelessExampleType({
        jsonExample,
        shape
    }: {
        jsonExample: unknown;
        shape: ExampleTypeShape;
    }): ExampleType {
        return {
            name: undefined,
            docs: undefined,
            jsonExample,
            shape
        };
    }

    private exceedsMaxDepth(depth: number): boolean {
        return depth > this.MAX_EXAMPLE_DEPTH;
    }
}
