import { camelCase } from "lodash-es";

import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    ArraySchema,
    DoubleSchema,
    EnumSchema,
    IntSchema,
    LiteralSchema,
    MapSchema,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    PrimitiveSchemaValue,
    ReferencedSchema,
    Schema,
    SdkGroupName,
    StringSchema
} from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import {
    buildEnumTypeDeclaration,
    buildObjectTypeDeclaration,
    buildOneOfTypeDeclaration
} from "./buildTypeDeclaration";
import { convertAvailability } from "./utils/convertAvailability";
import { convertSdkGroupNameToFile } from "./utils/convertSdkGroupName";
import { convertToEncodingSchema } from "./utils/convertToEncodingSchema";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema";
import {
    getDefaultFromTypeReference,
    getDocsFromTypeReference,
    getTypeFromTypeReference,
    getValidationFromTypeReference
} from "./utils/getTypeFromTypeReference";

const MIN_INT_32 = -2147483648;
const MAX_INT_32 = 2147483647;

const MIN_DOUBLE_64 = -1.7976931348623157e308;
const MAX_DOUBLE_64 = 1.7976931348623157e308;

export function buildTypeReference({
    schema,
    /* The file the type reference will be written to */
    fileContainingReference,
    /* The file any type declarations will be written to. Defaults to fileContainingReference if not present */
    declarationFile = fileContainingReference,
    context,
    namespace,
    declarationDepth
}: {
    schema: Schema;
    fileContainingReference: RelativeFilePath;
    declarationFile?: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    if (context.shouldMarkSchemaAsReferenced()) {
        context.markSchemaAsReferenced(schema, namespace);
    }
    switch (schema.type) {
        case "primitive": {
            return buildPrimitiveTypeReference(schema);
        }
        case "array":
            return buildArrayTypeReference({
                schema,
                fileContainingReference,
                context,
                declarationFile,
                namespace,
                declarationDepth
            });
        case "map":
            return buildMapTypeReference({
                schema,
                fileContainingReference,
                context,
                declarationFile,
                namespace,
                declarationDepth
            });
        case "reference":
            return buildReferenceTypeReference({
                schema,
                fileContainingReference,
                context,
                namespace
            });
        case "unknown":
            return buildUnknownTypeReference();
        case "optional":
        case "nullable":
            return buildOptionalTypeReference({
                schema,
                fileContainingReference,
                context,
                declarationFile,
                namespace,
                declarationDepth
            });
        case "enum":
            return buildEnumTypeReference({
                schema,
                fileContainingReference,
                context,
                declarationFile,
                declarationDepth
            });
        case "literal":
            schema.value;
            return buildLiteralTypeReference(schema);
        case "object":
            return buildObjectTypeReference({
                schema,
                fileContainingReference,
                context,
                declarationFile,
                namespace,
                declarationDepth
            });
        case "oneOf":
            return buildOneOfTypeReference({
                schema: schema.value,
                fileContainingReference,
                context,
                declarationFile,
                namespace,
                declarationDepth
            });
        default:
            assertNever(schema);
    }
}

export function buildPrimitiveTypeReference(primitiveSchema: PrimitiveSchema): RawSchemas.TypeReferenceSchema {
    switch (primitiveSchema.schema.type) {
        case "string":
            return buildStringTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
        case "int":
            return buildIntegerTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
        case "float":
            return buildFloatTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
        case "double":
            return buildDoubleTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
        case "boolean":
            return buildBooleanTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
        case "int64":
            return buildLongTypeReference({
                description: primitiveSchema.description,
                schema: primitiveSchema.schema
            });
    }
    const typeReference = primitiveSchema.schema._visit({
        int: () => "integer",
        int64: () => "long",
        uint: () => "uint",
        uint64: () => "uint64",
        float: () => "double",
        double: () => "double",
        string: () => "string",
        datetime: () => "datetime",
        date: () => "date",
        base64: () => "base64",
        boolean: () => "boolean",
        _other: () => "unknown"
    });
    if (primitiveSchema.description == null && primitiveSchema.title == null) {
        return typeReference;
    }

    return {
        type: typeReference,
        ...(primitiveSchema.description != null ? { docs: primitiveSchema.description } : {}),
        ...(primitiveSchema.availability != null
            ? { availability: convertAvailability(primitiveSchema.availability) }
            : {})
    };
}

function buildBooleanTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.Boolean;
}): RawSchemas.TypeReferenceSchema {
    const type = "boolean";
    if (description == null && schema.default == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    if (schema.default != null) {
        result.default = schema.default;
    }
    return result;
}

function buildLongTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.Int64;
}): RawSchemas.TypeReferenceSchema {
    const type = "long";
    if (description == null && schema.default == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    if (schema.default != null) {
        result.default = schema.default;
    }
    return result;
}

function buildStringTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.String;
}): RawSchemas.TypeReferenceSchema {
    const type = "string";
    const validation = maybeStringValidation(schema);
    if (description == null && schema.default == null && validation == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    if (schema.default != null) {
        result.default = schema.default;
    }
    if (validation != null) {
        result.validation = validation;
    }
    return result;
}

function buildIntegerTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.Int;
}): RawSchemas.TypeReferenceSchema {
    const type = "integer";
    const validation = maybeNumberValidation(schema, type);
    if (description == null && schema.default == null && validation == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    if (schema.default != null) {
        result.default = schema.default;
    }
    if (validation != null) {
        result.validation = validation;
    }
    return result;
}

function buildFloatTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.Float;
}): RawSchemas.TypeReferenceSchema {
    const type = "float";
    if (description == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    return result;
}

function buildDoubleTypeReference({
    description,
    schema
}: {
    description: string | undefined;
    schema: PrimitiveSchemaValue.Double;
}): RawSchemas.TypeReferenceSchema {
    const type = "double";
    const validation = maybeNumberValidation(schema, type);
    if (description == null && schema.default == null && validation == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (description != null) {
        result.docs = description;
    }
    if (schema.default != null) {
        result.default = schema.default;
    }
    if (validation != null) {
        result.validation = validation;
    }
    return result;
}

function maybeStringValidation(
    schema: Omit<StringSchema, "default"> | undefined
): RawSchemas.ValidationSchema | undefined {
    if (schema == null) {
        return undefined;
    }
    const { format, pattern, minLength, maxLength } = schema;
    const validFormat = maybeValidFormat(format);
    if (validFormat == null && pattern == null && minLength == null && maxLength == null) {
        return undefined;
    }
    return {
        format: validFormat,
        pattern,
        minLength,
        maxLength
    };
}

function maybeValidFormat(format: string | undefined): string | undefined {
    // We only accept the set of OpenAPI formats that are explicitly listed at the following:
    // https://swagger.io/docs/specification/data-models/data-types/#string
    switch (format) {
        case "date":
        case "date-time":
        case "password":
        case "byte":
        case "bytes":
        case "binary":
        case "email":
        case "uuid":
        case "uri":
        case "hostname":
        case "ipv4":
        case "ipv6":
            return format;
        default:
            return undefined;
    }
}

function maybeNumberValidation(
    schema: Omit<IntSchema, "default"> | Omit<DoubleSchema, "default"> | undefined,
    type: "integer" | "double"
): RawSchemas.ValidationSchema | undefined {
    if (schema == null) {
        return undefined;
    }
    let { minimum, maximum, multipleOf } = schema;
    const { exclusiveMinimum, exclusiveMaximum } = schema;
    minimum = makeUndefinedIfOutsideRange(minimum, type);
    maximum = makeUndefinedIfOutsideRange(maximum, type);
    multipleOf = makeUndefinedIfOutsideRange(multipleOf, type);
    if (
        minimum == null &&
        maximum == null &&
        exclusiveMinimum == null &&
        exclusiveMaximum == null &&
        multipleOf == null
    ) {
        return undefined;
    }

    return {
        min: minimum,
        max: maximum,
        exclusiveMin: exclusiveMinimum,
        exclusiveMax: exclusiveMaximum,
        multipleOf
    };
}

/**
 * Ensures that a number is within the specified range for its type.
 * Returns `undefined` if the number is outside the valid range for the given type.
 *
 * @param num - The number to check. Can be `undefined`.
 * @param type - The type of the number, either "integer" or "double".
 * @returns The number if it is within the valid range, or `undefined` if it is outside the range.
 */
function makeUndefinedIfOutsideRange(num: number | undefined, type: "integer" | "double"): number | undefined {
    if (num === undefined) {
        return undefined;
    }

    const [min, max] = type === "integer" ? [MIN_INT_32, MAX_INT_32] : [MIN_DOUBLE_64, MAX_DOUBLE_64];

    return num < min || num > max ? undefined : num;
}

export function buildReferenceTypeReference({
    schema,
    fileContainingReference,
    context,
    namespace
}: {
    schema: ReferencedSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
}): RawSchemas.TypeReferenceSchema {
    const resolvedSchema = context.getSchema(schema.schema, namespace);
    if (resolvedSchema == null) {
        return "unknown";
    }

    const schemaName = getSchemaName(resolvedSchema) ?? schema.schema;
    const groupName = getGroupNameForSchema(resolvedSchema);
    const displayName = getDisplayName(resolvedSchema);
    const typeWithPrefix = getPrefixedType({
        context,
        fileContainingReference,
        declarationFile: convertSdkGroupNameToFile(groupName),
        type: schemaName
    });

    const type = resolvedSchema.type === "nullable" ? `optional<${typeWithPrefix}>` : typeWithPrefix;
    if (schema.description == null && displayName == null) {
        return type;
    }
    return {
        type: resolvedSchema.type === "nullable" ? `optional<${typeWithPrefix}>` : typeWithPrefix,
        ...(schema.description != null ? { docs: schema.description } : {}),
        ...(schema.availability != null ? { availability: convertAvailability(schema.availability) } : {})
    };
}

export function buildArrayTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    namespace,
    declarationDepth
}: {
    schema: ArraySchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const item = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
        declarationFile,
        context,
        namespace,
        declarationDepth
    });
    const type = `list<${getTypeFromTypeReference(item)}>`;
    if (schema.description == null && schema.title == null) {
        return type;
    }
    return {
        ...(schema.description != null ? { docs: schema.description } : {}),
        ...(schema.availability != null ? { availability: convertAvailability(schema.availability) } : {}),
        type
    };
}

