import { assertNever } from "@fern-api/core-utils";
import { ast, CSharp, Generation, WithGeneration } from "@fern-api/csharp-codegen";
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
import { GeneratorContext } from "../cli";

type WrapperType = "optional" | "list" | "map";

const WrapperType = {
    Optional: "optional",
    List: "list",
    Map: "map"
} as const;

export declare namespace CsharpProtobufTypeMapper {
    interface Args {
        classReference: ast.ClassReference;
        protobufClassReference: ast.ClassReference;
        properties: CsharpProtobufTypeMapper.Property[];
    }

    interface Property {
        propertyName: string;
        typeReference: TypeReference;
    }
}

export class CsharpProtobufTypeMapper extends WithGeneration {
    public constructor(protected readonly context: GeneratorContext) {
        super(context.generation);
    }

    public toProtoMethod(
        cls: ast.Class,
        { classReference, protobufClassReference, properties }: CsharpProtobufTypeMapper.Args
    ): ast.Method {
        const mapper = new ToProtoPropertyMapper(this.context);
        return cls.addMethod({
            name: "ToProto",
            access: ast.Access.Internal,
            isAsync: false,
            summary: `Maps the ${classReference.name} type into its Protobuf-equivalent representation.`,
            parameters: [],
            return_: protobufClassReference,
            body: this.csharp.codeblock((writer) => {
                if (properties.length === 0) {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference: protobufClassReference,
                            arguments_: []
                        })
                    );
                    return;
                }

                writer.write("var result = ");
                writer.writeNodeStatement(
                    this.csharp.instantiateClass({
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

    public fromProtoMethod(
        cls: ast.Class,
        { classReference, protobufClassReference, properties }: CsharpProtobufTypeMapper.Args
    ): ast.Method {
        const mapper = new FromProtoPropertyMapper(this.context);
        return cls.addMethod({
            name: "FromProto",
            access: ast.Access.Internal,
            isAsync: false,
            type: ast.MethodType.STATIC,
            summary: `Returns a new ${classReference.name} type from its Protobuf-equivalent representation.`,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: protobufClassReference
                })
            ],
            return_: classReference,
            body: this.csharp.codeblock((writer) => {
                if (properties.length === 0) {
                    writer.write("return ");
                    writer.writeNodeStatement(
                        this.csharp.instantiateClass({
                            classReference,
                            arguments_: []
                        })
                    );
                    return;
                }
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.instantiateClass({
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

class ToProtoPropertyMapper extends WithGeneration {
    public constructor(protected readonly context: GeneratorContext) {
        super(context.generation);
    }

    public getCondition({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): ast.CodeBlock | undefined {
        const conditions = this.getConditions({ propertyName, typeReference });
        if (conditions.length === 0) {
            return undefined;
        }
        return this.csharp.codeblock((writer) => {
            // The control flow is closed by the caller.
            writer.controlFlow("if", this.csharp.and({ conditions }));
        });
    }

    public getValueWithAssignment({
        propertyName,
        typeReference
    }: {
        propertyName: string;
        typeReference: TypeReference;
    }): ast.CodeBlock {
        const value = this.getValue({ propertyName, typeReference });
        return this.csharp.codeblock((writer) => {
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
    }): ast.CodeBlock[] {
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
    }): ast.CodeBlock[] {
        const property = this.csharp.codeblock(propertyName);
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
                        return [this.isNotEmpty(this.csharp.codeblock(`${propertyName}.Value`))];
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
    }): ast.CodeBlock {
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
                return this.csharp.codeblock(propertyName);
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
    }): ast.CodeBlock {
        if (this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)) {
            return this.getValueForAny({ propertyName });
        }
        const resolvedType = this.model.dereferenceType(named.typeId).typeDeclaration;
        if (resolvedType.shape.type === "enum") {
            const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(named, {
                fullyQualified: true
            });
            if (wrapperType === WrapperType.List) {
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference: this.context.protobufResolver.getProtobufClassReference(named.typeId),
                    propertyName
                });
            }
            const protobufClassReference = this.context.protobufResolver.getProtobufClassReference(named.typeId);
            return this.getValueForEnum({
                enum_: resolvedType.shape,
                classReference: enumClassReference,
                protobufClassReference,
                propertyName
            });
        }
        if (wrapperType === WrapperType.List) {
            return this.csharp.codeblock(`${propertyName}.Select(elem => elem.ToProto())`);
        }
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
                    on: this.csharp.codeblock(propertyName),
                    method: "ToProto",
                    arguments_: []
                })
            );
        });
    }

    private getValueForAny({ propertyName }: { propertyName: string }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
                    on: this.generation.Types.ProtoAnyMapper,
                    method: "ToProto",
                    arguments_: [this.csharp.codeblock(propertyName)]
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
        classReference: ast.ClassReference;
        protobufClassReference: ast.ClassReference;
        propertyName: string;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Select(type => type switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(enumValue.name.name.pascalCase.safeName);
                writer.write(" => ");
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ generation: this.generation, classReference, enumValue }));
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
        classReference: ast.ClassReference;
        protobufClassReference: ast.ClassReference;
        propertyName: string;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Value switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(enumValue.name.name.pascalCase.safeName);
                writer.write(" => ");
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ generation: this.generation, classReference, enumValue }));
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
    }): ast.CodeBlock {
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
                return getValueForLiteral({ literal: container.literal }, this.csharp);
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
    }): ast.CodeBlock {
        const valuePropertyName =
            this.context.isReadOnlyMemoryType(listType) && wrapperType === WrapperType.Optional
                ? `${propertyName}.Value`
                : propertyName;
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
                    on: this.csharp.codeblock(`result.${propertyName}`),
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

    private getValueForMap({ propertyName, map }: { propertyName: string; map: MapType }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.controlFlow("foreach", this.csharp.codeblock(`var kvp in ${propertyName}`));
            writer.writeNodeStatement(
                this.csharp.invokeMethod({
                    on: this.csharp.codeblock(`result.${propertyName}`),
                    method: "Add",
                    arguments_: [
                        this.csharp.codeblock("kvp.Key"),
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
    }): ast.CodeBlock {
        const primitiveValue = this.getValueMapperForPrimitive({ propertyName, primitive });
        if (primitive.v1 === "DATE_TIME") {
            // The google.protobuf.Timestamp type doesn't need a default value guard.
            return primitiveValue;
        }
        if (wrapperType === WrapperType.Optional) {
            return this.csharp.codeblock((writer) => {
                writer.writeNode(primitiveValue);
                writer.write(" ?? ");
                writer.writeNode(this.context.getDefaultValueForPrimitive({ primitive }));
            });
        }
        if (wrapperType === WrapperType.List && this.context.isReadOnlyMemoryType(TypeReference.primitive(primitive))) {
            return this.csharp.codeblock((writer) => {
                writer.writeNode(
                    this.csharp.invokeMethod({
                        on: this.csharp.codeblock(propertyName),
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
    }): ast.CodeBlock {
        switch (primitive.v1) {
            case "DATE_TIME":
                return this.csharp.codeblock((writer) =>
                    writer.writeNode(
                        this.csharp.invokeMethod({
                            on: this.Google.Protobuf.WellKnownTypes.Timestamp,
                            method: "FromDateTime",
                            arguments_: [
                                this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.invokeMethod({
                                            on: this.csharp.codeblock(`${propertyName}.Value`),
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
                return this.csharp.codeblock(propertyName);
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

    private invokeAny(on: ast.AstNode): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
                    on,
                    method: "Any",
                    arguments_: []
                })
            );
        });
    }

    private isNotNull(value: ast.AstNode): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(value);
            writer.write(" != null");
        });
    }

    private isNotEmpty(on: ast.AstNode): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.write("!");
            writer.writeNode(on);
            writer.write(".IsEmpty");
        });
    }
}

class FromProtoPropertyMapper extends WithGeneration {
    public constructor(protected readonly context: GeneratorContext) {
        super(context.generation);
    }

    public getValue({
        propertyName,
        typeReference,
        wrapperType
    }: {
        propertyName: string;
        typeReference: TypeReference;
        wrapperType?: WrapperType;
    }): ast.CodeBlock {
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
                return this.csharp.codeblock(propertyName);
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
    }): ast.CodeBlock {
        const resolvedType = this.model.dereferenceType(named.typeId).typeDeclaration;
        if (resolvedType.shape.type === "enum") {
            const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(named, {
                fullyQualified: true
            });
            if (wrapperType === WrapperType.List) {
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference: this.context.protobufResolver.getProtobufClassReference(named.typeId),
                    propertyName
                });
            }
            return this.getValueForEnum({
                enum_: resolvedType.shape,
                classReference: enumClassReference,
                protobufClassReference: this.context.protobufResolver.getProtobufClassReference(named.typeId),
                propertyName
            });
        }
        const propertyClassReference = this.context.csharpTypeMapper.convertToClassReference(named);
        if (wrapperType === WrapperType.List) {
            // The static function is mapped within a LINQ expression.
            return this.csharp.codeblock((writer) => {
                writer.writeNode(propertyClassReference);
                writer.write(".FromProto");
            });
        }
        const fromProtoExpression = this.context.protobufResolver.isWellKnownAnyProtobufType(named.typeId)
            ? this.getValueForAny({ propertyName })
            : this.csharp.codeblock((writer) => {
                  writer.writeNode(
                      this.csharp.invokeMethod({
                          on: propertyClassReference,
                          method: "FromProto",
                          arguments_: [this.csharp.codeblock(propertyName)]
                      })
                  );
              });
        if (wrapperType === WrapperType.Optional) {
            return this.csharp.codeblock((writer) => {
                writer.writeNode(
                    this.csharp.ternary({
                        condition: this.csharp.codeblock(`${propertyName} != null`),
                        true_: fromProtoExpression,
                        false_: this.csharp.codeblock("null")
                    })
                );
            });
        }
        return fromProtoExpression;
    }

    private getValueForAny({ propertyName }: { propertyName: string }): ast.CodeBlock {
        return this.csharp.codeblock(propertyName);
    }

    private getValueForEnumList({
        enum_,
        classReference,
        protobufClassReference,
        propertyName
    }: {
        enum_: EnumTypeDeclaration;
        classReference: ast.ClassReference;
        protobufClassReference: ast.ClassReference;
        propertyName: string;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName}.Select(type => type switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ generation: this.generation, classReference, enumValue }));
                writer.write(" => ");
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(enumValue.name.name.pascalCase.safeName);
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
        classReference: ast.ClassReference;
        protobufClassReference: ast.ClassReference;
        propertyName: string;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine(`${propertyName} switch`);
            writer.writeLine("{");
            for (const enumValue of enum_.values) {
                writer.writeNode(protobufClassReference);
                writer.write(".");
                writer.write(getProtobufEnumValueName({ generation: this.generation, classReference, enumValue }));
                writer.write(" => ");
                writer.writeNode(classReference);
                writer.write(".");
                writer.write(enumValue.name.name.pascalCase.safeName);
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
    }): ast.CodeBlock {
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
                return getValueForLiteral({ literal: container.literal }, this.csharp);
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
    }): ast.CodeBlock {
        const on = this.csharp.codeblock(`${propertyName}?`);
        if (this.context.isPrimitive(listType)) {
            // Lists of primitive types can be directly mapped.
            const method = this.context.isReadOnlyMemoryType(listType) ? "ToArray" : "ToList";
            return this.csharp.codeblock((writer) => {
                writer.writeNode(
                    this.csharp.invokeMethod({
                        on,
                        method,
                        arguments_: []
                    })
                );
                if (wrapperType !== WrapperType.Optional) {
                    if (this.context.isReadOnlyMemoryType(listType)) {
                        writer.write(" ?? new ");
                        writer.writeNode(
                            this.Collection.listType(this.context.csharpTypeMapper.convert({ reference: listType }))
                        );
                        writer.write("()");
                        return;
                    }
                    writer.write(" ?? ");
                    writer.writeNode(
                        this.csharp.invokeMethod({
                            on: this.System.Linq.Enumerable,
                            method: "Empty",
                            generics: [this.context.csharpTypeMapper.convert({ reference: listType })],
                            arguments_: []
                        })
                    );
                }
            });
        }
        if (listType.type === "named") {
            const resolvedType = this.model.dereferenceType(listType.typeId).typeDeclaration;
            if (resolvedType.shape.type === "enum") {
                const enumClassReference = this.context.csharpTypeMapper.convertToClassReference(listType, {
                    fullyQualified: true
                });
                const protobufClassReference = this.context.protobufResolver.getProtobufClassReference(listType.typeId);
                return this.getValueForEnumList({
                    enum_: resolvedType.shape,
                    classReference: enumClassReference,
                    protobufClassReference,
                    propertyName
                });
            }
        }
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
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
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeNode(
                this.csharp.invokeMethod({
                    on: this.csharp.codeblock(`${propertyName}?`),
                    method: "ToDictionary",
                    arguments_: [
                        this.csharp.codeblock("kvp => kvp.Key"),
                        this.csharp.codeblock((writer) => {
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
    }): ast.CodeBlock {
        switch (primitive.v1) {
            case "DATE_TIME":
                return this.csharp.codeblock(`${propertyName}.ToDateTime()`);
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
                return this.csharp.codeblock(propertyName);
            default:
                assertNever(primitive.v1);
        }
    }
}

function getValueForLiteral({ literal }: { literal: Literal }, csharp: CSharp): ast.CodeBlock {
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
    generation,
    classReference,
    enumValue
}: {
    generation: Generation;
    classReference: ast.ClassReference;
    enumValue: EnumValue;
}): string {
    const enumValueName = enumValue.name.name.pascalCase.safeName;
    return enumValueName.replace(classReference.name, "");
}
