import { assertNever } from "@fern-api/core-utils";
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

export class ExampleGenerator {
    ir: IntermediateRepresentation;
    private types: Map<TypeId, TypeDeclaration>;
    private MAX_EXAMPLE_DEPTH = 2;
    public flattenedProperties: Map<TypeId, ExampleObjectProperty[]>;

    constructor(ir: IntermediateRepresentation) {
        this.ir = ir;

        this.types = new Map();
        for (const type of Object.values(ir.types)) {
            this.types.set(type.name.typeId, type);
        }

        this.flattenedProperties = new Map();
        for (const typeId of this.types.keys()) {
            this.flattenedProperties.set(typeId, this.getFlattenedProperties(typeId));
        }
    }

    // TODO: Clean this up and use the flattenedProperties... we also need to know keep the original type declaration
    // We pull all inherited properties onto the object because Ruby
    // does not allow for multiple inheritence of classes, and does not
    // have a concept of interfaces. We could leverage Modules, however inheriting
    // properties from Modules appears non-standard (functions is the more common usecase)
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
                      undiscriminatedUnion: () => {
                          this.flattenedProperties.set(typeId, []);
                          return [];
                      },
                      _other: () => {
                          throw new Error("Attempting to type declaration for an unknown type.");
                      }
                  });
    }

    public enrichWithExamples(): IntermediateRepresentation {
        for (const [_, service] of Object.entries(this.ir.services)) {
            service.endpoints = service.endpoints.map((endpoint) => {
                // We want to go in here and autogenerate the examples only if there is not
                // already an autogenerated example in the IR. Since the data is randomized, we'd
                // be making loads of unnecessary changes every time otherwise.
                const generatedExamples = endpoint.examples.filter((ex) => ex.exampleType === "generated");
                if (generatedExamples.length > 0) {
                    return endpoint;
                }

                const providedExamples = endpoint.examples.filter((ex) => ex.exampleType === "provided");
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

    private getExampleWithoutResponse(
        endpoint: HttpEndpoint,
        rootPathParameters: PathParameter[],
        servicePathParameters: PathParameter[],
        serviceHeaders: HttpHeader[]
    ): Omit<HttpEndpointExample, "response" | "type" | "_visit" | "exampleType"> {
        return {
            url: endpoint.path.head,
            rootPathParameters: rootPathParameters.map((p) => this.generatePathParameterExample(p)),
            servicePathParameters: servicePathParameters.map((p) => this.generatePathParameterExample(p)),
            endpointPathParameters: endpoint.pathParameters.map((p) => this.generatePathParameterExample(p)),
            serviceHeaders: serviceHeaders.map((h) => this.generateHttpParameterExample(h)),
            endpointHeaders: endpoint.headers.map((h) => this.generateHttpParameterExample(h)),
            queryParameters: endpoint.queryParameters.map((q) => this.generateHttpParameterExample(q)),
            request:
                endpoint.requestBody !== undefined ? this.generateRequestBodyExample(endpoint.requestBody) : undefined,
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
        return [
            HttpEndpointExample.generated({
                ...this.getExampleWithoutResponse(endpoint, rootPathParameters, servicePathParameters, serviceHeaders),
                response: this.generateSuccessResponseExample(endpoint.response)
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

    private generatePathParameterExample(pathParameter: PathParameter): ExamplePathParameter {
        return {
            name: pathParameter.name,
            value: this.generateExampleTypeReference(pathParameter.valueType, 0)
        };
    }

    private generateHttpParameterExample(parameter: { name: NameAndWireValue; valueType: TypeReference }): {
        name: NameAndWireValue;
        value: ExampleTypeReference;
    } {
        return {
            name: parameter.name,
            value: this.generateExampleTypeReference(parameter.valueType, 0)
        };
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

    private generateRequestBodyExample(requestBody: HttpRequestBody): ExampleRequestBody | undefined {
        return requestBody._visit<ExampleRequestBody | undefined>({
            inlinedRequestBody: (value) => this.generateInlinedRequestBodyExample(value),
            reference: (value) =>
                ExampleRequestBody.reference(this.generateExampleTypeReference(value.requestBodyType, 0)),
            fileUpload: () => undefined,
            bytes: () => undefined,
            _other: () => undefined
        });
    }

    private generateSuccessResponseExample(response: HttpResponse | undefined): ExampleResponse {
        const exampleResponse = response?._visit<ExampleTypeReference>({
            json: (jsonResponse: JsonResponse) =>
                jsonResponse._visit<ExampleTypeReference>({
                    response: (jsonResponseBody: JsonResponseBody) =>
                        this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0),
                    nestedPropertyAsResponse: (jsonResponseBody: JsonResponseBodyWithProperty) => {
                        if (jsonResponseBody.responseProperty !== undefined) {
                            return this.generateExampleTypeReference(jsonResponseBody.responseProperty.valueType, 0);
                        }
                        return this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0);
                    },
                    _other: () => this.generateExampleUnknown()
                }),
            fileDownload: () => this.generateExamplePrimitive(PrimitiveType.Base64),
            text: () => this.generateExamplePrimitive(PrimitiveType.String),
            streaming: (streamingResponse: StreamingResponse) =>
                streamingResponse.dataEventType._visit<ExampleTypeReference>({
                    json: (type: TypeReference) => this.generateExampleTypeReference(type, 0),
                    text: () => this.generateExamplePrimitive(PrimitiveType.String),
                    _other: () => this.generateExampleUnknown()
                }),
            _other: () => this.generateExampleUnknown()
        });
        return ExampleResponse.ok({ body: exampleResponse });
    }

    private generateErrorResponseExample(responseError: ResponseError): ExampleResponse {
        return ExampleResponse.error({
            error: responseError.error,
            body: undefined
        });
    }

    private generateExampleType(typeDeclaration: TypeDeclaration, depth: number): ExampleType | ExampleType[] | null {
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
        const exampleProperties = this.flattenedProperties.get(declaredTypeName.typeId);
        return this.newNamelessExampleType({
            jsonExample:
                exampleProperties === undefined
                    ? {}
                    : new Map(exampleProperties.map((prop) => [prop.name.wireValue, prop.value.jsonExample])),
            shape: ExampleTypeShape.object({
                properties: exampleProperties ?? []
            })
        });
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
                return this.generateExamplePrimitive(typeReference.primitive);
            case "unknown":
                return this.generateExampleUnknown();
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
            return this.generateExampleUnknown();
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

    private generateExamplePrimitive(primitiveType: PrimitiveType): ExampleTypeReference {
        switch (primitiveType) {
            case "STRING":
                return {
                    jsonExample: "string",
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: "string" }))
                };
            case "INTEGER":
                return {
                    jsonExample: 42,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(0))
                };
            case "DOUBLE":
                return {
                    jsonExample: 1.0,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(1.0))
                };
            case "BOOLEAN":
                return {
                    jsonExample: true,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(true))
                };
            case "LONG":
                return {
                    jsonExample: 99999,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(99999))
                };
            case "DATE_TIME":
                return {
                    jsonExample: "2024-01-01T00:00:00Z",
                    shape: ExampleTypeReferenceShape.primitive(
                        ExamplePrimitive.datetime(new Date("2024-01-01T00:00:00Z"))
                    )
                };
            case "UUID":
                return {
                    jsonExample: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    shape: ExampleTypeReferenceShape.primitive(
                        ExamplePrimitive.uuid("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
                    )
                };
            case "DATE":
                return {
                    jsonExample: "2024-01-01",
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.date("2024-01-01"))
                };
            case "BASE_64":
                // TODO(amckinney): Add support for base64 example primitives; use a string for now.
                return {
                    jsonExample: "SGVsbG8gV29ybGQ=",
                    shape: ExampleTypeReferenceShape.primitive(
                        ExamplePrimitive.string({ original: "SGVsbG8gV29ybGQ=" })
                    )
                };
            default:
                assertNever(primitiveType);
        }
    }

    private generateExampleUnknown(): ExampleTypeReference {
        return {
            jsonExample: {},
            shape: ExampleTypeReferenceShape.unknown({})
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