export function buildMapTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    namespace,
    declarationDepth
}: {
    schema: MapSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const keyTypeReference = buildPrimitiveTypeReference(schema.key);
    const valueTypeReference = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
        declarationFile,
        context,
        namespace,
        declarationDepth
    });
    const encoding = schema.encoding != null ? convertToEncodingSchema(schema.encoding) : undefined;
    const type = `map<${getTypeFromTypeReference(keyTypeReference)}, ${getTypeFromTypeReference(valueTypeReference)}>`;
    if (schema.description == null && encoding == null && schema.title == null) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (schema.description != null) {
        result.docs = schema.description;
    }
    if (schema.encoding != null) {
        result.encoding = encoding;
    }
    if (schema.availability != null) {
        result.availability = convertAvailability(schema.availability);
    }
    return result;
}

export function buildOptionalTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    namespace,
    declarationDepth
}: {
    schema: OptionalSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const itemTypeReference = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
        declarationFile,
        context,
        namespace,
        declarationDepth
    });
    const itemType = getTypeFromTypeReference(itemTypeReference);
    const itemDocs = getDocsFromTypeReference(itemTypeReference);
    const itemDefault = getDefaultFromTypeReference(itemTypeReference);
    const itemValidation = getValidationFromTypeReference(itemTypeReference);
    const type = itemType.startsWith("optional<") ? itemType : `optional<${itemType}>`;
    if (
        schema.availability == null &&
        schema.description == null &&
        itemDocs == null &&
        itemDefault == null &&
        itemValidation == null &&
        schema.title == null
    ) {
        return type;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type
    };
    if (schema.description != null || itemDocs != null) {
        result.docs = schema.description ?? itemDocs;
    }
    if (itemDefault != null) {
        result.default = itemDefault;
    }
    if (itemValidation != null) {
        result.validation = itemValidation;
    }
    if (schema.availability != null) {
        result.availability = convertAvailability(schema.availability);
    }
    return result;
}

