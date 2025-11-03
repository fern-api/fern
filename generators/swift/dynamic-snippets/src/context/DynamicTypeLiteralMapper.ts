import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { EnumWithAssociatedValues, LiteralEnum, sanitizeSelf, swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        fromSymbol: swift.Symbol;
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "mapKey" | "mapValue";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): swift.Expression {
        const { fromSymbol, typeReference, value, as } = args;
        switch (typeReference.type) {
            case "list":
                return this.convertList({ fromSymbol, list: typeReference.value, value });
            case "literal": {
                if (typeReference.value.type === "string") {
                    return swift.Expression.enumCaseShorthand(
                        LiteralEnum.generateEnumCaseLabel(typeReference.value.value)
                    );
                } else if (typeReference.value.type === "boolean") {
                    return swift.Expression.nop();
                } else {
                    assertNever(typeReference.value);
                    break;
                }
            }
            case "map":
                return this.convertMap({ fromSymbol, map: typeReference, value: value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return swift.Expression.nop();
                }
                return this.convertNamed({ fromSymbol, typeId: typeReference.value, named, value: value, as });
            }
            case "nullable":
                return this.context.customConfig?.nullableAsOptional
                    ? this.convert({ fromSymbol, typeReference: typeReference.value, value, as })
                    : this.convertNullable({ fromSymbol, nullable: typeReference, value: value, as });
            case "optional":
                return this.convert({ fromSymbol, typeReference: typeReference.value, value, as });
            case "primitive":
                return this.convertPrimitive({ primitive: typeReference.value, value: value, as });
            case "set":
                return swift.Expression.nop();
            case "unknown":
                return this.convertUnknown(value);
            default:
                assertNever(typeReference);
        }
    }

    private convertList({
        fromSymbol,
        list,
        value
    }: {
        fromSymbol: swift.Symbol;
        list: FernIr.dynamic.TypeReference;
        value: unknown;
    }): swift.Expression {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return swift.Expression.nop();
        }
        return swift.Expression.arrayLiteral({
            elements: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ fromSymbol, typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertMap({
        fromSymbol,
        map,
        value
    }: {
        fromSymbol: swift.Symbol;
        map: FernIr.dynamic.MapType;
        value: unknown;
    }): swift.Expression {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return swift.Expression.nop();
        }
        return swift.Expression.dictionaryLiteral({
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return [
                        this.convert({
                            fromSymbol,
                            typeReference: map.key,
                            value: key,
                            as: "mapKey"
                        }),
                        this.convert({
                            fromSymbol,
                            typeReference: map.value,
                            value,
                            as: "mapValue"
                        })
                    ];
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertNamed({
        fromSymbol,
        typeId,
        named,
        value,
        as
    }: {
        fromSymbol: swift.Symbol;
        typeId: string;
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        switch (named.type) {
            case "alias":
                return this.convert({
                    fromSymbol,
                    typeReference: named.typeReference,
                    value,
                    as
                });
            case "discriminatedUnion": {
                const unionSymbol = this.context.nameRegistry.getSchemaTypeSymbolOrThrow(typeId);
                return this.convertDiscriminatedUnion({
                    fromSymbol,
                    unionSymbol,
                    discriminatedUnion: named,
                    value
                });
            }
            case "enum":
                return this.convertEnum({ enum_: named, value });
            case "object":
                return this.convertObject({ fromSymbol, typeId, object_: named, value });
            case "undiscriminatedUnion": {
                const unionSymbol = this.context.nameRegistry.getSchemaTypeSymbolOrThrow(typeId);
                return this.convertUndiscriminatedUnion({
                    fromSymbol,
                    unionSymbol,
                    undiscriminatedUnion: named,
                    value
                });
            }
            default:
                assertNever(named);
        }
    }

    private convertNullable({
        fromSymbol,
        nullable,
        value,
        as
    }: {
        fromSymbol: swift.Symbol;
        nullable: FernIr.dynamic.TypeReference.Nullable;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        if (value == null) {
            return swift.Expression.enumCaseShorthand("null");
        }
        return swift.Expression.contextualMethodCall({
            methodName: "value",
            arguments_: [
                swift.functionArgument({
                    value: this.convert({ fromSymbol, typeReference: nullable.value, value, as })
                })
            ]
        });
    }

    private convertDiscriminatedUnion({
        fromSymbol,
        discriminatedUnion,
        unionSymbol,
        value
    }: {
        fromSymbol: swift.Symbol;
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        unionSymbol: swift.Symbol;
        value: unknown;
    }): swift.Expression {
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion: discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return swift.Expression.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionProperties = this.convertDiscriminatedUnionProperties({
            fromSymbol,
            discriminatedUnionTypeInstance,
            unionVariant
        });
        if (unionProperties == null) {
            return swift.Expression.nop();
        }
        const variants = this.context.nameRegistry.getAllDiscriminatedUnionVariantsOrThrow(unionSymbol);
        const matchingVariant = variants.find(
            (v) => v.discriminantWireValue === unionVariant.discriminantValue.wireValue
        );
        if (matchingVariant == null) {
            return swift.Expression.nop();
        }
        return swift.Expression.methodCall({
            target: swift.Expression.reference(unionSymbol.name),
            methodName: matchingVariant.caseName,
            arguments_: [
                swift.functionArgument({
                    value: swift.Expression.contextualMethodCall({
                        methodName: "init",
                        arguments_: unionProperties,
                        multiline: true
                    })
                })
            ],
            multiline: true
        });
    }

    private convertDiscriminatedUnionProperties({
        fromSymbol,
        discriminatedUnionTypeInstance,
        unionVariant
    }: {
        fromSymbol: swift.Symbol;
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): swift.FunctionArgument[] | undefined {
        const baseFields = this.getBaseFields({
            fromSymbol,
            discriminatedUnionTypeInstance,
            singleDiscriminatedUnionType: unionVariant
        });
        switch (unionVariant.type) {
            case "samePropertiesAsObject": {
                const named = this.context.resolveNamedType({
                    typeId: unionVariant.typeId
                });
                if (named == null) {
                    return undefined;
                }
                const converted = this.convertNamed({
                    fromSymbol,
                    typeId: unionVariant.typeId,
                    named,
                    value: discriminatedUnionTypeInstance.value
                });
                if (!converted.isStructInitialization()) {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: "Internal error; expected union value to be a struct"
                    });
                    return undefined;
                }
                const structInitialization = converted.asStructInitializationOrThrow();
                return [...baseFields, ...(structInitialization.arguments_ ?? [])];
            }
            case "singleProperty": {
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                    if (record == null) {
                        return [...baseFields];
                    }
                    return [
                        ...baseFields,
                        swift.functionArgument({
                            label: sanitizeSelf(
                                EnumWithAssociatedValues.sanitizeToCamelCase(
                                    unionVariant.discriminantValue.name.camelCase.unsafeName
                                )
                            ),
                            value: this.convert({
                                fromSymbol,
                                typeReference: unionVariant.typeReference,
                                value: record[unionVariant.discriminantValue.wireValue]
                            })
                        })
                    ];
                } finally {
                    this.context.errors.unscope();
                }
            }
            case "noProperties":
                return baseFields;
            default:
                assertNever(unionVariant);
        }
    }

    private getBaseFields({
        fromSymbol,
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType
    }: {
        fromSymbol: swift.Symbol;
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): swift.FunctionArgument[] {
        const properties = this.context.getExampleObjectProperties({
            parameters: singleDiscriminatedUnionType.properties ?? [],
            snippetObject: discriminatedUnionTypeInstance.value
        });
        return properties.map((property) => {
            this.context.errors.scope(property.name.wireValue);
            try {
                return swift.functionArgument({
                    label: sanitizeSelf(property.name.name.camelCase.unsafeName),
                    value: this.convert({
                        fromSymbol,
                        typeReference: property.typeReference,
                        value: property.value
                    })
                });
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    private convertEnum({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): swift.Expression {
        const nameAndWireValue = this.getEnumValue({ enum_, value });
        if (nameAndWireValue == null) {
            return swift.Expression.nop();
        }
        return swift.Expression.enumCaseShorthand(nameAndWireValue.name.camelCase.unsafeName);
    }

    private getEnumValue({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }) {
        if (typeof value !== "string") {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected enum value string, got: ${typeof value}`
            });
            return undefined;
        }
        const enumValue = enum_.values.find((v) => v.wireValue === value);
        if (enumValue == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `An enum value named "${value}" does not exist in this context`
            });
            return undefined;
        }
        return enumValue;
    }

    private convertObject({
        fromSymbol,
        typeId,
        object_,
        value
    }: {
        fromSymbol: swift.Symbol;
        typeId: string;
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
    }): swift.Expression {
        const symbol = this.context.nameRegistry.getSchemaTypeSymbolOrThrow(typeId);
        return swift.Expression.structInitialization({
            unsafeName: symbol.name,
            arguments_: this.context
                .getExampleObjectProperties({
                    parameters: object_.properties,
                    snippetObject: value
                })
                .map((typeInstance) => {
                    const expression = this.convert({
                        fromSymbol,
                        typeReference: typeInstance.typeReference,
                        value: typeInstance.value
                    });
                    if (expression.isNop()) {
                        return null;
                    }
                    return swift.functionArgument({
                        label: sanitizeSelf(typeInstance.name.name.camelCase.unsafeName),
                        value: this.convert({
                            fromSymbol,
                            typeReference: typeInstance.typeReference,
                            value: typeInstance.value
                        })
                    });
                })
                .filter((argument) => argument != null),
            multiline: true
        });
    }

    private convertUndiscriminatedUnion({
        fromSymbol,
        unionSymbol,
        undiscriminatedUnion,
        value
    }: {
        fromSymbol: swift.Symbol;
        unionSymbol: swift.Symbol;
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): swift.Expression {
        const result = this.findMatchingUndiscriminatedUnionType({
            fromSymbol,
            unionSymbol,
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return swift.Expression.nop();
        }
        return result;
    }

    private findMatchingUndiscriminatedUnionType({
        fromSymbol,
        unionSymbol,
        undiscriminatedUnion,
        value
    }: {
        fromSymbol: swift.Symbol;
        unionSymbol: swift.Symbol;
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): swift.Expression | undefined {
        const variants = this.context.nameRegistry.getAllUndiscriminatedUnionVariantsOrThrow(unionSymbol);
        for (const typeReference of undiscriminatedUnion.types) {
            try {
                const converted = this.convert({ fromSymbol, typeReference, value });
                const swiftType = this.context.getSwiftTypeReferenceFromScope(typeReference, fromSymbol);
                const matchingVariant = variants.find((v) => v.swiftType.equals(swiftType));
                if (matchingVariant == null) {
                    continue;
                }
                return swift.Expression.methodCall({
                    target: swift.Expression.reference(unionSymbol.name),
                    methodName: matchingVariant.caseName,
                    arguments_: [
                        swift.functionArgument({
                            value: converted
                        })
                    ],
                    multiline: true
                });
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

    private convertUnknown(value: unknown): swift.Expression {
        switch (typeof value) {
            case "boolean": {
                return swift.Expression.contextualMethodCall({
                    methodName: "bool",
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.boolLiteral(value)
                        })
                    ]
                });
            }
            case "string": {
                return swift.Expression.contextualMethodCall({
                    methodName: "string",
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.stringLiteral(value)
                        })
                    ]
                });
            }
            case "number": {
                return swift.Expression.contextualMethodCall({
                    methodName: "number",
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.numberLiteral(value)
                        })
                    ]
                });
            }
            case "object": {
                if (value === null) {
                    return swift.Expression.enumCaseShorthand("null");
                }
                if (Array.isArray(value)) {
                    return swift.Expression.contextualMethodCall({
                        methodName: "array",
                        arguments_: [
                            swift.functionArgument({
                                value: swift.Expression.arrayLiteral({
                                    elements: value.map((v) => this.convertUnknown(v)),
                                    multiline: true
                                })
                            })
                        ]
                    });
                }
                return swift.Expression.contextualMethodCall({
                    methodName: "object",
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.dictionaryLiteral({
                                entries: Object.entries(value).map(([key, value]) => [
                                    swift.Expression.stringLiteral(key),
                                    this.convertUnknown(value)
                                ]),
                                multiline: true
                            })
                        })
                    ]
                });
            }
            default:
                throw new Error(`Internal error; unsupported unknown type: ${typeof value}`);
        }
    }

    private convertPrimitive({
        primitive,
        value,
        as
    }: {
        primitive: FernIr.dynamic.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        switch (primitive) {
            case "INTEGER":
            case "UINT":
            case "LONG":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.numberLiteral(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.boolLiteral(bool);
            }
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.stringLiteral(str);
            }
            case "DATE": {
                const date = this.context.getValueAsString({ value });
                if (date == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.calendarDateLiteral(date);
            }
            case "DATE_TIME": {
                const dateTime = this.context.getValueAsString({ value });
                if (dateTime == null) {
                    return swift.Expression.nop();
                }
                const timestampMs = new Date(dateTime).getTime();
                const timestampSec = Math.round(timestampMs / 1000);
                const roundedDateTime = new Date(timestampSec * 1000).toISOString();
                // Remove fractional seconds (.000Z -> Z) for Swift compatibility
                const dateTimeWithoutFractional = roundedDateTime.replace(/\.\d{3}Z$/, "Z");
                return swift.Expression.dateLiteral(dateTimeWithoutFractional);
            }
            case "UUID": {
                const uuid = this.context.getValueAsString({ value });
                if (uuid == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.uuidLiteral(uuid);
            }
            case "BASE_64": {
                const base64 = this.context.getValueAsString({ value });
                if (base64 == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.stringLiteral(base64);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return swift.Expression.nop();
                }
                return swift.Expression.nop();
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
        const num = as === "mapKey" ? (typeof value === "string" ? Number(value) : value) : value;
        return this.context.getValueAsNumber({ value: num });
    }

    private getValueAsBoolean({
        value,
        as
    }: {
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): boolean | undefined {
        const bool = (() => {
            switch (as) {
                case "mapKey": {
                    if (value === "true") {
                        return true;
                    }
                    if (value === "false") {
                        return false;
                    }
                    return value;
                }
                case "mapValue":
                case undefined:
                    return value;
                default:
                    assertNever(as);
            }
        })();
        return this.context.getValueAsBoolean({ value: bool });
    }
}
