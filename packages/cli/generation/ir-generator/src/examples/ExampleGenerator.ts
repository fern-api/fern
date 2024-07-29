import { assertNever, Examples, isNonNullish } from "@fern-api/core-utils";
import {
    AliasTypeDeclaration,
    ContainerType,
    DeclaredTypeName,
    EnumTypeDeclaration,
    ExampleContainer,
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
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
    HttpHeader,
    HttpRequestBody,
    HttpResponseBody,
    InlinedRequestBody,
    IntermediateRepresentation,
    Literal,
    MapType,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    PathParameter,
    PrimitiveTypeV1,
    ResponseError,
    SingleUnionType,
    SingleUnionTypeProperty,
    TypeDeclaration,
    TypeId,
    TypeReference,
    UndiscriminatedUnionTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-api/ir-sdk";
import hash from "object-hash";

interface HttpParameterExample {
    name: NameAndWireValue;
    value: ExampleTypeReference;
}

export declare namespace ExampleGenerator {
    interface Options {
        unknownAsPrimitive?: boolean; // defaults to false
    }
}

export class ExampleGenerator {
    // Typing is a convenience to match the typing within generateIntermediateRepresentation.ts
    ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
    private userProvidedTypeExamples: Map<TypeId, ExampleType>;
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
        this.userProvidedTypeExamples = new Map();
        for (const [typeId, type] of Object.entries(this.ir.types)) {
            const userProvidedExamples = type.userProvidedExamples;
            if (userProvidedExamples && userProvidedExamples.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.userProvidedTypeExamples.set(typeId, userProvidedExamples[0]!);
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
        const foundTd =
            td === undefined
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

        return foundTd;
    }

    public enrichWithAutogeneratedExamples(): Omit<
        IntermediateRepresentation,
        "sdkConfig" | "subpackages" | "rootPackage"
    > {
        // TODO: uncommment to auto-generate examples
        // for (const [typeId, typeDeclation] of Object.entries(this.ir.types)) {
        //     // TODO: if the example already exists and has optional fields left empty, enrich it with values for those fields
        //     // and store as auto-generated
        //     if (this.userProvidedTypeExamples.has(typeId)) {
        //         continue;
        //     }
        //     const exampleType = this.generateExampleType(typeDeclation, 0);
        //     const examples =
        //         exampleType instanceof Array ? exampleType : exampleType != null ? [exampleType] : undefined;

        //     if (examples == null) {
        //         throw new Error(`internal error: failed to generate example type with id: ${typeId}`);
        //     }
        //     if (examples.length === 0) {
        //         // eslint-disable-next-line no-console
        //         console.log("NO examples! Typeid: " + typeId);
        //     }
        //     typeDeclation.autogeneratedExamples = examples;
        // }
        for (const [_, service] of Object.entries(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                // TODO: We should take advantage of union types here to generate multiple examples per
                // member type
                const autogeneratedExampleEndpoints = this.generateEndpointExamples(
                    endpoint,
                    this.ir.pathParameters,
                    service.pathParameters,
                    service.headers
                );
                endpoint.autogeneratedExamples = autogeneratedExampleEndpoints.map((example) => {
                    return {
                        example
                    };
                });
            }
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
    ): Omit<ExampleEndpointCall, "id" | "response"> {
        const examples = [
            ...endpoint.userSpecifiedExamples.map((userSpecified) => userSpecified.example).filter(isNonNullish)
        ];
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
            docs: undefined
        };
    }

    private generateEndpointExamples(
        endpoint: HttpEndpoint,
        rootPathParameters: PathParameter[],
        servicePathParameters: PathParameter[],
        serviceHeaders: HttpHeader[]
    ): ExampleEndpointCall[] {
        // We should generate the success v. error examples in a more intelligent way, just not now...
        // Here we generate a response example for each error, and one for the success case,
        // but there's no corralation between request and response really.

        // TODO: if there's a complete example, we should probably just return that, though that's just duplicative of the provided examples.
        const exampleWithoutResponse = this.getExampleWithoutResponse(
            endpoint,
            rootPathParameters,
            servicePathParameters,
            serviceHeaders
        );
        const examples = [
            ...endpoint.userSpecifiedExamples.map((userSpecified) => userSpecified.example).filter(isNonNullish)
        ];

        const successExamples = examples.map(({ response }) => {
            const exampleContent = {
                ...exampleWithoutResponse,
                response: this.generateSuccessResponseExample({
                    response: endpoint.response?.body,
                    maybeResponse: response
                })
            };
            return {
                ...exampleContent,
                id: hash(exampleContent)
            };
        });

        // If there are no examples, we should generate a default success example
        if (successExamples.length === 0) {
            const exampleContent = {
                ...exampleWithoutResponse,
                response: this.generateSuccessResponseExample({
                    response: endpoint.response?.body,
                    maybeResponse: undefined
                })
            };
            successExamples.push({
                ...exampleContent,
                id: hash(exampleContent)
            });
        }

        const errorExamples = endpoint.errors.map((e) => {
            const exampleContent = {
                ...exampleWithoutResponse,
                response: this.generateErrorResponseExample(e)
            };
            return {
                ...exampleContent,
                id: hash(exampleContent)
            };
        });

        return [...successExamples, ...errorExamples];
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

        const jsonExample: Record<string, unknown> = {};
        exampleProperties.forEach((prop) => (jsonExample[prop.name.wireValue] = prop.value.jsonExample));
        return ExampleRequestBody.inlinedRequestBody({
            jsonExample,
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
        response: HttpResponseBody | undefined;
        maybeResponse: ExampleResponse | undefined;
    }): ExampleResponse {
        // If there's an empty example, we should ignore it, but if it's populated, just return that.
        if (maybeResponse != null && maybeResponse.type === "ok" && maybeResponse.value?.value != null) {
            return maybeResponse;
        }

        if (response == null) {
            return ExampleResponse.ok(ExampleEndpointSuccessResponse.body());
        }

        return ExampleResponse.ok(
            response._visit<ExampleEndpointSuccessResponse>({
                json: (jsonResponse) =>
                    ExampleEndpointSuccessResponse.body(
                        jsonResponse._visit({
                            response: (jsonResponseBody) =>
                                this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0),
                            nestedPropertyAsResponse: (jsonResponseBody) => {
                                if (jsonResponseBody.responseProperty !== undefined) {
                                    return this.generateExampleTypeReference(
                                        jsonResponseBody.responseProperty.valueType,
                                        0
                                    );
                                }
                                return this.generateExampleTypeReference(jsonResponseBody.responseBodyType, 0);
                            },
                            _other: () => this.generateExampleUnknown()
                        })
                    ),
                fileDownload: () =>
                    ExampleEndpointSuccessResponse.body(
                        this.generateExamplePrimitive({ primitiveType: PrimitiveTypeV1.Base64 })
                    ),
                text: () =>
                    ExampleEndpointSuccessResponse.body(
                        this.generateExamplePrimitive({ primitiveType: PrimitiveTypeV1.String })
                    ),
                streaming: (streamingResponse) =>
                    streamingResponse._visit<ExampleEndpointSuccessResponse>({
                        sse: (sse) =>
                            ExampleEndpointSuccessResponse.sse([
                                { event: "message", data: this.generateExampleTypeReference(sse.payload, 0) },
                                { event: "message", data: this.generateExampleTypeReference(sse.payload, 0) }
                            ]),
                        json: (json) =>
                            ExampleEndpointSuccessResponse.stream([
                                this.generateExampleTypeReference(json.payload, 0),
                                this.generateExampleTypeReference(json.payload, 0)
                            ]),
                        text: () =>
                            ExampleEndpointSuccessResponse.stream([
                                this.generateExamplePrimitive({ primitiveType: PrimitiveTypeV1.String }),
                                this.generateExamplePrimitive({ primitiveType: PrimitiveTypeV1.String })
                            ]),
                        _other: () => ExampleEndpointSuccessResponse.stream([this.generateExampleUnknown()])
                    }),
                streamParameter: (value) => {
                    const nonStreamResponse = value.nonStreamResponse._visit({
                        fileDownload: (value) => HttpResponseBody.fileDownload({ ...value }),
                        json: (value) => HttpResponseBody.fileDownload({ ...value }),
                        text: (value) => HttpResponseBody.fileDownload({ ...value }),
                        _other: (type) => {
                            throw new Error(`Received unrecognized response ${type}`);
                        }
                    });
                    const example = this.generateSuccessResponseExample({
                        response: nonStreamResponse,
                        maybeResponse: undefined
                    });
                    if (example.type === "error") {
                        throw new Error("Unexpected: received error example");
                    }
                    return example.value;
                },
                _other: () => ExampleEndpointSuccessResponse.body(this.generateExampleUnknown())
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
        const example = this.userProvidedTypeExamples.get(typeDeclaration.name.typeId);
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
                return this.generateExampleTypeForUnion(typeDeclaration.name.typeId, typeDeclaration.shape, depth);
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
        const providedExample = this.userProvidedTypeExamples.get(declaredTypeName.typeId);
        const exampleProperties = this.flattenedProperties.get(declaredTypeName.typeId);

        const jsonExample: Record<string, unknown> = {};
        exampleProperties?.forEach((prop) => (jsonExample[prop.name.wireValue] = prop.value.jsonExample));

        return (
            providedExample ??
            this.newNamelessExampleType({
                jsonExample,
                shape: ExampleTypeShape.object({
                    properties: exampleProperties ?? []
                })
            })
        );
    }

    private generateSingleUnionType(
        containerProperties: ExampleObjectProperty[],
        type: SingleUnionType,
        depth: number
    ): ExampleSingleUnionType {
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
                            properties: [...containerProperties, ...(this.flattenedProperties.get(dtn.typeId) ?? [])]
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

    private generateExampleTypeForUnion(
        typeId: TypeId,
        unionDeclaration: UnionTypeDeclaration,
        depth: number
    ): ExampleType[] | null {
        return unionDeclaration.types.map((member) => {
            const containerProperties = this.flattenedProperties.get(typeId) ?? [];
            const singleUnionType = this.generateSingleUnionType(containerProperties, member, depth);

            const jsonExample: Record<string, unknown> = {};
            // eslint-disable-next-line @typescript-eslint/ban-types
            const unionExampleProperties = singleUnionType.shape._visit<Object>({
                samePropertiesAsObject: (ex: ExampleObjectTypeWithTypeId) => {
                    const properties = [
                        ...containerProperties,
                        ...(this.flattenedProperties.get(ex.typeId) ?? ex.object.properties)
                    ];
                    properties.forEach((prop) => (jsonExample[prop.name.wireValue] = prop.value.jsonExample));
                    return jsonExample;
                },
                // eslint-disable-next-line @typescript-eslint/ban-types
                singleProperty: (ex: ExampleTypeReference) => ex.jsonExample as Object,
                noProperties: () => {
                    return jsonExample;
                },
                _other: () => {
                    return jsonExample;
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

    private generateExampleTypeReference(
        typeReference: TypeReference,
        depth: number,
        opts: ExampleGenerator.Options = {}
    ): ExampleTypeReference {
        if (this.exceedsMaxDepth(depth)) {
            return this.generateExampleUnknown({}, opts);
        }

        switch (typeReference.type) {
            case "container":
                return this.generateExampleContainer(typeReference.container, depth);
            case "named":
                return this.generateExampleNamed(typeReference, depth);
            case "primitive":
                return this.generateExamplePrimitive({ primitiveType: typeReference.primitive.v1 });
            case "unknown":
                return this.generateExampleUnknown({}, opts);
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
                return this.generateExampleTypeReferenceOptional(containerType.optional, depth + 1);
            case "set":
                return this.generateExampleTypeReferenceSet(containerType.set, depth + 1);
            case "literal":
                return this.generateExampleTypeReferenceLiteral(containerType.literal);
            default:
                assertNever(containerType);
        }
    }

    private generateExampleTypeReferenceOptional(typeReference: TypeReference, depth: number): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference, depth);
        return {
            jsonExample: exampleTypeReference.jsonExample,
            shape: ExampleTypeReferenceShape.container(
                ExampleContainer.optional({
                    optional: exampleTypeReference,
                    valueType: typeReference
                })
            )
        };
    }

    private generateExampleTypeReferenceList(typeReference: TypeReference, depth: number): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference, depth);
        return {
            jsonExample: [exampleTypeReference.jsonExample],
            shape: ExampleTypeReferenceShape.container(
                ExampleContainer.list({
                    list: [exampleTypeReference],
                    itemType: typeReference
                })
            )
        };
    }

    private generateExampleTypeReferenceMap(mapType: MapType, depth: number): ExampleTypeReference {
        const exampleTypeReferenceKey = this.generateExampleTypeReference(mapType.keyType, depth, {
            unknownAsPrimitive: true
        });
        const exampleTypeReferenceValue = this.generateExampleTypeReference(mapType.valueType, depth);
        const jsonExampleMapKey = this.jsonExampleToMapKey(exampleTypeReferenceKey.jsonExample);
        return {
            jsonExample: {
                [jsonExampleMapKey]: exampleTypeReferenceValue.jsonExample
            },
            shape: ExampleTypeReferenceShape.container(
                ExampleContainer.map({
                    map: [
                        {
                            key: exampleTypeReferenceKey,
                            value: exampleTypeReferenceValue
                        }
                    ],
                    keyType: mapType.keyType,
                    valueType: mapType.valueType
                })
            )
        };
    }

    private jsonExampleToMapKey(jsonExample: unknown): string | number {
        // NOTE: you will have to manage this within the generator to ensure this number key becomes
        // a number proper, JSON converts this to a string as it cannot have numeric keys.
        if (typeof jsonExample === "number") {
            return 1;
        }
        return "string";
    }

    private generateExampleTypeReferenceSet(typeReference: TypeReference, depth: number): ExampleTypeReference {
        const exampleTypeReference = this.generateExampleTypeReference(typeReference, depth);
        return {
            // NOTE: you will have to manage this within the generator to ensure this list becomes a set,
            // as you can't represent a set in JSON.
            jsonExample: [exampleTypeReference.jsonExample],
            shape: ExampleTypeReferenceShape.container(
                ExampleContainer.set({
                    set: [exampleTypeReference],
                    itemType: typeReference
                })
            )
        };
    }

    private generateExampleTypeReferenceLiteral(literal: Literal): ExampleTypeReference {
        switch (literal.type) {
            case "boolean":
                return {
                    jsonExample: literal.boolean,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.literal({ literal: ExamplePrimitive.boolean(literal.boolean) })
                    )
                };
            case "string":
                return {
                    jsonExample: literal.string,
                    shape: ExampleTypeReferenceShape.container(
                        ExampleContainer.literal({ literal: ExamplePrimitive.string({ original: literal.string }) })
                    )
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
        primitiveType: PrimitiveTypeV1;
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
            case "UINT": {
                const exUint = example != null && typeof example === "number" ? example : Examples.UINT;
                return {
                    jsonExample: exUint,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint(exUint))
                };
            }
            case "UINT_64": {
                const exUint = example != null && typeof example === "number" ? example : Examples.UINT64;
                return {
                    jsonExample: exUint,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.uint64(exUint))
                };
            }
            case "FLOAT": {
                const exFloat = example != null && typeof example === "number" ? example : Examples.FLOAT;
                return {
                    jsonExample: exFloat,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.float(exFloat))
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
            case "BIG_INTEGER": {
                const exBigInt = example != null && typeof example === "string" ? example : Examples.BIG_INTEGER;
                return {
                    jsonExample: exBigInt,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: exBigInt }))
                };
            }
        }
    }

    private generateExampleUnknown(
        {
            name
        }: {
            name?: string;
        } = {},
        opts: ExampleGenerator.Options = {}
    ): ExampleTypeReference {
        if (opts.unknownAsPrimitive) {
            const value = name ?? "string";
            return this.generateExamplePrimitive({ primitiveType: PrimitiveTypeV1.String, example: value });
        }
        const value = { key: "value" };
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
