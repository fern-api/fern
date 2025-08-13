import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";

import {
    Literal,
    Name,
    NameAndWireValue,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { AbstractModelGenerator } from "../AbstractModelGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

const EMBED_TYPE_NAME = "embed";
const MARSHALER_TYPE_NAME = "marshaler";
const UNMARSHALER_TYPE_NAME = "unmarshaler";
const RAW_JSON_FIELD_NAME = "rawJSON";

declare namespace ObjectGenerator {
    interface Serde {
        /* The field defined within the marshaler/unmarshaler struct. */
        field: go.Field;
        /* The mapper function used to map the field to the marshaler struct. */
        marshal: go.AstNode;
        /* The mapper function used to map the field from the unmarshaler struct. */
        unmarshal: go.AstNode;
        /* If this field represents a literal property. */
        isLiteral?: boolean;
    }

    interface Field {
        node: go.Field;
        zeroValue: go.TypeInstantiation;

        // Some types require special [de]serialization logic, such
        // as dates. This interface is used in the MarshalJSON and
        // UnmarshalJSON implementations.
        serde?: Serde;
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
        const fields = this.getFields();
        struct_.addField(...fields.map((field) => field.node));
        struct_.addMethod(...this.getGetterMethods(fields));
        struct_.addMethod(this.getUnmarshalJsonMethod(fields));
        if (this.needsCustomMarshalJsonMethod(fields)) {
            struct_.addMethod(this.getMarshalJsonMethod(fields));
        }
        struct_.addMethod(this.getStringMethod());
        return this.toFile(struct_);
    }

    private getFields(): ObjectGenerator.Field[] {
        const properties = this.getAllObjectProperties();
        const fields = properties.map((property) => {
            return {
                name: property.name,
                node: this.context.goFieldMapper.convert({
                    name: property.name,
                    reference: property.valueType,
                    docs: property.docs
                }),
                zeroValue: this.context.goZeroValueMapper.convert({ reference: property.valueType }),
                serde: this.getSerde({ name: property.name, typeReference: property.valueType })
            };
        });
        return [...fields, this.getExtraPropertiesField(), this.getRawJsonField()];
    }

    private getGetterMethods(fields: ObjectGenerator.Field[]): go.Method[] {
        return fields
            .filter((fieldWithZeroValue) => !this.shouldExcludeGetterMethod(fieldWithZeroValue))
            .map((fieldWithZeroValue) => {
                return go.method({
                    typeReference: this.typeReference,
                    name: this.getGetterMethodName(fieldWithZeroValue.node),
                    receiver: this.receiver,
                    parameters: [],
                    return_: [fieldWithZeroValue.node.type],
                    body: go.codeblock((writer) => {
                        writer.writeLine(`if ${this.receiver} == nil {`);
                        writer.indent();
                        writer.write("return ");
                        writer.writeNode(fieldWithZeroValue.zeroValue);
                        writer.newLine();
                        writer.dedent();
                        writer.writeLine("}");
                        writer.writeLine(`return ${this.receiver}.${fieldWithZeroValue.node.name}`);
                    }),
                    pointerReceiver: true
                });
            });
    }

    private getMarshalJsonMethod(fields: ObjectGenerator.Field[]): go.Method {
        const marshalerType = go.struct({
            embeds: [
                go.typeReference({
                    name: EMBED_TYPE_NAME
                })
            ]
        });
        for (const field of fields) {
            if (field.serde == null) {
                continue;
            }
            marshalerType.addField(field.serde.field);
        }
        const marshalerInstantiation = go.TypeInstantiation.struct({
            typeReference: marshalerType,
            fields: [
                {
                    name: EMBED_TYPE_NAME,
                    value: go.TypeInstantiation.reference(go.identifier(`${EMBED_TYPE_NAME}(*${this.receiver})`))
                },
                ...fields
                    .map((field) => {
                        const serde = field.serde;
                        if (serde == null) {
                            return undefined;
                        }
                        return {
                            name: serde.field.name,
                            value: go.TypeInstantiation.reference(serde.marshal)
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
                writer.write(`var ${MARSHALER_TYPE_NAME} = `);
                writer.writeNode(marshalerInstantiation);
                writer.newLine();
                writer.write("return ");
                if (this.objectDeclaration.extraProperties) {
                    writer.writeNode(
                        this.context.callMarshalJsonWithExtraProperties([
                            go.identifier(MARSHALER_TYPE_NAME),
                            this.getExtraPropertiesFieldReference()
                        ])
                    );
                } else {
                    writer.writeNode(this.context.callJsonMarshal(go.identifier(MARSHALER_TYPE_NAME)));
                }
                writer.newLine();
            }),
            pointerReceiver: true
        });
    }

    private getUnmarshalJsonMethod(fields: ObjectGenerator.Field[]): go.Method {
        return go.method({
            typeReference: this.typeReference,
            name: "UnmarshalJSON",
            parameters: [go.parameter({ name: "data", type: go.Type.bytes() })],
            return_: [go.Type.error()],
            body: this.getUnmarshalJsonMethodBody(fields),
            pointerReceiver: true
        });
    }

    private getUnmarshalJsonMethodBody(fields: ObjectGenerator.Field[]): go.AstNode {
        return this.needsCustomUnmarshalJsonMethodBody(fields)
            ? this.getCustomUnmarshalJsonMethodBody(fields)
            : this.getDefaultUnmarshalJsonMethodBody(fields);
    }

    private getCustomUnmarshalJsonMethodBody(fields: ObjectGenerator.Field[]): go.AstNode {
        const typeName = go.Type.reference(
            go.typeReference({
                name: this.context.getClassName(this.typeDeclaration.name.name)
            })
        );
        const unmarshalerType = go.struct({
            embeds: [
                go.typeReference({
                    name: EMBED_TYPE_NAME
                })
            ]
        });
        for (const field of fields) {
            if (field.serde == null) {
                continue;
            }
            unmarshalerType.addField(field.serde.field);
        }
        const unmarshalerInstantiation = go.TypeInstantiation.struct({
            typeReference: unmarshalerType,
            fields: [
                {
                    name: EMBED_TYPE_NAME,
                    value: go.TypeInstantiation.reference(go.identifier(`${EMBED_TYPE_NAME}(*${this.receiver})`))
                }
            ]
        });
        return go.codeblock((writer) => {
            writer.writeNode(
                go.typeDeclaration({
                    name: EMBED_TYPE_NAME,
                    type: typeName
                })
            );
            writer.newLine();
            writer.write("var unmarshaler = ");
            writer.writeNode(unmarshalerInstantiation);
            writer.newLine();
            this.callJsonUnmarshalAndReturnValue({
                writer,
                data: go.identifier("data"),
                value: go.identifier(`&${UNMARSHALER_TYPE_NAME}`)
            });
            writer.write(`*${this.receiver} = `);
            writer.writeNode(typeName);
            writer.writeLine(`(${UNMARSHALER_TYPE_NAME}.embed)`);
            for (const field of fields) {
                if (field.serde?.unmarshal == null) {
                    continue;
                }
                writer.writeNode(field.serde.unmarshal);
            }
            this.callExtractExtraPropertiesAndReturnValue({
                writer,
                fields
            });
            this.setRawJsonField({ writer });
            writer.writeLine("return nil");
        });
    }

    private getDefaultUnmarshalJsonMethodBody(fields: ObjectGenerator.Field[]): go.AstNode {
        const typeName = go.Type.reference(
            go.typeReference({
                name: this.context.getClassName(this.typeDeclaration.name.name)
            })
        );
        return go.codeblock((writer) => {
            writer.writeNode(
                go.typeDeclaration({
                    name: UNMARSHALER_TYPE_NAME,
                    type: typeName
                })
            );
            writer.newLine();
            writer.writeLine(`var value ${UNMARSHALER_TYPE_NAME}`);
            this.callJsonUnmarshalAndReturnValue({
                writer,
                data: go.identifier("data"),
                value: go.identifier("&value")
            });
            writer.write(`*${this.receiver} = `);
            writer.writeNode(typeName);
            writer.writeLine("(value)");
            this.callExtractExtraPropertiesAndReturnValue({
                writer,
                fields
            });
            this.setRawJsonField({ writer });
            writer.writeLine("return nil");
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

    private callExtractExtraPropertiesAndReturnValue({
        writer,
        fields
    }: {
        writer: go.Writer;
        fields: ObjectGenerator.Field[];
    }): void {
        writer.write("extraProperties, err := ");
        writer.writeNode(
            this.context.callExtractExtraProperties([
                go.identifier("data"),
                go.identifier(`*${this.receiver}`),
                ...fields
                    .filter((field) => field.serde?.isLiteral)
                    .map((field) => go.TypeInstantiation.string(field.node.name))
            ])
        );
        writer.newLine();
        writer.writeLine("if err != nil {");
        writer.indent();
        writer.writeLine("return err");
        writer.dedent();
        writer.writeLine("}");
        writer.writeNode(this.getExtraPropertiesFieldReference());
        writer.writeLine(" = extraProperties");
    }

    private callJsonUnmarshalAndReturnValue({
        writer,
        data,
        value
    }: {
        writer: go.Writer;
        data: go.AstNode;
        value: go.AstNode;
    }): void {
        writer.write("if err := ");
        writer.writeNode(
            this.context.callJsonUnmarshal({
                data,
                value
            })
        );
        writer.writeLine("; err != nil {");
        writer.indent();
        writer.writeLine("return err");
        writer.dedent();
        writer.writeLine("}");
    }

    private setRawJsonField({ writer }: { writer: go.Writer }): void {
        writer.writeNode(this.getRawJsonFieldReference());
        writer.write(" = ");
        writer.writeNode(this.context.newJsonRawMessage(go.identifier("data")));
        writer.newLine();
    }

    private getExtraPropertiesField(): ObjectGenerator.Field {
        if (this.objectDeclaration.extraProperties) {
            return {
                node: go.field({
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
            node: go.field({
                name: "extraProperties",
                type: go.Type.map(go.Type.string(), go.Type.any())
            }),
            zeroValue: go.TypeInstantiation.nil()
        };
    }

    private getExtraPropertiesFieldReference(): go.AstNode {
        return go.selector({
            on: go.identifier(this.receiver),
            selector: go.identifier(this.getExtraPropertiesFieldName())
        });
    }

    private getExtraPropertiesFieldName(): string {
        return this.getExtraPropertiesField().node.name;
    }

    private getRawJsonField(): ObjectGenerator.Field {
        return {
            node: go.field({
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

    private getSerde({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Serde | undefined {
        const literal = this.context.maybeLiteral(typeReference);
        if (literal != null) {
            return this.getLiteralSerde({ name, typeReference, literal });
        }
        if (this.context.isDate(typeReference)) {
            return this.getDateSerde({ name, typeReference });
        }
        if (this.context.isDateTime(typeReference)) {
            return this.getDateTimeSerde({ name, typeReference });
        }
        return undefined;
    }

    private getLiteralSerde({
        name,
        typeReference,
        literal
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
        literal: Literal;
    }): ObjectGenerator.Serde | undefined {
        const unmarshalerFieldName = `${UNMARSHALER_TYPE_NAME}.${this.context.getFieldName(name.name)}`;
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
            marshal: this.context.getLiteralValue(literal),
            unmarshal: go.codeblock((writer) => {
                writer.write(`if ${unmarshalerFieldName} != `);
                writer.writeNode(this.context.getLiteralValue(literal));
                writer.writeLine(` {`);
                writer.indent();
                writer.write("return ");
                writer.writeNode(
                    this.context.callFmtErrorf("unexpected value for literal on type %T; expected %v got %v", [
                        go.identifier(this.receiver),
                        this.context.getLiteralValue(literal),
                        go.identifier(unmarshalerFieldName)
                    ])
                );
                writer.newLine();
                writer.dedent();
                writer.writeLine("}");
                writer.writeLine(
                    `${this.receiver}.${this.context.getLiteralFieldName(name.name)} = ${unmarshalerFieldName}`
                );
            }),
            isLiteral: true
        };
    }

    private getDateSerde({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Serde | undefined {
        const unmarshalerFieldName = `${UNMARSHALER_TYPE_NAME}.${this.context.getFieldName(name.name)}`;
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
            marshal: isOptional
                ? this.context.callNewOptionalDate(fieldReference)
                : this.context.callNewDate(fieldReference),
            unmarshal: isOptional
                ? this.callTimePtrMethod({ fieldReference, unmarshalerFieldName })
                : this.callTimeMethod({ fieldReference, unmarshalerFieldName })
        };
    }

    private getDateTimeSerde({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): ObjectGenerator.Serde | undefined {
        const unmarshalerFieldName = `${UNMARSHALER_TYPE_NAME}.${this.context.getFieldName(name.name)}`;
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
            marshal: isOptional
                ? this.context.callNewOptionalDateTime(fieldReference)
                : this.context.callNewDateTime(fieldReference),
            unmarshal: isOptional
                ? this.callTimePtrMethod({ fieldReference, unmarshalerFieldName })
                : this.callTimeMethod({ fieldReference, unmarshalerFieldName })
        };
    }

    private callTimeMethod({
        fieldReference,
        unmarshalerFieldName
    }: {
        fieldReference: go.AstNode;
        unmarshalerFieldName: string;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(fieldReference);
            writer.write(" = ");
            writer.writeNode(
                go.selector({
                    on: go.identifier(unmarshalerFieldName),
                    selector: go.identifier("Time()")
                })
            );
            writer.newLine();
        });
    }

    private callTimePtrMethod({
        fieldReference,
        unmarshalerFieldName
    }: {
        fieldReference: go.AstNode;
        unmarshalerFieldName: string;
    }): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(fieldReference);
            writer.write(" = ");
            writer.writeNode(
                go.selector({
                    on: go.identifier(unmarshalerFieldName),
                    selector: go.identifier("TimePtr()")
                })
            );
            writer.newLine();
        });
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

    private shouldExcludeGetterMethod(field: ObjectGenerator.Field): boolean {
        return field.node.name === RAW_JSON_FIELD_NAME;
    }

    private needsCustomMarshalJsonMethod(fields: ObjectGenerator.Field[]): boolean {
        return this.objectDeclaration.extraProperties || fields.some((field) => field.serde?.marshal != null);
    }

    private needsCustomUnmarshalJsonMethodBody(fields: ObjectGenerator.Field[]): boolean {
        return this.objectDeclaration.extraProperties || fields.some((field) => field.serde?.unmarshal != null);
    }

    private getAllObjectProperties(): ObjectProperty[] {
        return [...(this.objectDeclaration.extendedProperties ?? []), ...this.objectDeclaration.properties];
    }
}
