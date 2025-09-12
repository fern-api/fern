import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { EnumTypeDeclaration, NameAndWireValue, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class StringEnumGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: ast.ClassReference;
    private readonly customMethodName: string;
    private valuePropertyName: string = "Value";
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
        // if the enum contains a value actually called 'value', we need to avoid stomping on that
        // so we'll rename the Value property to 'Value_' (far less likely to be used than the enum value)
        // and we'll explicitly implement the IStringEnum interface so that it works as expected.
        if (enumDeclaration.values.some((v) => v.name.name.pascalCase.safeName === "Value")) {
            this.valuePropertyName = "Value_";
        }
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        this.customMethodName = this.getCustomMethodName(enumDeclaration);
    }

    private getCustomMethodName(enumDeclaration: EnumTypeDeclaration): string {
        const d = "FromCustom";
        return enumDeclaration.values.some((v) => v.name.name.pascalCase.safeName === d) ? "FromCustom_" : d;
    }

    protected doGenerate(): CSharpFile {
        const serializerAnnotation = this.csharp.annotation({
            reference: this.context.csharp.System.Text.Json.Serialization.JsonConverter(),
            argument: this.csharp.codeblock((writer) => {
                writer.write("typeof(");
                writer.writeNode(
                    this.csharp.classReference(this.context.getStringEnumSerializerClassReference(this.classReference))
                );
                writer.write(")");
            })
        });

        const stringEnum = this.csharp.class_({
            ...this.classReference,
            interfaceReferences: [
                this.csharp.classReference({
                    name: "IStringEnum",
                    namespace: this.context.getCoreNamespace()
                })
            ],
            annotations: [serializerAnnotation, this.context.getSerializableAttribute()],
            access: ast.Access.Public,
            type: ast.Class.ClassType.RecordStruct,
            readonly: true
        });

        stringEnum.addConstructor({
            access: ast.Access.Public,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.string(),
                    docs: "The string value of the enum."
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`${this.valuePropertyName} = value`);
            })
        });

        stringEnum.addField(
            this.csharp.field({
                name: this.valuePropertyName,
                type: this.csharp.Type.string(),
                access: ast.Access.Public,
                get: ast.Access.Public,
                summary: "The string value of the enum."
            })
        );

        const valuesClass = this.csharp.class_({
            access: ast.Access.Public,
            name: "Values",
            type: ast.Class.ClassType.Class,
            static_: true,
            namespace: this.context.getNamespace(),
            enclosingType: stringEnum.reference,
            summary: "Constant strings for enum values",
            annotations: [this.context.getSerializableAttribute()]
        });

        this.enumDeclaration.values.forEach((member) => {
            const fieldName = this.getPropertyName({
                className: this.classReference.name,
                objectProperty: member.name
            });
            valuesClass.addField(
                this.csharp.field({
                    name: fieldName,
                    type: this.csharp.Type.string(),
                    access: ast.Access.Public,
                    summary: member.docs,
                    const_: true,
                    initializer: this.csharp.codeblock(this.csharp.string_({ string: member.name.wireValue }))
                })
            );
            stringEnum.addField(
                this.csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: member.name }),
                    type: this.csharp.Type.reference(this.classReference),
                    access: ast.Access.Public,
                    summary: member.docs,
                    useRequired: false,
                    static_: true,
                    readonly: true,
                    initializer: this.csharp.codeblock(`new(Values.${fieldName})`)
                })
            );
        });

        stringEnum.addNestedClass(valuesClass);

        stringEnum.addMethod(
            this.csharp.method({
                access: ast.Access.Public,
                name: this.customMethodName,
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: this.csharp.Type.string(),
                        docs: "Custom enum value"
                    })
                ],
                summary: "Create a string enum with the given value.",
                return_: this.csharp.Type.reference(this.classReference),
                type: ast.MethodType.STATIC,
                classReference: this.csharp.classReference(this.classReference),
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
        );

        stringEnum.addMethod(
            this.csharp.method({
                access: ast.Access.Public,
                name: "ToString",
                return_: this.csharp.Type.string(),
                parameters: [],
                override: true,
                summary: "Returns the string value of the enum.",
                type: ast.MethodType.INSTANCE,
                body: this.csharp.codeblock((writer) => {
                    writer.writeTextStatement(`return ${this.valuePropertyName}`);
                })
            })
        );

        stringEnum.addMethod(
            this.csharp.method({
                access: ast.Access.Public,
                name: "Equals",
                parameters: [
                    this.csharp.parameter({
                        name: "other",
                        type: this.csharp.Type.optional(this.csharp.Type.string())
                    })
                ],
                return_: this.csharp.Type.boolean(),
                body: this.csharp.codeblock((writer) => {
                    writer.writeTextStatement(`return ${this.valuePropertyName}.Equals(other)`);
                })
            })
        );

        stringEnum.addOperator({
            type: "==",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.csharp.Type.reference(this.classReference) }),
                this.csharp.parameter({ name: "value2", type: this.csharp.Type.string() })
            ],
            return: this.csharp.Type.boolean(),
            body: this.csharp.codeblock((writer) => {
                writer.write(`value1.${this.valuePropertyName}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                this.csharp.parameter({ name: "value1", type: this.csharp.Type.reference(this.classReference) }),
                this.csharp.parameter({ name: "value2", type: this.csharp.Type.string() })
            ],
            return: this.csharp.Type.boolean(),
            body: this.csharp.codeblock((writer) => {
                writer.write(`!value1.${this.valuePropertyName}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "explicit",
            to: this.csharp.Type.string(),
            parameter: this.csharp.parameter({
                name: "value",
                type: this.csharp.Type.reference(this.classReference)
            }),
            body: this.csharp.codeblock(`value.${this.valuePropertyName}`),
            useExpressionBody: true
        });
        stringEnum.addOperator({
            type: "explicit",
            parameter: this.csharp.parameter({
                name: "value",
                type: this.csharp.Type.string()
            }),
            body: this.csharp.codeblock("new(value)"),
            useExpressionBody: true
        });

        if (this.valuePropertyName !== "Value") {
            // if we've renamed the value property, we need to implement the IStringEnum interface explicitly

            stringEnum.addField(
                this.csharp.field({
                    name: "IStringEnum.Value",
                    type: this.csharp.Type.string(),
                    get: ast.Access.Public,
                    summary: "The string value of the enum.",
                    init: false,
                    set: false,
                    initializer: this.csharp.codeblock(`${this.valuePropertyName}`)
                })
            );
        }

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
