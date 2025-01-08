import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    Availability,
    ExampleWebhookCall,
    InlinedWebhookPayloadProperty,
    Webhook,
    WebhookGroup,
    WebhookPayload
} from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { IdGenerator } from "../IdGenerator";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { parseTypeName } from "../utils/parseTypeName";
import { convertAvailability } from "./convertDeclaration";
import { convertHttpHeader } from "./services/convertHttpService";
import { convertTypeReferenceExample } from "./type-declarations/convertExampleType";
import { getExtensionsAsList, getPropertyName } from "./type-declarations/convertObjectTypeDeclaration";

export function convertWebhookGroup({
    webhooks,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    webhooks: Record<string, RawSchemas.WebhookSchema>;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): WebhookGroup {
    const webhookGroup: Webhook[] = [];
    for (const [webhookId, webhook] of Object.entries(webhooks)) {
        webhookGroup.push({
            id: IdGenerator.generateWebhookId(file.fernFilepath, webhookId),
            availability: convertAvailability(webhook.availability),
            displayName: webhook["display-name"],
            docs: webhook.docs,
            method: webhook.method,
            name: file.casingsGenerator.generateName(webhookId),
            headers:
                webhook.headers != null
                    ? Object.entries(webhook.headers).map(([headerKey, header]) =>
                          convertHttpHeader({ headerKey, header, file })
                      )
                    : [],
            payload: convertWebhookPayloadSchema({ payload: webhook.payload, file }),
            examples:
                webhook.examples != null
                    ? convertWebhookExamples({
                          webhook,
                          examples: webhook.examples,
                          file,
                          typeResolver,
                          exampleResolver,
                          workspace
                      })
                    : undefined
        });
    }
    return webhookGroup;
}

function convertWebhookPayloadSchema({
    payload,
    file
}: {
    payload: RawSchemas.WebhookPayloadSchema;
    file: FernFileContext;
}): WebhookPayload {
    if (typeof payload === "string") {
        return WebhookPayload.reference({
            docs: undefined,
            payloadType: file.parseTypeReference(payload)
        });
    } else if (isReferencedWebhookPayloadSchema(payload)) {
        return WebhookPayload.reference({
            docs: undefined,
            payloadType: file.parseTypeReference(payload.type)
        });
    } else {
        return WebhookPayload.inlinedPayload({
            name: file.casingsGenerator.generateName(payload.name),
            extends: getExtensionsAsList(payload.extends).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties:
                payload.properties != null
                    ? Object.entries(payload.properties).map(([propertyKey, propertyDefinition]) =>
                          convertInlinedRequestProperty({
                              propertyKey,
                              propertyDefinition,
                              docs: typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                              availability:
                                  typeof propertyDefinition !== "string"
                                      ? convertAvailability(propertyDefinition.availability)
                                      : undefined,
                              file
                          })
                      )
                    : []
        });
    }
}

function convertInlinedRequestProperty({
    propertyKey,
    propertyDefinition,
    docs,
    availability,
    file
}: {
    propertyKey: string;
    propertyDefinition: RawSchemas.ObjectPropertySchema;
    docs: string | undefined;
    availability: Availability | undefined;
    file: FernFileContext;
}): InlinedWebhookPayloadProperty {
    return {
        docs,
        availability,
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name
        }),
        valueType: file.parseTypeReference(propertyDefinition)
    };
}

function convertWebhookExamples({
    webhook,
    examples,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    webhook: RawSchemas.WebhookSchema;
    examples: RawSchemas.ExampleWebhookCallSchema[];
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ExampleWebhookCall[] {
    const typeName =
        typeof webhook.payload === "string"
            ? webhook.payload
            : isReferencedWebhookPayloadSchema(webhook.payload)
              ? webhook.payload.type
              : undefined;
    if (typeName != null) {
        return examples.map((example) => ({
            docs: webhook.docs,
            name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
            payload: convertTypeReferenceExample({
                example: example.payload,
                rawTypeBeingExemplified: typeName,
                fileContainingRawTypeReference: file,
                fileContainingExample: file,
                typeResolver,
                exampleResolver,
                workspace
            })
        }));
    }
    if (!isPlainObject(webhook.payload)) {
        throw new Error(`Example webhook payload is not an object. Got: ${JSON.stringify(webhook.payload)}`);
    }
    // The payload example is a simple object of key, value pairs, so we format the example as
    // a map<string, unknown> for simplicity. If we ever add support for webhooks in the generated
    // SDKs, we'll need to revisit this.
    return examples.map((example) => ({
        docs: webhook.docs,
        name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
        payload: convertTypeReferenceExample({
            example: example.payload,
            rawTypeBeingExemplified: "map<string, unknown>",
            fileContainingRawTypeReference: file,
            fileContainingExample: file,
            typeResolver,
            exampleResolver,
            workspace
        })
    }));
}

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebhookPayloadSchema
): payload is RawSchemas.WebhookReferencedPayloadSchema {
    return (payload as RawSchemas.WebhookReferencedPayloadSchema).type != null;
}
