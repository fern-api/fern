import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    ArraySchema,
    EnumSchema,
    LiteralSchema,
    MapSchema,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    ReferencedSchema,
    Schema
} from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { camelCase } from "lodash-es";
import {
    buildEnumTypeDeclaration,
    buildObjectTypeDeclaration,
    buildOneOfTypeDeclaration
} from "./buildTypeDeclaration";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getGroupNameForSchema } from "./utils/getGroupNameForSchema";
import { getDocsFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildTypeReference({
    schema,
    /* The file the type reference will be written to */
    fileContainingReference,
    /* The file any type declarations will be written to. Defaults to fileContainingReference if not present */
    declarationFile = fileContainingReference,
    context
}: {
    schema: Schema;
    fileContainingReference: RelativeFilePath;
    declarationFile?: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    switch (schema.type) {
        case "primitive":
            return buildPrimitiveTypeReference(schema);
        case "array":
            return buildArrayTypeReference({ schema, fileContainingReference, context, declarationFile });
        case "map":
            return buildMapTypeReference({ schema, fileContainingReference, context, declarationFile });
        case "reference":
            return buildReferenceTypeReference({ schema, fileContainingReference, context });
        case "unknown":
            return buildUnknownTypeReference();
        case "optional":
        case "nullable":
            return buildOptionalTypeReference({ schema, fileContainingReference, context, declarationFile });
        case "enum":
            return buildEnumTypeReference({ schema, fileContainingReference, context, declarationFile });
        case "literal":
            schema.value;
            return buildLiteralTypeReference(schema);
        case "object":
            return buildObjectTypeReference({ schema, fileContainingReference, context, declarationFile });
        case "oneOf":
            return buildOneOfTypeReference({ schema: schema.value, fileContainingReference, context, declarationFile });
        default:
            assertNever(schema);
    }
}

export function buildPrimitiveTypeReference(primitiveSchema: PrimitiveSchema): RawSchemas.TypeReferenceWithDocsSchema {
    switch (primitiveSchema.schema.type) {
        case "string":
            return {
                type: "string",
                docs: primitiveSchema.description,
                default: primitiveSchema.schema.default,
                validation: {
                    minLength: primitiveSchema.schema.minLength,
                    maxLength: primitiveSchema.schema.maxLength,
                    pattern: primitiveSchema.schema.pattern,
                    format: primitiveSchema.schema.format
                }
            };
        case "int":
            return {
                type: "integer",
                docs: primitiveSchema.description,
                default: primitiveSchema.schema.default,
                validation: {
                    min: primitiveSchema.schema.minimum,
                    max: primitiveSchema.schema.maximum,
                    exclusiveMin: primitiveSchema.schema.exclusiveMinimum,
                    exclusiveMax: primitiveSchema.schema.exclusiveMaximum,
                    multipleOf: primitiveSchema.schema.multipleOf
                }
            };
        case "double":
            return {
                type: "double",
                docs: primitiveSchema.description,
                default: primitiveSchema.schema.default,
                validation: {
                    min: primitiveSchema.schema.minimum,
                    max: primitiveSchema.schema.maximum,
                    exclusiveMin: primitiveSchema.schema.exclusiveMinimum,
                    exclusiveMax: primitiveSchema.schema.exclusiveMaximum,
                    multipleOf: primitiveSchema.schema.multipleOf
                }
            };
    }
    const typeReference = primitiveSchema.schema._visit({
        int: () => "integer",
        int64: () => "long",
        float: () => "double",
        double: () => "double",
        string: () => "string",
        datetime: () => "datetime",
        date: () => "date",
        base64: () => "base64",
        boolean: () => "boolean",
        _other: () => "unknown"
    });
    if (primitiveSchema.description != null) {
        return {
            type: typeReference,
            docs: primitiveSchema.description
        };
    }
    return typeReference;
}

export function buildReferenceTypeReference({
    schema,
    fileContainingReference,
    context
}: {
    schema: ReferencedSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const resolvedSchema = context.getSchema(schema.schema);
    if (resolvedSchema == null) {
        return "unknown";
    }
    const schemaName = getSchemaName(resolvedSchema) ?? schema.schema;
    const groupName = getGroupNameForSchema(resolvedSchema);
    const typeWithPrefix = getPrefixedType({
        context,
        fileContainingReference,
        declarationFile:
            groupName != null && groupName.length > 0
                ? RelativeFilePath.of(`${groupName.map(camelCase).join("/")}.yml`)
                : RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
        type: schemaName
    });
    const type = resolvedSchema.type === "nullable" ? `optional<${typeWithPrefix}>` : typeWithPrefix;
    if (schema.description == null) {
        return type;
    }
    return {
        type: resolvedSchema.type === "nullable" ? `optional<${typeWithPrefix}>` : typeWithPrefix,
        docs: schema.description
    };
}

export function buildArrayTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: ArraySchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const item = buildTypeReference({ schema: schema.value, fileContainingReference, declarationFile, context });
    const type = `list<${getTypeFromTypeReference(item)}>`;
    if (schema.description == null) {
        return type;
    }
    return {
        docs: schema.description,
        type
    };
}

export function buildMapTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: MapSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const keyTypeReference = buildPrimitiveTypeReference(schema.key);
    const valueTypeReference = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
        declarationFile,
        context
    });
    const type = `map<${getTypeFromTypeReference(keyTypeReference)}, ${getTypeFromTypeReference(valueTypeReference)}>`;
    if (schema.description == null) {
        return type;
    }
    return {
        docs: schema.description,
        type
    };
}

export function buildOptionalTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: OptionalSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const itemTypeReference = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
        declarationFile,
        context
    });
    const itemType = getTypeFromTypeReference(itemTypeReference);
    const itemDocs = getDocsFromTypeReference(itemTypeReference);
    const type = itemType.startsWith("optional<") ? itemType : `optional<${itemType}>`;
    if (schema.description == null && itemDocs == null) {
        return type;
    }
    return {
        docs: schema.description ?? itemDocs,
        type
    };
}

export function buildUnknownTypeReference(): RawSchemas.TypeReferenceWithDocsSchema {
    return "unknown";
}

export function buildLiteralTypeReference(schema: LiteralSchema): RawSchemas.TypeReferenceWithDocsSchema {
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
    if (schema.description == null) {
        return value;
    }
    return {
        type: value,
        docs: schema.description
    };
}

export function buildEnumTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: EnumSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const enumTypeDeclaration = buildEnumTypeDeclaration(schema);
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: enumTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null) {
        return prefixedType;
    }
    return {
        type: prefixedType,
        docs: schema.description
    };
}

export function buildObjectTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: ObjectSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const objectTypeDeclaration = buildObjectTypeDeclaration({
        schema,
        declarationFile,
        context
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: objectTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null) {
        return prefixedType;
    }
    return {
        type: prefixedType,
        docs: schema.description
    };
}

export function buildOneOfTypeReference({
    schema,
    fileContainingReference,
    declarationFile,
    context
}: {
    schema: OneOfSchema;
    fileContainingReference: RelativeFilePath;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const unionTypeDeclaration = buildOneOfTypeDeclaration({
        schema,
        declarationFile,
        context
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(declarationFile, {
        name,
        schema: unionTypeDeclaration.schema
    });
    const prefixedType = getPrefixedType({ type: name, fileContainingReference, declarationFile, context });
    if (schema.description == null) {
        return prefixedType;
    }
    return {
        type: prefixedType,
        docs: schema.description
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
