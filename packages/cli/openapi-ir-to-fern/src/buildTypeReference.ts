import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import {
    ArraySchema,
    EnumSchema,
    LiteralSchemaValue,
    MapSchema,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    PrimitiveSchemaValue,
    ReferencedSchema,
    Schema
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    buildEnumTypeDeclaration,
    buildObjectTypeDeclaration,
    buildOneOfTypeDeclaration
} from "./buildTypeDeclaration";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildTypeReference({
    schema,
    /* The file the type reference will be written to */
    fileContainingReference,
    context
}: {
    schema: Schema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    if (schema.type === "primitive") {
        return buildPrimitiveTypeReference(schema);
    } else if (schema.type === "array") {
        return buildArrayTypeReference({ schema, fileContainingReference, context });
    } else if (schema.type === "map") {
        return buildMapTypeReference({ schema, fileContainingReference, context });
    } else if (schema.type === "reference") {
        return buildReferenceTypeReference({ schema, fileContainingReference, context });
    } else if (schema.type === "unknown") {
        return buildUnknownTypeReference();
    } else if (schema.type === "optional") {
        return buildOptionalTypeReference({ schema, fileContainingReference, context });
    } else if (schema.type === "nullable") {
        return buildNullableTypeReference({ schema, fileContainingReference, context });
    } else if (schema.type === "enum") {
        // return convertEnumToTypeReference({ schema, prefix });
    } else if (schema.type === "literal") {
        return buildLiteralTypeReference(schema.value);
    } else if (schema.type === "object") {
        // return convertObjectToTypeReference({ schema, prefix, schemas });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (schema.type === "oneOf") {
        // return convertOneOfToTypeReference({ schema: schema.oneOf, prefix, schemas });
    }
    throw new Error(`Failed to convert to type reference: ${JSON.stringify(schema)}`);
}

export function buildPrimitiveTypeReference(primitiveSchema: PrimitiveSchema): RawSchemas.TypeReferenceWithDocsSchema {
    const typeReference = PrimitiveSchemaValue._visit<string>(primitiveSchema.schema, {
        int: () => "integer",
        int64: () => "long",
        float: () => "double",
        double: () => "double",
        string: () => "string",
        datetime: () => "datetime",
        date: () => "date",
        base64: () => "base64",
        boolean: () => "boolean",
        _unknown: () => "unknown"
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
    const schemaName = getSchemaName(resolvedSchema) ?? schema.schema;
    const typeWithPrefix = getPrefixedType({
        context,
        fileContainingReference,
        groupName: schema.groupName,
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
    context
}: {
    schema: ArraySchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const item = buildTypeReference({ schema: schema.value, fileContainingReference, context });
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
    context
}: {
    schema: MapSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const keyTypeReference = buildPrimitiveTypeReference(schema.key);
    const valueTypeReference = buildTypeReference({
        schema: schema.value,
        fileContainingReference,
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
    context
}: {
    schema: OptionalSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const itemTypeReference = buildTypeReference({ schema: schema.value, fileContainingReference, context });
    const itemType = getTypeFromTypeReference(itemTypeReference);
    const type = itemType.startsWith("optional<") ? itemType : `optional<${itemType}>`;
    if (schema.description == null) {
        return type;
    }
    return {
        docs: schema.description,
        type
    };
}

export function buildNullableTypeReference({
    schema,
    fileContainingReference,
    context
}: {
    schema: OptionalSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const itemTypeReference = buildTypeReference({ schema: schema.value, fileContainingReference, context });
    const itemType = getTypeFromTypeReference(itemTypeReference);
    const type = itemType.startsWith("optional<") ? itemType : `optional<${itemType}>`;
    if (schema.description == null) {
        return type;
    }
    return {
        docs: schema.description,
        type
    };
}

export function buildUnknownTypeReference(): RawSchemas.TypeReferenceWithDocsSchema {
    return "unknown";
}

export function buildLiteralTypeReference(value: LiteralSchemaValue): RawSchemas.TypeReferenceWithDocsSchema {
    switch (value.type) {
        case "boolean":
            return `literal<${value.boolean}>`;
        case "string":
            return `literal<"${value.string}">`;
        default:
            assertNever(value);
    }
}

export function buildEnumTypeReference({
    schema,
    fileContainingReference,
    context
}: {
    schema: EnumSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const enumTypeDeclaration = buildEnumTypeDeclaration(schema);
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(fileContainingReference, {
        name,
        schema: enumTypeDeclaration.schema
    });
    if (schema.description == null) {
        return name;
    }
    return {
        type: name,
        docs: schema.description
    };
}

export function buildObjectTypeReference({
    schema,
    fileContainingReference,
    context
}: {
    schema: ObjectSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const objectTypeDeclaration = buildObjectTypeDeclaration({
        schema,
        declarationFile: fileContainingReference,
        context
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(fileContainingReference, {
        name,
        schema: objectTypeDeclaration.schema
    });
    if (schema.description == null) {
        return name;
    }
    return {
        type: name,
        docs: schema.description
    };
}

export function convertOneOfToTypeReference({
    schema,
    fileContainingReference,
    context
}: {
    schema: OneOfSchema;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
}): RawSchemas.TypeReferenceWithDocsSchema {
    const unionTypeDeclaration = buildOneOfTypeDeclaration({
        schema,
        declarationFile: fileContainingReference,
        context
    });
    const name = schema.nameOverride ?? schema.generatedName;
    context.builder.addType(fileContainingReference, {
        name,
        schema: unionTypeDeclaration.schema
    });
    if (schema.description == null) {
        return name;
    }
    return {
        type: name,
        docs: schema.description
    };
}

function getPrefixedType({
    type,
    fileContainingReference,
    context,
    groupName
}: {
    type: string;
    fileContainingReference: RelativeFilePath;
    context: OpenApiIrConverterContext;
    groupName: string | undefined | null;
}): string {
    if (groupName == null && fileContainingReference === FERN_PACKAGE_MARKER_FILENAME) {
        return type;
    }
    const prefix = context.builder.addImport({
        file: fileContainingReference,
        fileToImport:
            groupName != null
                ? RelativeFilePath.of(`${groupName}.yml`)
                : RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)
    });
    return `${prefix}.${type}`;
}

function getSchemaName(schema: Schema): string | undefined {
    if (schema.type === "object") {
        return schema.nameOverride ?? schema.generatedName;
    } else if (schema.type === "enum") {
        return schema.nameOverride ?? schema.generatedName;
    } else if (schema.type === "oneOf") {
        return schema.oneOf.nameOverride ?? schema.oneOf.generatedName;
    } else if (schema.type === "reference") {
        return schema.nameOverride ?? schema.generatedName;
    } else if (schema.type === "nullable") {
        return getSchemaName(schema.value);
    }
    return undefined;
}
