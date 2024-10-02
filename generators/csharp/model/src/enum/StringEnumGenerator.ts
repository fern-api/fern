import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
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
                writer.writeNode(csharp.classReference(this.context.getStringEnumSerializerClassReference()));
                writer.write("<");
                writer.writeNode(this.classReference);
                writer.write(">");
                writer.write(")");
            })
        });

        const stringEnum = csharp.class_({
            ...this.classReference,
            interfaceReferences: [
                csharp.classReference({
                    name: "IStringEnum",
                    namespace: this.context.getCoreNamespace()
                }),
                csharp.classReference({
                    name: "IEquatable",
                    generics: [csharp.Type.reference(this.classReference)],
                    namespace: "System"
                })
            ],
            annotations: [serializerAnnotation],
            access: "public",
            type: "struct",
            readonly: true
        });

        stringEnum.addConstructor({
            access: "public",
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.string(),
                    docs: "The string value of the enum."
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.write("Value = value;");
            })
        });

        stringEnum.addField(
            csharp.field({
                name: "Value",
                type: csharp.Type.string(),
                access: "public",
                get: "public",
                summary: "The string value of the enum."
            })
        );

        const valuesClass = csharp.class_({
            access: "public",
            name: "Values",
            type: "class",
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
                    access: "public",
                    summary: member.docs,
                    const_: true,
                    initializer: csharp.codeblock(`"${member.name.wireValue}"`)
                })
            );
            stringEnum.addField(
                csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: member.name }),
                    type: csharp.Type.reference(this.classReference),
                    access: "public",
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
                access: "public",
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
                    writer.write("return new ");
                    writer.writeNode(csharp.classReference(this.classReference));
                    writer.write("(");
                    writer.write("value");
                    writer.write(");");
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: "public",
                name: "ToString",
                return_: csharp.Type.string(),
                parameters: [],
                override: true,
                summary: "Returns the string value of the enum.",
                type: csharp.MethodType.INSTANCE,
                body: csharp.codeblock((writer) => {
                    writer.write("return Value;");
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: "public",
                name: "Equals",
                parameters: [
                    csharp.parameter({
                        name: "other",
                        type: csharp.Type.reference(this.classReference)
                    })
                ],
                return_: csharp.Type.boolean(),
                body: csharp.codeblock((writer) => {
                    writer.write("return Value == other.Value;");
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: "public",
                name: "Equals",
                parameters: [
                    csharp.parameter({
                        name: "other",
                        type: csharp.Type.optional(csharp.Type.string())
                    })
                ],
                return_: csharp.Type.boolean(),
                body: csharp.codeblock((writer) => {
                    writer.write("return Value.Equals(other);");
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: "public",
                name: "Equals",
                override: true,
                parameters: [
                    csharp.parameter({
                        name: "obj",
                        type: csharp.Type.optional(csharp.Type.object())
                    })
                ],
                return_: csharp.Type.boolean(),
                body: csharp.codeblock((writer) => {
                    writer.write("if (obj is null) return false;");
                    writer.write("if (obj is string stringObj) return Value.Equals(stringObj);");
                    writer.write("if (obj.GetType() != GetType()) return false;");
                    writer.write(`return Equals((${this.classReference.name})obj);`);
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: "public",
                name: "GetHashCode",
                override: true,
                return_: csharp.Type.integer(),
                parameters: [],
                body: csharp.codeblock((writer) => {
                    writer.write("return Value.GetHashCode();");
                })
            })
        );

        stringEnum.addOperator({
            type: "==",
            parameters: [
                csharp.parameter({ name: "value1", type: csharp.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: csharp.Type.reference(this.classReference) })
            ],
            return: csharp.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write("value1.Equals(value2)");
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                csharp.parameter({ name: "value1", type: csharp.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: csharp.Type.reference(this.classReference) })
            ],
            return: csharp.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write("!(value1 == value2)");
            }),
            useExpressionBody: true
        });

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