export function buildUnknownTypeReference(): RawSchemas.TypeReferenceSchema {
    return "unknown";
}

export function buildLiteralTypeReference(schema: LiteralSchema): RawSchemas.TypeReferenceSchema {
    let value: string;
    switch (schema.value.type) {
        case "boolean": {
            value = `literal<${schema.value.value}>`;
            break;
        }
        case "string": {
            value = `literal<"${schema.value.value}">`;
            break;
        }
        default:
            assertNever(schema.value);
    }
    if (schema.description == null && schema.title == null) {
        return value;
    }
    return {
        type: value,
        ...(schema.description != null ? { docs: schema.description } : {}),
        ...(schema.availability != null ? { availability: convertAvailability(schema.availability) } : {})
    };
}

export function buildEnumTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    declarationDepth
}: {
    schema: EnumSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const enumTypeDeclaration = buildEnumTypeDeclaration(schema, declarationDepth);
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: enumTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null && schema.default == null && schema.title == null) {
        return prefixedType;
    }
    const result: RawSchemas.TypeReferenceSchema = {
        type: prefixedType
    };
    if (schema.description != null) {
        result.docs = schema.description;
    }
    if (schema.default != null) {
        result.default = schema.default.value;
    }
    if (schema.availability != null) {
        result.availability = convertAvailability(schema.availability);
    }

    return result;
}

