import { assertNever } from "@fern-api/core-utils";
import { BaseCsharpCustomConfigSchema, csharp } from "@fern-api/csharp-codegen";

import {
    ContainerType,
    EnumTypeDeclaration,
    EnumValue,
    Literal,
    MapType,
    NamedType,
    PrimitiveType,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { AbstractCsharpGeneratorContext } from "../context/AbstractCsharpGeneratorContext";
import { EXTERNAL_PROTO_TIMESTAMP_CLASS_REFERENCE } from "./constants";

type WrapperType = "optional" | "list" | "map";

const WrapperType = {
    Optional: "optional",
    List: "list",
    Map: "map"
} as const;

export declare namespace CsharpProtobufTypeMapper {
    interface Args {
        classReference: csharp.ClassReference;
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

    public toProtoMethod({
        classReference,
        protobufClassReference,
        properties
    }: CsharpProtobufTypeMapper.Args): csharp.Method {
        const mapper = new ToProtoPropertyMapper({ context: this.context });
        return csharp.method({
            name: "ToProto",
            access: csharp.Access.Internal,
            isAsync: false,
            summary: `Maps the ${classReference.name} type into its Protobuf-equivalent representation.`,
            parameters: [],
            return_: csharp.Type.reference(protobufClassReference),
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
                    const condition = mapper.getCondition({ propertyName, typeReference });
                    const value = mapper.getValueWithAssignment({ propertyName, typeReference });
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

    public fromProtoMethod({
        classReference,
        protobufClassReference,
        properties
    }: CsharpProtobufTypeMapper.Args): csharp.Method {
        const mapper = new FromProtoPropertyMapper({ context: this.context });
        return csharp.method({
            name: "FromProto",
            access: csharp.Access.Internal,
            isAsync: false,
            type: csharp.MethodType.STATIC,
            summary: `Returns a new ${classReference.name} type from its Protobuf-equivalent representation.`,
            parameters: [
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.reference(protobufClassReference)
                })
            ],
            return_: csharp.Type.reference(classReference),
            body: csharp.codeblock((writer) => {
                if (properties.length === 0) {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference,
                            arguments_: []
                        })
                    );
                    return;
                }
                writer.write("return ");
                writer.writeNodeStatement(
                    csharp.instantiateClass({
                        classReference,
                        arguments_: properties.map(({ propertyName, typeReference }) => {
                            return {
                                name: propertyName,
                                assignment: mapper.getValue({
                                    propertyName: `value.${propertyName}`,
                                    typeReference
                                })
                            };
                        })
                    })
                );
            })
        });
    }
}

class ToProtoPropertyMapper {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;

    constructor({ context }: { context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema> }) {
        this.context = context;
    }

