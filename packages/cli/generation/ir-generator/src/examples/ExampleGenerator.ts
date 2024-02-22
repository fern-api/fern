import { faker } from "@faker-js/faker";
import { assertNever } from "@fern-api/core-utils";
import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ExampleContainer,
    ExampleHeader,
    ExampleObjectProperty,
    ExamplePathParameter,
    ExamplePrimitive,
    ExampleQueryParameter,
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
    ObjectProperty,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveType,
    QueryParameter,
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
            value: this.generateExampleTypeReference(property.valueType),
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
                const generatedExamples = endpoint.examples.filter((ex) => ex.type === "generated");
                const providedExamples = endpoint.examples.filter((ex) => ex.type === "provided");
                if (generatedExamples.length > 0) {
                    return endpoint;
                }

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
    ): Omit<HttpEndpointExample, "response" | "type" | "_visit"> {
        return {
            url: endpoint.baseUrl + endpoint.path.head,
            rootPathParameters: rootPathParameters.map((p) => this.generatePathParameterExample(p)),
            servicePathParameters: servicePathParameters.map((p) => this.generatePathParameterExample(p)),
            endpointPathParameters: endpoint.pathParameters.map((p) => this.generatePathParameterExample(p)),
            serviceHeaders: serviceHeaders.map((h) => this.generateHeaderExample(h)),
            endpointHeaders: endpoint.headers.map((h) => this.generateHeaderExample(h)),
            queryParameters: endpoint.queryParameters.map((q) => this.generateQueryParameterExample(q)),
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
        // We should generate the success v. error examples in a more intelligeny way, just not now...
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
            value: this.generateExampleTypeReference(pathParameter.valueType)
        };
    }

    private generateHeaderExample(header: HttpHeader): ExampleHeader {
        return {
            name: header.name,
            value: this.generateExampleTypeReference(header.valueType)
        };
    }

    private generateQueryParameterExample(queryParameter: QueryParameter): ExampleQueryParameter {
        return {
            name: queryParameter.name,
            value: this.generateExampleTypeReference(queryParameter.valueType)
        };
    }

    private generateInlinedRequestBodyExample(requestBody: InlinedRequestBody): ExampleRequestBody {
        return ExampleRequestBody.inlinedRequestBody({
            // TODO: Create this jsonExample
            jsonExample: null,
            properties: [
                ...new Set([
                    ...requestBody.properties.map((prop) => ({
                        name: prop.name,
                        value: this.generateExampleTypeReference(prop.valueType),
                        originalTypeDeclaration: undefined
                    })),
                    ...requestBody.extends.flatMap((eo) => this.flattenedProperties.get(eo.typeId) ?? [])
                ])
            ]
        });
    }

    private generateRequestBodyExample(requestBody: HttpRequestBody): ExampleRequestBody | undefined {
        return requestBody._visit<ExampleRequestBody | undefined>({
            inlinedRequestBody: (value) => this.generateInlinedRequestBodyExample(value),
            reference: (value) =>
                ExampleRequestBody.reference(this.generateExampleTypeReference(value.requestBodyType)),
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
                        this.generateExampleTypeReference(jsonResponseBody.responseBodyType),
                    nestedPropertyAsResponse: (jsonResponseBody: JsonResponseBodyWithProperty) => {
                        if (jsonResponseBody.responseProperty !== undefined) {
                            return this.generateExampleTypeReference(jsonResponseBody.responseProperty.valueType);
                        }
                        return this.generateExampleTypeReference(jsonResponseBody.responseBodyType);
                    },
                    _other: () => this.generateExampleUnknown()
                }),
            fileDownload: () => this.generateExamplePrimitive(PrimitiveType.Base64),
            text: () => this.generateExamplePrimitive(PrimitiveType.String),
            streaming: (streamingResponse: StreamingResponse) =>
                streamingResponse.dataEventType._visit<ExampleTypeReference>({
                    json: (type: TypeReference) => this.generateExampleTypeReference(type),
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

    private generateExampleType(typeDeclaration: TypeDeclaration): ExampleType | ExampleType[] | null {
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.generateExampleTypeForAlias(typeDeclaration.shape);
            case "enum":
                return this.generateExampleTypeForEnum(typeDeclaration.shape);
            case "object":
                return this.generateExampleTypeForObject(typeDeclaration.name, typeDeclaration.shape);
            // For both union types, we generate an example for each member of the union.
            // unless it's a property of a larger class, then we just pick the first example.
            case "union":
                return this.generateExampleTypeForUnion(typeDeclaration.shape);
            case "undiscriminatedUnion":
                return this.generateExampleTypeForUndiscriminatedUnion(typeDeclaration.shape);
            default:
                assertNever(typeDeclaration.shape);
        }
    }

    private generateExampleTypeForAlias(aliasDeclaration: AliasTypeDeclaration): ExampleType | null {
        const exampleTypeReference = this.generateExampleTypeReference(aliasDeclaration.aliasOf);
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
        const exampleEnumValue =
            enumDeclaration.values[faker.number.int({ min: 0, max: enumDeclaration.values.length - 1 })];
        return this.newNamelessExampleType({
            jsonExample: exampleEnumValue!.name.wireValue,
            shape: ExampleTypeShape.enum({
                value: exampleEnumValue!.name
            })
        });
    }

    private generateExampleTypeForObject(
        declaredTypeName: DeclaredTypeName,
        objectDeclaration: ObjectTypeDeclaration
    ): ExampleType | null {
        return this.newNamelessExampleType({
            // TODO: Create this jsonExample
            jsonExample: null,
            shape: ExampleTypeShape.object({
                properties: this.flattenedProperties.get(declaredTypeName.typeId) ?? []
            })
        });
    }

    private generateSingleUionType(type: SingleUnionType): ExampleSingleUnionType {
        return {
            wireDiscriminantValue: type.discriminantValue,
            shape: type.shape._visit<ExampleSingleUnionTypeProperties>({
                samePropertiesAsObject: (dtn: DeclaredTypeName) => {
                    const objectDeclaration = this.types.get(dtn.typeId);
                    if (objectDeclaration === undefined || objectDeclaration?.shape.type !== "object") {
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
                    ExampleSingleUnionTypeProperties.singleProperty(this.generateExampleTypeReference(sutp.type)),
                noProperties: () => ExampleSingleUnionTypeProperties.noProperties(),
                _other: () => ExampleSingleUnionTypeProperties.noProperties()
            })
        };
    }

    private generateExampleTypeForUnion(unionDeclaration: UnionTypeDeclaration): ExampleType[] | null {
        return unionDeclaration.types.map((member) => {
            return this.newNamelessExampleType({
                // TODO: Create this jsonExample
                jsonExample: null,
                shape: ExampleTypeShape.union({
                    discriminant: unionDeclaration.discriminant,
                    singleUnionType: this.generateSingleUionType(member)
                })
            });
        });
    }

    private generateExampleTypeForUndiscriminatedUnion(
        undiscriminatedUnionDeclaration: UndiscriminatedUnionTypeDeclaration
    ): ExampleType[] | null {
        return undiscriminatedUnionDeclaration.members.map((member, index) => {
            return this.newNamelessExampleType({
                // TODO: Create this jsonExample
                jsonExample: null,
                shape: ExampleTypeShape.undiscriminatedUnion({
                    index,
                    singleUnionType: this.generateExampleTypeReference(member.type)
                })
            });
        });
    }

    private generateExampleTypeReference(typeReference: TypeReference): ExampleTypeReference {
        switch (typeReference.type) {
            case "container":
                return this.generateExampleContainer(typeReference.container);
            case "named":
                return this.generateExampleNamed(typeReference);
            case "primitive":
                return this.generateExamplePrimitive(typeReference.primitive);
            case "unknown":
                return this.generateExampleUnknown();
            default:
                assertNever(typeReference);
        }
    }

    private generateExampleNamed(name: DeclaredTypeName): ExampleTypeReference {
        const typeDeclaration = this.resolveType(name);
        const exampleType = this.generateExampleType(typeDeclaration);
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

    private generateExampleContainer(containerType: ContainerType): ExampleTypeReference {
        switch (containerType.type) {
            case "list":
                return this.generateExampleTypeReferenceList(containerType.list);
            case "map":
                return this.generateExampleTypeReferenceMap(containerType);
            case "optional":
                return this.generateExampleTypeReference(containerType.optional);
            case "set":
                return this.generateExampleTypeReferenceSet(containerType.set);
            case "literal":
                return this.generateExampleTypeReferenceLiteral(containerType.literal);
            default:
                assertNever(containerType);
        }
    }

    private generateExampleTypeReferenceList(typeReference: TypeReference): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference);
        return {
            jsonExample: [exampleTypeReference.jsonExample],
            shape: ExampleTypeReferenceShape.container(ExampleContainer.list([exampleTypeReference]))
        };
    }

    private generateExampleTypeReferenceMap(mapType: MapType): ExampleTypeReference {
        const exampleTypeReferenceKey = this.generateExampleTypeReference(mapType.keyType);
        const exampleTypeReferenceValue = this.generateExampleTypeReference(mapType.valueType);
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
            return faker.number.int();
        }
        return faker.word.sample();
    }

    private generateExampleTypeReferenceSet(typeReference: TypeReference): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference);
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
                const word = faker.lorem.words({ min: 2, max: 5 });
                return {
                    jsonExample: word,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: word }))
                };
            case "INTEGER":
                const int = faker.number.int();
                return {
                    jsonExample: int,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.integer(int))
                };
            case "DOUBLE":
                const float = faker.number.float();
                return {
                    jsonExample: float,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.double(float))
                };
            case "BOOLEAN":
                const bool = faker.datatype.boolean();
                return {
                    jsonExample: bool,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.boolean(bool))
                };
            case "LONG":
                const long = faker.number.int();
                return {
                    jsonExample: long,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.long(long))
                };
            case "DATE_TIME":
                const datetime = faker.date.recent();
                return {
                    jsonExample: datetime.toJSON(),
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.datetime(datetime))
                };
            case "UUID":
                const uuid = faker.string.uuid();
                return {
                    jsonExample: uuid,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.uuid(uuid))
                };
            case "DATE":
                const date = faker.date.recent().toDateString();
                return {
                    jsonExample: date,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.date(date))
                };
            case "BASE_64":
                // TODO(amckinney): Add support for base64 example primitives; use a string for now.
                const strToEncode = faker.lorem.words({ min: 2, max: 5 });
                const encoded = Buffer.from(strToEncode, "binary").toString("base64");

                return {
                    jsonExample: encoded,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: encoded }))
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
}
