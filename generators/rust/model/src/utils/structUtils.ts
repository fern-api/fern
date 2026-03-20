import { FernIr } from "@fern-fern/ir-sdk";
import { Attribute, rust } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import {
    extractNamedTypesFromTypeReference,
    getInnerTypeFromOptional,
    hasDefaultImpl,
    isBase64Type,
    isBigIntType,
    isCollectionType,
    isDateTimeOnlyType,
    isDateTimeType,
    isDateType,
    isFloatingPointType,
    isOptionalType,
    isUnknownType,
    isUuidType,
    typeSupportsHashAndEq,
    typeSupportsPartialEq
} from "./primitiveTypeUtils.js";

/**
 * Struct and Request generation utility functions
 */

export function hasDateTimeFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isDateTimeType(typeRef);
    });
}

export function hasDateFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isDateType(typeRef);
    });
}

export function hasDateTimeOnlyFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isDateTimeOnlyType(typeRef);
    });
}

export function hasCollectionFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isCollectionType(typeRef);
    });
}

export function hasHashMapFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return hasHashMapInType(typeRef);
    });
}

export function hasHashSetFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return hasHashSetInType(typeRef);
    });
}

export function hasBigIntFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return hasBigIntInType(typeRef);
    });
}

function hasHashMapInType(typeRef: FernIr.TypeReference): boolean {
    if (!typeRef || typeof typeRef !== "object") {
        return false;
    }

    if (typeRef.type === "container") {
        return typeRef.container._visit({
            map: () => true,
            optional: (innerType: FernIr.TypeReference) => hasHashMapInType(innerType),
            nullable: (innerType: FernIr.TypeReference) => hasHashMapInType(innerType),
            list: (innerType: FernIr.TypeReference) => hasHashMapInType(innerType),
            set: () => false,
            literal: () => false,
            _other: () => false
        });
    }

    return false;
}

function hasHashSetInType(typeRef: FernIr.TypeReference): boolean {
    if (!typeRef || typeof typeRef !== "object") {
        return false;
    }

    if (typeRef.type === "container") {
        return typeRef.container._visit({
            set: () => true,
            optional: (innerType: FernIr.TypeReference) => hasHashSetInType(innerType),
            nullable: (innerType: FernIr.TypeReference) => hasHashSetInType(innerType),
            list: (innerType: FernIr.TypeReference) => hasHashSetInType(innerType),
            map: () => false,
            literal: () => false,
            _other: () => false
        });
    }

    return false;
}

function hasBigIntInType(typeRef: FernIr.TypeReference): boolean {
    if (!typeRef || typeof typeRef !== "object") {
        return false;
    }

    if (typeRef.type === "primitive") {
        return FernIr.PrimitiveTypeV1._visit(typeRef.primitive.v1, {
            string: () => false,
            boolean: () => false,
            integer: () => false,
            uint: () => false,
            uint64: () => false,
            long: () => false,
            float: () => false,
            double: () => false,
            bigInteger: () => true,
            date: () => false,
            dateTime: () => false,
            base64: () => false,
            uuid: () => false,
            _other: () => false
        });
    }

    if (typeRef.type === "container") {
        return typeRef.container._visit({
            optional: (innerType: FernIr.TypeReference) => hasBigIntInType(innerType),
            nullable: (innerType: FernIr.TypeReference) => hasBigIntInType(innerType),
            list: (innerType: FernIr.TypeReference) => hasBigIntInType(innerType),
            set: (innerType: FernIr.TypeReference) => hasBigIntInType(innerType),
            map: (mapType: { keyType: FernIr.TypeReference; valueType: FernIr.TypeReference }) =>
                hasBigIntInType(mapType.keyType) || hasBigIntInType(mapType.valueType),
            literal: () => false,
            _other: () => false
        });
    }

    return false;
}

export function hasUuidFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isUuidType(typeRef);
    });
}

export function hasJsonValueFields(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isUnknownType(typeRef);
    });
}

export function hasFloatingPointSets(properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;

        // Check if this is a set of floating point numbers
        if (typeRef.type === "container" && typeRef.container.type === "set") {
            const setElementType = typeRef.container.set;
            return isFloatingPointType(setElementType);
        }
        return false;
    });
}

export function getCustomTypesUsedInFields(
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[],
    currentTypeName?: string
): {
    snakeCase: { unsafeName: string };
    pascalCase: { unsafeName: string };
}[] {
    const customTypeNames: {
        snakeCase: { unsafeName: string };
        pascalCase: { unsafeName: string };
    }[] = [];
    const visited = new Set<string>();

    properties.forEach((property) => {
        extractNamedTypesFromTypeReference(property.valueType, customTypeNames, visited);
    });

    // Filter out the current type itself to prevent self-imports
    return customTypeNames.filter((typeName) => typeName.pascalCase.unsafeName !== currentTypeName);
}

export function generateFieldType(
    property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty,
    context: ModelGeneratorContext,
    wrapInBox: boolean = false
): rust.Type {
    if (isOptionalType(property.valueType)) {
        // For optional types, generate Option<T> where T is the inner type
        // If recursive, wrap in Box: Option<Box<T>>
        const innerType = getInnerTypeFromOptional(property.valueType);
        return rust.Type.option(generateRustTypeForTypeReference(innerType, context, wrapInBox));
    } else {
        return generateRustTypeForTypeReference(property.valueType, context, wrapInBox);
    }
}

