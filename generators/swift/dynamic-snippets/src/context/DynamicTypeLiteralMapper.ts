import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { EnumWithAssociatedValues, LiteralEnum, sanitizeSelf, swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";
import { DynamicTypeMapper } from "./DynamicTypeMapper";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
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
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value });
            case "literal": {
                if (args.typeReference.value.type === "string") {
                    return swift.Expression.enumCaseShorthand(
                        LiteralEnum.generateEnumCaseLabel(args.typeReference.value.value)
                    );
                } else if (args.typeReference.value.type === "boolean") {
                    return swift.Expression.nop();
                } else {
                    assertNever(args.typeReference.value);
                    break;
                }
            }
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return swift.Expression.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as });
            }
            case "nullable":
                return this.convertNullable({ nullable: args.typeReference, value: args.value, as: args.as });
            case "optional":
                return this.convert({ typeReference: args.typeReference.value, value: args.value, as: args.as });
            case "primitive":
                return this.convertPrimitive({ primitive: args.typeReference.value, value: args.value, as: args.as });
            case "set":
                return swift.Expression.nop();
            case "unknown":
                return this.convertUnknown(args.value);
            default:
                assertNever(args.typeReference);
        }
    }

    private convertList({ list, value }: { list: FernIr.dynamic.TypeReference; value: unknown }): swift.Expression {
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
                    return this.convert({ typeReference: list, value: v });
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertMap({ map, value }: { map: FernIr.dynamic.MapType; value: unknown }): swift.Expression {
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
                        this.convert({ typeReference: map.key, value: key, as: "mapKey" }),
                        this.convert({ typeReference: map.value, value, as: "mapValue" })
                    ];
                } finally {
                    this.context.errors.unscope();
                }
            }),
            multiline: true
        });
    }

    private convertNamed({
        named,
        value,
        as
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        switch (named.type) {
            case "alias":
                return this.convert({ typeReference: named.typeReference, value, as });
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({ discriminatedUnion: named, value });
            case "enum":
                return this.convertEnum({ enum_: named, value });
            case "object":
                return this.convertObject({ object_: named, value, as });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value });
            default:
                assertNever(named);
        }
    }

    private convertNullable({
        nullable,
        value,
        as
    }: {
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
                    value: this.convert({ typeReference: nullable.value, value, as })
                })
            ]
        });
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
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
            discriminatedUnionTypeInstance,
            unionVariant
        });
        if (unionProperties == null) {
            return swift.Expression.nop();
        }
        return swift.Expression.methodCall({
            target: swift.Expression.reference(discriminatedUnion.declaration.name.pascalCase.unsafeName),
            methodName: EnumWithAssociatedValues.sanitizeToCamelCase(
                unionVariant.discriminantValue.name.camelCase.unsafeName
            ),
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
        discriminatedUnionTypeInstance,
        unionVariant
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
    }): swift.FunctionArgument[] | undefined {
        const baseFields = this.getBaseFields({
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
                const converted = this.convertNamed({ named, value: discriminatedUnionTypeInstance.value });
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
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType
    }: {
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
                    value: this.convert(property)
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
        object_,
        value,
        as
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
    }): swift.Expression {
        return swift.Expression.structInitialization({
            unsafeName: object_.declaration.name.pascalCase.unsafeName,
            arguments_: this.context
                .getExampleObjectProperties({
                    parameters: object_.properties,
                    snippetObject: value
                })
                .map((typeInstance) => {
                    const expression = this.convert(typeInstance);
                    if (expression.isNop()) {
                        return null;
                    }
                    return swift.functionArgument({
                        label: sanitizeSelf(typeInstance.name.name.camelCase.unsafeName),
                        value: this.convert(typeInstance)
                    });
                })
                .filter((argument) => argument != null),
            multiline: true
        });
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): swift.Expression {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value
        });
        if (result == null) {
            return swift.Expression.nop();
        }
        return result;
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
    }): swift.Expression | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            try {
                const converted = this.convert({ typeReference, value });
                const typeMapper = new DynamicTypeMapper({ context: this.context });
                const swiftType = typeMapper.convert({ typeReference });
                return swift.Expression.methodCall({
                    target: swift.Expression.reference(undiscriminatedUnion.declaration.name.pascalCase.unsafeName),
                    methodName: swiftType.toCaseName(),
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
        primitive: FernIr.PrimitiveTypeV1;
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
