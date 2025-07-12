import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { STATIC, rust } from "@fern-api/rust-codegen";

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

export class UnionGenerator extends FileGenerator<RustFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: rust.StructReference;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionTypeDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.rustTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    public doGenerate(): RustFile {
        const clazz = rust.dataClass({
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

        return new RustFile({
            struct: clazz,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    private discriminantGetter(): rust.CodeBlock {
        const discriminant = this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name);
        return rust.codeblock("$this->" + discriminant);
    }

    private valueGetter(): rust.CodeBlock {
        return rust.codeblock("$this->value");
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

    private getDiscriminantField(): rust.Field {
        const discriminantValues = [];
        this.unionTypeDeclaration.types.forEach((variant) =>
            discriminantValues.push(variant.discriminantValue.wireValue)
        );
        discriminantValues.push("_unknown");
        return rust.field({
            name: this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name),
            type: rust.Type.union(discriminantValues.map((value) => rust.Type.literalString(value))),
            access: this.context.getPropertyAccess(),
            readonly_: true
        });
    }

    private getValueField(): rust.Field {
        const types: rust.Type[] = [];

        for (const variant of this.unionTypeDeclaration.types) {
            types.push(this.getReturnType(variant));
        }

        types.push(rust.Type.mixed());

        return rust.field({
            name: this.getValueName().camelCase.safeName,
            type: rust.Type.union(types),
            access: this.context.getPropertyAccess(),
            readonly_: true
        });
    }

    private toField({ property, inherited }: { property: ObjectProperty; inherited?: boolean }): rust.Field {
        const convertedType = this.context.rustTypeMapper.convert({ reference: property.valueType });
        return rust.field({
            type: convertedType,
            name: this.context.getPropertyName(property.name.name),
            access: this.context.getPropertyAccess(),
            docs: property.docs,
            attributes: this.context.rustAttributeMapper.convert({
                type: convertedType,
                property
            }),
            inherited
        });
    }

    private staticConstructor(variant: SingleUnionType): rust.Method {
        return rust.method({
            name: this.context.getPropertyName(variant.discriminantValue.name),
            access: "public",
            parameters: this.getStaticConstructorParameters(variant),
            return_: rust.Type.reference(this.classReference),
            body: this.getStaticConstructorBody(variant),
            static_: true
        });
    }

    private getStaticConstructorParameters(variant: SingleUnionType): rust.Parameter[] {
        const parameters: rust.Parameter[] = [];

        for (const property of this.unionTypeDeclaration.baseProperties) {
            parameters.push(
                rust.parameter({
                    name: this.context.getPropertyName(property.name.name),
                    type: this.context.rustTypeMapper.convert({ reference: property.valueType })
                })
            );
        }

        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
            case "singleProperty":
                parameters.push(
                    rust.parameter({
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
        return rust.codeblock((writer) => {
            const constructorArgs: rust.Map.Entry[] = [];

            for (const property of this.unionTypeDeclaration.baseProperties) {
                constructorArgs.push({
                    key: rust.codeblock(`'${this.context.getPropertyName(property.name.name)}'`),
                    value: rust.codeblock(this.context.getVariableName(property.name.name))
                });
            }

            constructorArgs.push({
                key: rust.codeblock(`'${this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name)}'`),
                value: rust.codeblock(`'${variant.discriminantValue.wireValue}'`)
            });

            switch (variant.shape.propertiesType) {
                case "samePropertiesAsObject":
                case "singleProperty":
                    constructorArgs.push({
                        key: rust.codeblock(`'${this.getValueFieldName()}'`),
                        value: rust.codeblock(this.context.getVariableName(variant.discriminantValue.name))
                    });
                    break;
                case "noProperties":
                    constructorArgs.push({
                        key: rust.codeblock(`'${this.getValueFieldName()}'`),
                        value: rust.codeblock("null")
                    });
                    break;
                default:
                    assertNever(variant.shape);
            }

            const constructorCall = rust.instantiateStruct({
                structReference: this.classReference,
                arguments_: [rust.map({ entries: constructorArgs, multiline: true })]
            });

            writer.write("return ");
            writer.writeNodeStatement(constructorCall);
        });
    }

    private isMethod(variant: SingleUnionType): rust.Method {
        const methodName = "is" + variant.discriminantValue.name.pascalCase.safeName;

        return rust.method({
            name: methodName,
            access: "public",
            parameters: [],
            return_: rust.Type.bool(),
            body: rust.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(this.isMethodCheck(variant));
            })
        });
    }

    private asCastMethod(variant: SingleUnionType): rust.Method | null {
        if (variant.shape.propertiesType === "noProperties") {
            return null;
        }

        const methodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        const returnType = this.getReturnType(variant);

        const typeCheckConditional = this.getTypeCheckConditional(variant, this.valueGetter());

        const body = rust.codeblock((writer) => {
            if (typeCheckConditional) {
                writer.writeNode(typeCheckConditional);
                writer.writeLine();
            }

            writer.write("return ");
            writer.writeNodeStatement(this.valueGetter());
        });

        return rust.method({
            name: methodName,
            access: "public",
            parameters: [],
            return_: returnType,
            body
        });
    }

    private getReturnType(variant: SingleUnionType): rust.Type {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return rust.Type.reference(this.context.rustTypeMapper.convertToClassReference(variant.shape));
            case "singleProperty":
                return this.context.rustTypeMapper.convert({ reference: variant.shape.type });
            case "noProperties":
                return rust.Type.null();
            default:
                assertNever(variant.shape);
        }
    }

    private getTypeCheckConditional(variant: SingleUnionType, variableGetter: rust.CodeBlock): rust.CodeBlock | null {
        const negation = rust.codeblock((writer) => {
            writer.write("!");
            writer.write("(");
            writer.writeNode(this.isMethodCheck(variant));
            writer.write(")");
        });

        return rust.codeblock((writer) => {
            writer.controlFlow("if", negation);
            writer.writeNodeStatement(
                this.getErrorThrow(this.getVariantTypeCheckErrorMessage(variant, variableGetter))
            );
            writer.endControlFlow();
        });
    }

    private isMethodCheck(variant: SingleUnionType): rust.CodeBlock {
        const discriminantCheck = this.getDiscriminantCheck(this.discriminantGetter(), variant);
        const typeCheck = this.getTypeCheck(this.valueGetter(), this.getReturnType(variant));

        return rust.codeblock((writer) => {
            if (typeCheck) {
                writer.writeNode(typeCheck);
                writer.write("&& ");
            }

            writer.writeNode(discriminantCheck);
        });
    }

    private getErrorThrow(errorMessage: rust.CodeBlock): rust.CodeBlock {
        return rust.codeblock((writer) => {
            writer.writeNode(
                rust.throwException({
                    structReference: this.context.getExceptionClassReference(),
                    arguments_: [
                        rust.codeblock((writer) => {
                            writer.writeNode(errorMessage);
                        })
                    ],
                    multiline: true
                })
            );
        });
    }

    private getVariantTypeCheckErrorMessage(variant: SingleUnionType, variableGetter: rust.CodeBlock): rust.CodeBlock {
        return rust.codeblock((writer) => {
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
                rust.invokeMethod({
                    method: "get_debug_type",
                    arguments_: [variableGetter],
                    static_: true
                })
            );
        });
    }

    private getDeserializationArrayKeyExistsErrorMessage(propertyName: NameAndWireValue): rust.CodeBlock {
        return rust.codeblock(`"JSON data is missing property '${propertyName.wireValue}'"`);
    }

    private getDeserializationTypeCheckErrorMessage(propertyName: NameAndWireValue, type: rust.Type): rust.CodeBlock {
        return rust.codeblock((writer) => {
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
                rust.invokeMethod({
                    method: "get_debug_type",
                    arguments_: [rust.codeblock(`$data['${propertyName.wireValue}']`)],
                    static_: true
                })
            );
        });
    }

    private getDiscriminantCheck(variableGetter: rust.CodeBlock, variant: SingleUnionType): rust.CodeBlock {
        return rust.codeblock((writer) => {
            writer.writeNode(variableGetter);
            writer.write(" === ");
            writer.write(`'${variant.discriminantValue.wireValue}'`);
        });
    }

    private getTypeCheck(variableGetter: rust.CodeBlock, type: rust.Type): rust.CodeBlock {
        switch (type.internalType.type) {
            case "int":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
                            method: "is_int",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "string":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
                            method: "is_string",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "bool":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
                            method: "is_bool",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );
            case "float":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
                            method: "is_float",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );

            case "object":
            case "map":
            case "array":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
                            method: "is_array",
                            arguments_: [variableGetter],
                            static_: true
                        })
                    )
                );

            case "null":
            case "mixed":
                return rust.codeblock((writer) =>
                    writer.writeNode(
                        rust.invokeMethod({
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
                return rust.codeblock((writer) => {
                    writer.writeNode(variableGetter);
                    writer.write(" instanceof ");
                    writer.writeNode(type.getClassReference());
                });

            case "optional":
                return rust.codeblock((writer) => {
                    if (
                        type.underlyingType().internalType.type === "null" ||
                        type.underlyingType().internalType.type === "mixed"
                    ) {
                        writer.writeNode(
                            rust.invokeMethod({
                                method: "is_null",
                                arguments_: [variableGetter],
                                static_: true
                            })
                        );
                    } else {
                        writer.write("(");
                        writer.writeNode(
                            rust.invokeMethod({
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
                const checks: rust.CodeBlock[] = type.internalType.types.map((item, index) => {
                    return rust.codeblock((writer) => {
                        if (index > 0) {
                            writer.write("|| ");
                        }
                        writer.writeNode(this.getTypeCheck(variableGetter, item));
                    });
                });
                return rust.codeblock((writer) => {
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
                return rust.codeblock((writer) => {
                    writer.writeNode(variableGetter);
                    writer.write(" === ");
                    writer.writeNode(literalValue);
                });
            }
            default:
                assertNever(type.internalType);
        }
    }

    private jsonSerializeMethod(): rust.Method {
        return rust.method({
            name: "jsonSerialize",
            access: "public",
            parameters: [],
            return_: rust.Type.array(rust.Type.mixed()),
            body: rust.codeblock((writer) => {
                writer.writeTextStatement("$result = []");
                writer.writeNodeStatement(
                    rust.codeblock((_writer) => {
                        _writer.write(`$result['${this.unionTypeDeclaration.discriminant.wireValue}'] = `);
                        _writer.writeNode(this.discriminantGetter());
                    })
                );

                writer.writeLine();

                writer.writeNodeStatement(
                    rust.codeblock((_writer) => {
                        _writer.write("$base = ");
                        _writer.writeNode(
                            rust.invokeMethod({
                                method: "jsonSerialize",
                                arguments_: [],
                                static_: true,
                                on: rust.codeblock("parent")
                            })
                        );
                    })
                );
                writer.writeNodeStatement(
                    rust.codeblock((_writer) => {
                        _writer.write("$result = ");
                        _writer.writeNode(
                            rust.invokeMethod({
                                method: "array_merge",
                                arguments_: [rust.codeblock("$base"), rust.codeblock("$result")],
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

    private jsonSerializeCaseHandler(variant: SingleUnionType): rust.CodeBlock {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return rust.codeblock((writer) => {
                    const type = this.getReturnType(variant);
                    writer.writeNode(this.jsonSerializeValueCall({ variant, type }));
                    writer.writeNode(this.jsonSerializeMaybeArrayMerge(variant, type));
                    writer.writeTextStatement("break");
                });
            case "singleProperty":
                return rust.codeblock((writer) => {
                    writer.writeNode(this.jsonSerializeValueCall({ variant, type: this.getReturnType(variant) }));
                    writer.writeNodeStatement(
                        rust.codeblock((_writer) => {
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
                return rust.codeblock((writer) => {
                    writer.writeTextStatement(`$result['${variant.discriminantValue.wireValue}'] = []`);
                    writer.writeTextStatement("break");
                });
            default:
                assertNever(variant.shape);
        }
    }

    private jsonSerializeMaybeArrayMerge(variant: SingleUnionType, type: rust.Type): rust.CodeBlock {
        const asCastMethodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        switch (type.internalType.type) {
            case "reference":
            case "object":
            case "map":
            case "array":
                return rust.codeblock((writer) => {
                    writer.write("$result = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "array_merge",
                            arguments_: [rust.codeblock("$value"), rust.codeblock("$result")],
                            static_: true
                        })
                    );
                });

            case "optional":
                return rust.codeblock((writer) => {
                    writer.write(asCastMethodName);
                    writer.write(" = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: asCastMethodName,
                            arguments_: [],
                            on: rust.codeblock("$this")
                        })
                    );
                    writer.controlFlow(
                        "if",
                        rust.invokeMethod({
                            method: "is_array",
                            arguments_: [rust.codeblock(asCastMethodName)],
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
                return rust.codeblock((writer) => {
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
        type: rust.Type;
    }): rust.CodeBlock {
        const asCastMethodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        let argument: rust.AstNode = rust.invokeMethod({
            method: asCastMethodName,
            arguments_: [],
            static_: false,
            on: rust.codeblock("$this")
        });
        switch (type.internalType.type) {
            case "date":
                if (declaredVariableName != null) {
                    argument = rust.codeblock(declaredVariableName);
                }
                return rust.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "serializeDate",
                            arguments_: [argument],
                            static_: true,
                            on: this.context.getJsonSerializerClassReference()
                        })
                    );
                });

            case "dateTime":
                if (declaredVariableName != null) {
                    argument = rust.codeblock(declaredVariableName);
                }
                return rust.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "serializeDateTime",
                            arguments_: [argument],
                            static_: true,
                            on: this.context.getJsonSerializerClassReference()
                        })
                    );
                });

            case "reference":
                if (declaredVariableName != null) {
                    argument = rust.codeblock(declaredVariableName);
                }
                return rust.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "jsonSerialize",
                            arguments_: [],
                            static_: false,
                            on: argument
                        })
                    );
                });

            case "optional":
                return rust.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: asCastMethodName,
                            arguments_: [],
                            on: rust.codeblock("$this")
                        })
                    );

                    if (this.typeSerializationNeedsAdditionalCall(type.underlyingType())) {
                        writer.controlFlow(
                            "if",
                            rust.codeblock((_writer) => {
                                _writer.write("!");
                                _writer.writeNode(
                                    rust.invokeMethod({
                                        method: "is_null",
                                        arguments_: [rust.codeblock("$value")],
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
                return rust.codeblock((writer) => {
                    writer.write("$value = ");
                    writer.writeNodeStatement(this.valueGetter());
                });
            default:
                assertNever(type.internalType);
        }
    }

    private typeSerializationNeedsAdditionalCall(type: rust.Type) {
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

    private jsonSerializeDefaultHandler(): rust.CodeBlock {
        return rust.codeblock((writer) => {
            writer.controlFlow(
                "if",
                rust.invokeMethod({
                    method: "is_null",
                    arguments_: [this.valueGetter()],
                    static_: true
                })
            );
            writer.writeTextStatement("break");
            writer.endControlFlow();

            writer.controlFlow(
                "if",
                rust.codeblock((_writer) => {
                    _writer.writeNode(this.valueGetter());
                    _writer.write(" instanceof ");
                    _writer.writeNode(rust.structReference(this.context.getJsonSerializableTypeClassReference()));
                })
            );
            writer.write("$value = ");
            writer.writeNodeStatement(
                rust.invokeMethod({
                    method: "jsonSerialize",
                    arguments_: [],
                    static_: false,
                    on: this.valueGetter()
                })
            );
            writer.writeNodeStatement(
                rust.codeblock((_writer) => {
                    _writer.write("$result = ");
                    _writer.writeNode(
                        rust.invokeMethod({
                            method: "array_merge",
                            arguments_: [rust.codeblock("$value"), rust.codeblock("$result")],
                            static_: true
                        })
                    );
                })
            );

            writer.contiguousControlFlow(
                "elseif",
                rust.invokeMethod({
                    method: "is_array",
                    arguments_: [this.valueGetter()],
                    static_: true
                })
            );
            writer.writeNodeStatement(
                rust.codeblock((_writer) => {
                    _writer.write("$result = ");
                    _writer.writeNode(
                        rust.invokeMethod({
                            method: "array_merge",
                            arguments_: [this.valueGetter(), rust.codeblock("$result")],
                            static_: true
                        })
                    );
                })
            );

            writer.endControlFlow();
        });
    }

    private fromJsonMethod(): rust.Method {
        return rust.method({
            name: "fromJson",
            access: "public",
            parameters: [
                rust.parameter({
                    name: "json",
                    type: rust.Type.string()
                })
            ],
            return_: STATIC,
            body: rust.codeblock((writer) => {
                writer.write("$decodedJson = ");
                writer.writeNodeStatement(
                    rust.invokeMethod({
                        method: "decode",
                        arguments_: [rust.codeblock("$json")],
                        static_: true,
                        on: this.context.getJsonDecoderClassReference()
                    })
                );

                const negation = rust.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.writeNode(
                        rust.invokeMethod({
                            method: "is_array",
                            arguments_: [rust.codeblock("$decodedJson")],
                            static_: true
                        })
                    );
                });
                writer.controlFlow("if", negation);
                writer.writeNodeStatement(
                    rust.throwException({
                        structReference: this.context.getExceptionClassReference(),
                        arguments_: [rust.codeblock('"Unexpected non-array decoded type: " . gettype($decodedJson)')]
                    })
                );
                writer.endControlFlow();
                writer.write("return ");
                writer.writeNodeStatement(
                    rust.invokeMethod({
                        method: "jsonDeserialize",
                        arguments_: [rust.codeblock("$decodedJson")],
                        static_: true,
                        on: rust.codeblock("self")
                    })
                );
            }),
            static_: true
        });
    }

    private jsonDeserializeMethod(): rust.Method {
        const discriminantPropertyName = this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name);
        const discriminantVariableName = this.context.getVariableName(this.unionTypeDeclaration.discriminant.name);
        const body: rust.CodeBlock = rust.codeblock((writer) => {
            writer.writeTextStatement("$args = []");
            writer.writeNode(this.jsonDeserializeBaseProperties());
            writer.writeNode(this.jsonDeserializeCheckDiscriminant());

            writer.writeTextStatement(`$args['${discriminantPropertyName}'] = ${discriminantVariableName}`);
            writer.writeNode(
                this.variantSwitchStatement(
                    rust.codeblock(discriminantVariableName),
                    (variant) => this.jsonDeserializeCaseHandler(variant),
                    this.jsonDeserializeDefaultHandler()
                )
            );
            writer.writeLine();
            writer.writeLine("// @phpstan-ignore-next-line");
            writer.writeTextStatement("return new static($args)");
        });

        return rust.method({
            name: "jsonDeserialize",
            access: "public",
            parameters: [
                rust.parameter({
                    name: "data",
                    type: rust.Type.map(rust.Type.string(), rust.Type.mixed())
                })
            ],
            return_: STATIC,
            body,
            classReference: this.classReference,
            static_: true
        });
    }

    private jsonDeserializeBaseProperties(): rust.CodeBlock {
        return rust.codeblock((writer) => {
            for (const property of this.unionTypeDeclaration.baseProperties) {
                const arrayKeyDoesNotExist = rust.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.writeNode(
                        rust.invokeMethod({
                            method: "array_key_exists",
                            arguments_: [rust.codeblock(`'${property.name.wireValue}'`), rust.codeblock("$data")]
                        })
                    );
                });

                writer.controlFlow("if", arrayKeyDoesNotExist);
                writer.writeNodeStatement(
                    this.getErrorThrow(this.getDeserializationArrayKeyExistsErrorMessage(property.name))
                );
                writer.endControlFlow();

                const type = this.context.rustTypeMapper.convert({ reference: property.valueType });
                const typeCheck = this.getTypeCheck(rust.codeblock(`$data['${property.name.wireValue}']`), type);

                const isNotType = rust.codeblock((_writer) => {
                    _writer.write("!");
                    _writer.write("(");
                    _writer.writeNode(typeCheck);
                    _writer.write(")");
                });

                writer.writeNode(
                    rust.codeblock((_writer) => {
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

    private jsonDeserializeCheckDiscriminant(): rust.CodeBlock {
        const discriminant: NameAndWireValue = this.unionTypeDeclaration.discriminant;
        return rust.codeblock((writer) => {
            const arrayKeyDoesNotExist = rust.codeblock((_writer) => {
                _writer.write("!");
                _writer.writeNode(
                    rust.invokeMethod({
                        method: "array_key_exists",
                        arguments_: [rust.codeblock(`'${discriminant.wireValue}'`), rust.codeblock("$data")]
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
                rust.codeblock(this.context.getVariableName(discriminant.name)),
                rust.Type.string()
            );

            const isNotType = rust.codeblock((_writer) => {
                _writer.write("!");
                _writer.write("(");
                _writer.writeNode(typeCheck);
                _writer.write(")");
            });

            writer.writeNode(
                rust.codeblock((_writer) => {
                    _writer.controlFlow("if", isNotType);
                    _writer.writeNodeStatement(
                        this.getErrorThrow(
                            this.getDeserializationTypeCheckErrorMessage(discriminant, rust.Type.string())
                        )
                    );
                    _writer.endControlFlow();
                })
            );

            writer.writeLine();
        });
    }

    private jsonDeserializeDefaultHandler(): rust.CodeBlock {
        return rust.codeblock((writer) => {
            writer.writeTextStatement(
                `$args['${this.context.getPropertyName(this.unionTypeDeclaration.discriminant.name)}'] = '_unknown'`
            );
            writer.writeTextStatement(`$args['${this.getValueFieldName()}'] = $data`);
        });
    }

    private jsonDeserializeCaseHandler(variant: SingleUnionType): rust.CodeBlock {
        switch (variant.shape.propertiesType) {
            case "samePropertiesAsObject":
                return rust.codeblock((writer) => {
                    const type = this.getReturnType(variant);
                    if (type.internalType.type !== "reference") {
                        throw new Error("samePropertiesAsObject must be a reference type.");
                    }

                    writer.write(`$args['${this.getValueFieldName()}'] = `);
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "jsonDeserialize",
                            arguments_: [rust.codeblock("$data")],
                            static_: true,
                            on: type.getClassReference()
                        })
                    );
                    writer.writeTextStatement("break");
                });
            case "singleProperty":
                return rust.codeblock((writer) => {
                    const arrayKeyDoesNotExist = rust.codeblock((_writer) => {
                        _writer.write("!");
                        _writer.writeNode(
                            rust.invokeMethod({
                                method: "array_key_exists",
                                arguments_: [
                                    rust.codeblock(`'${variant.discriminantValue.wireValue}'`),
                                    rust.codeblock("$data")
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
                return rust.codeblock((writer) => {
                    writer.writeTextStatement(`$args['${this.getValueFieldName()}'] = null`);
                    writer.writeTextStatement("break");
                });
            default:
                assertNever(variant.shape);
        }
    }

    private jsonDeserializeTypeCall(variant: SingleUnionType, type: rust.Type): rust.CodeBlock {
        const discriminantGetter = rust.codeblock(`$data['${variant.discriminantValue.wireValue}']`);
        switch (type.internalType.type) {
            case "reference":
                return rust.codeblock((writer) => {
                    const typeCheck = this.getTypeCheck(discriminantGetter, rust.Type.array(rust.Type.mixed()));

                    const isNotType = rust.codeblock((_writer) => {
                        _writer.write("!");
                        _writer.write("(");
                        _writer.writeNode(typeCheck);
                        _writer.write(")");
                    });

                    writer.writeNode(
                        rust.codeblock((_writer) => {
                            _writer.controlFlow("if", isNotType);
                            _writer.writeNodeStatement(
                                this.getErrorThrow(
                                    this.getDeserializationTypeCheckErrorMessage(
                                        variant.discriminantValue,
                                        rust.Type.array(rust.Type.mixed())
                                    )
                                )
                            );
                            _writer.endControlFlow();
                        })
                    );

                    writer.write(`$args['${this.getValueFieldName()}'] = `);
                    writer.writeNodeStatement(
                        rust.invokeMethod({
                            method: "jsonDeserialize",
                            arguments_: [discriminantGetter],
                            static_: true,
                            on: type.getClassReference()
                        })
                    );
                });

            case "optional":
                return rust.codeblock((writer) => {
                    if (type.underlyingType().internalType.type === "reference") {
                        writer.controlFlow(
                            "if",
                            rust.invokeMethod({
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
                return rust.codeblock((writer) => {
                    writer.write(`$args['${this.getValueFieldName()}'] = `);
                    writer.writeNodeStatement(discriminantGetter);
                });
            default:
                assertNever(type.internalType);
        }
    }

    private variantSwitchStatement(
        variableGetter: rust.CodeBlock,
        caseMapper: (variant: SingleUnionType) => rust.CodeBlock,
        defaultHandler: rust.CodeBlock
    ): rust.CodeBlock {
        return rust.codeblock((writer) => {
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
