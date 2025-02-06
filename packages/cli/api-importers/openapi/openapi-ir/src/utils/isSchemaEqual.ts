import { EnumValue, ObjectSchema, OneOfSchema, PrimitiveSchemaValue, Schema } from "..";
import { isEqual } from "lodash-es";

export function isSchemaEqual(a: Schema, b: Schema): boolean {
    if (a.type === "primitive" && b.type === "primitive") {
        return isPrimitiveSchemaValueEqual(a.schema, b.schema);
    } else if (a.type === "enum" && b.type === "enum") {
        return areEnumValuesEqual(a.values, b.values);
    } else if (a.type === "array" && b.type === "array") {
        return isSchemaEqual(a.value, b.value);
    } else if (a.type === "unknown" && b.type === "unknown") {
        return true;
    } else if (a.type === "reference" && b.type === "reference") {
        return a.schema === b.schema;
    } else if (a.type === "optional" && b.type === "optional") {
        return isSchemaEqual(a.value, b.value);
    } else if (a.type === "oneOf" && b.type === "oneOf") {
        return isOneOfEqual(a.value, b.value);
    } else if (a.type === "object" && b.type === "object") {
        return isObjectEqual(a, b);
    } else if (a.type === "map" && b.type === "map") {
        return isPrimitiveSchemaValueEqual(a.key.schema, b.key.schema) && isSchemaEqual(a.value, b.value);
    } else if (a.type === "literal" && b.type === "literal") {
        return a.value === b.value;
    }
    return false;
}

function isPrimitiveSchemaValueEqual(a: PrimitiveSchemaValue, b: PrimitiveSchemaValue) {
    return a.type === b.type;
}

function areEnumValuesEqual(a: EnumValue[], b: EnumValue[]): boolean {
    const aSet = new Set(...a.map((enumValue) => enumValue.value));
    const bSet = new Set(...b.map((enumValue) => enumValue.value));
    return isEqual(aSet, bSet);
}

function isOneOfEqual(a: OneOfSchema, b: OneOfSchema): boolean {
    if (a.type === "discriminated" && b.type === "discriminated") {
        return (
            a.discriminantProperty === b.discriminantProperty &&
            Object.keys(a.schemas).length === Object.keys(b.schemas).length &&
            Object.entries(a.schemas).every(([discriminant, aSchema]) => {
                const bSchema = b.schemas[discriminant];
                if (bSchema == null) {
                    return false;
                }
                return isSchemaEqual(aSchema, bSchema);
            })
        );
    }
    if (a.type === "undiscriminated" && b.type === "undiscriminated") {
        return (
            a.schemas.length === b.schemas.length &&
            a.schemas.every((aSchema, index) => {
                const bSchema = b.schemas[index];
                if (bSchema == null) {
                    return false;
                }
                return isSchemaEqual(aSchema, bSchema);
            })
        );
    }
    return false;
}

function isObjectEqual(a: ObjectSchema, b: ObjectSchema): boolean {
    if (Object.keys(a.properties).length !== Object.keys(b.properties).length) {
        return false;
    }
    const aPropertyMap = Object.fromEntries(
        a.properties.map((property) => {
            return [property.key, property.schema];
        })
    );
    return Object.entries(b.properties).every(([bPropertyName, bPropertySchema]) => {
        const aProperty = aPropertyMap[bPropertyName];
        if (aProperty == null) {
            return false;
        }
        return isSchemaEqual(aProperty, bPropertySchema.schema);
    });
}