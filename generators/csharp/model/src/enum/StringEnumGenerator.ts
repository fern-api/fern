import { getWireValue } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class StringEnumGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly classReference: ast.ClassReference;
    private readonly customMethodName: string;
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);

        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
        this.customMethodName = this.getCustomMethodName(enumDeclaration);
    }

    private getCustomMethodName(enumDeclaration: EnumTypeDeclaration): string {
        const d = "FromCustom";
        return enumDeclaration.values.some((v) => this.case.pascalSafe(v.name) === d) ? "FromCustom_" : d;
    }

    protected doGenerate(): CSharpFile {
        // Create the serializer origin for the nested serializer class
        const serializerOrigin = this.model.explicit(this.typeDeclaration, `${this.classReference.name}Serializer`);

        const stringEnum = this.csharp.class_({
            reference: this.classReference,
            interfaceReferences: [this.Types.IStringEnum],
            annotations: [
                this.csharp.annotation({
                    reference: this.System.Text.Json.Serialization.JsonConverter(),
                    argument: this.csharp.codeblock((writer: Writer) => {
                        // Use the same pattern as UnionGenerator: write enclosing type + ".NestedClassName"
                        writer.write("typeof(");
                        writer.writeNode(this.classReference);
                        writer.write(`.${this.classReference.name}Serializer`);
                        writer.write(")");
                    })
                }),
                this.System.Serializable
            ],
            access: ast.Access.Public,
            type: ast.Class.ClassType.RecordStruct,
            readonly: true
        });

        // create the values class first
        const valuesClass = this.csharp.class_({
            origin: this.model.explicit(this.typeDeclaration, "Values"),
            access: ast.Access.Public,
            type: ast.Class.ClassType.Class,
            static_: true,
            enclosingType: stringEnum.reference,
            summary: "Constant strings for enum values",
            annotations: [this.System.Serializable]
        });

        this.enumDeclaration.values.forEach((member) => {
            const field = valuesClass.addField({
                enclosingType: valuesClass,
                origin: member,
                type: this.Primitive.string,
                access: ast.Access.Public,
                summary: member.docs,
                const_: true,
                initializer: this.csharp.codeblock(this.csharp.string_({ string: getWireValue(member.name) }))
            });
            stringEnum.addField({
                origin: member,
                enclosingType: stringEnum,
                type: this.classReference,
                access: ast.Access.Public,
                summary: member.docs,
                useRequired: false,
                static_: true,
                readonly: true,
                initializer: this.csharp.codeblock(`new(${valuesClass.name}.${field.name})`)
            });
        });

        stringEnum.addNestedClass(valuesClass);

        stringEnum
            .addMethod({
                access: ast.Access.Public,
                name: this.customMethodName,
                summary: "Create a string enum with the given value.",
                return_: this.classReference,
                type: ast.MethodType.STATIC,
                classReference: this.csharp.classReferenceInternal(this.classReference),
                body: this.csharp.codeblock((writer) => {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: this.classReference,
                            arguments_: [this.csharp.codeblock("value")]
                        })
                    );
                })
            })
            .addParameter({
                name: "value",
                type: this.Primitive.string,
                docs: "Custom enum value"
            });

        const valueProperty = stringEnum.addField({
            origin: this.model.explicit(this.typeDeclaration, "Value"),
            type: this.Primitive.string,
            access: ast.Access.Public,
            get: ast.Access.Public,
            summary: "The string value of the enum."
        });

        stringEnum.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.Primitive.string,
                    docs: "The string value of the enum."
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`${valueProperty.name} = value`);
            })
        });

        stringEnum.addMethod({
            access: ast.Access.Public,
            name: "ToString",
            return_: this.Primitive.string,
            parameters: [],
            override: true,
            summary: "Returns the string value of the enum.",
            type: ast.MethodType.INSTANCE,
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`return ${valueProperty.name}`);
            })
        });

        stringEnum.addMethod({
            access: ast.Access.Public,
            name: "Equals",
            parameters: [
                this.csharp.parameter({
                    name: "other",
                    type: this.Primitive.string.asOptional()
                })
            ],
            return_: this.Primitive.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`return ${valueProperty.name}.Equals(other)`);
            })
        });

        stringEnum.addOperator({
            type: "==",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.classReference }),
                this.csharp.parameter({ name: "value2", type: this.Primitive.string })
            ],
            return: this.Primitive.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.write(`value1.${valueProperty.name}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.classReference }),
                this.csharp.parameter({ name: "value2", type: this.Primitive.string })
            ],
            return: this.Primitive.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.write(`!value1.${valueProperty.name}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "explicit",
            to: this.Primitive.string,
            parameter: this.csharp.parameter({
                name: "value",
                type: this.classReference
            }),
            body: this.csharp.codeblock(`value.${valueProperty.name}`),
            useExpressionBody: true
        });
        stringEnum.addOperator({
            type: "explicit",
            parameter: this.csharp.parameter({
                name: "value",
                type: this.Primitive.string
            }),
            body: this.csharp.codeblock("new(value)"),
            useExpressionBody: true
        });

        if (valueProperty.name !== "Value") {
            // if we've renamed the value property, we need to implement the IStringEnum interface explicitly

            stringEnum.addField({
                enclosingType: stringEnum,
                origin: this.model.explicit(this.typeDeclaration, "IStringEnum.Value"),
                type: this.Primitive.string,
                get: ast.Access.Public,
                summary: "The string value of the enum.",
                init: false,
                set: false,
                initializer: this.csharp.codeblock(`${valueProperty.name}`)
            });
        }

        // Generate nested serializer class (no reflection)
        // Must be created after valueProperty so we can reference its potentially renamed name
        const serializerClass = this.csharp.class_({
            origin: serializerOrigin,
            access: ast.Access.Internal,
            type: ast.Class.ClassType.Class,
            enclosingType: stringEnum.reference,
            parentClassReference: this.csharp.classReference({
                name: `JsonConverter<${this.classReference.name}>`,
                namespace: "System.Text.Json.Serialization"
            })
        });

        serializerClass.addMethod({
            access: ast.Access.Public,
            name: "Read",
            return_: this.classReference,
            override: true,
            type: ast.MethodType.INSTANCE,
            parameters: [
                this.csharp.parameter({
                    name: "reader",
                    type: this.csharp.classReference({ name: "Utf8JsonReader", namespace: "System.Text.Json" }),
                    ref: true
                }),
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.csharp.classReference({ name: "Type", namespace: "System" })
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.classReference({ name: "JsonSerializerOptions", namespace: "System.Text.Json" })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    `var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");`
                );
                writer.writeTextStatement(`return new ${this.classReference.name}(stringValue)`);
            })
        });

        serializerClass.addMethod({
            access: ast.Access.Public,
            name: "Write",
            override: true,
            type: ast.MethodType.INSTANCE,
            parameters: [
                this.csharp.parameter({
                    name: "writer",
                    type: this.csharp.classReference({ name: "Utf8JsonWriter", namespace: "System.Text.Json" })
                }),
                this.csharp.parameter({
                    name: "value",
                    type: this.classReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.classReference({ name: "JsonSerializerOptions", namespace: "System.Text.Json" })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`writer.WriteStringValue(value.${valueProperty.name})`);
            })
        });

        serializerClass.addMethod({
            access: ast.Access.Public,
            name: "ReadAsPropertyName",
            return_: this.classReference,
            override: true,
            type: ast.MethodType.INSTANCE,
            parameters: [
                this.csharp.parameter({
                    name: "reader",
                    type: this.csharp.classReference({ name: "Utf8JsonReader", namespace: "System.Text.Json" }),
                    ref: true
                }),
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.csharp.classReference({ name: "Type", namespace: "System" })
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.classReference({ name: "JsonSerializerOptions", namespace: "System.Text.Json" })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    `var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON property name could not be read as a string.");`
                );
                writer.writeTextStatement(`return new ${this.classReference.name}(stringValue)`);
            })
        });

        serializerClass.addMethod({
            access: ast.Access.Public,
            name: "WriteAsPropertyName",
            override: true,
            type: ast.MethodType.INSTANCE,
            parameters: [
                this.csharp.parameter({
                    name: "writer",
                    type: this.csharp.classReference({ name: "Utf8JsonWriter", namespace: "System.Text.Json" })
                }),
                this.csharp.parameter({
                    name: "value",
                    type: this.classReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.classReference({ name: "JsonSerializerOptions", namespace: "System.Text.Json" })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`writer.WritePropertyName(value.${valueProperty.name})`);
            })
        });

        stringEnum.addNestedClass(serializerClass);

        return new CSharpFile({
            clazz: stringEnum,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
