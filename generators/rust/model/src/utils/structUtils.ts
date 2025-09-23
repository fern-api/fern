import { Attribute, rust } from "@fern-api/rust-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import {
    extractNamedTypesFromTypeReference,
    getInnerTypeFromOptional,
    isCollectionType,
    isDateTimeType,
    isFloatingPointType,
    isOptionalType,
    isUnknownType,
    isUuidType,
    typeSupportsHashAndEq
} from "./primitiveTypeUtils";

/**
 * Struct and Request generation utility functions
 */

export function hasDateTimeFields(properties: (ObjectProperty | InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isDateTimeType(typeRef);
    });
}

export function hasCollectionFields(properties: (ObjectProperty | InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isCollectionType(typeRef);
    });
}

export function hasUuidFields(properties: (ObjectProperty | InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isUuidType(typeRef);
    });
}

export function hasJsonValueFields(properties: (ObjectProperty | InlinedRequestBodyProperty)[]): boolean {
    return properties.some((prop) => {
        const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;
        return isUnknownType(typeRef);
    });
}

export function hasFloatingPointSets(properties: (ObjectProperty | InlinedRequestBodyProperty)[]): boolean {
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
    properties: (ObjectProperty | InlinedRequestBodyProperty)[],
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

export function generateFieldType(property: ObjectProperty | InlinedRequestBodyProperty): rust.Type {
    if (isOptionalType(property.valueType)) {
        // For optional types, generate Option<T> where T is the inner type
        const innerType = getInnerTypeFromOptional(property.valueType);
        return rust.Type.option(generateRustTypeForTypeReference(innerType));
    } else {
        return generateRustTypeForTypeReference(property.valueType);
    }
}

export function generateFieldAttributes(property: ObjectProperty | InlinedRequestBodyProperty): rust.Attribute[] {
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

    return attributes;
}

export function canDerivePartialEq(
    properties: (ObjectProperty | InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext
): boolean {
    // PartialEq is useful for testing and comparisons
    // Include it unless there are fields that can't support it
    return properties.every((property) => {
        return typeSupportsHashAndEq(property.valueType, context);
    });
}

export function canDeriveHashAndEq(
    properties: (ObjectProperty | InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext
): boolean {
    // Check if all field types can support Hash and Eq derives
    return properties.every((property) => {
        return typeSupportsHashAndEq(property.valueType, context);
    });
}

export function writeStructUseStatements(
    writer: rust.Writer,
    properties: (ObjectProperty | InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext,
    currentTypeName?: string
): void {
    // Add imports for custom named types referenced in fields FIRST
    const customTypes = getCustomTypesUsedInFields(properties, currentTypeName);
    customTypes.forEach((typeName) => {
        const modulePath = context.getModulePathForType(typeName.snakeCase.unsafeName);
        const moduleNameEscaped = context.escapeRustKeyword(modulePath);
        writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
    });

    // Add chrono if we have datetime fields
    if (hasDateTimeFields(properties)) {
        writer.writeLine("use chrono::{DateTime, NaiveDate, Utc};");
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

    // Add serde_json if we have unknown/Value fields
    if (hasJsonValueFields(properties)) {
        writer.writeLine("use serde_json::Value;");
    }

    // Add serde imports LAST
    writer.writeLine("use serde::{Deserialize, Serialize};");
}
