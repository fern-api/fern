import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { EnumTypeDeclaration, NameAndWireValue, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class StringEnumGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: csharp.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    protected doGenerate(): CSharpFile {
        const serializerAnnotation = csharp.annotation({
            reference: csharp.classReference({
                name: "JsonConverter",
                namespace: "System.Text.Json.Serialization"
            }),
            argument: csharp.codeblock((writer) => {
                writer.write("typeof(");
                writer.writeNode(
                    csharp.classReference(this.context.getStringEnumSerializerClassReference(this.classReference))
                );
                writer.write(")");
            })
        });

        const stringEnum = csharp.class_({
            ...this.classReference,
            interfaceReferences: [
                csharp.classReference({
                    name: "IStringEnum",
                    namespace: this.context.getCoreNamespace()
                })
            ],
            annotations: [serializerAnnotation],
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.RecordStruct,
            readonly: true
        });

        stringEnum.addConstructor({
            access: csharp.Access.Public,
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.string(),
                    docs: "The string value of the enum."
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.writeTextStatement("Value = value");
            })
        });

        stringEnum.addField(
            csharp.field({
                name: "Value",
                type: csharp.Type.string(),
                access: csharp.Access.Public,
                get: csharp.Access.Public,
                summary: "The string value of the enum."
            })
        );

        const valuesClass = csharp.class_({
            access: csharp.Access.Public,
            name: "Values",
            type: csharp.Class.ClassType.Class,
            static_: true,
            namespace: this.context.getNamespace(),
            isNestedClass: true,
            summary: "Constant strings for enum values"
        });

        this.enumDeclaration.values.forEach((member) => {
            const fieldName = this.getPropertyName({
                className: this.classReference.name,
                objectProperty: member.name
            });
            valuesClass.addField(
                csharp.field({
                    name: fieldName,
                    type: csharp.Type.string(),
                    access: csharp.Access.Public,
                    summary: member.docs,
                    const_: true,
                    initializer: csharp.codeblock(`"${member.name.wireValue}"`)
                })
            );
            stringEnum.addField(
                csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: member.name }),
                    type: csharp.Type.reference(this.classReference),
                    access: csharp.Access.Public,
                    summary: member.docs,
                    useRequired: false,
                    static_: true,
                    readonly: true,
                    initializer: csharp.codeblock((writer) => {
                        writer.write("Custom(");
                        writer.write("Values.");
                        writer.write(fieldName);
                        writer.write(")");
                    })
                })
            );
        });

        stringEnum.addNestedClass(valuesClass);

        stringEnum.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Custom",
                parameters: [
                    csharp.parameter({
                        name: "value",
                        type: csharp.Type.string(),
                        docs: "Custom enum value"
                    })
                ],
                summary: "Create a string enum with the given value.",
                return_: csharp.Type.reference(this.classReference),
                type: csharp.MethodType.STATIC,
                classReference: csharp.classReference(this.classReference),
                body: csharp.codeblock((writer) => {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: this.classReference,
                            arguments_: [csharp.codeblock("value")]
                        })
                    );
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "ToString",
                return_: csharp.Type.string(),
                parameters: [],
                override: true,
                summary: "Returns the string value of the enum.",
                type: csharp.MethodType.INSTANCE,
                body: csharp.codeblock((writer) => {
                    writer.writeTextStatement("return Value");
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Equals",
                parameters: [
                    csharp.parameter({
                        name: "other",
                        type: csharp.Type.optional(csharp.Type.string())
                    })
                ],
                return_: csharp.Type.boolean(),
                body: csharp.codeblock((writer) => {
                    writer.writeTextStatement("return Value.Equals(other)");
                })
            })
        );

        stringEnum.addOperator({
            type: "==",
            parameters: [
                csharp.parameter({ name: "value1", type: csharp.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: csharp.Type.string() })
            ],
            return: csharp.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write("value1.Value.Equals(value2)");
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                csharp.parameter({ name: "value1", type: csharp.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: csharp.Type.string() })
            ],
            return: csharp.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write("!value1.Value.Equals(value2)");
            }),
            useExpressionBody: true
        });

        return new CSharpFile({
            clazz: stringEnum,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    /**
     * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
     */
    private getPropertyName({
        className,
        objectProperty
    }: {
        className: string;
        objectProperty: NameAndWireValue;
    }): string {
        const propertyName = this.context.getPascalCaseSafeName(objectProperty.name);
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
