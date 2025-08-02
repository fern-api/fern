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
            parameters: [],
            body: swift.CodeBlock.withStatements([])
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
