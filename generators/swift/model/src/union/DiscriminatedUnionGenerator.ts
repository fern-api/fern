import { assertNever, noop } from "@fern-api/core-utils";
import { Referencer, sanitizeSelf, swift } from "@fern-api/swift-codegen";
import { UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { StructGenerator } from "../helpers/struct-generator/StructGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace DiscriminatedUnionGenerator {
    interface Args {
        symbol: swift.Symbol;
        unionTypeDeclaration: UnionTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class DiscriminatedUnionGenerator {
    private readonly symbol: swift.Symbol;
    private readonly unionTypeDeclaration: UnionTypeDeclaration;
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;
    private readonly referencer: Referencer;

    public constructor({ symbol, unionTypeDeclaration, docsContent, context }: DiscriminatedUnionGenerator.Args) {
        this.symbol = symbol;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.docsContent = docsContent;
        this.context = context;
        this.referencer = context.createReferencer(symbol);
    }

    public generate(): swift.EnumWithAssociatedValues {
        return this.generateEnumForTypeDeclaration();
    }

    private getAllVariants() {
        return this.context.project.nameRegistry.getAllDiscriminatedUnionVariantsOrThrow(this.symbol);
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.symbol.name,
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
        return this.getAllVariants().map((variant) => {
            return {
                unsafeName: variant.caseName,
                associatedValue: [swift.TypeReference.symbol(variant.symbolName)],
                docs: variant.docsContent ? swift.docComment({ summary: variant.docsContent }) : undefined
            };
        });
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
                                    this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName
                                )
                            })
                        ]
                    })
                )
            }),
            swift.Statement.switch({
                target: swift.Expression.reference("discriminant"),
                cases: this.getAllVariants().map((variant) => {
                    return {
                        pattern: swift.Expression.stringLiteral(variant.discriminantWireValue),
                        body: [
                            swift.Statement.selfAssignment(
                                swift.Expression.contextualMethodCall({
                                    methodName: variant.caseName,
                                    arguments_: [
                                        swift.functionArgument({
                                            value: swift.Expression.try(
                                                swift.Expression.structInitialization({
                                                    unsafeName: variant.symbolName,
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
                            )
                        ]
                    };
                }),
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
                swift.Statement.switch({
                    target: swift.Expression.rawValue("self"),
                    cases: this.getAllVariants().map((variant) => {
                        return {
                            pattern: swift.Pattern.enumCaseValueBinding({
                                caseName: variant.caseName,
                                referenceName: "data",
                                declarationType: swift.DeclarationType.Let
                            }),
                            body: [
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
                    })
                })
            ])
        });
    }

    private generateNestedTypesForTypeDeclaration(): (swift.Struct | swift.EnumWithRawValues)[] {
        const variantStructs = this.unionTypeDeclaration.types.map((singleUnionType) => {
            const constantPropertyDefinitions: StructGenerator.ConstantPropertyDefinition[] = [];
            const dataPropertyDefinitions: StructGenerator.DataPropertyDefinition[] = [];
            const variantSymbol = this.context.project.nameRegistry.getDiscriminatedUnionVariantSymbolOrThrow(
                this.symbol,
                singleUnionType.discriminantValue.wireValue
            );
            const referencer = this.context.createReferencer(variantSymbol);

            if (singleUnionType.shape.propertiesType === "singleProperty") {
                constantPropertyDefinitions.push({
                    unsafeName: sanitizeSelf(this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName),
                    rawName: this.unionTypeDeclaration.discriminant.wireValue,
                    type: referencer.referenceSwiftType("String"),
                    value: swift.Expression.stringLiteral(singleUnionType.discriminantValue.wireValue)
                });
                dataPropertyDefinitions.push({
                    unsafeName: sanitizeSelf(singleUnionType.shape.name.name.camelCase.unsafeName),
                    rawName: singleUnionType.shape.name.wireValue,
                    type: singleUnionType.shape.type
                });
            } else if (singleUnionType.shape.propertiesType === "samePropertiesAsObject") {
                const variantProperties = this.context.getPropertiesOfDiscriminatedUnionVariant(
                    singleUnionType.shape.typeId
                );
                constantPropertyDefinitions.push({
                    unsafeName: sanitizeSelf(this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName),
                    rawName: this.unionTypeDeclaration.discriminant.wireValue,
                    type: referencer.referenceSwiftType("String"),
                    value: swift.Expression.stringLiteral(singleUnionType.discriminantValue.wireValue)
                });
                dataPropertyDefinitions.push(
                    ...variantProperties.map((p) => ({
                        unsafeName: sanitizeSelf(p.name.name.camelCase.unsafeName),
                        rawName: p.name.wireValue,
                        type: p.valueType,
                        docsContent: p.docs
                    }))
                );
            } else if (singleUnionType.shape.propertiesType === "noProperties") {
                noop();
            } else {
                assertNever(singleUnionType.shape);
            }

            return new StructGenerator({
                symbol: variantSymbol,
                constantPropertyDefinitions,
                dataPropertyDefinitions,
                additionalProperties: true,
                docsContent: singleUnionType.docs,
                context: this.context
            }).generate();
        });

        return [...variantStructs, this.generateCodingKeysEnum()];
    }

    private generateCodingKeysEnum(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", swift.Protocol.CodingKey, swift.Protocol.CaseIterable],
            cases: [
                {
                    unsafeName: this.unionTypeDeclaration.discriminant.name.camelCase.unsafeName,
                    rawValue: this.unionTypeDeclaration.discriminant.wireValue
                }
            ]
        });
    }
}
