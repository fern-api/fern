import { FileLocation, GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import {
    HttpEndpoint,
    HttpService,
    Literal,
    Name,
    NameAndWireValue,
    ObjectProperty,
    SdkRequestWrapper,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { GoTypeReference } from "@fern-api/go-ast/src/ast";
import { assertNever } from "@fern-api/core-utils";

const EMBED_TYPE_NAME = "embed";
const MARSHALER_TYPE_NAME = "marshaler";
const UNMARSHALER_TYPE_NAME = "unmarshaler";

declare namespace RequestWrapperGenerator {
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

// TODO: This abstraction shares a lot of the same implementation details as the ObjectGenerator.
// We should refactor this to share more implementation details.
//
// The original implementation for this utility is implemented with the WriteRequestType method in
// the legacy Go SDK generator.
export class RequestWrapperGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly wrapper: SdkRequestWrapper;
    private readonly service: HttpService;
    private readonly endpoint: HttpEndpoint;
    private readonly location: FileLocation;
    private readonly typeReference: GoTypeReference;
    private readonly receiver: string;

    constructor(
        context: SdkGeneratorContext,
        wrapper: SdkRequestWrapper,
        service: HttpService,
        endpoint: HttpEndpoint,
    ) {
        this.context = context;
        this.wrapper = wrapper;
        this.service = service;
        this.endpoint = endpoint;
        this.location = this.context.getPackageLocation(this.service.name.fernFilepath);
        this.typeReference = go.typeReference({
            name: this.context.getClassName(this.wrapper.wrapperName),
            importPath: this.location.importPath
        });
        this.receiver = this.context.getReceiverName(this.wrapper.wrapperName);
    }

    protected doGenerate(): GoFile {
        const struct_ = go.struct({
            ...this.typeReference,
        });
        const fields = this.getFields();
        struct_.addField(...fields.map((field) => field.node));
        struct_.addMethod(...this.getGetterMethods(fields));
        if (this.needsCustomUnmarshalJsonMethod(fields)) {
            struct_.addMethod(this.getUnmarshalJsonMethod(fields));
        }
        if (this.needsCustomMarshalJsonMethod(fields)) {
            struct_.addMethod(this.getMarshalJsonMethod(fields));
        }
        return new GoFile({
            node: struct_,
            importPath: this.location.importPath,
            packageName: this.context.getTypePackageName(this.service.name),
            directory: this.location.directory,
            filename: this.context.getTypeFilename(this.service.name),
            rootImportPath: this.context.getRootImportPath(),
            customConfig: this.context.customConfig,
            includeGeneratedCodeHeader: true
        });
    }

    // TODO: Include path parameters and file properties as fields when inlinePathParameters 
    // and inlineFileProperties are enabled, respectively.
    private getFields(): RequestWrapperGenerator.Field[] {
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
        return [...fields];
    }

    private getGetterMethods(fields: RequestWrapperGenerator.Field[]): go.Method[] {
        return fields
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

    private getMarshalJsonMethod(fields: RequestWrapperGenerator.Field[]): go.Method {
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
                                name: this.context.getClassName(this.wrapper.wrapperName)
                            })
                        )
                    })
                );
                writer.newLine();
                writer.write(`var ${MARSHALER_TYPE_NAME} = `);
                writer.writeNode(marshalerInstantiation);
                writer.newLine();
                writer.write("return ");
                writer.writeNode(this.context.callJsonMarshal(go.identifier(MARSHALER_TYPE_NAME)));
                writer.newLine();
            }),
            pointerReceiver: true
        });
    }

    private getUnmarshalJsonMethod(fields: RequestWrapperGenerator.Field[]): go.Method {
        return go.method({
            typeReference: this.typeReference,
            name: "UnmarshalJSON",
            parameters: [go.parameter({ name: "data", type: go.Type.bytes() })],
            return_: [go.Type.error()],
            body: this.getUnmarshalJsonMethodBody(fields),
            pointerReceiver: true
        });
    }

    private getUnmarshalJsonMethodBody(fields: RequestWrapperGenerator.Field[]): go.AstNode {
        const typeName = go.Type.reference(this.typeReference);
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
            writer.writeLine("return nil");
        });
    }

    private callExtractExtraPropertiesAndReturnValue({
        writer,
        fields
    }: {
        writer: go.Writer;
        fields: RequestWrapperGenerator.Field[];
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

    private getExtraPropertiesField(): RequestWrapperGenerator.Field | undefined {
        if (this.supportsExtraProperties()) {
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
        return undefined;
    }

    private getExtraPropertiesFieldReference(): go.AstNode {
        const extraPropertiesFieldName = this.getExtraPropertiesFieldName();
        if (extraPropertiesFieldName == null) {
            return go.TypeInstantiation.nop();
        }
        return go.selector({
            on: go.identifier(this.receiver),
            selector: go.identifier(extraPropertiesFieldName)
        });
    }

    private getExtraPropertiesFieldName(): string | undefined {
        const extraPropertiesField = this.getExtraPropertiesField();
        if (extraPropertiesField == null) {
            return undefined;
        }
        return extraPropertiesField.node.name;
    }


    private getSerde({
        name,
        typeReference
    }: {
        name: NameAndWireValue;
        typeReference: TypeReference;
    }): RequestWrapperGenerator.Serde | undefined {
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
    }): RequestWrapperGenerator.Serde | undefined {
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
    }): RequestWrapperGenerator.Serde | undefined {
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
    }): RequestWrapperGenerator.Serde | undefined {
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

    private supportsExtraProperties(): boolean {
        const requestBody = this.endpoint.requestBody;
        if (requestBody == null) {
            return false;
        }
        switch (requestBody.type) {
            case "inlinedRequestBody":
                return requestBody.extraProperties;
            case "reference":
            case "fileUpload":
            case "bytes":
                return false;
            default:
                assertNever(requestBody);
        }
    }

    private needsCustomMarshalJsonMethod(fields: RequestWrapperGenerator.Field[]): boolean {
        return fields.some((field) => field.serde?.marshal != null);
    }

    private needsCustomUnmarshalJsonMethod(fields: RequestWrapperGenerator.Field[]): boolean {
        return fields.some((field) => field.serde?.unmarshal != null);
    }

    private getAllObjectProperties(): ObjectProperty[] {
        // TODO: Implement me!
        return [];
    }
}