export function buildObjectTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    namespace,
    declarationDepth
}: {
    schema: ObjectSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const objectTypeDeclaration = buildObjectTypeDeclaration({
        schema,
        declarationFile,
        context,
        namespace,
        declarationDepth
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: objectTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null && schema.title == null) {
        return prefixedType;
    }
    return {
        type: prefixedType,
        ...(schema.description != null ? { docs: schema.description } : {}),
        ...(schema.availability != null ? { availability: convertAvailability(schema.availability) } : {})
    };
}

export function buildOneOfTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context,
    namespace,
    declarationDepth
}: {
    schema: OneOfSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    namespace: string | undefined;
    declarationDepth: number;
}): RawSchemas.TypeReferenceSchema {
    const unionTypeDeclaration = buildOneOfTypeDeclaration({
        schema,
        declarationFile,
        context,
        namespace,
        declarationDepth
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: unionTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null && schema.title == null) {
        return prefixedType;
    }
    return {
        ...(schema.title != null ? { "display-name": schema.title } : {}),
        type: prefixedType,
        ...(schema.description != null ? { docs: schema.description } : {}),
        ...(schema.availability != null ? { availability: convertAvailability(schema.availability) } : {})
    };
}

function getPrefixedType({
    type,
    fileContainingReference,
    declarationFile,
    context
}: {
    type: string;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): string {
    if (declarationFile === fileContainingReference) {
        return type;
    }
    const prefix = context.builder.addImport({
        file: fileContainingReference,
        fileToImport: declarationFile
    });
    return prefix != null ? `${prefix}.${type}` : type;
}

function getSchemaName(schema: Schema): string | undefined {
    return Schema._visit(schema, {
        primitive: (s) => s.nameOverride ?? s.generatedName,
        object: (s) => s.nameOverride ?? s.generatedName,
        array: (s) => s.nameOverride ?? s.generatedName,
        map: (s) => s.nameOverride ?? s.generatedName,
        enum: (s) => s.nameOverride ?? s.generatedName,
        reference: (s) => s.nameOverride ?? s.generatedName,
        literal: (s) => s.nameOverride ?? s.generatedName,
        oneOf: (s) => s.nameOverride ?? s.generatedName,
        optional: (s) => s.nameOverride ?? s.generatedName,
        nullable: (s) => s.nameOverride ?? s.generatedName,
        unknown: (s) => s.nameOverride ?? s.generatedName,
        _other: () => undefined
    });
}

function getDisplayName(schema: Schema): string | undefined {
    return Schema._visit(schema, {
        primitive: (s) => s.title,
        object: (s) => s.title,
        array: (s) => s.title,
        map: (s) => s.title,
        enum: (s) => s.title,
        reference: (s) => s.title,
        literal: (s) => s.title,
        oneOf: (s) => s.title,
        optional: (s) => s.title,
        nullable: (s) => s.title,
        unknown: (s) => undefined,
        _other: () => undefined
    });
}
