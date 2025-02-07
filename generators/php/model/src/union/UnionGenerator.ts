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
            const method = this.asCastMethod(type);
            if (method) {
                clazz.addMethod(method);
            }
        }

        clazz.addMethod(this.context.getToStringMethod());
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

    private asCastMethod(type: SingleUnionType): php.Method | null {
        if (type.shape.propertiesType === "noProperties") {
            return null;
        }

        const methodName = "as" + type.discriminantValue.name.pascalCase.safeName;
        const returnType = this.getReturnType(type);

        const typeCheckConditional = this.getTypeCheckConditional(php.codeblock("$this->value"), returnType);

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

    private getReturnType(type: SingleUnionType): php.Type {
        return type.shape._visit({
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

    private getTypeCheckConditional(variableGetter: php.CodeBlock, type: php.Type): php.CodeBlock | null {
        const typeCheck = this.getTypeCheck(variableGetter, type);

        if (typeCheck == null) {
            return null;
        }

        const negation = php.codeblock((writer) => {
            writer.write("!");
            writer.write("(");
            writer.writeNode(typeCheck);
            writer.write(")");
        });

        return php.codeblock((writer) => {
            writer.controlFlow("if", negation);
            writer.writeNodeStatement(this.getTypeCheckErrorThrow());
            writer.endControlFlow();
        });
    }

    private getTypeCheckErrorThrow(): php.CodeBlock {
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
                            writer.write('"');
                            writer.write(this.getTypeCheckErrorMessage());
                            writer.write('"');
                        })
                    ],
                    multiline: true
                })
            );
        });
    }

    private getTypeCheckErrorMessage(): string {
        // TODO(ajgateno): Customize this message to the real expected and received types.
        return "Unexpected value type";
    }

    private getTypeCheck(variableGetter: php.CodeBlock, type: php.Type): php.CodeBlock | null {
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

            case "typeDict":
            case "optional":
            case "enumString":
            case "union":
            default:
                return null;
        }
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
