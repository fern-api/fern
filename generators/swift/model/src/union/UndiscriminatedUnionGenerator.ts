import { assertDefined } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { uniqWith } from "lodash-es";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace UndiscriminatedUnionGenerator {
    interface Args {
        name: string;
        symbolId: string;
        typeDeclaration: UndiscriminatedUnionTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class UndiscriminatedUnionGenerator {
    private readonly name: string;
    private readonly symbolId: string;
    private readonly typeDeclaration: UndiscriminatedUnionTypeDeclaration;
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, symbolId, typeDeclaration, docsContent, context }: UndiscriminatedUnionGenerator.Args) {
        this.name = name;
        this.symbolId = symbolId;
        this.typeDeclaration = typeDeclaration;
        this.docsContent = docsContent;
        this.context = context;
    }

    public generate(): swift.EnumWithAssociatedValues {
        return this.generateEnumForTypeDeclaration();
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            cases: this.generateCasesForTypeDeclaration(),
            initializers: this.generateInitializers(),
            methods: this.generateMethods(),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return this.getDistinctMembers().map((member) => {
            return {
                unsafeName: this.inferCaseNameForTypeReference(member.swiftType),
                associatedValue: [member.swiftType],
                docs: member.docsContent ? swift.docComment({ summary: member.docsContent }) : undefined
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
                    type: swift.TypeReference.type(swift.Type.custom("Decoder"))
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
        const distinctMembers = this.getDistinctMembers();
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
                    methodName: this.inferCaseNameForTypeReference(member.swiftType),
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
                        // TODO(kafkas): Add more descriptive error message. We can perhaps try to decode as JSONValue and add the result to the error message.
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
        const distinctMembers = this.getDistinctMembers();
        return swift.method({
            unsafeName: "encode",
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "to",
                    unsafeName: "encoder",
                    type: swift.TypeReference.type(swift.Type.custom("Encoder"))
                })
            ],
            throws: true,
            returnType: swift.TypeReference.type(swift.Type.void()),
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
                                caseName: this.inferCaseNameForTypeReference(member.swiftType),
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

    private getDistinctMembers(): { swiftType: swift.TypeReference; docsContent?: string }[] {
        const members = this.typeDeclaration.members.map((member) => ({
            docsContent: member.docs,
            swiftType: this.context.getSwiftTypeReferenceFromScope(member.type, this.symbolId)
        }));
        return uniqWith(members, (a, b) => a.swiftType.equals(b.swiftType));
    }

    private inferCaseNameForTypeReference(typeReference: swift.TypeReference): string {
        // TODO(kafkas): Implement this
        throw new Error("Not implemented");
    }
}