export function generateFieldAttributes(
    property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty,
    context?: ModelGeneratorContext
): rust.Attribute[] {
    const attributes: rust.Attribute[] = [];

    // Add serde rename if the field name differs from wire name
    if (property.name.name.snakeCase.unsafeName !== property.name.wireValue) {
        attributes.push(Attribute.serde.rename(property.name.wireValue));
    }

    // Add skip_serializing_if for optional fields to omit null values
    const isOptional = isOptionalType(property.valueType);
    if (isOptional) {
        attributes.push(Attribute.serde.skipSerializingIf('"Option::is_none"'));
    }

    // For non-optional fields with types that implement Default (primitives, containers),
    // add #[serde(default)] so deserialization succeeds when the field is missing from JSON.
    // This handles cases like deferred responses that return partial objects.
    if (!isOptional && hasDefaultImpl(property.valueType, context)) {
        attributes.push(Attribute.serde.default());
    }

    // Add flexible datetime serde attribute - both "offset" (default) and "utc" use flexible parsing
    // "offset" uses flexible_datetime::offset module (DateTime<FixedOffset>)
    // "utc" uses flexible_datetime::utc module (DateTime<Utc>)
    if (context) {
        const dateTimeType = context.getDateTimeType();
        const typeRef = isOptional ? getInnerTypeFromOptional(property.valueType) : property.valueType;
        if (isDateTimeOnlyType(typeRef)) {
            const modulePath = dateTimeType === "utc" 
                ? "crate::core::flexible_datetime::utc" 
                : "crate::core::flexible_datetime::offset";
            if (isOptional) {
                // For optional datetime fields with custom deserializer, we need serde(default)
                // to handle missing fields in JSON (otherwise serde expects the field to be present)
                attributes.push(Attribute.serde.default());
                attributes.push(Attribute.serde.with(`${modulePath}::option`));
            } else {
                attributes.push(Attribute.serde.with(modulePath));
            }
        }

        // Add base64 serde attribute for Vec<u8> fields that need base64 encoding/decoding
        if (isBase64Type(typeRef)) {
            if (isOptional) {
                attributes.push(Attribute.serde.default());
                attributes.push(Attribute.serde.with("crate::core::base64_bytes::option"));
            } else {
                attributes.push(Attribute.serde.with("crate::core::base64_bytes"));
            }
        }

        // Add bigint_string serde attribute for BigInt fields that need string encoding/decoding
        if (isBigIntType(typeRef)) {
            if (isOptional) {
                attributes.push(Attribute.serde.default());
                attributes.push(Attribute.serde.with("crate::core::bigint_string::option"));
            } else {
                attributes.push(Attribute.serde.with("crate::core::bigint_string"));
            }
        }
    }

    return attributes;
}

export function canDerivePartialEq(
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext
): boolean {
    // PartialEq is useful for testing and comparisons
    // Include it unless there are fields that can't support it
    // Use the PartialEq-specific function instead of the Hash/Eq function
    return properties.every((property) => {
        return typeSupportsPartialEq(property.valueType, context);
    });
}

export function canDeriveHashAndEq(
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext
): boolean {
    // Check if all field types can support Hash and Eq derives
    return properties.every((property) => {
        return typeSupportsHashAndEq(property.valueType, context);
    });
}

export function writeStructUseStatements(
    writer: rust.Writer,
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext,
    currentTypeName?: string
): void {
    const customTypes = getCustomTypesUsedInFields(properties, currentTypeName);
    customTypes.forEach((typeName) => {
        const modulePath = context.getModulePathForType(typeName.snakeCase.unsafeName);
        const moduleNameEscaped = context.escapeRustKeyword(modulePath);
        writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
    });

    // Add chrono imports based on specific types needed
    const hasDateOnly = hasDateFields(properties);
    const hasDateTimeOnly = hasDateTimeOnlyFields(properties);
    const useUtc = context.getDateTimeType() === "utc";

    // TODO: @iamnamananand996 - use AST mechanism for all imports
    if (hasDateOnly && hasDateTimeOnly) {
        // Both date and datetime types present
        if (useUtc) {
            writer.writeLine("use chrono::{DateTime, NaiveDate, Utc};");
        } else {
            // Default: DateTime<FixedOffset>
            writer.writeLine("use chrono::{DateTime, FixedOffset, NaiveDate};");
        }
    } else if (hasDateOnly) {
        // Only date type present, import NaiveDate only
        writer.writeLine("use chrono::NaiveDate;");
    } else if (hasDateTimeOnly) {
        // Only datetime type present
        if (useUtc) {
            writer.writeLine("use chrono::{DateTime, Utc};");
        } else {
            // Default: DateTime<FixedOffset>
            writer.writeLine("use chrono::{DateTime, FixedOffset};");
        }
    }

    // Add std::collections if we have maps or sets
    if (hasCollectionFields(properties)) {
        writer.writeLine("use std::collections::HashMap;");
    }

    // Add ordered_float if we have floating-point sets
    if (hasFloatingPointSets(properties)) {
        writer.writeLine("use ordered_float::OrderedFloat;");
    }

    // Add uuid if we have UUID fields
    if (hasUuidFields(properties)) {
        writer.writeLine("use uuid::Uuid;");
    }

    // TODO: @iamnamananand996 build to use serde_json::Value ---> Value directly
    // if (hasJsonValueFields(properties)) {
    //     writer.writeLine("use serde_json::Value;");
    // }

    // Add serde imports LAST
    writer.writeLine("use serde::{Deserialize, Serialize};");
}