    public getCondition({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): csharp.CodeBlock | undefined {
        const conditions = this.getConditions({ propertyName, typeReference });
        if (conditions.length === 0) {
            return undefined;
        }
        return csharp.codeblock((writer) => {
            // The control flow is closed by the caller.
            writer.controlFlow("if", csharp.and({ conditions }));
        });
    }

    public getValueWithAssignment({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): csharp.CodeBlock {
        const value = this.getValue({ propertyName, typeReference });
        return csharp.codeblock((writer) => {
            if (this.propertyNeedsAssignment({ typeReference })) {
                writer.write(`result.${propertyName} = `);
                writer.writeNode(value);
                return;
            }
            writer.writeNode(value);
        });
    }

    private getConditions({
        propertyName,
        typeReference,
        wrapperType
    }: {
        propertyName: string;
        typeReference: TypeReference;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock[] {
        switch (typeReference.type) {
            case "container":
                return this.getConditionsForContainer({
                    propertyName,
                    container: typeReference.container,
                    wrapperType
                });
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

    private getConditionsForContainer({
        propertyName,
        container,
        wrapperType
    }: {
        propertyName: string;
        container: ContainerType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock[] {
        const property = csharp.codeblock(propertyName);
        switch (container.type) {
            case "optional":
                if (wrapperType === WrapperType.Optional) {
                    return this.getConditions({
                        propertyName,
                        typeReference: container.optional,
                        wrapperType: WrapperType.Optional
                    });
                }
                return [
                    this.isNotNull(property),
                    ...this.getConditions({
                        propertyName,
                        typeReference: container.optional,
                        wrapperType: WrapperType.Optional
                    })
                ];
            case "nullable":
                if (wrapperType === WrapperType.Optional) {
                    return this.getConditions({
                        propertyName,
                        typeReference: container.nullable,
                        wrapperType: WrapperType.Optional
                    });
                }
                return [
                    this.isNotNull(property),
                    ...this.getConditions({
                        propertyName,
                        typeReference: container.nullable,
                        wrapperType: WrapperType.Optional
                    })
                ];
            case "list":
                if (this.context.isReadOnlyMemoryType(container.list)) {
                    if (wrapperType === WrapperType.Optional) {
                        return [this.isNotEmpty(csharp.codeblock(`${propertyName}.Value`))];
                    }
                    return [this.isNotEmpty(property)];
                }
                return [this.invokeAny(property)];
            case "map":
            case "set":
                return [this.invokeAny(property)];
            case "literal":
                return [];
        }
    }

    private getValue({
        propertyName,
        typeReference,
        wrapperType
    }: {
        propertyName: string;
        typeReference: TypeReference;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        switch (typeReference.type) {
            case "container":
                return this.getValueForContainer({
                    propertyName,
                    container: typeReference.container,
                    wrapperType
                });
            case "named":
                return this.getValueForNamed({ propertyName, named: typeReference, wrapperType });
            case "primitive":
                return this.getValueForPrimitive({ propertyName, primitive: typeReference.primitive, wrapperType });
            case "unknown":
                return csharp.codeblock(propertyName);
        }
    }

    private getValueForNamed({
        propertyName,
        named,
        wrapperType
    }: {
        propertyName: string;
        named: NamedType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        if (this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)) {
            return this.getValueForAny({ propertyName });
        }
        const resolvedType = this.context.getTypeDeclarationOrThrow(named.typeId);
        if (resolvedType.shape.type === "enum") {
            const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(named, {
                fullyQualified: true
            });
            if (wrapperType === WrapperType.List) {
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference: this.context.protobufResolver.getProtobufClassReferenceOrThrow(
                        named.typeId
                    ),
                    propertyName
                });
            }
            const protobufClassReference = this.context.protobufResolver.getProtobufClassReferenceOrThrow(named.typeId);
            return this.getValueForEnum({
                enum_: resolvedType.shape,
                classReference: enumClassReference,
                protobufClassReference,
                propertyName
            });
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

    private getValueForAny({ propertyName }: { propertyName: string }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: this.context.getProtoAnyMapperClassReference(),
                    method: "ToProto",
                    arguments_: [csharp.codeblock(propertyName)]
                })
            );
        });
    }

    private getValueForEnumList({
        enum_,
        classReference,
        protobufClassReference,
        propertyName
    }: {
        enum_: EnumTypeDeclaration;
        classReference: csharp.ClassReference;
        protobufClassReference: csharp.ClassReference;
        propertyName: string;
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Select(type => type switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(this.context.getPascalCaseSafeName(enumValue.name.name));
                writer.write(" => ");
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ context: this.context, classReference, enumValue }));
                writer.writeLine(",");
            }
            writer.writeLine(' _ => throw new ArgumentException($"Unknown enum value: {type}")');
            writer.write("})");
        });
    }

