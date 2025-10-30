import { assertDefined } from "@fern-api/core-utils";
import { Referencer, swift } from "@fern-api/swift-codegen";
import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { LiteralEnumGenerator } from "../literal";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace UndiscriminatedUnionGenerator {
    interface Args {
        symbol: swift.Symbol;
        typeDeclaration: UndiscriminatedUnionTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class UndiscriminatedUnionGenerator {
    private readonly symbol: swift.Symbol;
    private readonly typeDeclaration: UndiscriminatedUnionTypeDeclaration;
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
        const distinctMembers = this.getAllVariants();
        const memberDecodeAttempts = distinctMembers.map((member) => {
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
            return { decodeStatement, selfAssignment };
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
            body: [firstAttempt.selfAssignment],
            elseIfs: remainingAttempts.map((attempt) => ({
                condition: attempt.decodeStatement,
                body: [attempt.selfAssignment]
            })),
            else: [throwDecodingErrorStatement]
        });
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
