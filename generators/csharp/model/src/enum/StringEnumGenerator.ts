import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class StringEnumGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: ast.ClassReference;
    private readonly customMethodName: string;
    // private valuePropertyName: string = "Value";
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
        return enumDeclaration.values.some((v) => v.name.name.pascalCase.safeName === d) ? "FromCustom_" : d;
    }

    protected doGenerate(): CSharpFile {
        const serializerAnnotation = this.csharp.annotation({
            reference: this.extern.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.codeblock((writer) => {
                writer.write("typeof(");
                writer.writeNode(
                    this.csharp.classReferenceInternal(this.types.StringEnumSerializer(this.classReference))
                );
                writer.write(")");
            })
        });

        const stringEnum = this.csharp.class_({
            reference: this.classReference,
            interfaceReferences: [this.types.IStringEnum],
            annotations: [serializerAnnotation, this.extern.System.Serializable],
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
            namespace: stringEnum.reference.namespace,
            enclosingType: stringEnum.reference,
            summary: "Constant strings for enum values",
            annotations: [this.extern.System.Serializable]
        });

        this.enumDeclaration.values.forEach((member) => {
            const field = valuesClass.addField({
                enclosingType: valuesClass,
                origin: member,
                type: this.csharp.Type.string,
                access: ast.Access.Public,
                summary: member.docs,
                const_: true,
                initializer: this.csharp.codeblock(this.csharp.string_({ string: member.name.wireValue }))
            });
            stringEnum.addField({
                origin: member,
                enclosingType: stringEnum,
                type: this.csharp.Type.reference(this.classReference),
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
                return_: this.csharp.Type.reference(this.classReference),
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
                type: this.csharp.Type.string,
                docs: "Custom enum value"
            });

        const valueProperty = stringEnum.addField({
            origin: this.model.explicit(this.typeDeclaration, "Value"),
            type: this.csharp.Type.string,
            access: ast.Access.Public,
            get: ast.Access.Public,
            summary: "The string value of the enum."
        });

        stringEnum.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.string,
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
            return_: this.csharp.Type.string,
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
                    type: this.csharp.Type.optional(this.csharp.Type.string)
                })
            ],
            return_: this.csharp.Type.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`return ${valueProperty.name}.Equals(other)`);
            })
        });

        stringEnum.addOperator({
            type: "==",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.csharp.Type.reference(this.classReference) }),
                this.csharp.parameter({ name: "value2", type: this.csharp.Type.string })
            ],
            return: this.csharp.Type.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.write(`value1.${valueProperty.name}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.csharp.Type.reference(this.classReference) }),
                this.csharp.parameter({ name: "value2", type: this.csharp.Type.string })
            ],
            return: this.csharp.Type.boolean,
            body: this.csharp.codeblock((writer) => {
                writer.write(`!value1.${valueProperty.name}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "explicit",
            to: this.csharp.Type.string,
            parameter: this.csharp.parameter({
                name: "value",
                type: this.csharp.Type.reference(this.classReference)
            }),
            body: this.csharp.codeblock(`value.${valueProperty.name}`),
            useExpressionBody: true
        });
        stringEnum.addOperator({
            type: "explicit",
            parameter: this.csharp.parameter({
                name: "value",
                type: this.csharp.Type.string
            }),
            body: this.csharp.codeblock("new(value)"),
            useExpressionBody: true
        });

        if (valueProperty.name !== "Value") {
            // if we've renamed the value property, we need to implement the IStringEnum interface explicitly

            stringEnum.addField({
                enclosingType: stringEnum,
                origin: this.model.explicit(this.typeDeclaration, "IStringEnum.Value"),
                type: this.csharp.Type.string,
                get: ast.Access.Public,
                summary: "The string value of the enum.",
                init: false,
                set: false,
                initializer: this.csharp.codeblock(`${valueProperty.name}`)
            });
        }

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
