import { Referencer } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { TypeReference } from "@fern-fern/ir-sdk/api";
import { LiteralEnumGenerator } from "../../literal";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { AdditionalPropertiesMetadata, computeAdditionalPropertiesMetadata } from "./additional-properties";

export declare namespace StructGenerator {
    interface ConstantPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: swift.TypeReference | TypeReference;
        value: swift.Expression;
        docsContent?: string;
    }

    interface DataPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: TypeReference;
        docsContent?: string;
    }

    interface Args {
        symbol: swift.Symbol;
        constantPropertyDefinitions: ConstantPropertyDefinition[];
        dataPropertyDefinitions: DataPropertyDefinition[];
        additionalProperties: boolean;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class StructGenerator {
    private readonly symbol: swift.Symbol;
    private readonly constantPropertyDefinitions: StructGenerator.ConstantPropertyDefinition[];
    private readonly dataPropertyDefinitions: StructGenerator.DataPropertyDefinition[];
    private readonly docsContent?: string;
    private readonly generatorContext: ModelGeneratorContext;
    private readonly referencer: Referencer;
    private readonly additionalPropertiesMetadata: AdditionalPropertiesMetadata | null;

    public constructor(args: StructGenerator.Args) {
        const { symbol, constantPropertyDefinitions, dataPropertyDefinitions, docsContent, context } = args;
        this.symbol = symbol;
        this.constantPropertyDefinitions = constantPropertyDefinitions;
        this.dataPropertyDefinitions = dataPropertyDefinitions;
        this.docsContent = docsContent;
        this.generatorContext = context;
        this.referencer = context.createReferencer(symbol);
        this.additionalPropertiesMetadata = computeAdditionalPropertiesMetadata(args, this.referencer);
    }

    public generate(): swift.Struct {
        const constantProperties = this.generateConstantProperties();
        const dataProperties = this.generateDataProperties();
        const properties = [...constantProperties, ...dataProperties];
        if (this.additionalPropertiesMetadata) {
            properties.push(
                swift.property({
                    unsafeName: this.additionalPropertiesMetadata.propertyName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: this.additionalPropertiesMetadata.swiftType,
                    docs: swift.docComment({
                        summary: "Additional properties that are not explicitly defined in the schema"
                    })
                })
            );
        }
        return swift.struct({
            name: this.symbol.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            properties,
            initializers: this.generateInitializers(dataProperties),
            methods: this.generateMethods(constantProperties, dataProperties),
            nestedTypes: this.generateNestedTypes(constantProperties, dataProperties),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }

    private generateConstantProperties(): swift.Property[] {
        return this.constantPropertyDefinitions.map((p) =>
            swift.property({
                unsafeName: p.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: this.getSwiftTypeReferenceForProperty(p),
                defaultValue: p.value,
                docs: p.docsContent ? swift.docComment({ summary: p.docsContent }) : undefined
            })
        );
    }

    private generateDataProperties(): swift.Property[] {
        return this.dataPropertyDefinitions.map((p) =>
            swift.property({
                unsafeName: p.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: this.getSwiftTypeReferenceForProperty(p),
                docs: p.docsContent ? swift.docComment({ summary: p.docsContent }) : undefined
            })
        );
    }

    private getSwiftTypeReferenceForProperty(
        definition: StructGenerator.ConstantPropertyDefinition | StructGenerator.DataPropertyDefinition
    ) {
        if (definition.type instanceof swift.TypeReference) {
            return definition.type;
        }
        return this.generatorContext.getSwiftTypeReferenceFromScope(definition.type, this.symbol);
    }

    private generateInitializers(dataProperties: swift.Property[]): swift.Initializer[] {
        const initializers = [this.generatePrimaryInitializer(dataProperties)];
        if (this.additionalPropertiesMetadata) {
            initializers.push(this.generateInitializerForDecoder(dataProperties));
        }
        return initializers;
    }

    private generatePrimaryInitializer(dataProperties: swift.Property[]) {
        const parameters = dataProperties.map((p) => {
            return swift.functionParameter({
                argumentLabel: p.unsafeName,
                unsafeName: p.unsafeName,
                type: p.type,
                defaultValue: p.type.isOptional ? swift.Expression.rawValue("nil") : undefined
            });
        });
        if (this.additionalPropertiesMetadata) {
            parameters.push(
                swift.functionParameter({
                    argumentLabel: this.additionalPropertiesMetadata.propertyName,
                    unsafeName: this.additionalPropertiesMetadata.propertyName,
                    type: this.additionalPropertiesMetadata.swiftType,
                    defaultValue: swift.Expression.contextualMethodCall({ methodName: "init" })
                })
            );
        }
        const bodyStatements = dataProperties.map((p) =>
            swift.Statement.propertyAssignment(p.unsafeName, swift.Expression.reference(p.unsafeName))
        );
        if (this.additionalPropertiesMetadata) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesMetadata.propertyName,
                    swift.Expression.reference(this.additionalPropertiesMetadata.propertyName)
                )
            );
        }
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters,
            body: swift.CodeBlock.withStatements(bodyStatements),
            multiline: true
        });
    }

    private generateInitializerForDecoder(dataProperties: swift.Property[]) {
        const bodyStatements: swift.Statement[] = [];

        if (dataProperties.length > 0) {
            bodyStatements.push(
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
                })
            );
            dataProperties.forEach((p) => {
                bodyStatements.push(
                    swift.Statement.propertyAssignment(
                        p.unsafeName,
                        swift.Expression.try(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("container"),
                                methodName: p.type.isOptional
                                    ? p.type.isOptionalNullable
                                        ? "decodeNullableIfPresent"
                                        : "decodeIfPresent"
                                    : "decode",
                                arguments_: [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess({
                                            target: p.type.isOptionalNullable
                                                ? p.type.nonOptional().nonNullable()
                                                : p.type.nonOptional(),
                                            memberName: "self"
                                        })
                                    }),
                                    swift.functionArgument({
                                        label: "forKey",
                                        value: swift.Expression.enumCaseShorthand(p.unsafeName)
                                    })
                                ]
                            })
                        )
                    )
                );
            });
        }

        if (this.additionalPropertiesMetadata) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesMetadata.propertyName,
                    swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("decoder"),
                            methodName: "decodeAdditionalProperties",
                            arguments_: [
                                dataProperties.length === 0
                                    ? swift.functionArgument({
                                          label: "knownKeys",
                                          value: swift.Expression.rawValue("[]")
                                      })
                                    : swift.functionArgument({
                                          label: "using",
                                          value: swift.Expression.rawValue("CodingKeys.self")
                                      })
                            ]
                        })
                    )
                )
            );
        }

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

    private generateMethods(constantProperties: swift.Property[], dataProperties: swift.Property[]) {
        const methods: swift.Method[] = [];
        if (this.additionalPropertiesMetadata) {
            methods.push(this.generateEncodeMethod(constantProperties, dataProperties));
        }
        return methods;
    }

    private generateEncodeMethod(constantProperties: swift.Property[], dataProperties: swift.Property[]) {
        const bodyStatements: swift.Statement[] = [];

        if (constantProperties.length > 0 || dataProperties.length > 0) {
            bodyStatements.push(
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
                })
            );
        }

        if (this.additionalPropertiesMetadata) {
            bodyStatements.push(
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("encoder"),
                            methodName: "encodeAdditionalProperties",
                            arguments_: [
                                swift.functionArgument({
                                    value: swift.Expression.memberAccess({
                                        target: swift.Expression.rawValue("self"),
                                        memberName: this.additionalPropertiesMetadata.propertyName
                                    })
                                })
                            ]
                        })
                    )
                )
            );
        }

        [...constantProperties, ...dataProperties].forEach((p) => {
            bodyStatements.push(
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.methodCall({
                            target: swift.Expression.reference("container"),
                            methodName: p.type.isOptional
                                ? p.type.isOptionalNullable
                                    ? "encodeNullableIfPresent"
                                    : "encodeIfPresent"
                                : "encode",
                            arguments_: [
                                swift.functionArgument({
                                    value: swift.Expression.memberAccess({
                                        target: swift.Expression.rawValue("self"),
                                        memberName: p.unsafeName
                                    })
                                }),
                                swift.functionArgument({
                                    label: "forKey",
                                    value: swift.Expression.enumCaseShorthand(p.unsafeName)
                                })
                            ]
                        })
                    )
                )
            );
        });

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
            body: swift.CodeBlock.withStatements(bodyStatements)
        });
    }

    private generateNestedTypes(constantProperties: swift.Property[], dataProperties: swift.Property[]) {
        const nestedTypes: (swift.Struct | swift.EnumWithRawValues)[] = [];
        this.generatorContext.project.srcNameRegistry
            .getAllNestedLiteralEnumSymbolsOrThrow(this.symbol)
            .forEach(({ symbol, literalValue }) => {
                const literalEnumGenerator = new LiteralEnumGenerator({
                    name: symbol.name,
                    literalValue
                });
                nestedTypes.push(literalEnumGenerator.generate());
            });
        if (constantProperties.length > 0 || dataProperties.length > 0) {
            nestedTypes.push(this.generateCodingKeysEnum());
        }
        return nestedTypes;
    }

    private generateCodingKeysEnum() {
        return swift.enumWithRawValues({
            name: "CodingKeys",
            conformances: ["String", swift.Protocol.CodingKey, swift.Protocol.CaseIterable],
            cases: [
                ...this.constantPropertyDefinitions.map((property) => ({
                    unsafeName: property.unsafeName,
                    rawValue: property.rawName
                })),
                ...this.dataPropertyDefinitions.map((property) => ({
                    unsafeName: property.unsafeName,
                    rawValue: property.rawName
                }))
            ],
            docs: swift.docComment({ summary: "Keys for encoding/decoding struct properties." })
        });
    }
}
