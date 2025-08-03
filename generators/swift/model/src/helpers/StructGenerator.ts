import { swift } from "@fern-api/swift-codegen";

export declare namespace StructGenerator {
    interface ConstantPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: swift.Type;
        value: swift.Expression;
    }

    interface DataPropertyDefinition {
        unsafeName: string;
        rawName: string;
        type: swift.Type;
    }

    interface Args {
        name: string;
        constantPropertyDefinitions: ConstantPropertyDefinition[];
        dataPropertyDefinitions: DataPropertyDefinition[];
        additionalProperties: boolean;
    }
}

export class StructGenerator {
    private readonly name: string;
    private readonly constantPropertyDefinitions: StructGenerator.ConstantPropertyDefinition[];
    private readonly dataPropertyDefinitions: StructGenerator.DataPropertyDefinition[];
    private readonly additionalPropertiesInfo;

    public constructor({
        name,
        constantPropertyDefinitions,
        dataPropertyDefinitions,
        additionalProperties
    }: StructGenerator.Args) {
        this.name = name;
        this.constantPropertyDefinitions = constantPropertyDefinitions;
        this.dataPropertyDefinitions = dataPropertyDefinitions;
        this.additionalPropertiesInfo = additionalProperties ? this.getAdditionalPropertiesInfo() : undefined;
    }

    private getAdditionalPropertiesInfo = () => {
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

    public generate(): swift.Struct {
        const constantProperties = this.generateConstantProperties();
        const dataProperties = this.generateDataProperties();
        const properties = [...constantProperties, ...dataProperties];
        if (this.additionalPropertiesInfo) {
            properties.push(
                swift.property({
                    unsafeName: this.additionalPropertiesInfo.propertyName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: this.additionalPropertiesInfo.swiftType
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
            nestedTypes: this.generateNestedTypes(dataProperties)
        });
    }

    private generateConstantProperties(): swift.Property[] {
        return this.constantPropertyDefinitions.map((p) =>
            swift.property({
                unsafeName: p.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: p.type,
                defaultValue: p.value
            })
        );
    }

    private generateDataProperties(): swift.Property[] {
        return this.dataPropertyDefinitions.map((p) =>
            swift.property({
                unsafeName: p.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: p.type
            })
        );
    }

    private generateInitializers(dataProperties: swift.Property[]): swift.Initializer[] {
        const initializers = [this.generatePrimaryInitializer(dataProperties)];
        if (this.additionalPropertiesInfo) {
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
        if (this.additionalPropertiesInfo) {
            parameters.push(
                swift.functionParameter({
                    argumentLabel: this.additionalPropertiesInfo.propertyName,
                    unsafeName: this.additionalPropertiesInfo.propertyName,
                    type: this.additionalPropertiesInfo.swiftType,
                    defaultValue: swift.Expression.contextualMethodCall({ methodName: "init" })
                })
            );
        }
        const bodyStatements = dataProperties.map((p) =>
            swift.Statement.propertyAssignment(p.unsafeName, swift.Expression.reference(p.unsafeName))
        );
        if (this.additionalPropertiesInfo) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesInfo.propertyName,
                    swift.Expression.reference(this.additionalPropertiesInfo.propertyName)
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

        if (this.additionalPropertiesInfo) {
            bodyStatements.push(
                swift.Statement.propertyAssignment(
                    this.additionalPropertiesInfo.propertyName,
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
        if (this.additionalPropertiesInfo) {
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

        if (this.additionalPropertiesInfo) {
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
                                        memberName: this.additionalPropertiesInfo.propertyName
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
            ]
        });
    }
}
