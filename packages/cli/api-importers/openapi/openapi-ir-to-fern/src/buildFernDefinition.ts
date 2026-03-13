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
import { buildObjectTypeDeclaration, buildTypeDeclaration } from "./buildTypeDeclaration.js";
import { buildVariables } from "./buildVariables.js";
import { buildWebhooks } from "./buildWebhooks.js";
import { computeSchemaReachability, computeVariantPlan } from "./computeSchemaReachability.js";
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
    schemaIdsToExclude: Set<string>;
    namespace: string | undefined;
    context: OpenApiIrConverterContext;
}): void {
    for (const [id, schema] of Object.entries(schemas)) {
        if (schemaIdsToExclude.has(id)) {
            continue;
        }

        const declarationFile = getDeclarationFileForSchema(schema);

        // Variant-plan-based logic for readonly schemas
        if (context.options.respectReadonlySchemas && context.needsBothVariants(id) && schema.type === "object") {
            // Generate Read variant (all properties, "Read" suffix)
            const readDeclaration = buildObjectTypeDeclaration({
                schema,
                context,
                declarationFile,
                namespace,
                declarationDepth: 0,
                variant: "read"
            });
            context.builder.addType(declarationFile, {
                name: readDeclaration.name ?? id,
                schema: readDeclaration.schema
            });

            // Generate Write variant (without readOnly properties, original name)
            const writeDeclaration = buildObjectTypeDeclaration({
                schema,
                context,
                declarationFile,
                namespace,
                declarationDepth: 0,
                skipReadonlyProperties: true,
                variant: "write"
            });
            context.builder.addType(declarationFile, {
                name: writeDeclaration.name ?? id,
                schema: writeDeclaration.schema
            });

            continue;
        }

        if (
            context.options.respectReadonlySchemas &&
            context.isRequestOnlyWithReadonly(id) &&
            schema.type === "object"
        ) {
            // Single Write variant (strip readonly properties)
            const writeDeclaration = buildObjectTypeDeclaration({
                schema,
                context,
                declarationFile,
                namespace,
                declarationDepth: 0,
                skipReadonlyProperties: true,
                variant: "write"
            });
            context.builder.addType(declarationFile, {
                name: writeDeclaration.name ?? id,
                schema: writeDeclaration.schema
            });

            continue;
        }

        // Default path: determine variant based on reachability
        // Request-only schemas resolve references to Write variants,
        // everything else resolves to Read variants
        let variant: "read" | "write" | undefined;
        if (context.options.respectReadonlySchemas) {
            variant = context.isRequestOnly(id) ? "write" : "read";
        }

        const typeDeclaration = buildTypeDeclaration({
            schema,
            context,
            declarationFile,
            namespace,
            declarationDepth: 0,
            variant
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

    // Compute reachability-based variant plan for readonly schema handling
    if (context.options.respectReadonlySchemas) {
        const reachability = computeSchemaReachability(context.ir);
        const variantPlan = computeVariantPlan(context.ir, reachability);
        context.setVariantPlan(variantPlan, reachability);
    }

    // Build type declarations
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
}): Set<string> {
    const referencedSchemaIds = context.getReferencedSchemaIds();
    if (referencedSchemaIds == null) {
        // No further filtering is required; we can return the
        // excluded schemas as-is.
        return new Set(schemaIdsToExcludeFromServices);
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

    return schemaIdsToExcludeSet;
}
