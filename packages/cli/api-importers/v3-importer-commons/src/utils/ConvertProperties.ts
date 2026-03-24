import { ObjectProperty, TypeId, V2SchemaExamples } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { ExampleConverter } from "../converters/ExampleConverter.js";
import { SchemaConverter } from "../converters/schema/SchemaConverter.js";
import { SchemaOrReferenceConverter } from "../converters/schema/SchemaOrReferenceConverter.js";
import { ErrorCollector } from "../ErrorCollector.js";
import { Extensions } from "../index.js";

export function convertProperties({
    properties,
    required,
    breadcrumbs,
    context,
    errorCollector
}: {
    properties: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject>;
    required: string[];
    breadcrumbs: string[];
    context: AbstractConverterContext<object>;
    errorCollector: ErrorCollector;
}): {
    convertedProperties: ObjectProperty[];
    propertiesByAudience: Record<string, Set<string>>;
    inlinedTypesFromProperties: Record<TypeId, SchemaConverter.ConvertedSchema>;
    referencedTypes: Set<string>;
} {
    const convertedProperties: ObjectProperty[] = [];
    let inlinedTypesFromProperties: Record<TypeId, SchemaConverter.ConvertedSchema> = {};
    const propertiesByAudience: Record<string, Set<string>> = {};
    const referencedTypes: Set<string> = new Set();
    for (const [propertyName, propertySchema] of Object.entries(properties ?? {})) {
        const propertyBreadcrumbs = [...breadcrumbs, "properties", propertyName];
        if (typeof propertySchema !== "object") {
            errorCollector.collect({
                message: `Schema property ${propertyName} should be an object`,
                path: propertyBreadcrumbs
            });
            continue;
        }
        const propertyId =
            maybeGetFernTypeNameExtension(breadcrumbs, propertySchema, context) ??
            context.convertBreadcrumbsToName(propertyBreadcrumbs);
        const isNullable = "nullable" in propertySchema ? (propertySchema.nullable as boolean) : false;

        const propertySchemaConverter = new SchemaOrReferenceConverter({
            context,
            breadcrumbs: propertyBreadcrumbs,
            schemaOrReference: propertySchema,
            schemaIdOverride: propertyId,
            wrapAsOptional: !required.includes(propertyName),
            wrapAsNullable: isNullable
        });
        const convertedProperty = propertySchemaConverter.convert();
        if (convertedProperty != null) {
            convertedProperties.push({
                name: context.casingsGenerator.generateNameAndWireValue({
                    name: propertyName,
                    wireValue: propertyName
                }),
                valueType: convertedProperty.type,
                docs: propertySchema.description,
                availability: convertedProperty.availability,
                propertyAccess: context.getPropertyAccess(propertySchema),
                v2Examples:
                    convertedProperty.schema?.typeDeclaration?.v2Examples ??
                    generatePropertyV2Examples({
                        propertySchema,
                        breadcrumbs: propertyBreadcrumbs,
                        context,
                        propertyId
                    })
            });
            inlinedTypesFromProperties = {
                ...inlinedTypesFromProperties,
                ...convertedProperty.inlinedTypes
            };

            if (convertedProperty.schema?.typeDeclaration.referencedTypes != null) {
                convertedProperty.schema.typeDeclaration.referencedTypes.forEach((type) => {
                    referencedTypes.add(type);
                });
            }
            for (const audience of convertedProperty.schema?.audiences ?? []) {
                if (propertiesByAudience[audience] == null) {
                    propertiesByAudience[audience] = new Set<string>();
                }
                propertiesByAudience[audience].add(propertyName);
            }
        }
    }
    for (const typeId of Object.keys(inlinedTypesFromProperties)) {
        referencedTypes.add(typeId);
    }
    return { convertedProperties, propertiesByAudience, inlinedTypesFromProperties, referencedTypes };
}

function generatePropertyV2Examples({
    propertySchema,
    breadcrumbs,
    context,
    propertyId
}: {
    propertySchema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;
    breadcrumbs: string[];
    context: AbstractConverterContext<object>;
    propertyId: string;
}): V2SchemaExamples {
    const resolvedSchema = context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
        schemaOrReference: propertySchema,
        breadcrumbs,
        skipErrorCollector: true
    });
    const examples = context.getExamplesFromSchema({
        schema: resolvedSchema ?? undefined,
        breadcrumbs
    });

    if (examples.length > 0) {
        const userSpecifiedExamples: Record<string, unknown> = {};
        for (const [index, example] of examples.entries()) {
            const resolvedExample = context.resolveExample(example);
            const exampleName = `${propertyId}_example_${index}`;
            const exampleConverter = new ExampleConverter({
                breadcrumbs,
                context,
                schema: propertySchema,
                example: resolvedExample
            });
            const { validExample } = exampleConverter.convert();
            userSpecifiedExamples[exampleName] = validExample;
        }
        return { userSpecifiedExamples, autogeneratedExamples: {} };
    }

    const exampleName = `${propertyId}_example_autogenerated`;
    const exampleConverter = new ExampleConverter({
        breadcrumbs,
        context,
        schema: propertySchema,
        example: undefined,
        generateOptionalProperties: true
    });
    const { validExample } = exampleConverter.convert();
    return {
        userSpecifiedExamples: {},
        autogeneratedExamples: { [exampleName]: validExample }
    };
}

function maybeGetFernTypeNameExtension(
    breadcrumbs: string[],
    schema: OpenAPIV3_1.SchemaObject,
    context: AbstractConverterContext<object>
): string | undefined {
    if (context.isReferenceObject(schema)) {
        return undefined;
    }
    const fernTypeNameConverter = new Extensions.FernTypeNameExtension({
        breadcrumbs,
        schema,
        context
    });
    return fernTypeNameConverter.convert();
}
