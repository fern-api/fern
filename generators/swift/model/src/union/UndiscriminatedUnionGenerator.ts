import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class UndiscriminatedUnionGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly typeDeclaration: UndiscriminatedUnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        name: string,
        directory: RelativeFilePath,
        typeDeclaration: UndiscriminatedUnionTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.name = name;
        this.directory = directory;
        this.typeDeclaration = typeDeclaration;
        this.context = context;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
            fileContents: [swiftEnum]
        });
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            cases: this.generateCasesForTypeDeclaration(),
            initializers: this.generateInitializers(),
            methods: this.generateMethods(),
            nestedTypes: this.generateNestedTypesForTypeDeclaration()
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return this.typeDeclaration.members.map((member) => {
            const swiftType = getSwiftTypeForTypeReference(member.type);
            return {
                unsafeName: swiftType.toCaseName(),
                associatedValue: [swiftType]
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
                    type: swift.Type.custom("Decoder")
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
        const memberDecodeAttempts = this.typeDeclaration.members.map((member) => {
            const swiftType = getSwiftTypeForTypeReference(member.type);
            const decodeStatement = swift.Statement.constantDeclaration({
                unsafeName: "value",
                value: swift.Expression.optionalTry(
                    swift.Expression.methodCall({
                        target: swift.Expression.reference("container"),
                        methodName: "decode",
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.memberAccess({
                                    target: swiftType,
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
                    methodName: swiftType.toCaseName(),
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.reference("value")
                        })
                    ]
                })
            );
            return { swiftType, decodeStatement, selfAssignment };
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
                        value: swift.Expression.rawStringValue(`Unexpected value.`)
                    })
                ],
                multiline: true
            })
        );

        const [firstAttempt, ...remainingAttempts] = memberDecodeAttempts;

        if (firstAttempt) {
            return swift.Statement.if({
                condition: firstAttempt.decodeStatement,
                body: [firstAttempt.selfAssignment],
                elseIfs: remainingAttempts.map((attempt) => ({
                    condition: attempt.decodeStatement,
                    body: [attempt.selfAssignment]
                })),
                else: [throwDecodingErrorStatement]
            });
        } else {
            throw new Error("Cannot generate undiscriminated union decoder body because there are no members.");
        }
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
                    type: swift.Type.custom("Encoder")
                })
            ],
            throws: true,
            returnType: swift.Type.void(),
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
                    cases: this.typeDeclaration.members.map((member) => {
                        const swiftType = getSwiftTypeForTypeReference(member.type);
                        return {
                            pattern: swift.Pattern.enumCaseValueBinding({
                                caseName: swiftType.toCaseName(),
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

    private generateNestedTypesForTypeDeclaration(): (swift.Struct | swift.EnumWithRawValues)[] {
        return [];
    }
}
