import { assertNever } from "@fern-api/core-utils";
import { ContainerType, Literal, MapType, NamedType, PrimitiveType, TypeReference } from "@fern-fern/ir-sdk/api";
import { csharp } from "../";
import { CodeBlock } from "../ast";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { AbstractCsharpGeneratorContext } from "./AbstractCsharpGeneratorContext";

type WrapperType = "optional" | "list" | "map";

const WrapperType = {
    Optional: "optional",
    List: "list",
    Map: "map"
} as const;

export declare namespace CsharpProtobufTypeMapper {
    interface ToProtoArgs {
        protobufClassReference: csharp.ClassReference;
        properties: CsharpProtobufTypeMapper.Property[];
    }

    interface Property {
        propertyName: string;
        typeReference: TypeReference;
    }
}

export class CsharpProtobufTypeMapper {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;

    constructor(context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>) {
        this.context = context;
    }

    public toProtoMethod({ protobufClassReference, properties }: CsharpProtobufTypeMapper.ToProtoArgs): csharp.Method {
        return csharp.method({
            name: "ToProto",
            access: "internal",
            isAsync: false,
            return_: csharp.Type.reference(protobufClassReference),
            parameters: [],
            body: csharp.codeblock((writer) => {
                if (properties.length === 0) {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: protobufClassReference,
                            arguments_: []
                        })
                    );
                    return;
                }

                writer.write("var result = ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference: protobufClassReference,
                        arguments_: []
                    })
                );

                properties.forEach(({ propertyName, typeReference }: CsharpProtobufTypeMapper.Property) => {
                    const condition = this.toProtoCondition({ propertyName, typeReference });
                    const value = this.toProtoValueWithAssignment({ propertyName, typeReference });
                    if (condition != null) {
                        writer.writeNode(condition);
                        writer.writeNodeStatement(value);
                        writer.endControlFlow();
                        return;
                    }
                    writer.writeNodeStatement(value);
                });

