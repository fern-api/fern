import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { EnumWithAssociatedValues, Referencer, sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { LiteralEnumGenerator } from "../literal/index.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export declare namespace DiscriminatedUnionGenerator {
    interface Args {
        symbol: swift.Symbol;
        unionTypeDeclaration: FernIr.UnionTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

type ResolvedVariant = {
    caseName: string;
    discriminantWireValue: string;
    docsContent: string | undefined;
    shape: FernIr.SingleUnionTypeProperties;
};

export class DiscriminatedUnionGenerator {
    private readonly symbol: swift.Symbol;
    private readonly unionTypeDeclaration: FernIr.UnionTypeDeclaration;
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;
    private readonly referencer: Referencer;
    private readonly resolvedVariants: ResolvedVariant[];

    public constructor({ symbol, unionTypeDeclaration, docsContent, context }: DiscriminatedUnionGenerator.Args) {
        this.symbol = symbol;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.docsContent = docsContent;
        this.context = context;
        this.referencer = context.createReferencer(symbol);

        this.resolvedVariants = unionTypeDeclaration.types
            .map((singleUnionType) => ({
                caseName: EnumWithAssociatedValues.sanitizeToCamelCase(
                    this.context.caseConverter.camelUnsafe(singleUnionType.discriminantValue)
                ),
                discriminantWireValue: getWireValue(singleUnionType.discriminantValue),
                docsContent: singleUnionType.docs,
                shape: singleUnionType.shape
            }))
            .sort((a, b) => a.caseName.localeCompare(b.caseName));
    }

    public generate(): swift.EnumWithAssociatedValues {
        return this.generateEnumForTypeDeclaration();
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.symbol.name,
            indirect: this.context.shouldGenerateEnumAsIndirect(this.symbol),
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            cases: this.generateCasesForTypeDeclaration(),
            initializers: this.generateInitializers(),
            methods: this.generateMethods(),
            nestedTypes: this.generateNestedTypesForTypeDeclaration(),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return this.resolvedVariants.map((variant) => {
            const typeRef = this.getAssociatedValueType(variant);
            return {
                unsafeName: variant.caseName,
                associatedValue: typeRef != null ? [typeRef] : undefined,
                docs: variant.docsContent ? swift.docComment({ summary: variant.docsContent }) : undefined
            };
        });
    }

    private hasAssociatedValue(variant: ResolvedVariant): boolean {
        switch (variant.shape.propertiesType) {
            case "noProperties":
                return false;
            case "singleProperty":
                return getWireValue(this.unionTypeDeclaration.discriminant) !== getWireValue(variant.shape.name);
            case "samePropertiesAsObject":
                return true;
            default:
                assertNever(variant.shape);
        }
    }

    private getAssociatedValueType(variant: ResolvedVariant): swift.TypeReference | undefined {
        if (!this.hasAssociatedValue(variant)) {
            return undefined;
        }
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject": {
                const toSymbol = this.context.project.nameRegistry.getSchemaTypeSymbolOrThrow(variant.shape.typeId);
                const symbolRef = this.context.project.nameRegistry.reference({
                    fromSymbol: this.symbol,
                    toSymbol
                });
                return swift.TypeReference.symbol(symbolRef);
            }
            case "singleProperty":
                return this.context.getSwiftTypeReferenceFromScope(variant.shape.type, this.symbol);
            case "noProperties":
                return undefined;
            default:
                assertNever(variant.shape);
        }
    }

    private generateInitializers(): swift.Initializer[] {
        return [this.generateInitializerForDecoder()];
    }

    private generateInitializerForDecoder() {
        const bodyStatements: swift.Statement[] = [
            swift.Statement.constantDeclaration({
                unsafeName: "container",
                value: swift.Expression.try(
                    swift.Expression.methodCall({
                        target: swift.Expression.reference("decoder"),
                        methodName: "container",
                        arguments_: [
                            swift.functionArgument({
                                label: "keyedBy",
                                value: swift.Expression.rawValue("CodingKeys.self")
                            })
                        ]
                    })
                )
            }),
            swift.Statement.constantDeclaration({
                unsafeName: "discriminant",
                value: swift.Expression.try(
                    swift.Expression.methodCall({
                        target: swift.Expression.reference("container"),
                        methodName: "decode",
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.memberAccess({
                                    target: this.referencer.referenceSwiftType("String"),
                                    memberName: "self"
                                })
                            }),
                            swift.functionArgument({
                                label: "forKey",
                                value: swift.Expression.enumCaseShorthand(
                                    this.context.caseConverter.camelUnsafe(this.unionTypeDeclaration.discriminant)
                                )
                            })
                        ]
                    })
                )
            }),
            swift.Statement.switch({
                target: swift.Expression.reference("discriminant"),
                cases: this.resolvedVariants.map((variant) => ({
                    pattern: swift.Expression.stringLiteral(variant.discriminantWireValue),
                    body: [this.generateDecodingForVariant(variant)]
                })),
                defaultCase: [
                    swift.Statement.throw(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("DecodingError"),
                            methodName: "dataCorrupted",
                            arguments_: [
                                swift.functionArgument({
                                    value: swift.Expression.methodCall({
                                        target: swift.Expression.reference("DecodingError"),
                                        methodName: "Context",
                                        arguments_: [
                                            swift.functionArgument({
                                                label: "codingPath",
                                                value: swift.Expression.memberAccess({
                                                    target: swift.Expression.reference("decoder"),
                                                    memberName: "codingPath"
                                                })
                                            }),
                                            swift.functionArgument({
                                                label: "debugDescription",
                                                value: swift.Expression.stringLiteral(
                                                    `Unknown shape discriminant value: \\(discriminant)`
                                                )
                                            })
                                        ],
                                        multiline: true
                                    })
                                })
                            ],
                            multiline: true
                        })
                    )
                ]
            })
        ];
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            throws: true,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "from",
                    unsafeName: "decoder",
                    type: this.referencer.referenceSwiftType("Decoder")
                })
            ],
            body: swift.CodeBlock.withStatements(bodyStatements)
        });
    }

    private generateDecodingForVariant(variant: ResolvedVariant): swift.Statement {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject": {
                const typeRef = this.getAssociatedValueType(variant);
                if (typeRef == null) {
                    return this.generateNoPropertiesDecoding(variant);
                }
                return swift.Statement.selfAssignment(
                    swift.Expression.contextualMethodCall({
                        methodName: variant.caseName,
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.try(
                                    swift.Expression.structInitialization({
                                        unsafeName: typeRef.toString(),
                                        arguments_: [
                                            swift.functionArgument({
                                                label: "from",
                                                value: swift.Expression.reference("decoder")
                                            })
                                        ]
                                    })
                                )
                            })
                        ]
                    })
                );
            }
            case "singleProperty": {
                if (!this.hasAssociatedValue(variant)) {
                    return this.generateNoPropertiesDecoding(variant);
                }
                const typeRef = this.getAssociatedValueType(variant);
                if (typeRef == null) {
                    return this.generateNoPropertiesDecoding(variant);
                }
                const propertyKey = sanitizeSelf(this.context.caseConverter.camelUnsafe(variant.shape.name));
                return swift.Statement.selfAssignment(
                    swift.Expression.contextualMethodCall({
                        methodName: variant.caseName,
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.try(
                                    swift.Expression.methodCall({
                                        target: swift.Expression.reference("container"),
                                        methodName: "decode",
                                        arguments_: [
                                            swift.functionArgument({
                                                value: swift.Expression.memberAccess({
                                                    target: typeRef,
                                                    memberName: "self"
                                                })
                                            }),
                                            swift.functionArgument({
                                                label: "forKey",
                                                value: swift.Expression.enumCaseShorthand(propertyKey)
                                            })
                                        ]
                                    })
                                )
                            })
                        ]
                    })
                );
            }
            case "noProperties":
                return this.generateNoPropertiesDecoding(variant);
            default:
                assertNever(variant.shape);
        }
    }

    private generateNoPropertiesDecoding(variant: ResolvedVariant): swift.Statement {
        return swift.Statement.selfAssignment(swift.Expression.enumCaseShorthand(variant.caseName));
    }

    private generateMethods(): swift.Method[] {
        return [this.generateEncodeMethod()];
    }

    private generateEncodeMethod(): swift.Method {
        return swift.method({
            unsafeName: "encode",
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "to",
                    unsafeName: "encoder",
                    type: this.referencer.referenceSwiftType("Encoder")
                })
            ],
            throws: true,
            returnType: this.referencer.referenceSwiftType("Void"),
            body: swift.CodeBlock.withStatements([
                swift.Statement.variableDeclaration({
                    unsafeName: "container",
                    value: swift.Expression.methodCall({
                        target: swift.Expression.reference("encoder"),
                        methodName: "container",
                        arguments_: [
                            swift.functionArgument({
                                label: "keyedBy",
                                value: swift.Expression.rawValue("CodingKeys.self")
                            })
                        ]
                    })
                }),
                swift.Statement.switch({
                    target: swift.Expression.rawValue("self"),
                    cases: this.resolvedVariants.map((variant) => this.generateEncodingForVariant(variant))
                })
            ])
        });
    }

    private generateEncodingForVariant(variant: ResolvedVariant): {
        pattern: swift.Expression | swift.Pattern;
        body: swift.Statement[];
    } {
        const discriminantEncode = swift.Statement.expressionStatement(
            swift.Expression.try(
                swift.Expression.methodCall({
                    target: swift.Expression.reference("container"),
                    methodName: "encode",
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.stringLiteral(variant.discriminantWireValue)
                        }),
                        swift.functionArgument({
                            label: "forKey",
                            value: swift.Expression.enumCaseShorthand(
                                this.context.caseConverter.camelUnsafe(this.unionTypeDeclaration.discriminant)
                            )
                        })
                    ]
                })
            )
        );

        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return {
                    pattern: swift.Pattern.enumCaseValueBinding({
                        caseName: variant.caseName,
                        referenceName: "data",
                        declarationType: swift.DeclarationType.Let
                    }),
                    body: [
                        discriminantEncode,
                        swift.Statement.expressionStatement(
                            swift.Expression.try(
                                swift.Expression.methodCall({
                                    target: swift.Expression.reference("data"),
                                    methodName: "encode",
                                    arguments_: [
                                        swift.functionArgument({
                                            label: "to",
                                            value: swift.Expression.reference("encoder")
                                        })
                                    ]
                                })
                            )
                        )
                    ]
                };
            case "singleProperty": {
                if (!this.hasAssociatedValue(variant)) {
                    return {
                        pattern: swift.Expression.enumCaseShorthand(variant.caseName),
                        body: [discriminantEncode]
                    };
                }
                const propertyKey = sanitizeSelf(this.context.caseConverter.camelUnsafe(variant.shape.name));
                return {
                    pattern: swift.Pattern.enumCaseValueBinding({
                        caseName: variant.caseName,
                        referenceName: "data",
                        declarationType: swift.DeclarationType.Let
                    }),
                    body: [
                        discriminantEncode,
                        swift.Statement.expressionStatement(
                            swift.Expression.try(
                                swift.Expression.methodCall({
                                    target: swift.Expression.reference("container"),
                                    methodName: "encode",
                                    arguments_: [
                                        swift.functionArgument({
                                            value: swift.Expression.reference("data")
                                        }),
                                        swift.functionArgument({
                                            label: "forKey",
                                            value: swift.Expression.enumCaseShorthand(propertyKey)
                                        })
                                    ]
                                })
                            )
                        )
                    ]
                };
            }
            case "noProperties":
                return {
                    pattern: swift.Expression.enumCaseShorthand(variant.caseName),
                    body: [discriminantEncode]
                };
            default:
                assertNever(variant.shape);
        }
    }

    private generateNestedTypesForTypeDeclaration(): (swift.Struct | swift.EnumWithRawValues)[] {
        const nestedTypes: (swift.Struct | swift.EnumWithRawValues)[] = [];
        this.context.project.nameRegistry
            .getAllNestedLiteralEnumSymbolsOrThrow(this.symbol)
            .forEach(({ symbol, literalValue }) => {
                nestedTypes.push(
                    new LiteralEnumGenerator({
                        name: symbol.name,
                        literalValue
                    }).generate()
                );
            });
        nestedTypes.push(this.generateCodingKeysEnum());
        return nestedTypes;
    }

    private generateCodingKeysEnum(): swift.EnumWithRawValues {
        const cases: { unsafeName: string; rawValue: string }[] = [
            {
                unsafeName: this.context.caseConverter.camelUnsafe(this.unionTypeDeclaration.discriminant),
                rawValue: getWireValue(this.unionTypeDeclaration.discriminant)
            }
        ];

        const seenRawValues = new Set<string>([getWireValue(this.unionTypeDeclaration.discriminant)]);
        for (const variant of this.resolvedVariants) {
            if (variant.shape.propertiesType === "singleProperty") {
                const rawValue = getWireValue(variant.shape.name);
                if (!seenRawValues.has(rawValue)) {
                    seenRawValues.add(rawValue);
                    cases.push({
                        unsafeName: sanitizeSelf(this.context.caseConverter.camelUnsafe(variant.shape.name)),
                        rawValue
                    });
                }
            }
        }

        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", swift.Protocol.CodingKey, swift.Protocol.CaseIterable],
            cases
        });
    }
}
