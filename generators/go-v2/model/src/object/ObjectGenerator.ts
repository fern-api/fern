import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";

const RAW_JSON_FIELD_NAME = "rawJSON";

declare namespace ObjectGenerator {
    interface FieldWithZeroValue {
        field: go.Field;
        zeroValue: go.TypeInstantiation;
        isLiteral: boolean;
    }
}

export class ObjectGenerator extends AbstractModelGenerator {
    private receiver: string;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context, typeDeclaration);
        this.receiver = this.context.getReceiverName(this.typeDeclaration.name.name);
    }

    protected doGenerate(): GoFile {
        const struct_ = go.struct({
            ...this.typeReference,
            docs: this.typeDeclaration.docs
        });
        const fieldsWithZeroValue = this.getFieldsWithZeroValue();
        struct_.addField(...fieldsWithZeroValue.map((field) => field.field));
        struct_.addMethod(...this.getGetterMethods(fieldsWithZeroValue));
        struct_.addMethod(this.getStringMethod());
        return this.toFile(struct_);
    }

    private getFieldsWithZeroValue(): ObjectGenerator.FieldWithZeroValue[] {
        const properties = this.getAllObjectProperties();
        const fields = properties.map((property) => {
            return {
                field: this.context.goFieldMapper.convert({
                    name: property.name,
                    reference: property.valueType,
                    docs: property.docs
                }),
                zeroValue: this.context.goZeroValueMapper.convert({ reference: property.valueType }),
                isLiteral: this.context.maybeLiteral(property.valueType) !== undefined
            };
        });
        return [...fields, this.getExtraPropertiesField(), this.getRawJsonField()];
    }

    private getGetterMethods(fieldsWithZeroValue: ObjectGenerator.FieldWithZeroValue[]): go.Method[] {
        return fieldsWithZeroValue
            .filter((fieldWithZeroValue) => !this.shouldExcludeGetterMethod(fieldWithZeroValue))
            .map((fieldWithZeroValue) => {
                return go.method({
                    typeReference: this.typeReference,
                    name: this.getGetterMethodName(fieldWithZeroValue.field),
                    receiver: this.receiver,
                    parameters: [],
                    return_: [fieldWithZeroValue.field.type],
                    body: go.codeblock((writer) => {
                        writer.writeLine(`if ${this.receiver} == nil {`);
                        writer.indent();
                        writer.write("return ");
                        writer.writeNode(fieldWithZeroValue.zeroValue);
                        writer.newLine();
                        writer.dedent();
                        writer.writeLine("}");
                        writer.writeLine(`return ${this.receiver}.${fieldWithZeroValue.field.name}`);
                    }),
                    pointerReceiver: true
                });
            });
    }

    private getStringMethod(): go.Method {
        const rawJsonFieldReference = go.selector({
            on: go.identifier({ name: this.receiver }),
            selector: go.identifier({ name: RAW_JSON_FIELD_NAME })
        });
        return go.method({
            typeReference: this.typeReference,
            name: "String",
            parameters: [],
            return_: [go.Type.string()],
            body: go.codeblock((writer) => {
                writer.write(`if len(`);
                writer.writeNode(rawJsonFieldReference);
                writer.writeLine(`) > 0 {`);
                writer.indent();
                this.callStringifyJsonAndReturnValue({
                    writer,
                    arg: rawJsonFieldReference
                });
                writer.dedent();
                writer.writeLine("}");
                this.callStringifyJsonAndReturnValue({
                    writer,
                    arg: go.identifier({ name: this.receiver })
                });
                writer.write("return ");
                writer.writeNode(this.context.callFmtSprintf("%#v", [go.identifier({ name: this.receiver })]));
            }),
            pointerReceiver: true
        });
    }

    private callStringifyJsonAndReturnValue({ writer, arg }: { writer: go.Writer; arg: go.AstNode }): void {
        writer.write("if value, err := ");
        writer.writeNode(this.context.callInternalStringifyJSON(go.TypeInstantiation.reference(arg)));
        writer.writeLine(`; err == nil {`);
        writer.indent();
        writer.writeLine("return value");
        writer.dedent();
        writer.writeLine("}");
    }

    private getExtraPropertiesField(): ObjectGenerator.FieldWithZeroValue {
        if (this.objectDeclaration.extraProperties) {
            return {
                field: go.field({
                    name: "ExtraProperties",
                    type: go.Type.map(go.Type.string(), go.Type.any()),
                    tags: [
                        {
                            name: "json",
                            value: "-"
                        },
                        {
                            name: "url",
                            value: "-"
                        }
                    ]
                }),
                zeroValue: go.TypeInstantiation.nil(),
                isLiteral: false
            };
        }
        return {
            field: go.field({
                name: "extraProperties",
                type: go.Type.map(go.Type.string(), go.Type.any())
            }),
            zeroValue: go.TypeInstantiation.nil(),
            isLiteral: false
        };
    }

    private getRawJsonField(): ObjectGenerator.FieldWithZeroValue {
        return {
            field: go.field({
                name: RAW_JSON_FIELD_NAME,
                type: go.Type.reference(this.context.getJsonRawMessageTypeReference())
            }),
            zeroValue: go.TypeInstantiation.nil(),
            isLiteral: false
        };
    }

    private getGetterMethodName(field: go.Field): string {
        return `Get${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
    }

    private shouldExcludeGetterMethod(fieldWithZeroValue: ObjectGenerator.FieldWithZeroValue): boolean {
        return fieldWithZeroValue.field.name === RAW_JSON_FIELD_NAME;
    }

    private getAllObjectProperties(): ObjectProperty[] {
        return [...(this.objectDeclaration.extendedProperties ?? []), ...this.objectDeclaration.properties];
    }
}
