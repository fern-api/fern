import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { STATIC, php } from "@fern-api/php-codegen";

import {
    DeclaredTypeName,
    Name,
    NameAndWireValue,
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

        const discriminantField = this.getDiscriminantField();
        clazz.addField(discriminantField);

        const valueField = this.getValueField();
        clazz.addField(valueField);

        if (includeGetter) {
            clazz.addMethod(
                this.context.getGetterMethod({
                    name: this.unionTypeDeclaration.discriminant.name,
                    field: discriminantField
                })
            );
            clazz.addMethod(
                this.context.getGetterMethod({
                    name: this.getValueFieldName(),
                    field: valueField
                })
            );
        }

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

        clazz.addMethod(this.fromJsonMethod());

        clazz.addMethod(this.jsonDeserializeMethod());

        return new PhpFile({
            clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private discriminantGetter(): php.CodeBlock {
        if (this.context.shouldGenerateGetterMethods()) {
            const getterName = this.context.getGetterMethod({
                name: this.unionTypeDeclaration.discriminant.name,
                field: this.getDiscriminantField()
            }).name;
            return php.codeblock(`$this->${getterName}`);
        }

        const discriminant = this.unionTypeDeclaration.discriminant.wireValue;
        return php.codeblock("$this->" + discriminant);
    }

    private valueGetter(): php.CodeBlock {
        if (this.context.shouldGenerateGetterMethods()) {
            const getterName = this.context.getGetterMethod({
                name: this.getValueFieldName(),
                field: this.getValueField()
            }).name;
            return php.codeblock(`$this->${getterName}`);
        }

        return php.codeblock("$this->value");
    }

    private getValueFieldName(): Name {
        const safeUnsafeValue = {
            safeName: "value",
            unsafeName: "value"
        };

        return {
            originalName: "value",
            camelCase: safeUnsafeValue,
            pascalCase: safeUnsafeValue,
            snakeCase: safeUnsafeValue,
            screamingSnakeCase: { safeName: "VALUE", unsafeName: "VALUE" }
        };
    }

    private getDiscriminantField(): php.Field {
        const includeGetter: boolean = this.context.shouldGenerateGetterMethods();
        // TODO(ajgateno): Actually add the literals as a union rather than just string
        return php.field({
            name: this.unionTypeDeclaration.discriminant.wireValue,
            type: php.Type.string(),
            access: includeGetter ? "private" : "public",
            readonly_: true
        });
    }

    private getValueField(): php.Field {
        const includeGetter: boolean = this.context.shouldGenerateGetterMethods();
        const types: php.Type[] = [];

        for (const variant of this.unionTypeDeclaration.types) {
            types.push(this.getReturnType(variant));
        }

        types.push(php.Type.mixed());

        return php.field({
            // TODO(ajgateno): We'll want to disambiguate here if e.g. there's a "value" property
            name: "value",
            type: php.Type.union(types),
            access: includeGetter ? "private" : "public",
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

        const typeCheckConditional = this.getTypeCheckConditional(variant, this.valueGetter(), returnType);

        const body = php.codeblock((writer) => {
            if (typeCheckConditional) {
                writer.writeNode(typeCheckConditional);
                writer.writeLine();
            }

            writer.write("return ");
            writer.writeNodeStatement(this.valueGetter());
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
            writer.writeNodeStatement(
                this.getErrorThrow(this.getVariantTypeCheckErrorMessage(variant, variableGetter))
            );
            writer.endControlFlow();
        });
    }

    private isMethodCheck(variant: SingleUnionType): php.CodeBlock {
        const discriminantCheck = this.getDiscriminantCheck(this.discriminantGetter(), variant);
        const typeCheck = this.getTypeCheck(this.valueGetter(), this.getReturnType(variant));

        return php.codeblock((writer) => {
            if (typeCheck) {
                writer.writeNode(typeCheck);
                writer.write("&& ");
            }

            writer.writeNode(discriminantCheck);
        });
    }

    private getErrorThrow(errorMessage: php.CodeBlock): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(
                php.throwException({
                    classReference: this.context.getExceptionClassReference(),
                    arguments_: [
                        php.codeblock((writer) => {
                            writer.writeNode(errorMessage);
                        })
                    ],
                    multiline: true
                })
            );
        });
    }

    private getVariantTypeCheckErrorMessage(variant: SingleUnionType, variableGetter: php.CodeBlock): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write('"');
            writer.write("Expected ");
            writer.write(variant.discriminantValue.wireValue);
            writer.write("; got ");
            writer.write('"');
            writer.write(" . ");
            writer.writeNode(this.discriminantGetter());
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

    private getDeserializationArrayKeyExistsErrorMessage(propertyName: NameAndWireValue): php.CodeBlock {
        return php.codeblock(`"Json data is missing property '${propertyName.wireValue}'"`);
    }

    private getDeserliazationTypeCheckErrorMessage(propertyName: NameAndWireValue, typeName: string): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write(
                `"Expected property '${this.context.getPropertyName(propertyName.name)}' in json data to be ${typeName}, instead received " . `
            );
            writer.writeNode(
                php.invokeMethod({
                    method: "get_debug_type",
                    arguments_: [php.codeblock(`$data['${propertyName.wireValue}']`)],
                    static_: true
                })
            );
        });
    }

    private getDiscriminantCheck(variableGetter: php.CodeBlock, variant: SingleUnionType): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(variableGetter);
            writer.write(" === ");
            writer.write(`'${variant.discriminantValue.wireValue}'`);
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
                        _writer.write(`$result['${discriminant}'] = `);
                        _writer.writeNode(this.discriminantGetter());
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
                        this.discriminantGetter(),
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
                return php.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(this.valueGetter());
                });
        }
    }

    private jsonSerializeDefaultHandler(): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.controlFlow(
                "if",
                php.invokeMethod({
                    method: "is_null",
                    arguments_: [this.valueGetter()],
                    static_: true
                })
            );
            writer.writeTextStatement("break");
            writer.endControlFlow();

            writer.controlFlow(
                "if",
                php.codeblock((_writer) => {
                    _writer.writeNode(this.valueGetter());
                    _writer.write(" instanceof ");
                    _writer.writeNode(php.classReference(this.context.getJsonSerializableTypeClassReference()));
                })
            );
            writer.write("$value = ");
            writer.writeNodeStatement(
                php.invokeMethod({
                    method: "jsonSerialize",
                    arguments_: [],
                    static_: false,
                    on: this.valueGetter()
                })
            );
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
                    arguments_: [this.valueGetter()],
                    static_: true
                })
            );
            writer.writeNodeStatement(
                php.codeblock((_writer) => {
                    _writer.write("$result = ");
                    _writer.writeNode(
                        php.invokeMethod({
                            method: "array_merge",
                            arguments_: [this.valueGetter(), php.codeblock("$result")],
                            static_: true
                        })
                    );
                })
            );

            writer.endControlFlow();
        });
    }

    private fromJsonMethod(): php.Method {
        return php.method({
            name: "fromJson",
            access: "public",
            parameters: [
                php.parameter({
                    name: "json",
                    type: php.Type.string()
                })
            ],
            return_: STATIC,
            body: php.codeblock((writer) => {
                writer.write("$decodedJson = ");
                writer.writeNodeStatement(
                    php.invokeMethod({
                        method: "decode",
                        arguments_: [php.codeblock("$json")],
                        static_: true,
                        on: this.context.getJsonDecoderClassReference()
                    })
                );

                const negation = php.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.writeNode(
                        php.invokeMethod({
                            method: "is_array",
                            arguments_: [php.codeblock("$decodedJson")],
                            static_: true
                        })
                    );
                });
                writer.controlFlow("if", negation);
                writer.writeNodeStatement(
                    php.throwException({
                        classReference: this.context.getExceptionClassReference(),
                        arguments_: [php.codeblock('"Unexpected non-array decoded type: " . gettype($decodedJson)')]
                    })
                );
                writer.endControlFlow();
                writer.write("return ");
                writer.writeNodeStatement(
                    php.invokeMethod({
                        method: "jsonDeserialize",
                        arguments_: [php.codeblock("$decodedJson")],
                        static_: true,
                        on: php.codeblock("self")
                    })
                );
            }),
            static_: true
        });
    }

    private jsonDeserializeMethod(): php.Method {
        const body: php.CodeBlock = php.codeblock((writer) => {
            writer.writeTextStatement("$args = []");
            writer.writeNode(this.jsonDeserializeBaseProperties());
            writer.writeNode(this.jsonDeserializeCheckDiscriminant());
            writer.writeNode(
                this.variantSwitchStatement(
                    php.codeblock(this.context.getVariableName(this.unionTypeDeclaration.discriminant.name)),
                    (variant) => this.jsonDeserializeCaseHandler(variant),
                    this.jsonDeserializeDefaultHandler()
                )
            );
            writer.writeLine();
            writer.writeLine("// @phpstan-ignore-next-line");
            writer.writeTextStatement("return new static($args)");
        });

        return php.method({
            name: "jsonDeserialize",
            access: "public",
            parameters: [
                php.parameter({
                    name: "data",
                    type: php.Type.map(php.Type.string(), php.Type.mixed())
                })
            ],
            return_: STATIC,
            body,
            classReference: this.classReference,
            static_: true
        });
    }

    private jsonDeserializeBaseProperties(): php.CodeBlock {
        return php.codeblock((writer) => {
            for (const property of this.unionTypeDeclaration.baseProperties) {
                const arrayKeyDoesNotExist = php.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.writeNode(
                        php.invokeMethod({
                            method: "array_key_exists",
                            arguments_: [php.codeblock(`'${property.name.wireValue}'`), php.codeblock("$data")]
                        })
                    );
                });

                writer.controlFlow("if", arrayKeyDoesNotExist);
                writer.writeNodeStatement(
                    this.getErrorThrow(this.getDeserializationArrayKeyExistsErrorMessage(property.name))
                );
                writer.endControlFlow();

                const type = this.context.phpTypeMapper.convert({ reference: property.valueType });
                const typeCheck = this.getTypeCheck(php.codeblock(`$data['${property.name.wireValue}']`), type);

                // TODO(ajgateno): We have to fix this or else we could be skipping base properties in deserialization.
                if (typeCheck == null) {
                    continue;
                }

                const isNotType = php.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.write("(");
                    _writer.writeNode(typeCheck);
                    _writer.write(")");
                });

                writer.writeNode(
                    php.codeblock((_writer) => {
                        _writer.controlFlow("if", isNotType);
                        _writer.writeNodeStatement(
                            this.getErrorThrow(
                                this.getDeserliazationTypeCheckErrorMessage(property.name, type.internalType.type)
                            )
                        );
                        _writer.endControlFlow();
                    })
                );

                writer.writeTextStatement(`$args['${property.name.wireValue}'] = $data['${property.name.wireValue}']`);

                writer.writeLine();
            }
        });
    }

    private jsonDeserializeCheckDiscriminant(): php.CodeBlock {
        const discriminant: NameAndWireValue = this.unionTypeDeclaration.discriminant;
        return php.codeblock((writer) => {
            const arrayKeyDoesNotExist = php.codeblock((_writer) => {
                _writer.write("!");
                _writer.writeNode(
                    php.invokeMethod({
                        method: "array_key_exists",
                        arguments_: [php.codeblock(`'${discriminant.wireValue}'`), php.codeblock("$data")]
                    })
                );
            });

            writer.controlFlow("if", arrayKeyDoesNotExist);
            writer.writeNodeStatement(
                this.getErrorThrow(this.getDeserializationArrayKeyExistsErrorMessage(discriminant))
            );
            writer.endControlFlow();
            writer.writeTextStatement(
                `${this.context.getVariableName(discriminant.name)} = $data['${discriminant.wireValue}']`
            );
            const typeCheck = this.getTypeCheck(
                php.codeblock(this.context.getVariableName(discriminant.name)),
                php.Type.string()
            );

            if (typeCheck == null) {
                throw new Error("Attempted to get type check for string and got null; this is impossible");
            }

            const isNotType = php.codeblock((_writer) => {
                _writer.write("!");
                _writer.write("(");
                _writer.writeNode(typeCheck);
                _writer.write(")");
            });

            writer.writeNode(
                php.codeblock((_writer) => {
                    _writer.controlFlow("if", isNotType);
                    _writer.writeNodeStatement(
                        this.getErrorThrow(this.getDeserliazationTypeCheckErrorMessage(discriminant, "string"))
                    );
                    _writer.endControlFlow();
                })
            );

            writer.writeLine();
        });
    }

    private jsonDeserializeDefaultHandler(): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeTextStatement("$args['value'] = $data");
        });
    }

    private jsonDeserializeCaseHandler(variant: SingleUnionType): php.CodeBlock {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return php.codeblock((writer) => {
                    writer.writeTextStatement(
                        `$args['${this.unionTypeDeclaration.discriminant.wireValue}'] = '${variant.discriminantValue.wireValue}'`
                    );

                    const type = this.getReturnType(variant);
                    if (type.internalType.type !== "reference") {
                        throw new Error("samePropertiesAsObject must be a reference type.");
                    }

                    writer.write(`$args['${variant.discriminantValue.wireValue}'] = `);
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "jsonDeserialize",
                            arguments_: [php.codeblock("$data")],
                            static_: true,
                            on: type.getClassReference()
                        })
                    );
                    writer.writeTextStatement("break");
                });
            case "singleProperty":
                return php.codeblock((writer) => {
                    writer.writeTextStatement(
                        `$args['${this.unionTypeDeclaration.discriminant.wireValue}'] = '${variant.discriminantValue.wireValue}'`
                    );

                    const arrayKeyDoesNotExist = php.codeblock((_writer) => {
                        _writer.write("!");
                        _writer.writeNode(
                            php.invokeMethod({
                                method: "array_key_exists",
                                arguments_: [
                                    php.codeblock(`'${variant.discriminantValue.wireValue}'`),
                                    php.codeblock("$data")
                                ]
                            })
                        );
                    });

                    writer.controlFlow("if", arrayKeyDoesNotExist);
                    writer.writeNodeStatement(
                        this.getErrorThrow(this.getDeserializationArrayKeyExistsErrorMessage(variant.discriminantValue))
                    );
                    writer.endControlFlow();

                    writer.writeLine();

                    writer.writeNode(this.jsonDeserializeTypeCall(variant, this.getReturnType(variant)));

                    writer.writeTextStatement("break");
                });
            case "noProperties":
                return php.codeblock((writer) => {
                    writer.writeTextStatement(
                        `$args['${this.unionTypeDeclaration.discriminant.wireValue}'] = '${variant.discriminantValue.wireValue}'`
                    );
                    writer.writeTextStatement("$args['value'] = null");
                    writer.writeTextStatement("break");
                });
            default:
                return php.codeblock((writer) => {
                    writer.writeTextStatement("break");
                });
        }
    }

    private jsonDeserializeTypeCall(variant: SingleUnionType, type: php.Type): php.CodeBlock {
        const discriminantGetter = php.codeblock(`$data['${variant.discriminantValue.wireValue}']`);
        const typeCheck = this.getTypeCheck(discriminantGetter, php.Type.string());

        if (typeCheck == null) {
            throw new Error("Type check should never be null for string");
        }

        switch (type.internalType.type) {
            case "reference":
                return php.codeblock((writer) => {
                    const typeCheck = this.getTypeCheck(discriminantGetter, php.Type.array(php.Type.mixed()));

                    if (typeCheck == null) {
                        throw new Error("Attempted to get type check for array and got null; this is impossible");
                    }

                    const isNotType = php.codeblock((_writer) => {
                        _writer.write("!");
                        _writer.write("(");
                        _writer.writeNode(typeCheck);
                        _writer.write(")");
                    });

                    writer.writeNode(
                        php.codeblock((_writer) => {
                            _writer.controlFlow("if", isNotType);
                            _writer.writeNodeStatement(
                                this.getErrorThrow(
                                    this.getDeserliazationTypeCheckErrorMessage(variant.discriminantValue, "array")
                                )
                            );
                            _writer.endControlFlow();
                        })
                    );

                    writer.write(`$args['${variant.discriminantValue.wireValue}'] = `);
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: "jsonDeserialize",
                            arguments_: [discriminantGetter],
                            static_: true,
                            on: type.getClassReference()
                        })
                    );
                });

            case "optional":
                return php.codeblock((writer) => {
                    if (type.underlyingType().internalType.type === "reference") {
                        writer.controlFlow(
                            "if",
                            php.invokeMethod({
                                method: "is_null",
                                arguments_: [discriminantGetter],
                                static_: true
                            })
                        );
                        writer.writeTextStatement(`$args['${variant.discriminantValue.wireValue}'] = null`);
                        writer.alternativeControlFlow("else");
                    }

                    writer.writeNode(this.jsonDeserializeTypeCall(variant, type.underlyingType()));

                    if (type.underlyingType().internalType.type === "reference") {
                        writer.endControlFlow();
                    }
                });

            case "date":
            case "dateTime":
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
                return php.codeblock((writer) => {
                    writer.write(`$args['${variant.discriminantValue.wireValue}'] = `);
                    writer.writeNodeStatement(discriminantGetter);
                });
        }
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
                writer.write(`'${variant.discriminantValue.wireValue}'`);
                writer.writeLine(":");
                writer.indent();
                writer.writeNode(caseMapper(variant));
                writer.dedent();
            }

            writer.writeLine("case '_unknown':");
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
