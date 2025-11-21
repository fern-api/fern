import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php, STATIC } from "@fern-api/php-codegen";

import {
    Name,
    NameAndWireValue,
    ObjectProperty,
    SingleUnionType,
    TypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { assertNever } from "../../../../../packages/commons/core-utils/src";
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
            parentClassReference: this.context.getJsonSerializableTypeClassReference(),
            constructorAccess: "private"
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
                    name: this.getValueName(),
                    field: valueField
                })
            );
        }

        for (const type of this.unionTypeDeclaration.types) {
            clazz.addMethod(this.staticConstructor(type));
        }

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
        const discriminant = this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name);
        return php.codeblock("$this->" + discriminant);
    }

    private valueGetter(): php.CodeBlock {
        return php.codeblock("$this->value");
    }

    private getValueName(): Name {
        // TODO(ajgateno): We'll want to disambiguate here if e.g. there's a "value" property
        return {
            originalName: "value",
            camelCase: { safeName: "value", unsafeName: "value" },
            pascalCase: { safeName: "Value", unsafeName: "Value" },
            snakeCase: { safeName: "value", unsafeName: "value" },
            screamingSnakeCase: { safeName: "VALUE", unsafeName: "VALUE" }
        };
    }

    private getValueFieldName(): string {
        return this.context.getFieldName(this.getValueName());
    }

    private getDiscriminantField(): php.Field {
        const discriminantValues = [];
        this.unionTypeDeclaration.types.forEach((variant) =>
            discriminantValues.push(variant.discriminantValue.wireValue)
        );
        discriminantValues.push("_unknown");
        return php.field({
            name: this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name),
            type: php.Type.union(discriminantValues.map((value) => php.Type.literalString(value))),
            access: this.context.getPropertyAccess(),
            readonly_: true
        });
    }

    private getValueField(): php.Field {
        const types: php.Type[] = [];

        for (const variant of this.unionTypeDeclaration.types) {
            types.push(this.getReturnType(variant));
        }

        types.push(php.Type.mixed());

        return php.field({
            name: this.getValueName().camelCase.safeName,
            type: php.Type.union(types),
            access: this.context.getPropertyAccess(),
            readonly_: true
        });
    }

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): php.Field {
        const convertedType = this.context.phpTypeMapper.convert({ reference: property.valueType });
        return php.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: this.context.getPropertyAccess(),
            docs: property.docs,
            attributes: this.context.phpAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
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
                break;
            default:
                assertNever(variant.shape);
        }

        return parameters;
    }

    private getStaticConstructorBody(variant: SingleUnionType) {
        return php.codeblock((writer) => {
            const constructorArgs: php.Map.Entry[] = [];

            for (const property of this.unionTypeDeclaration.baseProperties) {
                constructorArgs.push({
                    key: php.codeblock(`'${this.context.getPropertyName(property.name.name)}'`),
                    value: php.codeblock(this.context.getVariableName(property.name.name))
                });
            }

            constructorArgs.push({
                key: php.codeblock(`'${this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name)}'`),
                value: php.codeblock(`'${variant.discriminantValue.wireValue}'`)
            });

            switch (variant.shape.propertiesType) {
                case "samePropertiesAsObject":
                case "singleProperty":
                    constructorArgs.push({
                        key: php.codeblock(`'${this.getValueFieldName()}'`),
                        value: php.codeblock(this.context.getVariableName(variant.discriminantValue.name))
                    });
                    break;
                case "noProperties":
                    constructorArgs.push({
                        key: php.codeblock(`'${this.getValueFieldName()}'`),
                        value: php.codeblock("null")
                    });
                    break;
                default:
                    assertNever(variant.shape);
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

        const typeCheckConditional = this.getTypeCheckConditional(variant, this.valueGetter());

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
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return php.Type.reference(this.context.phpTypeMapper.convertToClassReference(variant.shape));
            case "singleProperty":
                return this.context.phpTypeMapper.convert({ reference: variant.shape.type });
            case "noProperties":
                return php.Type.null();
            default:
                assertNever(variant.shape);
        }
    }

    private getTypeCheckConditional(variant: SingleUnionType, variableGetter: php.CodeBlock): php.CodeBlock | null {
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
            writer.write(" with value of type ");
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
        return php.codeblock(`"JSON data is missing property '${propertyName.wireValue}'"`);
    }

    private getDeserializationTypeCheckErrorMessage(propertyName: NameAndWireValue, type: php.Type): php.CodeBlock {
        return php.codeblock((writer) => {
            if (type.internalType.type === "literal") {
                writer.write(
                    `"Expected property '${this.context.getPropertyName(propertyName.name)}' in JSON data to be `
                );
                writer.writeNode(type.internalType.value);
                writer.write(', instead received " . ');
            } else {
                writer.write(
                    `"Expected property '${this.context.getPropertyName(propertyName.name)}' in JSON data to be ${type.internalType.type}, instead received " . `
                );
            }
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

    private getTypeCheck(variableGetter: php.CodeBlock, type: php.Type): php.CodeBlock {
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
            case "enumString":
            case "reference":
                return php.codeblock((writer) => {
                    writer.writeNode(variableGetter);
                    writer.write(" instanceof ");
                    writer.writeNode(type.getClassReference());
                });

            case "optional":
                return php.codeblock((writer) => {
                    if (
                        type.underlyingType().internalType.type === "null" ||
                        type.underlyingType().internalType.type === "mixed"
                    ) {
                        writer.writeNode(
                            php.invokeMethod({
                                method: "is_null",
                                arguments_: [variableGetter],
                                static_: true
                            })
                        );
                    } else {
                        writer.write("(");
                        writer.writeNode(
                            php.invokeMethod({
                                method: "is_null",
                                arguments_: [variableGetter],
                                static_: true
                            })
                        );
                        writer.write(" || ");
                        writer.writeNode(this.getTypeCheck(variableGetter, type.underlyingType()));
                        writer.write(")");
                    }
                });

            case "typeDict":
                throw new Error(
                    "Cannot get type check for type dict value because properties should never be typeDicts"
                );
            case "union": {
                const checks: php.CodeBlock[] = type.internalType.types.map((item, index) => {
                    return php.codeblock((writer) => {
                        if (index > 0) {
                            writer.write("|| ");
                        }
                        writer.writeNode(this.getTypeCheck(variableGetter, item));
                    });
                });
                return php.codeblock((writer) => {
                    if (checks.length > 1) {
                        writer.write("(");
                    }

                    checks.forEach((check) => writer.writeNode(check));

                    if (checks.length > 1) {
                        writer.write(")");
                    }
                });
            }
            case "literal": {
                const literalValue = type.internalType.value;
                return php.codeblock((writer) => {
                    writer.writeNode(variableGetter);
                    writer.write(" === ");
                    writer.writeNode(literalValue);
                });
            }
            default:
                assertNever(type.internalType);
        }
    }

    private jsonSerializeMethod(): php.Method {
        return php.method({
            name: "jsonSerialize",
            access: "public",
            parameters: [],
            return_: php.Type.array(php.Type.mixed()),
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$result = []");
                writer.writeNodeStatement(
                    php.codeblock((_writer) => {
                        _writer.write(`$result['${this.unionTypeDeclaration.discriminant.wireValue}'] = `);
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
                return php.codeblock((writer) => {
                    writer.writeTextStatement(`$result['${variant.discriminantValue.wireValue}'] = []`);
                    writer.writeTextStatement("break");
                });
            default:
                assertNever(variant.shape);
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
            case "literal":
                return php.codeblock((writer) => {
                    writer.write("$result");
                    writer.write("['");
                    writer.write(variant.discriminantValue.wireValue);
                    writer.write("']");
                    writer.writeTextStatement(" = $value");
                });
            default:
                assertNever(type.internalType);
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
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        php.invokeMethod({
                            method: asCastMethodName,
                            arguments_: [],
                            on: php.codeblock("$this")
                        })
                    );

                    if (this.typeSerializationNeedsAdditionalCall(type.underlyingType())) {
                        writer.controlFlow(
                            "if",
                            php.codeblock((_writer) => {
                                _writer.write("!");
                                _writer.writeNode(
                                    php.invokeMethod({
                                        method: "is_null",
                                        arguments_: [php.codeblock("$value")],
                                        static_: true
                                    })
                                );
                            })
                        );
                        writer.writeNode(
                            this.jsonSerializeValueCall({
                                declaredVariableName: "$value",
                                variant,
                                type: type.underlyingType()
                            })
                        );
                        writer.endControlFlow();
                    }
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
            case "literal":
                return php.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(this.valueGetter());
                });
            default:
                assertNever(type.internalType);
        }
    }

    private typeSerializationNeedsAdditionalCall(type: php.Type) {
        switch (type.internalType.type) {
            case "date":
            case "dateTime":
            case "reference":
            case "optional":
                return true;
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
            case "literal":
                return false;
            default:
                assertNever(type.internalType);
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
        const discriminantPropertyName = this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name);
        const discriminantVariableName = this.context.getVariableName(this.unionTypeDeclaration.discriminant.name);
        const body: php.CodeBlock = php.codeblock((writer) => {
            writer.writeTextStatement("$args = []");
            writer.writeNode(this.jsonDeserializeBaseProperties());
            writer.writeNode(this.jsonDeserializeCheckDiscriminant());

            writer.writeTextStatement(`$args['${discriminantPropertyName}'] = ${discriminantVariableName}`);
            writer.writeNode(
                this.variantSwitchStatement(
                    php.codeblock(discriminantVariableName),
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
                            this.getErrorThrow(this.getDeserializationTypeCheckErrorMessage(property.name, type))
                        );
                        _writer.endControlFlow();
                    })
                );

                writer.writeTextStatement(
                    `$args['${this.context.getPropertyName(property.name.name)}'] = $data['${property.name.wireValue}']`
                );

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
                            this.getDeserializationTypeCheckErrorMessage(discriminant, php.Type.string())
                        )
                    );
                    _writer.endControlFlow();
                })
            );

            writer.writeLine();
        });
    }

    private jsonDeserializeDefaultHandler(): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeTextStatement(
                `$args['${this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name)}'] = '_unknown'`
            );
            writer.writeTextStatement(`$args['${this.getValueFieldName()}'] = $data`);
        });
    }

    private jsonDeserializeCaseHandler(variant: SingleUnionType): php.CodeBlock {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return php.codeblock((writer) => {
                    const type = this.getReturnType(variant);
                    if (type.internalType.type !== "reference") {
                        throw new Error("samePropertiesAsObject must be a reference type.");
                    }

                    writer.write(`$args['${this.getValueFieldName()}'] = `);
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
                    writer.writeTextStatement(`$args['${this.getValueFieldName()}'] = null`);
                    writer.writeTextStatement("break");
                });
            default:
                assertNever(variant.shape);
        }
    }

    private jsonDeserializeTypeCall(variant: SingleUnionType, type: php.Type): php.CodeBlock {
        const discriminantGetter = php.codeblock(`$data['${variant.discriminantValue.wireValue}']`);
        switch (type.internalType.type) {
            case "reference":
                return php.codeblock((writer) => {
                    const typeCheck = this.getTypeCheck(discriminantGetter, php.Type.array(php.Type.mixed()));

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
                                    this.getDeserializationTypeCheckErrorMessage(
                                        variant.discriminantValue,
                                        php.Type.array(php.Type.mixed())
                                    )
                                )
                            );
                            _writer.endControlFlow();
                        })
                    );

                    writer.write(`$args['${this.getValueFieldName()}'] = `);
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
                        writer.writeTextStatement(`$args['${this.getValueFieldName()}'] = null`);
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
            case "literal":
                return php.codeblock((writer) => {
                    writer.write(`$args['${this.getValueFieldName()}'] = `);
                    writer.writeNodeStatement(discriminantGetter);
                });
            default:
                assertNever(type.internalType);
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

    protected getLogLabel(): string {
        const dir = this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
        return dir ? `${dir}/${this.classReference.name}` : this.classReference.name;
    }
}
