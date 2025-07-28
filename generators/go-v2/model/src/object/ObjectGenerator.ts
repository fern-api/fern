import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import {
    Literal,
    Name,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";

const EMBED_TYPE_NAME = "embed";
const RAW_JSON_FIELD_NAME = "rawJSON";

declare namespace ObjectGenerator {
    interface Marshaler {
        /* The field defined within the marshaler struct. */
        field: go.Field;
        /* The mapper function used to map the field to the marshaler struct. */
        mapper: go.AstNode;
    }

    interface FieldWithZeroValue {
        field: go.Field;
        zeroValue: go.TypeInstantiation;

        // Some types require special [de]serialization logic, such
        // as dates. These mappers are used in the MarshalJSON and
        // UnmarshalJSON implementations.
        marshaler?: Marshaler;
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
        if (this.needsCustomMarshalJsonMethod(fieldsWithZeroValue)) {
            struct_.addMethod(this.getMarshalJsonMethod(fieldsWithZeroValue));
        }
        struct_.addMethod(this.getStringMethod());
        return this.toFile(struct_);
    }

    private getFieldsWithZeroValue(): ObjectGenerator.FieldWithZeroValue[] {
        const properties = this.getAllObjectProperties();
        const fields = properties.map((property) => {
            return {
                name: property.name,
                field: this.context.goFieldMapper.convert({
                    name: property.name,
                    reference: property.valueType,
                    docs: property.docs
                }),
                zeroValue: this.context.goZeroValueMapper.convert({ reference: property.valueType }),
                marshaler: this.getMarshaler({ name: property.name, typeReference: property.valueType })
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

    private getMarshalJsonMethod(fieldsWithZeroValue: ObjectGenerator.FieldWithZeroValue[]): go.Method {
        const marshalerType = go.struct({
            embeds: [
                go.typeReference({
                    name: EMBED_TYPE_NAME
                })
            ]
        });
        for (const field of fieldsWithZeroValue) {
            if (field.marshaler == null) {
                continue;
            }
            marshalerType.addField(field.marshaler.field);
        }
        const marshalerInstantiation = go.TypeInstantiation.struct({
            typeReference: marshalerType,
            fields: [
                {
                    name: EMBED_TYPE_NAME,
                    value: go.TypeInstantiation.reference(go.identifier(`${EMBED_TYPE_NAME}(*${this.receiver})`))
                },
                ...fieldsWithZeroValue
                    .map((field) => {
                        const fieldMarshaler = field.marshaler;
                        if (fieldMarshaler == null) {
                            return undefined;
                        }
                        return {
                            name: fieldMarshaler.field.name,
                            value: go.TypeInstantiation.reference(fieldMarshaler.mapper)
                        };
                    })
                    .filter((field) => field != null)
            ]
        });
        return go.method({
            typeReference: this.typeReference,
            name: "MarshalJSON",
            parameters: [],
            return_: [go.Type.bytes(), go.Type.error()],
            body: go.codeblock((writer) => {
                writer.writeNode(
                    go.typeDeclaration({
                        name: EMBED_TYPE_NAME,
                        type: go.Type.reference(
                            go.typeReference({
                                name: this.context.getClassName(this.typeDeclaration.name.name)
                            })
                        )
                    })
                );
                writer.newLine();
                writer.write("var marshaler = ");
                writer.writeNode(marshalerInstantiation);
                writer.newLine();
                writer.write("return ");
                if (this.objectDeclaration.extraProperties) {
                    writer.writeNode(
                        this.context.callMarshalJsonWithExtraProperties([
                            go.identifier("marshaler"),
                            this.getExtraPropertiesFieldReference()
                        ])
                    );
                } else {
                    writer.writeNode(this.context.callJsonMarshal(go.identifier("marshaler")));
                }
                writer.newLine();
            }),
            pointerReceiver: true
        });
    }

    private getUnmarshalJsonMethod(fieldsWithZeroValue: ObjectGenerator.FieldWithZeroValue[]): go.Method {
        return go.method({
            typeReference: this.typeReference,
            name: "UnmarshalJSON",
            parameters: [go.parameter({ name: "data", type: go.Type.bytes() })],
            return_: [go.Type.error()],
            body: go.codeblock((writer) => {
                writer.writeLine("return nil");
            }),
            pointerReceiver: true
        });
    }

    private getStringMethod(): go.Method {
        return go.method({
            typeReference: this.typeReference,
            name: "String",
            parameters: [],
            return_: [go.Type.string()],
            body: go.codeblock((writer) => {
                writer.write(`if len(`);
                writer.writeNode(this.getRawJsonFieldReference());
                writer.writeLine(`) > 0 {`);
                writer.indent();
                this.callStringifyJsonAndReturnValue({
                    writer,
                    arg: this.getRawJsonFieldReference()
                });
                writer.dedent();
                writer.writeLine("}");
                this.callStringifyJsonAndReturnValue({
                    writer,
                    arg: go.identifier(this.receiver)
                });
                writer.write("return ");
                writer.writeNode(this.context.callFmtSprintf("%#v", [go.identifier(this.receiver)]));
            }),
            pointerReceiver: true
        });
    }

    private callStringifyJsonAndReturnValue({ writer, arg }: { writer: go.Writer; arg: go.AstNode }): void {
        writer.write("if value, err := ");
        writer.writeNode(this.context.callStringifyJson(go.TypeInstantiation.reference(arg)));
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
                zeroValue: go.TypeInstantiation.nil()
            };
        }
        return {
            field: go.field({
                name: "extraProperties",
                type: go.Type.map(go.Type.string(), go.Type.any())
            }),
            zeroValue: go.TypeInstantiation.nil()
        };
    }

    private getExtraPropertiesFieldReference(): go.AstNode {
        return go.selector({
            on: go.identifier(this.receiver),
            selector: go.identifier(this.getExtraPropertiesField().field.name)
        });
    }

    private getRawJsonField(): ObjectGenerator.FieldWithZeroValue {
        return {
            field: go.field({
                name: RAW_JSON_FIELD_NAME,
                type: go.Type.reference(this.context.getJsonRawMessageTypeReference())
            }),
            zeroValue: go.TypeInstantiation.nil()
        };
    }

    private getRawJsonFieldReference(): go.AstNode {
        return go.selector({
            on: go.identifier(this.receiver),
            selector: go.identifier(RAW_JSON_FIELD_NAME)
        });
    }

    private getMarshaler({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Marshaler | undefined {
        const literal = this.context.maybeLiteral(typeReference);
        if (literal != null) {
            return this.getLiteralMarshaler({ name, typeReference, literal });
        }
        if (this.context.isDate(typeReference)) {
            return this.getDateMarshaler({ name, typeReference });
        }
        if (this.context.isDateTime(typeReference)) {
            return this.getDateTimeMarshaler({ name, typeReference });
        }
        return undefined;
    }

    private getLiteralMarshaler({
        name,
        typeReference,
        literal
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
        literal: Literal;
    }): ObjectGenerator.Marshaler | undefined {
        return {
            field: go.field({
                name: this.context.getFieldName(name.name),
                type: this.context.goTypeMapper.convert({ reference: typeReference }),
                tags: [
                    {
                        name: "json",
                        value: name.wireValue
                    }
                ]
            }),
            mapper: this.context.getLiteralValue(literal)
        };
    }

    private getDateMarshaler({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Marshaler | undefined {
        const fieldReference = this.getFieldReference(name.name);
        const isOptional = this.context.isOptional(typeReference);
        return {
            field: go.field({
                name: this.context.getFieldName(name.name),
                type: go.Type.pointer(go.Type.reference(this.context.getDateTypeReference())),
                tags: [
                    {
                        name: "json",
                        value: name.wireValue
                    }
                ]
            }),
            mapper: isOptional
                ? this.context.callNewOptionalDate(fieldReference)
                : this.context.callNewDate(fieldReference)
        };
    }

    private getDateTimeMarshaler({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Marshaler | undefined {
        const fieldReference = this.getFieldReference(name.name);
        const isOptional = this.context.isOptional(typeReference);
        return {
            field: go.field({
                name: this.context.getFieldName(name.name),
                type: go.Type.pointer(go.Type.reference(this.context.getDateTimeTypeReference())),
                tags: [
                    {
                        name: "json",
                        value: name.wireValue
                    }
                ]
            }),
            mapper: isOptional
                ? this.context.callNewOptionalDateTime(fieldReference)
                : this.context.callNewDateTime(fieldReference)
        };
    }

    private getGetterMethodName(field: go.Field): string {
        return `Get${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
    }

    private getFieldReference(name: Name): go.AstNode {
        return go.selector({
            on: go.identifier(this.receiver),
            selector: go.identifier(this.context.getFieldName(name))
        });
    }

    private shouldExcludeGetterMethod(fieldWithZeroValue: ObjectGenerator.FieldWithZeroValue): boolean {
        return fieldWithZeroValue.field.name === RAW_JSON_FIELD_NAME;
    }

    private needsCustomMarshalJsonMethod(fields: ObjectGenerator.FieldWithZeroValue[]): boolean {
        return this.objectDeclaration.extraProperties || fields.some((field) => field.marshaler != null);
    }

    private needsCustomUnmarshalJsonMethod(fields: ObjectGenerator.FieldWithZeroValue[]): boolean {
        return fields.some((field) => field.marshaler != null);
    }

    private getAllObjectProperties(): ObjectProperty[] {
        return [...(this.objectDeclaration.extendedProperties ?? []), ...this.objectDeclaration.properties];
    }
}
