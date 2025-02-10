import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import {
    DeclaredTypeName,
    ObjectProperty,
    SingleUnionType,
    SingleUnionTypeProperty,
    TypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class UnionGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: php.ClassReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionTypeDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.phpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): PhpFile {
        const clazz = php.dataClass({
            ...this.classReference,
            docs: this.typeDeclaration.docs,
            parentClassReference: this.context.getJsonSerializableTypeClassReference()
        });

        const { includeGetter, includeSetter } = {
            includeGetter: this.context.shouldGenerateGetterMethods(),
            includeSetter: this.context.shouldGenerateSetterMethods()
        };
        for (const property of this.unionTypeDeclaration.baseProperties) {
            const field = this.toField({ property });
            if (includeGetter) {
                clazz.addMethod(this.context.getGetterMethod({ name: property.name.name, field }));
            }
            if (includeSetter) {
                clazz.addMethod(this.context.getSetterMethod({ name: property.name.name, field }));
            }
            clazz.addField(field);
        }

        const typeField = this.getTypeField();
        clazz.addField(typeField);

        const valueField = this.getValueField();
        clazz.addField(valueField);

        for (const type of this.unionTypeDeclaration.types) {
            clazz.addMethod(this.staticConstructor(type));
        }

        clazz.addMethod(this.unknownStaticConstructor());

        for (const type of this.unionTypeDeclaration.types) {
            const isMethod = this.isMethod(type);
            clazz.addMethod(isMethod);

            const asMethod = this.asCastMethod(type);
            if (asMethod) {
                clazz.addMethod(asMethod);
            }
        }

        clazz.addMethod(this.context.getToStringMethod());

        clazz.addMethod(this.jsonSerializeMethod());
        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private typeGetter(): php.CodeBlock {
        const discriminant = this.unionTypeDeclaration.discriminant.wireValue;
        return php.codeblock("$this->" + discriminant);
    }

    private getTypeField(): php.Field {
        // TODO(ajgateno): Actually add the literals as a union rather than just string
        return php.field({
            name: this.unionTypeDeclaration.discriminant.wireValue,
            type: php.Type.string(),
            access: "public",
            readonly_: true
        });
    }

    private getValueField(): php.Field {
        // TODO(ajgateno): Actually add the class references as a union rather than just mixed
        return php.field({
            // TODO(ajgateno): We'll want to disambiguate here if e.g. there's a "value" property
            name: "value",
            type: php.Type.mixed(),
            access: "public",
            readonly_: true
        });
    }

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): php.Field {
        const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
        return php.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: "public",
            docs: property.docs,
            attributes: this.context.phpAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
        });
    }

    private unknownStaticConstructor(): php.Method {
        const parameters: php.Parameter[] = [];

        for (const property of this.unionTypeDeclaration.baseProperties) {
            parameters.push(
                php.parameter({
                    name: this.context.getPropertyName(property.name.name),
                    type: this.context.phpTypeMapper.convert({ reference: property.valueType })
                })
            );
        }

        parameters.push(
            php.parameter({
                name: "_unknown",
                type: php.Type.mixed()
            })
        );

        const body = php.codeblock((writer) => {
            const constructorArgs: php.Map.Entry[] = [];

            for (const property of this.unionTypeDeclaration.baseProperties) {
                constructorArgs.push({
                    key: php.codeblock(`'${property.name.wireValue}'`),
                    value: php.codeblock(this.context.getVariableName(property.name.name))
                });
            }

            constructorArgs.push({
                key: php.codeblock(`'${this.unionTypeDeclaration.discriminant.wireValue}'`),
                value: php.codeblock("'_unknown'")
            });
            constructorArgs.push({
                key: php.codeblock("'value'"),
                value: php.codeblock("$_unknown")
            });

            const constructorCall = php.instantiateClass({
                classReference: this.classReference,
                arguments_: [php.map({ entries: constructorArgs, multiline: true })]
            });

            writer.write("return ");
            writer.writeNodeStatement(constructorCall);
        });

        return php.method({
            name: "_unknown",
            access: "public",
            parameters,
            return_: php.Type.reference(this.classReference),
            body,
            static_: true
        });
    }

    private staticConstructor(variant: SingleUnionType): php.Method {
        return php.method({
            name: this.context.getPropertyName(variant.discriminantValue.name),
            access: "public",
            parameters: this.getStaticConstructorParameters(variant),
            return_: php.Type.reference(this.classReference),
            body: this.getStaticConstructorBody(variant),
            static_: true
        });
    }

    private getStaticConstructorParameters(variant: SingleUnionType): php.Parameter[] {
        const parameters: php.Parameter[] = [];

        for (const property of this.unionTypeDeclaration.baseProperties) {
            parameters.push(
                php.parameter({
                    name: this.context.getPropertyName(property.name.name),
                    type: this.context.phpTypeMapper.convert({ reference: property.valueType })
                })
            );
        }

        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
            case "singleProperty":
                parameters.push(
                    php.parameter({
                        name: this.context.getPropertyName(variant.discriminantValue.name),
                        type: this.getReturnType(variant)
                    })
                );
                break;
            case "noProperties":
            default:
        }

        return parameters;
    }

    private getStaticConstructorBody(variant: SingleUnionType) {
        return php.codeblock((writer) => {
            const constructorArgs: php.Map.Entry[] = [];

            for (const property of this.unionTypeDeclaration.baseProperties) {
                constructorArgs.push({
                    key: php.codeblock(`'${property.name.wireValue}'`),
                    value: php.codeblock(this.context.getVariableName(property.name.name))
                });
            }

            constructorArgs.push({
                key: php.codeblock(`'${this.unionTypeDeclaration.discriminant.wireValue}'`),
                value: php.codeblock(`'${variant.discriminantValue.wireValue}'`)
            });

            switch (variant.shape.propertiesType) {
                case "samePropertiesAsObject":
                case "singleProperty":
                    constructorArgs.push({
                        key: php.codeblock("'value'"),
                        value: php.codeblock(this.context.getVariableName(variant.discriminantValue.name))
                    });
                    break;
                case "noProperties":
                default:
                    constructorArgs.push({
                        key: php.codeblock("'value'"),
                        value: php.codeblock("null")
                    });
            }

            const constructorCall = php.instantiateClass({
                classReference: this.classReference,
                arguments_: [php.map({ entries: constructorArgs, multiline: true })]
            });

            writer.write("return ");
            writer.writeNodeStatement(constructorCall);
        });
    }

    private isMethod(variant: SingleUnionType): php.Method {
        const methodName = "is" + variant.discriminantValue.name.pascalCase.safeName;

        return php.method({
            name: methodName,
            access: "public",
            parameters: [],
            return_: php.Type.bool(),
            body: php.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(this.isMethodCheck(variant));
            })
        });
    }

    private asCastMethod(variant: SingleUnionType): php.Method | null {
        if (variant.shape.propertiesType === "noProperties") {
            return null;
        }

        const methodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        const returnType = this.getReturnType(variant);

        const typeCheckConditional = this.getTypeCheckConditional(variant, php.codeblock("$this->value"), returnType);

        const body = php.codeblock((writer) => {
            if (typeCheckConditional) {
                writer.writeNode(typeCheckConditional);
                writer.writeLine();
            }

            writer.writeTextStatement("return $this->value");
        });

        return php.method({
            name: methodName,
            access: "public",
            parameters: [],
            return_: returnType,
            body
        });
    }

    private getReturnType(variant: SingleUnionType): php.Type {
        return variant.shape._visit({
            samePropertiesAsObject: (value: DeclaredTypeName) => {
                return php.Type.reference(this.context.phpTypeMapper.convertToClassReference(value));
            },
            singleProperty: (value: SingleUnionTypeProperty) => {
                return this.context.phpTypeMapper.convert({ reference: value.type });
            },
            noProperties: () => {
                return php.Type.null();
            },
            _other: (value) => {
                throw new Error("Got unexpected union type: " + value);
            }
        });
    }

    private getTypeCheckConditional(
        variant: SingleUnionType,
        variableGetter: php.CodeBlock,
        type: php.Type
    ): php.CodeBlock | null {
        const typeCheck = this.getTypeCheck(variableGetter, type);

        if (typeCheck == null) {
            return null;
        }

        const negation = php.codeblock((writer) => {
            writer.write("!");
            writer.write("(");
            writer.writeNode(this.isMethodCheck(variant));
            writer.write(")");
        });

        return php.codeblock((writer) => {
            writer.controlFlow("if", negation);
            writer.writeNodeStatement(this.getTypeCheckErrorThrow(variant, variableGetter));
            writer.endControlFlow();
        });
    }

    private isMethodCheck(variant: SingleUnionType): php.CodeBlock {
        const discriminantCheck = this.getDiscriminantCheck(this.typeGetter(), variant);
        const typeCheck = this.getTypeCheck(php.codeblock("$this->value"), this.getReturnType(variant));

        return php.codeblock((writer) => {
            if (typeCheck) {
                writer.writeNode(typeCheck);
                writer.write("&& ");
            }

            writer.writeNode(discriminantCheck);
        });
    }

    private getTypeCheckErrorThrow(variant: SingleUnionType, variableGetter: php.CodeBlock): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write("throw ");
            writer.writeNode(
                php.instantiateClass({
                    classReference: php.classReference({
                        name: "Exception",
                        namespace: ""
                    }),
                    arguments_: [
                        php.codeblock((writer) => {
                            writer.writeNode(this.getTypeCheckErrorMessage(variant, variableGetter));
                        })
                    ],
                    multiline: true
                })
            );
        });
    }

    private getTypeCheckErrorMessage(variant: SingleUnionType, variableGetter: php.CodeBlock): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write('"');
            writer.write("Expected ");
            writer.write(variant.discriminantValue.wireValue);
            writer.write("; got ");
            writer.write('"');
            writer.write(" . ");
            writer.writeNode(this.typeGetter());
            writer.write(" . ");
            writer.write('"');
            writer.write("with value of type ");
            writer.write('"');
            writer.write(" . ");
            writer.writeNode(
                php.invokeMethod({
                    method: "get_debug_type",
                    arguments_: [variableGetter],
                    static_: true
                })
            );
        });
    }

    private getDiscriminantCheck(variableGetter: php.CodeBlock, variant: SingleUnionType): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(variableGetter);
            writer.write(" === ");
            writer.write('"');
            writer.write(variant.discriminantValue.wireValue);
            writer.write('"');
        });
    }

    private getTypeCheck(variableGetter: php.CodeBlock, type: php.Type): php.CodeBlock | null {
        let underlyingTypeCheck: php.CodeBlock | null = null;
        switch (type.internalType.type) {
            case "int":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_int",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "string":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_string",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "bool":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_bool",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "float":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_float",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );

            case "object":
            case "map":
            case "array":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_array",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );

            case "null":
            case "mixed":
                return php.codeblock((writer) =>
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_null",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );

            case "date":
            case "dateTime":
            case "reference":
                return php.codeblock((writer) => {
                    writer.writeNode(variableGetter);
                    writer.write(" instanceof ");
                    writer.writeNode(type);
                });

            case "optional":
                underlyingTypeCheck = this.getTypeCheck(variableGetter, type.underlyingType());
                if (underlyingTypeCheck == null) {
                    return null;
                }
                return php.codeblock((writer) => {
                    writer.write("(");
                    writer.writeNode(
                        php.invokeMethod({
                            method: "is_null",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    );
                    writer.write(" || ");

                    // NOTE: Casting because LSP was complaining here
                    writer.writeNode(underlyingTypeCheck as php.CodeBlock);
                    writer.write(")");
                });

            case "typeDict":
            case "enumString":
            case "union":
            default:
                return null;
        }
    }

    private jsonSerializeMethod(): php.Method {
        const discriminant = this.unionTypeDeclaration.discriminant.wireValue;
        return php.method({
            name: "jsonSerialize",
            access: "public",
            parameters: [],
            return_: php.Type.array(php.Type.mixed()),
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$result = []");
                writer.writeNodeStatement(
                    php.codeblock((_writer) => {
                        _writer.write(`$result["${discriminant}"] = `);
                        _writer.writeNode(this.typeGetter());
                    })
                );

                writer.writeLine();

                writer.writeNodeStatement(
                    php.codeblock((_writer) => {
                        _writer.write("$base = ");
                        _writer.writeNode(
                            php.invokeMethod({
                                method: "jsonSerialize",
                                arguments_: [],
                                static_: true,
                                on: php.codeblock("parent")
                            })
                        );
                    })
                );
                writer.writeNodeStatement(
                    php.codeblock((_writer) => {
                        _writer.write("$result = ");
                        _writer.writeNode(
                            php.invokeMethod({
                                method: "array_merge",
                                arguments_: [php.codeblock("$base"), php.codeblock("$result")],
                                static_: true
                            })
                        );
                    })
                );

                writer.writeLine();

                writer.writeNode(
                    this.variantSwitchStatement(
                        this.typeGetter(),
                        (variant) => this.jsonSerializeCaseHandler(variant),
                        this.jsonSerializeDefaultHandler()
                    )
                );

                writer.writeLine();

                writer.writeTextStatement("return $result");
            })
        });
    }

    private jsonSerializeCaseHandler(variant: SingleUnionType): php.CodeBlock {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return php.codeblock((writer) => {
                    const type = this.getReturnType(variant);
                    writer.writeNode(this.jsonSerializeValueCall({ variant, type }));
                    writer.writeNode(this.jsonSerializeMaybeArrayMerge(variant, type));
                    writer.writeTextStatement("break");
                });
            case "singleProperty":
                return php.codeblock((writer) => {
                    writer.writeNode(this.jsonSerializeValueCall({ variant, type: this.getReturnType(variant) }));
                    writer.writeNodeStatement(
                        php.codeblock((_writer) => {
                            _writer.write("$result");
                            _writer.write("['");
                            _writer.write(variant.discriminantValue.wireValue);
                            _writer.write("']");
                            _writer.write(" = $value");
                        })
                    );
                    writer.writeTextStatement("break");
                });
            case "noProperties":
                return php.codeblock((writer) => writer.writeTextStatement("break"));
            default:
                return php.codeblock("");
        }
    }

    private jsonSerializeMaybeArrayMerge(variant: SingleUnionType, type: php.Type): php.CodeBlock {
        const asCastMethodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        switch (type.internalType.type) {
            case "reference":
            case "object":
            case "map":
            case "array":
                return php.codeblock((writer) => {
                    writer.write("$result = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "array_merge",
                            arguments_: [php.codeblock("$value"), php.codeblock("$result")],
                            static_: true
                        })
                    );
                });

            case "optional":
                return php.codeblock((writer) => {
                    writer.write(asCastMethodName);
                    writer.write(" = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: asCastMethodName,
                            arguments_: [],
                            on: php.codeblock("$this")
                        })
                    );
                    writer.controlFlow(
                        "if",
                        php.invokeMethod({
                            method: "is_array",
                            arguments_: [php.codeblock(asCastMethodName)],
                            static_: true
                        })
                    );
                    writer.write("$result");
                    writer.write("['");
                    writer.write(variant.discriminantValue.wireValue);
                    writer.write("']");
                    writer.write(" = ");
                    writer.writeTextStatement(asCastMethodName);
                    writer.endControlFlow();
                    writer.writeNode(this.jsonSerializeMaybeArrayMerge(variant, type.underlyingType()));
                });

            case "date":
            case "dateTime":
            case "int":
            case "string":
            case "bool":
            case "float":
            case "null":
            case "mixed":
            case "typeDict":
            case "enumString":
            case "union":
            default:
                return php.codeblock((writer) => {
                    writer.write("$result");
                    writer.write("['");
                    writer.write(variant.discriminantValue.wireValue);
                    writer.write("']");
                    writer.writeTextStatement(" = $value");
                });
        }
    }

    private jsonSerializeValueCall({
        declaredVariableName,
        variant,
        type
    }: {
        declaredVariableName?: string | null;
        variant: SingleUnionType;
        type: php.Type;
    }): php.CodeBlock {
        const asCastMethodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        let argument: php.AstNode = php.invokeMethod({
            method: asCastMethodName,
            arguments_: [],
            static_: false,
            on: php.codeblock("$this")
        });
        switch (type.internalType.type) {
            case "date":
                if (declaredVariableName != null) {
                    argument = php.codeblock(declaredVariableName);
                }
                return php.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "serializeDate",
                            arguments_: [argument],
                            static_: true,
                            on: this.context.getJsonSerializerClassReference()
                        })
                    );
                });

            case "dateTime":
                if (declaredVariableName != null) {
                    argument = php.codeblock(declaredVariableName);
                }
                return php.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "serializeDateTime",
                            arguments_: [argument],
                            static_: true,
                            on: this.context.getJsonSerializerClassReference()
                        })
                    );
                });

            case "reference":
                if (declaredVariableName != null) {
                    argument = php.codeblock(declaredVariableName);
                }
                return php.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "jsonSerialize",
                            arguments_: [],
                            static_: false,
                            on: argument
                        })
                    );
                });

            case "optional":
                return php.codeblock((writer) => {
                    writer.write("$" + asCastMethodName);
                    writer.write(" = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: asCastMethodName,
                            arguments_: [],
                            on: php.codeblock("$this")
                        })
                    );
                    writer.controlFlow(
                        "if",
                        php.invokeMethod({
                            method: "is_null",
                            arguments_: [php.codeblock("$" + asCastMethodName)],
                            static_: true
                        })
                    );
                    writer.write("$value = ");
                    writer.writeTextStatement("$" + asCastMethodName);
                    if (
                        ["reference", "dateTime", "date", "optional"].includes(type.underlyingType().internalType.type)
                    ) {
                        writer.alternativeControlFlow("else");
                        writer.writeNode(
                            this.jsonSerializeValueCall({
                                declaredVariableName: "$" + asCastMethodName,
                                variant,
                                type: type.underlyingType()
                            })
                        );
                    }
                    writer.endControlFlow();
                });

            case "int":
            case "string":
            case "bool":
            case "float":
            case "object":
            case "map":
            case "array":
            case "null":
            case "mixed":
            case "typeDict":
            case "enumString":
            case "union":
            default:
                return php.codeblock((writer) => writer.writeTextStatement("$value = $this->value"));
        }
    }

    private jsonSerializeDefaultHandler(): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.controlFlow(
                "if",
                php.invokeMethod({
                    method: "is_null",
                    arguments_: [php.codeblock("$this->value")],
                    static_: true
                })
            );
            writer.writeTextStatement("break");
            writer.endControlFlow();

            writer.controlFlow(
                "if",
                php.codeblock((_writer) => {
                    _writer.write("$this->value instanceof ");
                    _writer.writeNode(php.classReference(this.context.getJsonSerializableTypeClassReference()));
                })
            );
            writer.writeTextStatement("$value = $this->value->jsonSerialize()");
            writer.writeNodeStatement(
                php.codeblock((_writer) => {
                    _writer.write("$result = ");
                    _writer.writeNode(
                        php.invokeMethod({
                            method: "array_merge",
                            arguments_: [php.codeblock("$value"), php.codeblock("$result")],
                            static_: true
                        })
                    );
                })
            );

            writer.contiguousControlFlow(
                "elseif",
                php.invokeMethod({
                    method: "is_array",
                    arguments_: [php.codeblock("$this->value")],
                    static_: true
                })
            );
            writer.writeNodeStatement(
                php.codeblock((_writer) => {
                    _writer.write("$result = ");
                    _writer.writeNode(
                        php.invokeMethod({
                            method: "array_merge",
                            arguments_: [php.codeblock("$this->value"), php.codeblock("$result")],
                            static_: true
                        })
                    );
                })
            );

            writer.endControlFlow();
        });
    }

    private variantSwitchStatement(
        variableGetter: php.CodeBlock,
        caseMapper: (variant: SingleUnionType) => php.CodeBlock,
        defaultHandler: php.CodeBlock
    ): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.controlFlow("switch", variableGetter);

            for (const variant of this.unionTypeDeclaration.types) {
                writer.write("case ");
                writer.write('"');
                writer.write(variant.discriminantValue.wireValue);
                writer.write('"');
                writer.writeLine(":");
                writer.indent();
                writer.writeNode(caseMapper(variant));
                writer.dedent();
            }

            writer.writeLine('case "_unknown":');
            writer.writeLine("default:");
            writer.indent();
            writer.writeNode(defaultHandler);
            writer.dedent();

            writer.endControlFlow();
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
