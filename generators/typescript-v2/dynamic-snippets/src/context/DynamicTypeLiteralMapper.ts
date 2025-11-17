import { DiscriminatedUnionTypeInstance, Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { ObjectPropertyAccess } from "@fern-api/dynamic-ir-sdk/api";
import { ts } from "@fern-api/typescript-ast";
import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

const UNION_VALUE_KEY = "value";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
        convertOpts?: ConvertOpts;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";

    export type ConvertOpts = {
        isForRequest?: boolean;
        isForResponse?: boolean;
    };
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): ts.TypeLiteral {
        const convertOpts = args.convertOpts;
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return ts.TypeLiteral.null();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return ts.TypeLiteral.nop();
        }
        if (args.value === undefined) {
            return ts.TypeLiteral.nop();
        }
        switch (args.typeReference.type) {
            case "list":
                return this.convertList({ list: args.typeReference.value, value: args.value, convertOpts });
            case "literal":
                return this.convertLiteral({ literalType: args.typeReference.value, value: args.value, convertOpts });
            case "map":
                return this.convertMap({ map: args.typeReference, value: args.value, convertOpts });
            case "named": {
                const named = this.context.resolveNamedType({ typeId: args.typeReference.value });
                if (named == null) {
                    return ts.TypeLiteral.nop();
                }
                return this.convertNamed({ named, value: args.value, as: args.as, convertOpts });
            }
            case "optional":
                return this.convert({
                    typeReference: args.typeReference.value,
                    value: args.value,
                    as: args.as,
                    convertOpts
                });
            case "nullable":
                return this.convert({
                    typeReference: args.typeReference.value,
                    value: args.value,
                    as: args.as,
                    convertOpts
                });
            case "primitive":
                return this.convertPrimitive({
                    primitive: args.typeReference.value,
                    value: args.value,
                    as: args.as,
                    convertOpts
                });
            case "set":
                return this.convertSet({ set: args.typeReference.value, value: args.value, convertOpts });
            case "unknown":
                return this.convertUnknown({ value: args.value, convertOpts });
            default:
                assertNever(args.typeReference);
        }
    }

    private convertLiteral({
        literalType,
        value
    }: {
        literalType: FernIr.dynamic.LiteralType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        switch (literalType.type) {
            case "boolean": {
                const bool = this.context.getValueAsBoolean({ value });
                if (bool == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.boolean(bool);
            }
            case "string": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.string(str);
            }
            default:
                assertNever(literalType);
        }
    }

    private convertList({
        list,
        value,
        convertOpts
    }: {
        list: FernIr.dynamic.TypeReference;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.array({
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: list, value: v, convertOpts });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertSet({
        set,
        value,
        convertOpts
    }: {
        set: FernIr.dynamic.TypeReference;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        if (!Array.isArray(value)) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected array but got: ${typeof value}`
            });
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.set({
            values: value.map((v, index) => {
                this.context.errors.scope({ index });
                try {
                    return this.convert({ typeReference: set, value: v, convertOpts });
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private convertMap({
        map,
        value,
        convertOpts
    }: {
        map: FernIr.dynamic.MapType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        if (typeof value !== "object" || value == null) {
            this.context.errors.add({
                severity: Severity.Critical,
                message: `Expected object but got: ${value == null ? "null" : typeof value}`
            });
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.record({
            entries: Object.entries(value).map(([key, value]) => {
                this.context.errors.scope(key);
                try {
                    return {
                        key: this.convert({ typeReference: map.key, value: key, as: "key", convertOpts }),
                        value: this.convert({ typeReference: map.value, value, convertOpts })
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
        convertOpts
    }: {
        named: FernIr.dynamic.NamedType;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        switch (named.type) {
            case "alias": {
                if (this.context.customConfig?.useBrandedStringAliases) {
                    return ts.TypeLiteral.reference(
                        ts.codeblock((writer) => {
                            writer.writeNode(
                                ts.reference({
                                    name: this.context.namespaceExport,
                                    importFrom: this.context.getModuleImport(),
                                    memberName: this.context.getFullyQualifiedReference({
                                        declaration: named.declaration
                                    })
                                })
                            );
                            writer.write("(");
                            writer.writeNode(
                                this.convert({ typeReference: named.typeReference, value, as, convertOpts })
                            );
                            writer.write(")");
                        })
                    );
                }
                return this.convert({ typeReference: named.typeReference, value, as, convertOpts });
            }
            case "discriminatedUnion":
                return this.convertDiscriminatedUnion({
                    discriminatedUnion: named,
                    value,
                    convertOpts
                });
            case "enum":
                return this.convertEnum({ enum_: named, value, convertOpts });
            case "object":
                return this.convertObject({ object_: named, value, convertOpts });
            case "undiscriminatedUnion":
                return this.convertUndiscriminatedUnion({ undiscriminatedUnion: named, value, convertOpts });
            default:
                assertNever(named);
        }
    }

    private convertDiscriminatedUnion({
        discriminatedUnion,
        value,
        convertOpts
    }: {
        discriminatedUnion: FernIr.dynamic.DiscriminatedUnionType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        const discriminatedUnionTypeInstance = this.context.resolveDiscriminatedUnionTypeInstance({
            discriminatedUnion,
            value
        });
        if (discriminatedUnionTypeInstance == null) {
            return ts.TypeLiteral.nop();
        }
        const unionVariant = discriminatedUnionTypeInstance.singleDiscriminatedUnionType;
        const unionProperties = this.convertDiscriminatedUnionProperties({
            discriminatedUnionTypeInstance,
            unionVariant,
            convertOpts
        });
        if (unionProperties == null) {
            return ts.TypeLiteral.nop();
        }
        if (this.context.customConfig?.includeUtilsOnUnionMembers) {
            return ts.TypeLiteral.reference(
                ts.codeblock((writer) => {
                    writer.writeNode(
                        ts.invokeMethod({
                            on: ts.reference({
                                name: this.context.namespaceExport,
                                importFrom: this.context.getModuleImport(),
                                memberName: this.context.getFullyQualifiedReference({
                                    declaration: discriminatedUnion.declaration
                                })
                            }),
                            method: this.context.getMethodName(unionVariant.discriminantValue.name),
                            arguments_: this.convertDiscriminatedUnionUtilsArgs({
                                discriminatedUnionTypeInstance,
                                unionVariant,
                                unionProperties,
                                convertOpts
                            })
                        })
                    );
                })
            );
        }
        const discriminantProperty = {
            name: this.context.getPropertyName(discriminatedUnion.discriminant.name),
            value: ts.TypeLiteral.string(unionVariant.discriminantValue.wireValue)
        };
        return ts.TypeLiteral.object({
            fields: [discriminantProperty, ...unionProperties]
        });
    }

    private convertDiscriminatedUnionProperties({
        discriminatedUnionTypeInstance,
        unionVariant,
        convertOpts
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.ObjectField[] | undefined {
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
                const converted = this.convertNamed({
                    named,
                    value: discriminatedUnionTypeInstance.value,
                    convertOpts
                });
                if (!converted.isObject()) {
                    this.context.errors.add({
                        severity: Severity.Critical,
                        message: "Internal error; expected union value to be an object"
                    });
                    return undefined;
                }
                const object_ = converted.asObjectOrThrow();
                return [...baseFields, ...object_.fields];
            }
            case "singleProperty": {
                try {
                    this.context.errors.scope(unionVariant.discriminantValue.wireValue);
                    const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
                    if (record == null) {
                        return [
                            ...baseFields,
                            {
                                name: UNION_VALUE_KEY,
                                value: this.convert({
                                    typeReference: unionVariant.typeReference,
                                    value: discriminatedUnionTypeInstance.value,
                                    convertOpts
                                })
                            }
                        ];
                    }
                    return [
                        ...baseFields,
                        {
                            name: this.context.getPropertyName(unionVariant.discriminantValue.name),
                            value: this.convert({
                                typeReference: unionVariant.typeReference,
                                value: record[unionVariant.discriminantValue.wireValue],
                                convertOpts
                            })
                        }
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

    private convertDiscriminatedUnionUtilsArgs({
        discriminatedUnionTypeInstance,
        unionVariant,
        unionProperties,
        convertOpts
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        unionVariant: FernIr.dynamic.SingleDiscriminatedUnionType;
        unionProperties: ts.ObjectField[];
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.AstNode[] {
        if (unionVariant.type === "singleProperty") {
            const record = this.context.getRecord(discriminatedUnionTypeInstance.value);
            if (record == null && unionProperties.length === 1) {
                // The union is a single value without any base properties, e.g.
                return [
                    this.convert({
                        typeReference: unionVariant.typeReference,
                        value: discriminatedUnionTypeInstance.value,
                        convertOpts
                    })
                ];
            }
        }
        return unionProperties.length > 0 ? [ts.TypeLiteral.object({ fields: unionProperties })] : [];
    }

    private getBaseFields({
        discriminatedUnionTypeInstance,
        singleDiscriminatedUnionType,
        convertOpts
    }: {
        discriminatedUnionTypeInstance: DiscriminatedUnionTypeInstance;
        singleDiscriminatedUnionType: FernIr.dynamic.SingleDiscriminatedUnionType;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.ObjectField[] {
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
                    value: this.convert({ ...property, convertOpts })
                };
            } finally {
                this.context.errors.unscope();
            }
        });
    }

    private convertObject({
        object_,
        value,
        convertOpts
    }: {
        object_: FernIr.dynamic.ObjectType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        const properties = this.context.associateByWireValue({
            parameters: this.filterReadWriteProperties(object_.properties, convertOpts),
            values: this.context.getRecord(value) ?? {}
        });
        return ts.TypeLiteral.object({
            fields: properties.map((property) => {
                this.context.errors.scope(property.name.wireValue);
                try {
                    return {
                        name: this.context.getPropertyName(property.name.name),
                        value: this.convert({ ...property, convertOpts })
                    };
                } finally {
                    this.context.errors.unscope();
                }
            })
        });
    }

    private filterReadWriteProperties(
        properties: FernIr.dynamic.NamedParameter[],
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts
    ): FernIr.dynamic.NamedParameter[] {
        if (this.context.customConfig?.experimentalGenerateReadWriteOnlyTypes !== true) {
            return properties;
        }
        if (typeof convertOpts === "undefined") {
            return properties;
        }
        if (convertOpts.isForRequest) {
            properties = properties.filter((prop) => prop.propertyAccess !== ObjectPropertyAccess.ReadOnly);
        }
        if (convertOpts.isForResponse) {
            properties = properties.filter((prop) => prop.propertyAccess !== ObjectPropertyAccess.WriteOnly);
        }
        return properties;
    }

    private convertEnum({
        enum_,
        value
    }: {
        enum_: FernIr.dynamic.EnumType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        const enumValue = this.getEnumValue({ enum_, value });
        if (enumValue == null) {
            return ts.TypeLiteral.nop();
        }
        return ts.TypeLiteral.string(enumValue);
    }

    private getEnumValue({ enum_, value }: { enum_: FernIr.dynamic.EnumType; value: unknown }): string | undefined {
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
        return value;
    }

    private convertUndiscriminatedUnion({
        undiscriminatedUnion,
        value,
        convertOpts
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        const result = this.findMatchingUndiscriminatedUnionType({
            undiscriminatedUnion,
            value,
            convertOpts
        });
        if (result == null) {
            return ts.TypeLiteral.nop();
        }
        return result;
    }

    private findMatchingUndiscriminatedUnionType({
        undiscriminatedUnion,
        value,
        convertOpts
    }: {
        undiscriminatedUnion: FernIr.dynamic.UndiscriminatedUnionType;
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral | undefined {
        for (const typeReference of undiscriminatedUnion.types) {
            if (this.typeReferenceMatchesValue({ typeReference, value })) {
                try {
                    return this.convert({ typeReference, value, convertOpts });
                } catch (e) {
                    continue;
                }
            }
        }
        this.context.errors.add({
            severity: Severity.Critical,
            message: `None of the types in the undiscriminated union matched the given "${typeof value}" value`
        });
        return undefined;
    }

    private typeReferenceMatchesValue({
        typeReference,
        value
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
    }): boolean {
        switch (typeReference.type) {
            case "named": {
                const named = this.context.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return false;
                }
                return this.namedTypeMatchesValue({ named, value });
            }
            case "optional":
                return value === undefined || this.typeReferenceMatchesValue({ typeReference: typeReference.value, value });
            case "nullable":
                return value === null || this.typeReferenceMatchesValue({ typeReference: typeReference.value, value });
            case "list":
                return Array.isArray(value);
            case "set":
                return Array.isArray(value);
            case "map":
                return typeof value === "object" && value != null && !Array.isArray(value);
            case "primitive":
                return this.primitiveMatchesValue({ primitive: typeReference.value, value });
            case "literal":
                return this.literalMatchesValue({ literal: typeReference.value, value });
            case "unknown":
                return true;
            default:
                assertNever(typeReference);
        }
    }

    private namedTypeMatchesValue({ named, value }: { named: FernIr.dynamic.NamedType; value: unknown }): boolean {
        switch (named.type) {
            case "alias":
                return this.typeReferenceMatchesValue({ typeReference: named.typeReference, value });
            case "enum":
                return typeof value === "string";
            case "object":
                return this.objectMatchesValue({ object_: named, value });
            case "discriminatedUnion":
                return typeof value === "object" && value != null;
            case "undiscriminatedUnion":
                return named.types.some((typeReference) => this.typeReferenceMatchesValue({ typeReference, value }));
            default:
                assertNever(named);
        }
    }

    private objectMatchesValue({ object_, value }: { object_: FernIr.dynamic.ObjectType; value: unknown }): boolean {
        const record = this.context.getRecord(value);
        if (record == null) {
            return false;
        }
        for (const property of object_.properties) {
            if (this.isRequiredProperty(property) && !(property.name.wireValue in record)) {
                return false;
            }
        }
        return true;
    }

    private isRequiredProperty(property: FernIr.dynamic.NamedParameter): boolean {
        const typeRef = property.typeReference;
        if (typeRef.type === "optional" || typeRef.type === "nullable") {
            return false;
        }
        if (typeRef.type === "literal") {
            return false;
        }
        return true;
    }

    private primitiveMatchesValue({
        primitive,
        value
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
    }): boolean {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
            case "FLOAT":
            case "DOUBLE":
                return typeof value === "number";
            case "BOOLEAN":
                return typeof value === "boolean";
            case "STRING":
            case "DATE":
            case "DATE_TIME":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return typeof value === "string";
            default:
                assertNever(primitive);
        }
    }

    private literalMatchesValue({
        literal,
        value
    }: {
        literal: FernIr.dynamic.LiteralType;
        value: unknown;
    }): boolean {
        switch (literal.type) {
            case "boolean":
                return typeof value === "boolean" && value === literal.value;
            case "string":
                return typeof value === "string" && value === literal.value;
            default:
                assertNever(literal);
        }
    }

    private convertUnknown({
        value,
        convertOpts
    }: {
        value: unknown;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        return ts.TypeLiteral.unknown(value);
    }

    private convertPrimitive({
        primitive,
        value,
        as,
        convertOpts
    }: {
        primitive: FernIr.PrimitiveTypeV1;
        value: unknown;
        as?: DynamicTypeLiteralMapper.ConvertedAs;
        convertOpts?: DynamicTypeLiteralMapper.ConvertOpts;
    }): ts.TypeLiteral {
        switch (primitive) {
            case "INTEGER":
            case "UINT": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.number(num);
            }
            case "LONG":
            case "UINT_64": {
                const num = this.getValueAsNumber({ value, as });
                if (num == null) {
                    return ts.TypeLiteral.nop();
                }
                if (this.context.customConfig?.useBigInt) {
                    return ts.TypeLiteral.bigint(BigInt(num));
                }
                return ts.TypeLiteral.number(num);
            }
            case "FLOAT":
            case "DOUBLE": {
                const num = this.getValueAsNumber({ value });
                if (num == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.number(num);
            }
            case "BOOLEAN": {
                const bool = this.getValueAsBoolean({ value, as });
                if (bool == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.boolean(bool);
            }
            case "BASE_64":
            case "DATE":
            case "UUID":
            case "STRING": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.string(str);
            }
            case "DATE_TIME": {
                const str = this.context.getValueAsString({ value });
                if (str == null) {
                    return ts.TypeLiteral.nop();
                }
                return ts.TypeLiteral.datetime(str);
            }
            case "BIG_INTEGER": {
                const bigInt = this.context.getValueAsString({ value });
                if (bigInt == null) {
                    return ts.TypeLiteral.nop();
                }
                if (this.context.customConfig?.useBigInt) {
                    return ts.TypeLiteral.bigint(BigInt(bigInt));
                }
                return ts.TypeLiteral.string(bigInt);
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
