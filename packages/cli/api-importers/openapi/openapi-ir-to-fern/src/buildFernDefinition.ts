import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { isRawAliasDefinition } from "@fern-api/fern-definition-schema";
import { FernDefinition } from "@fern-api/importer-commons";
import { Schema } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildAuthSchemes } from "./buildAuthSchemes.js";
import { buildChannel } from "./buildChannel.js";
import { buildEnvironments } from "./buildEnvironments.js";
import { buildGlobalHeaders } from "./buildGlobalHeaders.js";
import { buildIdempotencyHeaders } from "./buildIdempotencyHeaders.js";
import { buildServices } from "./buildServices.js";
import { buildTypeDeclaration } from "./buildTypeDeclaration.js";
import { buildVariables } from "./buildVariables.js";
import { buildWebhooks } from "./buildWebhooks.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { State } from "./State.js";
import { convertSdkGroupNameToFile } from "./utils/convertSdkGroupName.js";
import { getDeclarationFileForSchema } from "./utils/getDeclarationFileForSchema.js";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference.js";

export const ROOT_PREFIX = "root";
export const EXTERNAL_AUDIENCE = "external";
/** All errors are currently declared in __package__.yml */
export const ERROR_DECLARATIONS_FILENAME = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);

function addSchemas({
    schemas,
    schemaIdsToExclude,
    namespace,
    context
}: {
    schemas: Record<string, Schema>;
    schemaIdsToExclude: string[];
    namespace: string | undefined;
    context: OpenApiIrConverterContext;
}): void {
    // Phase 1: Pre-compute all final schema names to handle readonly renaming
    // Skip this phase entirely if respect-readonly-schemas is disabled
    if (context.options.respectReadonlySchemas) {
        for (const [id, schema] of Object.entries(schemas)) {
            if (schemaIdsToExclude.includes(id) || schema.type !== "object") {
                continue;
            }

            const originalName = schema.nameOverride ?? schema.generatedName;
            const hasReadonlyProperties = schema.properties.some((prop) => prop.readonly);

            if (hasReadonlyProperties) {
                const finalName = `${originalName}Read`;
                context.setSchemaFinalName(originalName, finalName);
            }
        }
    }

    // Phase 2: Build type declarations using final names
    for (const [id, schema] of Object.entries(schemas)) {
        if (schemaIdsToExclude.includes(id)) {
            continue;
        }

        const declarationFile = getDeclarationFileForSchema(schema);
        const typeDeclaration = buildTypeDeclaration({
            schema,
            context,
            declarationFile,
            namespace,
            declarationDepth: 0
        });

        // HACKHACK: Skip self-referencing schemas. I'm not sure if this is the right way to do this.
        if (isRawAliasDefinition(typeDeclaration.schema)) {
            const aliasType = getTypeFromTypeReference(typeDeclaration.schema);
            if (
                aliasType === (typeDeclaration.name ?? id) ||
                aliasType === `optional<${typeDeclaration.name ?? id}>` ||
                aliasType === `nullable<${typeDeclaration.name ?? id}>` ||
                aliasType === `optional<nullable<${typeDeclaration.name ?? id}>>`
            ) {
                continue;
            }
        }

        context.builder.addType(declarationFile, {
            name: typeDeclaration.name ?? id,
            schema: typeDeclaration.schema
        });
    }
}

export function buildFernDefinition(context: OpenApiIrConverterContext): FernDefinition {
    if (context.ir.apiVersion != null) {
        context.builder.setApiVersion(context.ir.apiVersion);
    }
    buildEnvironments(context);
    buildGlobalHeaders(context);
    buildIdempotencyHeaders(context);
    buildAuthSchemes(context);
    buildVariables(context);
    if (context.ir.basePath != null) {
        context.builder.setBasePath(context.ir.basePath);
    }
    if (context.ir.hasEndpointsMarkedInternal) {
        context.builder.addAudience(EXTERNAL_AUDIENCE);
    }

    const convertedServices = buildServices(context);
    const sdkGroups = convertedServices.sdkGroups;

    context.setInState(State.Webhook);
    buildWebhooks(context);
    context.unsetInState(State.Webhook);

    // Add Channels
    context.setInState(State.Channel);
    for (const channel of Object.values(context.ir.channels)) {
        const declarationFile = convertSdkGroupNameToFile(channel.groupName);
        buildChannel({ channel, context, declarationFile });
    }
    context.unsetInState(State.Channel);

    // Add Schemas
    const schemaIdsToExclude = getSchemaIdsToExclude({
        context,
        schemaIdsToExcludeFromServices: convertedServices.schemaIdsToExclude
    });
    addSchemas({ schemas: context.ir.groupedSchemas.rootSchemas, schemaIdsToExclude, namespace: undefined, context });
    for (const [namespace, schemas] of Object.entries(context.ir.groupedSchemas.namespacedSchemas)) {
        addSchemas({ schemas, schemaIdsToExclude, namespace, context });
    }

    if (context.ir.tags.orderedTagIds != null && context.ir.tags.orderedTagIds.length > 0) {
        const containsValidTagIds = context.ir.tags.orderedTagIds.every((tagId) => {
            return sdkGroups.has(tagId);
        });
        if (containsValidTagIds) {
            context.builder.addNavigation({
                navigation: context.ir.tags.orderedTagIds
            });
        }
    }

    context.builder.optimizeServiceAuth();

    return context.builder.build();
}

function getSchemaIdsToExclude({
    context,
    schemaIdsToExcludeFromServices
}: {
    context: OpenApiIrConverterContext;
    schemaIdsToExcludeFromServices: string[];
}): string[] {
    const referencedSchemaIds = context.getReferencedSchemaIds();
    if (referencedSchemaIds == null) {
        // No further filtering is required; we can return the
        // excluded schemas as-is.
        return schemaIdsToExcludeFromServices;
    }

    // Retrieve all the schema IDs, then exclude all the schemas that
    // aren't explicitly referenced.
    const allSchemaIds = new Set([
        ...Object.keys(context.ir.groupedSchemas.rootSchemas),
        ...Object.values(context.ir.groupedSchemas.namespacedSchemas).flatMap((schemas) => Object.keys(schemas))
    ]);

    const schemaIdsToExcludeSet = new Set<string>(schemaIdsToExcludeFromServices);
    for (const schemaId of allSchemaIds) {
        if (!referencedSchemaIds.includes(schemaId)) {
            schemaIdsToExcludeSet.add(schemaId);
        }
    }

    return Array.from(schemaIdsToExcludeSet);
}