                writer.writeLine("return result;");
            })
        });
    }

    private toProtoCondition({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): CodeBlock | undefined {
        const conditions = this.getToProtoConditions({ propertyName, typeReference });
        if (conditions.length === 0) {
            return undefined;
        }
        return csharp.codeblock((writer) => {
            // The control flow is closed by the caller.
            writer.controlFlow("if", csharp.and({ conditions }));
        });
    }

    private getToProtoConditions({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): CodeBlock[] {
        switch (typeReference.type) {
            case "container":
                return this.getToProtoConditionsForContainer({ propertyName, container: typeReference.container });
            case "named":
                return [];
            case "primitive":
                return [];
            case "unknown":
                return [];
            default:
                assertNever(typeReference);
        }
    }

    private getToProtoConditionsForContainer({
        propertyName,
        container
    }: {
        propertyName: string;
        container: ContainerType;
    }): CodeBlock[] {
        const property = csharp.codeblock(propertyName);
        switch (container.type) {
            case "optional":
                return [
                    this.isNotNull(property),
                    ...this.getToProtoConditions({ propertyName, typeReference: container.optional })
                ];
            case "list":
            case "map":
            case "set":
                return [this.invokeAny(property)];
            case "literal":
                return [];
        }
    }

    private toProtoValueWithAssignment({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): CodeBlock {
        const value = this.toProtoValue({ propertyName, typeReference });
        return csharp.codeblock((writer) => {
            if (this.propertyNeedsAssignment({ typeReference })) {
                writer.write(`result.${propertyName} = `);
                writer.writeNode(value);
                return;
            }
            writer.writeNode(value);
        });
    }

    private toProtoValue({
        propertyName,
        typeReference,
        wrapperType
    }: {
        propertyName: string;
        typeReference: TypeReference;
        wrapperType?: WrapperType;
    }): CodeBlock {
        switch (typeReference.type) {
            case "container":
                return this.toProtoValueForContainer({
                    propertyName,
                    container: typeReference.container,
                    wrapperType
                });
            case "named":
                return this.toProtoValueForNamed({ propertyName, named: typeReference, wrapperType });
            case "primitive":
                return this.toProtoValueForPrimitive({ propertyName, primitive: typeReference.primitive, wrapperType });
            case "unknown":
                return csharp.codeblock(propertyName);
        }
    }

    private toProtoValueForNamed({
        propertyName,
        named,
        wrapperType
    }: {
        propertyName: string;
        named: NamedType;
        wrapperType?: WrapperType;
    }): CodeBlock {
        if (this.context.protobufResolver.isProtobufStruct(named.typeId)) {
            return this.toProtoValueForProtobufStruct({ propertyName });
        }
        if (wrapperType === WrapperType.List) {
            return csharp.codeblock(`${propertyName}.Select(elem => elem.ToProto())`);
        }
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: csharp.codeblock(propertyName),
                    method: "ToProto",
                    arguments_: []
                })
            );
        });
    }

    private toProtoValueForProtobufStruct({ propertyName }: { propertyName: string }): CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: this.context.getProtoConverterClassReference(),
                    method: "ToProtoStruct",
                    arguments_: [csharp.codeblock(propertyName)]
                })
            );
        });
    }

    private toProtoValueForContainer({
        propertyName,
        container,
        wrapperType
    }: {
        propertyName: string;
        container: ContainerType;
        wrapperType?: WrapperType;
    }): CodeBlock {
        switch (container.type) {
            case "optional":
                return this.toProtoValue({
                    propertyName,
                    typeReference: container.optional,
                    wrapperType: wrapperType ?? WrapperType.Optional
                });
            case "list":
                return this.toProtoValueForList({ propertyName, listType: container.list });
            case "set":
                return this.toProtoValueForList({ propertyName, listType: container.set });
            case "map":
                return this.toProtoValueForMap({ propertyName, map: container });
            case "literal":
                return this.toProtoValueForLiteral({ literal: container.literal });
        }
    }

    private toProtoValueForList({
        propertyName,
        listType
    }: {
        propertyName: string;
        listType: TypeReference;
    }): CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: csharp.codeblock(`result.${propertyName}`),
                    method: "AddRange",
                    arguments_: [
                        this.toProtoValue({
                            propertyName,
                            typeReference: listType,
                            wrapperType: WrapperType.List
                        })
                    ]
                })
            );
        });
    }

    private toProtoValueForMap({ propertyName, map }: { propertyName: string; map: MapType }): CodeBlock {
        return csharp.codeblock((writer) => {
            writer.controlFlow("foreach", csharp.codeblock(`var kvp in ${propertyName}`));
            writer.writeNodeStatement(
                csharp.invokeMethod({
                    on: csharp.codeblock(`result.${propertyName}`),
                    method: "Add",
                    arguments_: [
                        csharp.codeblock("kvp.Key"),
                        this.toProtoValue({
                            propertyName: "kvp.Value",
                            typeReference: map.valueType,
                            wrapperType: WrapperType.Map
                        })
                    ]
                })
            );
            writer.endControlFlow();
        });
    }

    private toProtoValueForLiteral({ literal }: { literal: Literal }): CodeBlock {
        return csharp.codeblock((writer) => {
            switch (literal.type) {
                case "string":
                    return writer.write(`"${literal.string}"`);
                case "boolean":
                    return writer.write(literal.boolean.toString());
            }
        });
    }

    private toProtoValueForPrimitive({
        propertyName,
        primitive,
        wrapperType
    }: {
        propertyName: string;
        primitive: PrimitiveType;
        wrapperType?: WrapperType;
    }): CodeBlock {
        if (wrapperType === WrapperType.Optional) {
            return csharp.codeblock((writer) => {
                writer.write(propertyName);
                writer.write(" ?? ");
                writer.writeNode(this.context.getDefaultValueForPrimitive({ primitive }));
            });
        }
        return csharp.codeblock(propertyName);
    }

    private propertyNeedsAssignment({ typeReference }: { typeReference: TypeReference }): boolean {
        if (typeReference.type === "container") {
            switch (typeReference.container.type) {
                case "optional":
                    return this.propertyNeedsAssignment({ typeReference: typeReference.container.optional });
                case "list":
                case "set":
                case "map":
                    return false;
            }
        }
        return true;
    }

    private invokeAny(on: csharp.AstNode): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on,
                    method: "Any",
                    arguments_: []
                })
            );
        });
    }

    private isNotNull(value: csharp.AstNode): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(value);
            writer.write(" != null");
        });
    }
}
