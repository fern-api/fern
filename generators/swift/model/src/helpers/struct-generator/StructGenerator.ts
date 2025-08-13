import { noop } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { TypeReference } from "@fern-fern/ir-sdk/api";
import { camelCase } from "lodash-es";

import { StringEnumGenerator } from "../../enum";
import { ModelGeneratorContext } from "../../ModelGeneratorContext";
import { LocalSymbolRegistry } from "./LocalSymbolRegistry";

export declare namespace StructGenerator {
    interface ConstantPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: swift.Type | TypeReference;
        value: swift.Expression;
        docsContent?: string;
    }

    interface DataPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: TypeReference;
        docsContent?: string;
    }

    interface LocalContext {
        readonly additionalPropertiesMetadata?: {
            /**
             * The name of the property that will be used to store additional properties that are not explicitly defined in the schema.
             */
            propertyName: string;
            swiftType: swift.Type;
        };
        readonly stringLiteralEnums: Map<string, swift.EnumWithRawValues>;
        readonly symbolRegistry: LocalSymbolRegistry;
    }

    interface Args {
        name: string;
        constantPropertyDefinitions: ConstantPropertyDefinition[];
        dataPropertyDefinitions: DataPropertyDefinition[];
        additionalProperties: boolean;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class StructGenerator {
    private readonly name: string;
    private readonly constantPropertyDefinitions: StructGenerator.ConstantPropertyDefinition[];
    private readonly dataPropertyDefinitions: StructGenerator.DataPropertyDefinition[];
    private readonly docsContent?: string;
    private readonly generatorContext: ModelGeneratorContext;
    private readonly localContext: StructGenerator.LocalContext;

    public constructor({
        name,
        constantPropertyDefinitions,
        dataPropertyDefinitions,
        additionalProperties,
        docsContent,
        context
    }: StructGenerator.Args) {
        this.name = name;
        this.constantPropertyDefinitions = constantPropertyDefinitions;
        this.dataPropertyDefinitions = dataPropertyDefinitions;
        this.docsContent = docsContent;
        this.generatorContext = context;
        this.localContext = this.buildLocalContext(additionalProperties);
    }

    private buildLocalContext(hasAdditionalProperties: boolean): StructGenerator.LocalContext {
        const symbolRegistry = LocalSymbolRegistry.create();

        const computeAdditionalPropertiesMetadata = () => {
            const otherPropertyNames = [
                ...this.constantPropertyDefinitions.map((p) => p.unsafeName),
                ...this.dataPropertyDefinitions.map((p) => p.unsafeName)
            ];
            const otherPropertyNamesSet = new Set(otherPropertyNames);
            let propertyName = "additionalProperties";
            while (otherPropertyNamesSet.has(propertyName)) {
                propertyName = "_" + propertyName;
            }
            return {
                propertyName,
                swiftType: swift.Type.dictionary(swift.Type.string(), swift.Type.jsonValue())
            };
        };

        const generateStringLiteralEnums = (): Map<string, swift.EnumWithRawValues> => {
            const enumsByLiteralValue = new Map<string, swift.EnumWithRawValues>();

            const generateStringLiteralEnumsForTypeReference = (typeReference: TypeReference) => {
                typeReference._visit({
                    container: (container) => {
                        container._visit({
                            literal: (literal) => {
                                literal._visit({
                                    string: (literalValue) => {
                                        const enumName =
                                            symbolRegistry.registerStringLiteralSymbolIfNotExists(literalValue);
                                        const stringEnumGenerator = new StringEnumGenerator({
                                            name: enumName,
                                            source: {
                                                type: "custom",
                                                values: [
                                                    {
                                                        unsafeName: camelCase(literalValue),
                                                        rawValue: literalValue
                                                    }
                                                ]
                                            }
                                        });
                                        enumsByLiteralValue.set(literalValue, stringEnumGenerator.generate());
                                    },
                                    boolean: noop,
                                    _other: noop
                                });
                            },
                            map: (mapType) => {
                                generateStringLiteralEnumsForTypeReference(mapType.keyType);
                                generateStringLiteralEnumsForTypeReference(mapType.valueType);
                            },
                            set: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            nullable: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            optional: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            list: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            _other: noop
                        });
                    },
                    primitive: noop,
                    unknown: noop,
                    named: noop,
                    _other: noop
                });
            };

            for (const def of [...this.constantPropertyDefinitions, ...this.dataPropertyDefinitions]) {
                if (def.type instanceof swift.Type) {
                    continue;
                }
                generateStringLiteralEnumsForTypeReference(def.type);
            }

            return enumsByLiteralValue;
        };

        return {
            additionalPropertiesMetadata: hasAdditionalProperties ? computeAdditionalPropertiesMetadata() : undefined,
            stringLiteralEnums: generateStringLiteralEnums(),
            symbolRegistry
        };
    }

    public generate(): swift.Struct {
        const constantProperties = this.generateConstantProperties();
        const dataProperties = this.generateDataProperties();
        const properties = [...constantProperties, ...dataProperties];
        if (this.localContext.additionalPropertiesMetadata) {
            properties.push(
                swift.property({
                    unsafeName: this.localContext.additionalPropertiesMetadata.propertyName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: this.localContext.additionalPropertiesMetadata.swiftType,
                    docs: swift.docComment({
                        summary: "Additional properties that are not explicitly defined in the schema"
                    })
                })
            );
        }
        return swift.struct({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            properties,
            initializers: this.generateInitializers(dataProperties),
            methods: this.generateMethods(constantProperties, dataProperties),
            nestedTypes: this.generateNestedTypes(dataProperties),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }

    private generateConstantProperties(): swift.Property[] {
        return this.constantPropertyDefinitions.map((p) =>
            swift.property({
                unsafeName: p.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: this.getSwiftTypeForProperty(p),
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
                type: this.getSwiftTypeForProperty(p),
                docs: p.docsContent ? swift.docComment({ summary: p.docsContent }) : undefined
            })
        );
    }

    private getSwiftTypeForProperty(
        definition: StructGenerator.ConstantPropertyDefinition | StructGenerator.DataPropertyDefinition
    ) {
        if (definition.type instanceof swift.Type) {
            return definition.type;
        }
        return this.generatorContext.getSwiftTypeForTypeReference(definition.type, {
            getSwiftTypeForStringLiteral: (literalValue) => {
                const enumName = this.localContext.symbolRegistry.getStringLiteralSymbolOrThrow(literalValue);
                return swift.Type.custom(enumName);
            },
            hasNestedTypeWithName: (symbolName) => {
                return Array.from(this.localContext.stringLiteralEnums.values()).some(
                    (enum_) => enum_.name === symbolName
                );
            }
        });
    }

    private generateInitializers(dataProperties: swift.Property[]): swift.Initializer[] {
        const initializers = [this.generatePrimaryInitializer(dataProperties)];
        if (this.localContext.additionalPropertiesMetadata) {
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
        if (this.localContext.additionalPropertiesMetadata) {
            parameters.push(
                swift.functionParameter({
                    argumentLabel: this.localContext.additionalPropertiesMetadata.propertyName,
                    unsafeName: this.localContext.additionalPropertiesMetadata.propertyName,
                    type: this.localContext.additionalPropertiesMetadata.swiftType,
                    defaultValue: swift.Expression.contextualMethodCall({ methodName: "init" })
                })
            );
        }
        const bodyStatements = dataProperties.map((p) =>
            swift.Statement.propertyAssignment(p.unsafeName, swift.Expression.reference(p.unsafeName))
        );
        if (this.localContext.additionalPropertiesMetadata) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.localContext.additionalPropertiesMetadata.propertyName,
                    swift.Expression.reference(this.localContext.additionalPropertiesMetadata.propertyName)
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
                                methodName: p.type.isOptional ? "decodeIfPresent" : "decode",
                                arguments_: [
                                    swift.functionArgument({
                                        value: swift.Expression.memberAccess({
                                            target: swift.Type.required(p.type),
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

        if (this.localContext.additionalPropertiesMetadata) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.localContext.additionalPropertiesMetadata.propertyName,
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
                    type: swift.Type.custom("Decoder")
                })
            ],
            body: swift.CodeBlock.withStatements(bodyStatements)
        });
    }

    private generateMethods(constantProperties: swift.Property[], dataProperties: swift.Property[]) {
        const methods: swift.Method[] = [];
        if (this.localContext.additionalPropertiesMetadata) {
            methods.push(this.generateEncodeMethod(constantProperties, dataProperties));
        }
        return methods;
    }

    private generateEncodeMethod(constantProperties: swift.Property[], dataProperties: swift.Property[]) {
        const bodyStatements: swift.Statement[] = [];

        if (dataProperties.length > 0) {
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

        if (this.localContext.additionalPropertiesMetadata) {
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
                                        memberName: this.localContext.additionalPropertiesMetadata.propertyName
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
                            methodName: p.type.isOptional ? "encodeIfPresent" : "encode",
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
                    type: swift.Type.custom("Encoder")
                })
            ],
            throws: true,
            returnType: swift.Type.void(),
            body: swift.CodeBlock.withStatements(bodyStatements)
        });
    }

    private generateNestedTypes(dataProperties: swift.Property[]) {
        const nestedTypes: (swift.Struct | swift.EnumWithRawValues)[] = [];
        this.localContext.stringLiteralEnums.forEach((enum_) => {
            nestedTypes.push(enum_);
        });
        if (dataProperties.length > 0) {
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
