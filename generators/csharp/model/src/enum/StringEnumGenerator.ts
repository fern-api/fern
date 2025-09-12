import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp, ast } from "@fern-api/csharp-codegen";
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
        const serializerAnnotation = csharp.annotation({
            reference: this.context.nameRegistry.System.Text.Json.Serialization.JsonConverter(),
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
            annotations: [serializerAnnotation, this.context.getSerializableAttribute()],
            access: ast.Access.Public,
            type: ast.Class.ClassType.RecordStruct,
            readonly: true
        });

        stringEnum.addConstructor({
            access: ast.Access.Public,
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: ast.Type.string(),
                    docs: "The string value of the enum."
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.writeTextStatement(`${this.valuePropertyName} = value`);
            })
        });

        stringEnum.addField(
            csharp.field({
                name: this.valuePropertyName,
                type: ast.Type.string(),
                access: ast.Access.Public,
                get: ast.Access.Public,
                summary: "The string value of the enum."
            })
        );

        const valuesClass = csharp.class_({
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
                csharp.field({
                    name: fieldName,
                    type: ast.Type.string(),
                    access: ast.Access.Public,
                    summary: member.docs,
                    const_: true,
                    initializer: csharp.codeblock(csharp.string_({ string: member.name.wireValue }))
                })
            );
            stringEnum.addField(
                csharp.field({
                    name: this.getPropertyName({ className: this.classReference.name, objectProperty: member.name }),
                    type: ast.Type.reference(this.classReference),
                    access: ast.Access.Public,
                    summary: member.docs,
                    useRequired: false,
                    static_: true,
                    readonly: true,
                    initializer: csharp.codeblock(`new(Values.${fieldName})`)
                })
            );
        });

        stringEnum.addNestedClass(valuesClass);

        stringEnum.addMethod(
            csharp.method({
                access: ast.Access.Public,
                name: this.customMethodName,
                parameters: [
                    csharp.parameter({
                        name: "value",
                        type: ast.Type.string(),
                        docs: "Custom enum value"
                    })
                ],
                summary: "Create a string enum with the given value.",
                return_: ast.Type.reference(this.classReference),
                type: ast.MethodType.STATIC,
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
                access: ast.Access.Public,
                name: "ToString",
                return_: ast.Type.string(),
                parameters: [],
                override: true,
                summary: "Returns the string value of the enum.",
                type: ast.MethodType.INSTANCE,
                body: csharp.codeblock((writer) => {
                    writer.writeTextStatement(`return ${this.valuePropertyName}`);
                })
            })
        );

        stringEnum.addMethod(
            csharp.method({
                access: ast.Access.Public,
                name: "Equals",
                parameters: [
                    csharp.parameter({
                        name: "other",
                        type: ast.Type.optional(ast.Type.string())
                    })
                ],
                return_: ast.Type.boolean(),
                body: csharp.codeblock((writer) => {
                    writer.writeTextStatement(`return ${this.valuePropertyName}.Equals(other)`);
                })
            })
        );

        stringEnum.addOperator({
            type: "==",
            parameters: [
                csharp.parameter({ name: "value1", type: ast.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: ast.Type.string() })
            ],
            return: ast.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write(`value1.${this.valuePropertyName}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "!=",
            parameters: [
                csharp.parameter({ name: "value1", type: ast.Type.reference(this.classReference) }),
                csharp.parameter({ name: "value2", type: ast.Type.string() })
            ],
            return: ast.Type.boolean(),
            body: csharp.codeblock((writer) => {
                writer.write(`!value1.${this.valuePropertyName}.Equals(value2)`);
            }),
            useExpressionBody: true
        });

        stringEnum.addOperator({
            type: "explicit",
            to: ast.Type.string(),
            parameter: csharp.parameter({
                name: "value",
                type: ast.Type.reference(this.classReference)
            }),
            body: csharp.codeblock(`value.${this.valuePropertyName}`),
            useExpressionBody: true
        });
        stringEnum.addOperator({
            type: "explicit",
            parameter: csharp.parameter({
                name: "value",
                type: ast.Type.string()
            }),
            body: csharp.codeblock("new(value)"),
            useExpressionBody: true
        });

        if (this.valuePropertyName !== "Value") {
            // if we've renamed the value property, we need to implement the IStringEnum interface explicitly

            stringEnum.addField(
                csharp.field({
                    name: "IStringEnum.Value",
                    type: ast.Type.string(),
                    get: ast.Access.Public,
                    summary: "The string value of the enum.",
                    init: false,
                    set: false,
                    initializer: csharp.codeblock(`${this.valuePropertyName}`)
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
