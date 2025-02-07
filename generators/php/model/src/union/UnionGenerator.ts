import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { FileGenerator } from "@fern-api/php-codegen";
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

        for (const property of this.unionTypeDeclaration.baseProperties) {
            clazz.addField(this.toField({ property }));
        }

        const typeField = this.getTypeField();
        clazz.addField(typeField);

        const valueField = this.getValueField();
        clazz.addField(valueField);

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

    private getTypeField(): php.Field {
        // TODO(ajgateno): Actually add the literals as a union rather than just string
        return php.field({
            name: this.unionTypeDeclaration.discriminant.name.camelCase.safeName,
            type: php.Type.string(),
            access: "public",
            readonly_: true
        });
    }

    private getValueField(): php.Field {
        // TODO(ajgateno): Actually add the class references as a union rather than just mixed
        return php.field({
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
        const discriminantCheck = this.getDiscriminantCheck(php.codeblock("$this->type"), variant);
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
            writer.write("$this->type . ");
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
        return php.method({
            name: "jsonSerialize",
            access: "public",
            parameters: [],
            return_: php.Type.array(php.Type.mixed()),
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$result = []");
                writer.writeTextStatement('$result["type"] = $this->type');

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
                        php.codeblock("$this->type"),
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
                    writer.writeNodeStatement(
                        php.codeblock((_writer) => {
                            _writer.write("$value = ");
                            _writer.writeNode(this.jsonSerializeValueCall(variant));
                        })
                    );
                    writer.controlFlow(
                        "if",
                        php.invokeMethod({
                            method: "is_array",
                            arguments_: [php.codeblock("$value")],
                            static_: true
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
                    writer.alternativeControlFlow("else");
                    writer.writeNodeStatement(
                        php.codeblock((_writer) => {
                            _writer.write("$result");
                            _writer.write("['");
                            _writer.write(variant.discriminantValue.wireValue);
                            _writer.write("']");
                            _writer.write(" = $value");
                        })
                    );
                    writer.endControlFlow();
                    writer.writeTextStatement("break");
                });
            case "singleProperty":
                return php.codeblock((writer) => {
                    writer.writeNodeStatement(
                        php.codeblock((_writer) => {
                            _writer.write("$value = ");
                            _writer.writeNode(this.jsonSerializeValueCall(variant));
                        })
                    );
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

    private jsonSerializeValueCall(variant: SingleUnionType): php.MethodInvocation {
        const asCastMethodName = "as" + variant.discriminantValue.name.pascalCase.safeName;
        return php.invokeMethod({
            method: "serializeValue",
            arguments_: [
                php.invokeMethod({
                    method: asCastMethodName,
                    arguments_: [],
                    on: php.codeblock("$this")
                }),
                php.codeblock((__writer) => {
                    __writer.write('"');
                    __writer.writeNode(this.getReturnType(variant));
                    __writer.write('"');
                })
            ],
            static_: true,
            on: this.context.getJsonSerializerClassReference()
        });
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
