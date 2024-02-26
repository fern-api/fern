import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { isRawAliasDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { buildAuthSchemes } from "./buildAuthSchemes";
import { buildChannel } from "./buildChannel";
import { buildEnvironments } from "./buildEnvironments";
import { buildGlobalHeaders } from "./buildGlobalHeaders";
import { buildServices } from "./buildServices";
import { buildTypeDeclaration } from "./buildTypeDeclaration";
import { buildTypeReference } from "./buildTypeReference";
import { buildVariables } from "./buildVariables";
import { buildWebhooks } from "./buildWebhooks";
import { FernDefinition } from "./FernDefnitionBuilder";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getDeclarationFileForSchema } from "./utils/getDeclarationFileForSchema";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export const ROOT_PREFIX = "root";
export const EXTERNAL_AUDIENCE = "external";
/** All errrors are currently declared in __package__.yml */
export const ERROR_DECLARATIONS_FILENAME = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);

export function buildFernDefinition(context: OpenApiIrConverterContext): FernDefinition {
    buildEnvironments(context);
    buildGlobalHeaders(context);
    buildAuthSchemes(context);
    buildVariables(context);
    if (context.ir.hasEndpointsMarkedInternal) {
        context.builder.addAudience(EXTERNAL_AUDIENCE);
    }
    const { schemaIdsToExclude, sdkGroups } = buildServices(context);
    buildWebhooks(context);

    // Add Channels
    for (const channel of context.ir.channel) {
        const declarationFile = RelativeFilePath.of(`${channel.groupName.join("/")}.yml`);
        buildChannel({ channel, context, declarationFile });
    }

    // Add Schemas
    for (const [id, schema] of Object.entries(context.ir.schemas)) {
        if (schemaIdsToExclude.includes(id)) {
            continue;
        }

        const declarationFile = getDeclarationFileForSchema(schema);
        const typeDeclaration = buildTypeDeclaration({ schema, context, declarationFile });

        // HACKHACK: Skip self-referencing schemas. I'm not sure if this is the right way to do this.
        if (isRawAliasDefinition(typeDeclaration.schema)) {
            const aliasType = getTypeFromTypeReference(typeDeclaration.schema);
            if (aliasType === (typeDeclaration.name ?? id) || aliasType === `optional<${typeDeclaration.name ?? id}>`) {
                continue;
            }
        }

        context.builder.addType(declarationFile, {
            name: typeDeclaration.name ?? id,
            schema: typeDeclaration.schema
        });
    }

    // Add Errors
    for (const [statusCode, httpError] of Object.entries(context.ir.errors)) {
        const errorDeclaration: RawSchemas.ErrorDeclarationSchema = {
            "status-code": parseInt(statusCode)
        };
        if (httpError.schema != null) {
            const typeReference = buildTypeReference({
                schema: httpError.schema,
                context,
                fileContainingReference: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)
            });
            errorDeclaration.type = getTypeFromTypeReference(typeReference);
        }
        context.builder.addError(ERROR_DECLARATIONS_FILENAME, {
            name: httpError.generatedName,
            schema: errorDeclaration
        });
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

    return context.builder.build();
}
