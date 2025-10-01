import { swift } from "@fern-api/swift-codegen";
import { ExampleEndpointCall, ExampleTypeReference, HttpEndpoint, Package, Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace WireTestSuiteGenerator {
    interface Args {
        suiteName: string;
        subclientName: string;
        packageOrSubpackage: Package | Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class WireTestSuiteGenerator {
    private readonly suiteName: string;
    private readonly subclientName: string;
    private readonly packageOrSubpackage: Package | Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({
        suiteName,
        subclientName,
        packageOrSubpackage,
        sdkGeneratorContext
    }: WireTestSuiteGenerator.Args) {
        this.suiteName = suiteName;
        this.subclientName = subclientName;
        this.packageOrSubpackage = packageOrSubpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    private get service() {
        return this.packageOrSubpackage.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.packageOrSubpackage.service)
            : undefined;
    }

    public generate(): swift.Struct {
        return swift.struct({
            attributes: [
                {
                    name: "Suite",
                    arguments: [
                        swift.functionArgument({
                            value: swift.Expression.stringLiteral(`${this.subclientName} Wire Tests`)
                        })
                    ]
                }
            ],
            name: this.suiteName,
            properties: [],
            methods: this.generateTestFunctions()
        });
    }

    private generateTestFunctions(): swift.Method[] {
        return (this.service?.endpoints ?? []).flatMap((endpoint) => {
            const exampleEndpointCalls = this.getExampleEndpointCallsForTests(endpoint);
            return exampleEndpointCalls
                .map((exampleEndpointCall, exampleEndpointCallIndex) => {
                    if (exampleEndpointCall.response.type === "error") {
                        return null;
                    }
                    const exampleTypeRef = exampleEndpointCall.response.value._visit({
                        body: (exampleTypeRef) => exampleTypeRef,
                        stream: () => null,
                        sse: () => null,
                        _other: () => null
                    });
                    if (exampleTypeRef == null) {
                        return null;
                    }
                    const statements: swift.Statement[] = [
                        swift.Statement.constantDeclaration({
                            unsafeName: "stub",
                            value: swift.Expression.structInitialization({ unsafeName: "WireStub" })
                        }),
                        swift.Statement.expressionStatement(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("stub"),
                                methodName: "setResponse",
                                arguments_: [
                                    swift.functionArgument({
                                        label: "body",
                                        value: swift.Expression.structInitialization({
                                            unsafeName: "Data",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.stringLiteral(
                                                        `""\n${JSON.stringify(exampleTypeRef.jsonExample, null, 2)}\n""`
                                                    )
                                                })
                                            ],
                                            multiline: true
                                        })
                                    })
                                ],
                                multiline: true
                            })
                        ),
                        this.generateClientDeclaration(),
                        swift.Statement.constantDeclaration({
                            unsafeName: "expectedResponse",
                            value: this.generateExampleResponse(exampleTypeRef)
                        }),
                        swift.Statement.constantDeclaration({
                            unsafeName: "response",
                            // TODO(kafkas): Implement this
                            value: swift.Expression.stringLiteral("abc")
                        }),
                        swift.Statement.expressionStatement(
                            swift.Expression.try(
                                swift.Expression.functionCall({
                                    unsafeName: "#require",
                                    arguments_: [
                                        swift.functionArgument({
                                            value: swift.Expression.equals(
                                                swift.Expression.reference("response"),
                                                swift.Expression.reference("expectedResponse")
                                            )
                                        })
                                    ]
                                })
                            )
                        )
                    ];
                    return swift.method({
                        attributes: [{ name: "Test" }],
                        unsafeName: `${endpoint.name.camelCase.unsafeName}${exampleEndpointCallIndex + 1}`,
                        async: true,
                        throws: true,
                        returnType: swift.Type.void(),
                        body: swift.CodeBlock.withStatements(statements)
                    });
                })
                .filter((method) => method != null);
        });
    }

    private getExampleEndpointCallsForTests(endpoint: HttpEndpoint): ExampleEndpointCall[] {
        const examples: ExampleEndpointCall[] = [];
        // If any of the examples are user provided, we should only include those.
        const hasUserExamples = endpoint.userSpecifiedExamples.length > 0;
        const userExamplesHasErrorExample = endpoint.userSpecifiedExamples.some(
            (e) => e.example?.response.type === "error"
        );
        if (hasUserExamples) {
            examples.push(...endpoint.userSpecifiedExamples.map((e) => e.example).filter((e) => e != null));
            // if no user examples, add auto generated error examples
            if (!userExamplesHasErrorExample) {
                examples.push(
                    ...endpoint.autogeneratedExamples
                        .map((e) => e.example)
                        .filter((e) => e != null)
                        .filter((e) => e.response.type === "error")
                );
            }

            return examples;
        }

        // Otherwise we should only include a single one of the generated examples.
        examples.push(...endpoint.autogeneratedExamples.map((e) => e.example).filter((e) => e != null));
        return examples;
    }

    private generateClientDeclaration(): swift.Statement {
        const symbolName = this.sdkGeneratorContext.project.srcSymbolRegistry.getRootClientSymbolOrThrow();
        return swift.Statement.constantDeclaration({
            unsafeName: "client",
            value: swift.Expression.structInitialization({
                unsafeName: symbolName,
                arguments_: [] // TODO(kafkas): Implement this
            })
        });
    }

    private generateExampleResponse(exampleTypeRef: ExampleTypeReference): swift.Expression {
        return exampleTypeRef.shape._visit({
            container: (exampleContainer) =>
                exampleContainer._visit({
                    literal: () => swift.Expression.stringLiteral("abc"), // TODO(kafkas): Implement this
                    map: (mapContainer) => {
                        return swift.Expression.dictionaryLiteral({
                            entries: mapContainer.map.map((kvPair) => [
                                this.generateExampleResponse(kvPair.key),
                                this.generateExampleResponse(kvPair.value)
                            ]),
                            multiline: true
                        });
                    },
                    set: () => swift.Expression.arrayLiteral({}), // TODO(kafkas): Set is not supported yet
                    nullable: (nullableContainer) => {
                        if (nullableContainer.nullable == null) {
                            return swift.Expression.enumCaseShorthand("null");
                        }
                        return this.generateExampleResponse(nullableContainer.nullable);
                    },
                    optional: (optionalContainer) => {
                        return optionalContainer.optional == null
                            ? swift.Expression.nop()
                            : this.generateExampleResponse(optionalContainer.optional);
                    },
                    list: (listContainer) => {
                        return swift.Expression.arrayLiteral({
                            elements: listContainer.list.map((element) => this.generateExampleResponse(element)),
                            multiline: true
                        });
                    },
                    _other: () => swift.Expression.nop()
                }),
            primitive: (examplePrimitive) =>
                examplePrimitive._visit({
                    string: (escapedString) => swift.Expression.stringLiteral(escapedString.original),
                    boolean: (bool) => swift.Expression.boolLiteral(bool),
                    integer: (value) => swift.Expression.numberLiteral(value),
                    uint: (value) => swift.Expression.numberLiteral(value),
                    uint64: (value) => swift.Expression.numberLiteral(value),
                    long: (value) => swift.Expression.numberLiteral(value),
                    float: (value) => swift.Expression.numberLiteral(value),
                    double: (value) => swift.Expression.numberLiteral(value),
                    // TODO(kafkas): Bigints are not supported yet
                    bigInteger: (value) => swift.Expression.stringLiteral(value),
                    date: (value) => swift.Expression.calendarDateLiteral(value),
                    datetime: (value) => {
                        if (value.raw == null) {
                            return swift.Expression.nop();
                        }
                        const timestampMs = new Date(value.raw).getTime();
                        const timestampSec = Math.round(timestampMs / 1000);
                        const roundedDateTime = new Date(timestampSec * 1000).toISOString();
                        // Remove fractional seconds (.000Z -> Z) for Swift compatibility
                        const dateTimeWithoutFractional = roundedDateTime.replace(/\.\d{3}Z$/, "Z");
                        return swift.Expression.dateLiteral(dateTimeWithoutFractional);
                    },
                    base64: (value) => swift.Expression.stringLiteral(value),
                    uuid: (value) => swift.Expression.uuidLiteral(value),
                    _other: () => swift.Expression.nop()
                }),
            named: (exampleNamedType) => {
                const { typeId } = exampleNamedType.typeName;
                const symbolName =
                    this.sdkGeneratorContext.project.srcSymbolRegistry.getSchemaTypeSymbolOrThrow(typeId);
                return exampleNamedType.shape._visit({
                    alias: (exampleAliasType) => {
                        return this.generateExampleResponse(exampleAliasType.value);
                    },
                    enum: (exampleEnumType) => {
                        return swift.Expression.enumCaseShorthand(exampleEnumType.value.name.camelCase.unsafeName);
                    },
                    object: (exampleObjectType) => {
                        return swift.Expression.structInitialization({
                            unsafeName: symbolName,
                            arguments_: exampleObjectType.properties.map((property) =>
                                swift.functionArgument({
                                    label: property.name.name.camelCase.unsafeName,
                                    value: this.generateExampleResponse(property.value)
                                })
                            ),
                            multiline: true
                        });
                    },
                    union: (exampleUnionType) => {
                        return exampleUnionType.singleUnionType.shape._visit({
                            noProperties: () =>
                                swift.Expression.contextualMethodCall({
                                    methodName:
                                        exampleUnionType.singleUnionType.wireDiscriminantValue.name.camelCase
                                            .unsafeName,
                                    arguments_: []
                                }),
                            samePropertiesAsObject: (exampleObjectTypeWithId) =>
                                swift.Expression.contextualMethodCall({
                                    methodName:
                                        exampleUnionType.singleUnionType.wireDiscriminantValue.name.camelCase
                                            .unsafeName,
                                    arguments_: exampleObjectTypeWithId.object.properties.map((property) =>
                                        swift.functionArgument({
                                            label: property.name.name.camelCase.unsafeName,
                                            value: this.generateExampleResponse(property.value)
                                        })
                                    ),
                                    multiline: true
                                }),
                            singleProperty: (exampleTypeRef) => this.generateExampleResponse(exampleTypeRef),
                            _other: () =>
                                swift.Expression.contextualMethodCall({
                                    methodName:
                                        exampleUnionType.singleUnionType.wireDiscriminantValue.name.camelCase
                                            .unsafeName,
                                    arguments_: []
                                })
                        });
                    },
                    undiscriminatedUnion: () => swift.Expression.stringLiteral("abc"), // TODO(kafkas): Implement this
                    _other: () => swift.Expression.nop()
                });
            },
            unknown: () => swift.Expression.nop(),
            _other: () => swift.Expression.nop()
        });
    }
}
