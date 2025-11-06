import { DiscriminatedUnionTypeInstance, NamedArgument, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, WithGeneration } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
        fallbackToDefault?: string;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeLiteralMapper extends WithGeneration {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        super(context);
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): ast.TypeLiteral {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return this.csharp.TypeLiteral.null();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return this.csharp.TypeLiteral.nop();
        }
        if (args.value === undefined && !args.fallbackToDefault) {
            return this.csharp.TypeLiteral.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({
                    list: args.typeReference.value,
                    value: args.value,
                    fallbackToDefault: args.fallbackToDefault
                });
            case "literal":
                return this.convertLiteral({
                    literal: args.typeReference.value,
                    value: args.value
                });
            case "map":
                return this.convertMap({
                    map: args.typeReference,
                    value: args.value,
                    fallbackToDefault: args.fallbackToDefault
                });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return this.csharp.TypeLiteral.nop();
                }
                return this.convertNamed({
                    named,
                    value: args.value,
                    as: args.as,
                    fallbackToDefault: args.fallbackToDefault
                });
            }
            case "nullable":
                return this.convert({
                    typeReference: args.typeReference.value,
                    value: args.value,
                    as: args.as
                });
            case "optional":
                return this.convert({
                    typeReference: args.typeReference.value,
                    value: args.value,
                    as: args.as
                });
            case "primitive":
                return this.convertPrimitive({
                    primitive: args.typeReference.value,
                    value: args.value,
                    as: args.as,
                    fallbackToDefault: args.fallbackToDefault
                });
            case "set":
                return this.convertSet({
                    set: args.typeReference.value,
                    value: args.value,
                    fallbackToDefault: args.fallbackToDefault
                });
            case "unknown":
                return this.convertUnknown({ value: args.value, fallbackToDefault: args.fallbackToDefault });
            default:
                assertNever(args.typeReference);
        }
    }

    private convertList({
        list,
        value,
        fallbackToDefault
    }: {
        list: FernIr.dynamic.TypeReference;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return this.csharp.TypeLiteral.nop();
        }
        return this.csharp.TypeLiteral.list({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: list, unboxOptionals: true }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertLiteral({
        literal,
        value,
        fallbackToDefault
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        switch (literal.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.boolean(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.string.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.string(str);
            }
            default:
                assertNever(literal);
        }
    }

    private convertSet({
        set,
        value,
        fallbackToDefault
    }: {
        set: FernIr.dynamic.TypeReference;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return this.csharp.TypeLiteral.nop();
        }
        return this.csharp.TypeLiteral.set({
            valueType: this.context.dynamicTypeMapper.convert({ typeReference: set, unboxOptionals: true }),
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertMap({
        map,
        value,
        fallbackToDefault
    }: {
        map: FernIr.dynamic.MapType;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return this.csharp.TypeLiteral.nop();
        }
        return this.csharp.TypeLiteral.dictionary({
            keyType: this.context.dynamicTypeMapper.convert({ typeReference: map.key }),
            valueType:
                map.value.type === "unknown"
                    ? this.context.dynamicTypeMapper.convert({ typeReference: map.value }).toOptionalIfNotAlready()
                    : this.context.dynamicTypeMapper.convert({ typeReference: map.value }),
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: "key" }),
                        value: this.convert({ typeReference: map.value, value })
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertNamed({
        named,
        value,
        as,
        fallbackToDefault
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference, value, as, fallbackToDefault });
            case "discriminatedUnion":
                if (this.settings.shouldGeneratedDiscriminatedUnions) {
                    return this.convertDiscriminatedUnion({ discriminatedUnion: named, value, fallbackToDefault });
                }
                return this.convertUnknown({ value, fallbackToDefault });
            case "enum":
                return this.getEnumValue(named, value);
            case "object":
                return this.convertObject({ object_: named, value, fallbackToDefault });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value, fallbackToDefault });
            default:
                assertNever(named);
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value,
        fallbackToDefault
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        const classReference = this.csharp.classReference({
            origin: discriminatedUnion.declaration,
            namespace: this.context.getNamespace(discriminatedUnion.declaration.fernFilepath)
        });
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return this.csharp.TypeLiteral.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const baseProperties = this.getBaseProperties({
            discriminatedUnionTypeInstance,
            singleDiscriminatedUnionType: unionVariant
        });
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return this.csharp.TypeLiteral.nop();
                }
                return this.instantiateUnionWithBaseProperties({
                    classReference,
                    baseProperties,
                    arguments_: [this.convertNamed({ named, value: discriminatedUnionTypeInstance.value })]
                });
            }
            case "singleProperty": {
                const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                if (record == null) {
                    return this.csharp.TypeLiteral.nop();
                }
                try {
                    const innerClassName = ["Value", "Type"].includes(
                        unionVariant.discriminantValue.name.pascalCase.safeName
                    )
                        ? `${unionVariant.discriminantValue.name.pascalCase.safeName}Inner`
                        : unionVariant.discriminantValue.name.pascalCase.safeName;

                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    return this.instantiateUnionWithBaseProperties({
                        classReference,
                        baseProperties,
                        arguments_: [
                            this.csharp.instantiateClass({
                                classReference: this.csharp.classReference({
                                    // origin: discriminatedUnionTypeInstance.discriminantValue,
                                    name: innerClassName,
                                    enclosingType: classReference
                                }),
                                arguments_: [
                                    this.convert({
                                        typeReference: unionVariant.typeReference,
                                        value: unionVariant.discriminantValue.wireValue
                                    })
                                ]
                            })
                        ]
                    });
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return this.instantiateUnionWithBaseProperties({
                    classReference,
                    baseProperties,
                    arguments_: [
                        // Unions with no properties require the discriminant property to be set.
                        this.csharp.instantiateClass({
                            classReference: this.csharp.classReference({
                                origin: discriminatedUnionTypeInstance.discriminantValue,
                                enclosingType: classReference
                            }),
                            arguments_: []
                        })
                    ]
                });
            default:
                assertNever(unionVariant);
        }
    }

    private getBaseProperties({
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): NamedArgument[] {
        const properties = this.context.associateByWireValue({
            parameters: singleDiscriminatedUnionType.properties ?? [],
            values: this.context.getRecord(discriminatedUnionTypeInstance.value) ?? {},

            // We're only selecting the base properties here. The rest of the properties
            // are handled by the union variant.
            ignoreMissingParameters: true
        });
        return properties.map((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                return {
                    name: this.context.getPropertyName(property.name.name),
                    assignment: this.convert(property)
                };
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    private instantiateUnionWithBaseProperties({
        classReference,
        arguments_,
        baseProperties
    }: {
        classReference: ast.ClassReference;
        arguments_: ast.AstNode[];
        baseProperties: NamedArgument[];
    }): ast.TypeLiteral {
        const instantiation = this.csharp.instantiateClass({
            classReference,
            arguments_,
            multiline: true
        });
        if (baseProperties.length === 0) {
            return this.csharp.TypeLiteral.reference(instantiation);
        }
        return this.csharp.TypeLiteral.reference(
            this.csharp.codeblock((writer) => {
                writer.write(instantiation, " ");
                writer.pushScope();
                for (const baseProperty of baseProperties) {
                    writer.write(baseProperty.name, " = ", baseProperty.assignment, ",");
                }
                writer.popScope(false);
            })
        );
    }

    private getEnumValue(enum_: FernIr.dynamic.EnumType, wireValue: unknown): ast.TypeLiteral {
        if (typeof wireValue !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected enum value string, got: ${typeof wireValue}`
            });
            return this.csharp.TypeLiteral.nop();
        }
        const enumValue = enum_.values.find((v) => v.wireValue === wireValue);
        if (enumValue == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `An enum value named "${wireValue}" does not exist in this context`
            });
            return this.csharp.TypeLiteral.nop();
        }
        const reference = this.csharp.classReference({
            origin: enum_.declaration,
            namespace: this.context.getNamespace(enum_.declaration.fernFilepath)
        });

        const valueName = reference.registerField(this.model.getPropertyNameFor(enumValue), enumValue);

        return this.csharp.TypeLiteral.reference(
            this.csharp.enumInstantiation({
                reference,
                value: valueName
            })
        );
    }

    private convertObject({
        object_,
        value,
        fallbackToDefault
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        const properties = this.context.associateByWireValue({
            parameters: object_.properties,
            values: this.context.getRecord(value) ?? {}
        });

        return this.csharp.TypeLiteral.class_({
            reference: this.csharp.classReference({
                origin: object_.declaration,
                namespace: this.context.getNamespace(object_.declaration.fernFilepath)
            }),
            fields: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue);
                try {
                    return {
                        name: this.context.getClassName(property.name.name),
                        value: this.convert(property)
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value,
        fallbackToDefault
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return this.csharp.TypeLiteral.nop();
        }
        return result.typeLiteral;
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): { valueTypeReference: FernIr.dynamic.TypeReference; typeLiteral: ast.TypeLiteral } | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            try {
                const typeLiteral = this.convert({ typeReference, value });
                return { valueTypeReference: typeReference, typeLiteral };
            } catch (e) {
                continue;
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    private convertUnknown({
        value,
        fallbackToDefault
    }: {
        value: unknown;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        return this.csharp.TypeLiteral.unknown(value);
    }

    private convertPrimitive({
        primitive,
        value,
        as,
        fallbackToDefault
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        fallbackToDefault?: string;
    }): ast.TypeLiteral {
        switch (primitive) {
            case "INTEGER": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.integer.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.integer(num);
            }
            case "LONG": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.long.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.long(num);
            }
            case "UINT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.uint.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.uint(num);
            }
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.ulong.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.ulong(num);
            }
            case "FLOAT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.float.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.float(num);
            }
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.double.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.double(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.boolean.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.boolean(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.string.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.string(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.dateOnly.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.date(date);
            }
            case "DATE_TIME": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.dateTime.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.datetime(dateTime);
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.string.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.string(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.string.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.string(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return fallbackToDefault
                        ? this.csharp.Type.string.getDeterminsticDefault(fallbackToDefault)
                        : this.csharp.TypeLiteral.nop();
                }
                return this.csharp.TypeLiteral.string(bigInt);
            }
            default:
                assertNever(primitive);
        }
    }

    private getValueAsNumber({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): number | undefined {
        const num = as === "key" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool =
            as === "key" ? (typeof value === "string" ? value === "true" : value === "false" ? false : value) : value;
        return this.context.getValueAsBoolean({ value: bool });
    }
}
