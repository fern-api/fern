import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation, Webhook } from "@fern-fern/openapi-ir-model/finalIr";
import { camelCase, isEqual } from "lodash-es";
import { ROOT_PREFIX } from "../convertPackage";
import { OpenApiIrConverterContext } from "../OpenApiIrConverterContext";
import { convertHeader } from "./convertHeader";
import { convertToTypeReference } from "./convertToTypeReference";
import { tokenizeString } from "./utils/getEndpointLocation";

export interface ConvertedWebhooks {
    webhooks: Record<RelativeFilePath, Record<string, RawSchemas.WebhookSchema>>;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertWebhooks({
    openApiFile,
    context
}: {
    openApiFile: OpenAPIIntermediateRepresentation;
    context: OpenApiIrConverterContext;
}): ConvertedWebhooks | undefined {
    const webhooksByFile: Record<RelativeFilePath, Record<string, RawSchemas.WebhookSchema>> = {};
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};

    const { schemas, webhooks } = openApiFile;
    for (const webhook of webhooks) {
        const webhookLocation = getWebhookLocation({ webhook, context });
        if (webhookLocation == null) {
            continue;
        }
        const isPackageYml = webhookLocation.file === FERN_PACKAGE_MARKER_FILENAME;
        const headers: Record<string, RawSchemas.HttpHeaderSchema> = {};
        for (const header of webhook.headers) {
            const convertedHeader = convertHeader({ header, isPackageYml, schemas });
            headers[header.name] = convertedHeader.value;
        }

        const payloadTypeReference = convertToTypeReference({
            schema: webhook.payload,
            prefix: isPackageYml ? undefined : ROOT_PREFIX,
            schemas
        });
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...payloadTypeReference.additionalTypeDeclarations
        };

        const webhookDefinition: RawSchemas.WebhookSchema = {
            method: webhook.method,
            "display-name": webhook.summary ?? undefined,
            headers,
            payload: payloadTypeReference.typeReference
        };

        if (webhook.description != null) {
            webhookDefinition.docs = webhook.description;
        }

        const maybeWebhooksForFile = webhooksByFile[webhookLocation.file];
        if (maybeWebhooksForFile != null) {
            maybeWebhooksForFile[webhookLocation.endpointId] = webhookDefinition;
        } else {
            webhooksByFile[webhookLocation.file] = { [webhookLocation.endpointId]: webhookDefinition };
        }
    }

    return {
        webhooks: webhooksByFile,
        additionalTypeDeclarations
    };
}

export interface WebhookLocation {
    file: RelativeFilePath;
    endpointId: string;
    tag?: string;
}

function getWebhookLocation({
    webhook,
    context
}: {
    webhook: Webhook;
    context: OpenApiIrConverterContext;
}): WebhookLocation | undefined {
    const tag = webhook.tags[0];
    const operationId = webhook.operationId;

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: operationId
        };
    }

    // if both tag and operation ids are defined
    const tagTokens = tokenizeString(tag);
    const operationIdTokens = tokenizeString(operationId);

    // add to __package__.yml if equal
    if (isEqual(tagTokens, operationIdTokens)) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            endpointId: tag
        };
    }

    const fileParts: string[] = [];
    for (let i = 0; i < tagTokens.length; ++i) {
        const tagElement = tagTokens[i];
        if (tagElement != null && tagElement === operationIdTokens[i]) {
            fileParts.push(tagElement);
        } else {
            // tag and operation id don't overlap, so just return operation id
            const camelCasedTag = camelCase(tag);
            return {
                file: RelativeFilePath.of(`${camelCasedTag}.yml`),
                endpointId: operationId,
                tag
            };
        }
    }

    if (fileParts.length >= operationIdTokens.length) {
        context.logger.warn(`Skipping webhook ${webhook.operationId} because couldn't compute file location`);
        return undefined;
    }

    return {
        file: RelativeFilePath.of(camelCase(fileParts.join("_")) + ".yml"),
        endpointId: camelCase(operationIdTokens.slice(fileParts.length).join("_")),
        tag
    };
}
