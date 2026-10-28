import { assertDefined } from "@fern-api/core-utils";
import { Referencer, swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { LiteralEnumGenerator } from "../literal/index.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export declare namespace UndiscriminatedUnionGenerator {
    interface Args {
        symbol: swift.Symbol;
        typeDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class UndiscriminatedUnionGenerator {
    private readonly symbol: swift.Symbol;
    private readonly typeDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration;
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;
    private readonly referencer: Referencer;

    public constructor({ symbol, typeDeclaration, docsContent, context }: UndiscriminatedUnionGenerator.Args) {
        this.referencer = context.createReferencer(symbol);
        this.symbol = symbol;
        this.typeDeclaration = typeDeclaration;
        this.docsContent = docsContent;
        this.context = context;
    }

    private getAllVariants() {
        return this.context.project.nameRegistry.getAllUndiscriminatedUnionVariantsOrThrow(this.symbol);
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
            nestedTypes: this.generateNestedTypes(),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return this.getAllVariants().map((variant) => {
            return {
                unsafeName: variant.caseName,
                associatedValue: [variant.swiftType],
                docs: variant.docsContent ? swift.docComment({ summary: variant.docsContent }) : undefined
            };
        });
    }

    private generateInitializers(): swift.Initializer[] {
        return [this.generateInitializerForDecoder()];
    }

    private generateInitializerForDecoder() {
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
            body: swift.CodeBlock.withStatements([
                swift.Statement.constantDeclaration({
                    unsafeName: "container",
                    value: swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("decoder"),
                            methodName: "singleValueContainer"
                        })
                    )
                }),
                this.generateIfStatementForDecodingAttempts()
            ])
        });
    }

    private generateIfStatementForDecodingAttempts(): swift.Statement {
        // A forward-compatible enum decodes any string, so it first claims only the values it lists.
        // Other members get a chance at the rest, and the first such enum keeps any value left over.
        const variants = this.getAllVariants();
        const firstForwardCompatibleEnum = variants.find((variant) => this.isForwardCompatibleEnum(variant));
        const decodeAttempts = [
            ...variants.map((member) => ({ member, requireListedValue: this.isForwardCompatibleEnum(member) })),
            ...(firstForwardCompatibleEnum != null
                ? [{ member: firstForwardCompatibleEnum, requireListedValue: false }]
                : [])
        ];
        const memberDecodeAttempts = decodeAttempts.map(({ member, requireListedValue }) => {
            const decodeStatement = swift.Statement.constantDeclaration({
                unsafeName: "value",
                value: swift.Expression.optionalTry(
                    swift.Expression.methodCall({
                        target: swift.Expression.reference("container"),
                        methodName: "decode",
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.memberAccess({
                                    target: member.swiftType,
                                    memberName: "self"
                                })
                            })
                        ]
                    })
                ),
                noTrailingNewline: true
            });
            const selfAssignment = swift.Statement.selfAssignment(
                swift.Expression.contextualMethodCall({
                    methodName: member.caseName,
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.reference("value")
                        })
                    ]
                })
            );
            const additionalConditions = requireListedValue
                ? [
                      swift.Expression.methodCall({
                          target: swift.Expression.memberAccess({ target: member.swiftType, memberName: "allCases" }),
                          methodName: "contains",
                          arguments_: [swift.functionArgument({ value: swift.Expression.reference("value") })]
                      })
                  ]
                : undefined;
            return { decodeStatement, additionalConditions, selfAssignment };
        });
        const throwDecodingErrorStatement = swift.Statement.throw(
            swift.Expression.methodCall({
                target: swift.Expression.reference("DecodingError"),
                methodName: "dataCorruptedError",
                arguments_: [
                    swift.functionArgument({
                        label: "in",
                        value: swift.Expression.reference("container")
                    }),
                    swift.functionArgument({
                        label: "debugDescription",
                        value: swift.Expression.stringLiteral(`Unexpected value.`)
                    })
                ],
                multiline: true
            })
        );

        const [firstAttempt, ...remainingAttempts] = memberDecodeAttempts;

        assertDefined(firstAttempt, "Cannot generate undiscriminated union decoder body because there are no members.");

        return swift.Statement.if({
            condition: firstAttempt.decodeStatement,
            additionalConditions: firstAttempt.additionalConditions,
            body: [firstAttempt.selfAssignment],
            elseIfs: remainingAttempts.map((attempt) => ({
                condition: attempt.decodeStatement,
                additionalConditions: attempt.additionalConditions,
                body: [attempt.selfAssignment]
            })),
            else: [throwDecodingErrorStatement]
        });
    }

    private isForwardCompatibleEnum(variant: { swiftType: swift.TypeReference }): boolean {
        const symbol = this.referencer.resolveToSymbolIfSymbolType(variant.swiftType);
        return symbol != null && this.context.isForwardCompatibleEnum(symbol);
    }

    private generateMethods(): swift.Method[] {
        return [this.generateEncodeMethod()];
    }

    private generateEncodeMethod(): swift.Method {
        const distinctMembers = this.getAllVariants();
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
                        methodName: "singleValueContainer"
                    })
                }),
                swift.Statement.switch({
                    target: swift.Expression.rawValue("self"),
                    cases: distinctMembers.map((member) => {
                        return {
                            pattern: swift.Pattern.enumCaseValueBinding({
                                caseName: member.caseName,
                                referenceName: "value",
                                declarationType: swift.DeclarationType.Let
                            }),
                            body: [
                                swift.Statement.expressionStatement(
                                    swift.Expression.try(
                                        swift.Expression.methodCall({
                                            target: swift.Expression.reference("container"),
                                            methodName: "encode",
                                            arguments_: [
                                                swift.functionArgument({
                                                    value: swift.Expression.reference("value")
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

    private generateNestedTypes(): (swift.Struct | swift.EnumWithRawValues)[] {
        const nestedTypes: (swift.Struct | swift.EnumWithRawValues)[] = [];
        this.context.project.nameRegistry
            .getAllNestedLiteralEnumSymbolsOrThrow(this.symbol)
            .forEach(({ symbol, literalValue }) => {
                const literalEnumGenerator = new LiteralEnumGenerator({
                    name: symbol.name,
                    literalValue
                });
                nestedTypes.push(literalEnumGenerator.generate());
            });
        return nestedTypes;
    }
}