    private getValueForEnum({
        enum_,
        classReference,
        protobufClassReference,
        propertyName
    }: {
        enum_: EnumTypeDeclaration;
        classReference: csharp.ClassReference;
        protobufClassReference: csharp.ClassReference;
        propertyName: string;
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Value switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(this.context.getPascalCaseSafeName(enumValue.name.name));
                writer.write(" => ");
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ context: this.context, classReference, enumValue }));
                writer.writeLine(",");
            }
            writer.writeLine(` _ => throw new ArgumentException($"Unknown enum value: {${propertyName}.Value}")`);
            writer.write("}");
        });
    }

    private getValueForContainer({
        propertyName,
        container,
        wrapperType
    }: {
        propertyName: string;
        container: ContainerType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        switch (container.type) {
            case "optional":
                return this.getValue({
                    propertyName,
                    typeReference: container.optional,
                    wrapperType: wrapperType ?? WrapperType.Optional
                });
            case "nullable":
                return this.getValue({
                    propertyName,
                    typeReference: container.nullable,
                    wrapperType: wrapperType ?? WrapperType.Optional
                });
            case "list":
                return this.getValueForList({ propertyName, listType: container.list, wrapperType });
            case "set":
                return this.getValueForList({ propertyName, listType: container.set, wrapperType });
            case "map":
                return this.getValueForMap({ propertyName, map: container });
            case "literal":
                return getValueForLiteral({ literal: container.literal });
        }
    }

    private getValueForList({
        propertyName,
        listType,
        wrapperType
    }: {
        propertyName: string;
        listType: TypeReference;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        const valuePropertyName =
            this.context.isReadOnlyMemoryType(listType) && wrapperType === WrapperType.Optional
                ? `${propertyName}.Value`
                : propertyName;
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: csharp.codeblock(`result.${propertyName}`),
                    method: "AddRange",
                    arguments_: [
                        this.getValue({
                            propertyName: valuePropertyName,
                            typeReference: listType,
                            wrapperType: WrapperType.List
                        })
                    ]
                })
            );
        });
    }

    private getValueForMap({ propertyName, map }: { propertyName: string; map: MapType }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.controlFlow("foreach", csharp.codeblock(`var kvp in ${propertyName}`));
            writer.writeNodeStatement(
                csharp.invokeMethod({
                    on: csharp.codeblock(`result.${propertyName}`),
                    method: "Add",
                    arguments_: [
                        csharp.codeblock("kvp.Key"),
                        this.getValue({
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

    private getValueForPrimitive({
        propertyName,
        primitive,
        wrapperType
    }: {
        propertyName: string;
        primitive: PrimitiveType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        const primitiveValue = this.getValueMapperForPrimitive({ propertyName, primitive });
        if (primitive.v1 === "DATE_TIME") {
            // The google.protobuf.Timestamp type doesn't need a default value guard.
            return primitiveValue;
        }
        if (wrapperType === WrapperType.Optional) {
            return csharp.codeblock((writer) => {
                writer.writeNode(primitiveValue);
                writer.write(" ?? ");
                writer.writeNode(this.context.getDefaultValueForPrimitive({ primitive }));
            });
        }
        if (wrapperType === WrapperType.List && this.context.isReadOnlyMemoryType(TypeReference.primitive(primitive))) {
            return csharp.codeblock((writer) => {
                writer.writeNode(
                    csharp.invokeMethod({
                        on: csharp.codeblock(propertyName),
                        method: "ToArray",
                        arguments_: []
                    })
                );
            });
        }
        return primitiveValue;
    }

    private getValueMapperForPrimitive({
        propertyName,
        primitive
    }: {
        propertyName: string;
        primitive: PrimitiveType;
    }): csharp.CodeBlock {
        switch (primitive.v1) {
            case "DATE_TIME":
                return csharp.codeblock((writer) =>
                    writer.writeNode(
                        csharp.invokeMethod({
                            on: EXTERNAL_PROTO_TIMESTAMP_CLASS_REFERENCE,
                            method: "FromDateTime",
                            arguments_: [
                                csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        csharp.invokeMethod({
                                            on: csharp.codeblock(`${propertyName}.Value`),
                                            method: "ToUniversalTime",
                                            arguments_: []
                                        })
                                    );
                                })
                            ]
                        })
                    )
                );
            case "DATE":
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
            case "BOOLEAN":
            case "STRING":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return csharp.codeblock(propertyName);
            default:
                assertNever(primitive.v1);
        }
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

    private isNotEmpty(on: csharp.AstNode): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.write("!");
            writer.writeNode(on);
            writer.write(".IsEmpty");
        });
    }
}

class FromProtoPropertyMapper {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;
    private readonly enumerableClassReference = csharp.classReference({
        namespace: "System.Linq",
        name: "Enumerable"
    });

    constructor({ context }: { context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema> }) {
        this.context = context;
    }

    public getValue({
        propertyName,
        typeReference,
        wrapperType
    }: {
        propertyName: string;
        typeReference: TypeReference;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        switch (typeReference.type) {
            case "container":
                return this.getValueForContainer({
                    propertyName,
                    container: typeReference.container,
                    wrapperType
                });
            case "named":
                return this.getValueForNamed({ propertyName, named: typeReference, wrapperType });
            case "primitive":
                return this.getValueForPrimitive({ propertyName, primitive: typeReference.primitive });
            case "unknown":
                return csharp.codeblock(propertyName);
        }
    }

    private getValueForNamed({
        propertyName,
        named,
        wrapperType
    }: {
        propertyName: string;
        named: NamedType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        const resolvedType = this.context.getTypeDeclarationOrThrow(named.typeId);
        if (resolvedType.shape.type === "enum") {
            const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(named, {
                fullyQualified: true
            });
            if (wrapperType === WrapperType.List) {
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference: this.context.protobufResolver.getProtobufClassReferenceOrThrow(
                        named.typeId
                    ),
                    propertyName
                });
            }
            return this.getValueForEnum({
                enum_: resolvedType.shape,
                classReference: enumClassReference,
                protobufClassReference: this.context.protobufResolver.getProtobufClassReferenceOrThrow(named.typeId),
                propertyName
            });
        }
        const propertyClassReference = this.context.csharpTypeMapper.convertToClassReference(named);
        if (wrapperType === WrapperType.List) {
            // The static function is mapped within a LINQ expression.
            return csharp.codeblock((writer) => {
                writer.writeNode(propertyClassReference);
                writer.write(".FromProto");
            });
        }
        const fromProtoExpression = this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)
            ? this.getValueForAny({ propertyName })
            : csharp.codeblock((writer) => {
                  writer.writeNode(
                      csharp.invokeMethod({
                          on: propertyClassReference,
                          method: "FromProto",
                          arguments_: [csharp.codeblock(propertyName)]
                      })
                  );
              });
        if (wrapperType === WrapperType.Optional) {
            return csharp.codeblock((writer) => {
                writer.writeNode(
                    csharp.ternary({
                        condition: csharp.codeblock(`${propertyName} != null`),
                        true_: fromProtoExpression,
                        false_: csharp.codeblock("null")
                    })
                );
            });
        }
        return fromProtoExpression;
    }

    private getValueForAny({ propertyName }: { propertyName: string }): csharp.CodeBlock {
        return csharp.codeblock(propertyName);
    }

    private getValueForEnumList({
        enum_,
        classReference,
        protobufClassReference,
        propertyName
    }: {
        enum_: EnumTypeDeclaration;
        classReference: csharp.ClassReference;
        protobufClassReference: csharp.ClassReference;
        propertyName: string;
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Select(type => type switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ context: this.context, classReference, enumValue }));
                writer.write(" => ");
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(this.context.getPascalCaseSafeName(enumValue.name.name));
                writer.writeLine(",");
            }
            writer.writeLine(` _ => throw new ArgumentException($"Unknown enum value: {${propertyName}}")`);
            writer.write("})");
        });
    }

    private getValueForEnum({
        enum_,
        classReference,
        protobufClassReference,
        propertyName
    }: {
        enum_: EnumTypeDeclaration;
        classReference: csharp.ClassReference;
        protobufClassReference: csharp.ClassReference;
        propertyName: string;
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName} switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ context: this.context, classReference, enumValue }));
                writer.write(" => ");
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(this.context.getPascalCaseSafeName(enumValue.name.name));
                writer.writeLine(",");
            }
            writer.writeLine(` _ => throw new ArgumentException($"Unknown enum value: {${propertyName}}")`);
            writer.write("}");
        });
    }

    private getValueForContainer({
        propertyName,
        container,
        wrapperType
    }: {
        propertyName: string;
        container: ContainerType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        switch (container.type) {
            case "optional":
                return this.getValue({
                    propertyName,
                    typeReference: container.optional,
                    wrapperType: wrapperType ?? WrapperType.Optional
                });
            case "nullable":
                return this.getValue({
                    propertyName,
                    typeReference: container.nullable,
                    wrapperType: wrapperType ?? WrapperType.Optional
                });
            case "list":
                return this.getValueForList({
                    propertyName,
                    listType: container.list,
                    wrapperType
                });
            case "set":
                return this.getValueForList({
                    propertyName,
                    listType: container.set,
                    wrapperType
                });
            case "map":
                return this.getValueForMap({ propertyName, map: container, wrapperType });
            case "literal":
                return getValueForLiteral({ literal: container.literal });
        }
    }

    private getValueForList({
        propertyName,
        listType,
        wrapperType
    }: {
        propertyName: string;
        listType: ContainerType.List["list"] | ContainerType.Set["set"];
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        const on = csharp.codeblock(`${propertyName}?`);
        if (this.context.isPrimitive(listType)) {
            // Lists of primitive types can be directly mapped.
            const method = this.context.isReadOnlyMemoryType(listType) ? "ToArray" : "ToList";
            return csharp.codeblock((writer) => {
                writer.writeNode(
                    csharp.invokeMethod({
                        on,
                        method,
                        arguments_: []
                    })
                );
                if (wrapperType !== WrapperType.Optional) {
                    if (this.context.isReadOnlyMemoryType(listType)) {
                        writer.write(" ?? new ");
                        writer.writeNode(
                            csharp.Type.listType(this.context.csharpTypeMapper.convert({ reference: listType }))
                        );
                        writer.write("()");
                        return;
                    }
                    writer.write(" ?? ");
                    writer.writeNode(
                        csharp.invokeMethod({
                            on: this.enumerableClassReference,
                            method: "Empty",
                            generics: [this.context.csharpTypeMapper.convert({ reference: listType })],
                            arguments_: []
                        })
                    );
                }
            });
        }
        if (listType.type === "named") {
            const resolvedType = this.context.getTypeDeclarationOrThrow(listType.typeId);
            if (resolvedType.shape.type === "enum") {
                const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(listType, {
                    fullyQualified: true
                });
                const protobufClassReference = this.context.protobufResolver.getProtobufClassReferenceOrThrow(
                    listType.typeId
                );
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference,
                    propertyName
                });
            }
        }
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on,
                    method: "Select",
                    arguments_: [
                        this.getValue({
                            propertyName,
                            typeReference: listType,
                            wrapperType: WrapperType.List
                        })
                    ]
                })
            );
        });
    }

    private getValueForMap({
        propertyName,
        map,
        wrapperType
    }: {
        propertyName: string;
        map: MapType;
        wrapperType?: WrapperType;
    }): csharp.CodeBlock {
        return csharp.codeblock((writer) => {
            writer.writeNode(
                csharp.invokeMethod({
                    on: csharp.codeblock(`${propertyName}?`),
                    method: "ToDictionary",
                    arguments_: [
                        csharp.codeblock("kvp => kvp.Key"),
                        csharp.codeblock((writer) => {
                            writer.write("kvp => ");
                            writer.writeNode(
                                this.getValue({
                                    propertyName: "kvp.Value",
                                    typeReference: map.valueType,
                                    wrapperType: WrapperType.Map
                                })
                            );
                        })
                    ]
                })
            );
            if (wrapperType !== WrapperType.Optional) {
                writer.write(" ?? new ");
                writer.writeNode(
                    this.context.csharpTypeMapper.convert({
                        reference: TypeReference.container(ContainerType.map(map))
                    })
                );
                writer.write("()");
            }
        });
    }

    private getValueForPrimitive({
        propertyName,
        primitive
    }: {
        propertyName: string;
        primitive: PrimitiveType;
    }): csharp.CodeBlock {
        switch (primitive.v1) {
            case "DATE_TIME":
                return csharp.codeblock(`${propertyName}.ToDateTime()`);
            case "DATE":
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
            case "BOOLEAN":
            case "STRING":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return csharp.codeblock(propertyName);
            default:
                assertNever(primitive.v1);
        }
    }
}

function getValueForLiteral({ literal }: { literal: Literal }): csharp.CodeBlock {
    return csharp.codeblock((writer) => {
        switch (literal.type) {
            case "string":
                return writer.writeNode(csharp.string_({ string: literal.string }));
            case "boolean":
                return writer.write(literal.boolean.toString());
        }
    });
}

/*
 * Protobuf enums remove the stutter in their generated enum value names.
 * For example, the enum value `Status.StatusActive` becomes `Status.Active`.
 */
function getProtobufEnumValueName({
    context,
    classReference,
    enumValue
}: {
    context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;
    classReference: csharp.ClassReference;
    enumValue: EnumValue;
}): string {
    const enumValueName = context.getPascalCaseSafeName(enumValue.name.name);
    return enumValueName.replace(classReference.name, "");
}
