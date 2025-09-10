import { TypeReference } from "@fern-api/ir-sdk";
import { AbstractConverterContext, DisplayNameOverrideSource } from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { AsyncAPIV2 } from "./2.x";
import { AsyncAPIV3 } from "./3.0";

/**
 * Context class for converting AsyncAPI specifications
 */
export class AsyncAPIConverterContext extends AbstractConverterContext<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    public isReferenceObject(parameter: unknown): parameter is OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
        return parameter != null && typeof parameter === "object" && "$ref" in parameter;
    }

    public isMessageWithPayload(msg: unknown): msg is AsyncAPIV3.ChannelMessage {
        return msg != null && typeof msg === "object" && "payload" in msg;
    }

    public getTypeIdFromMessageReference(reference: OpenAPIV3_1.ReferenceObject): string | undefined {
        const messageMatch = reference.$ref.match(/\/messages\/(.+)$/);
        if (!messageMatch || !messageMatch[1]) {
            return undefined;
        }
        return messageMatch[1];
    }

    public convertReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: DisplayNameOverrideSource;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        let typeId: string | undefined;

        const schemaMatch = reference.$ref.match(/^.*\/schemas\/(.+)$/);
        const messageMatch = reference.$ref.match(/^.*\/channels\/([^/]+)\/messages\/(.+)$/);
        const simpleMessageMatch = reference.$ref.match(/^.*\/messages\/(.+)$/);

        if (schemaMatch && schemaMatch[1]) {
            typeId = schemaMatch[1];
            return this.convertSchemaReferenceToTypeReference({
                reference,
                breadcrumbs,
                displayNameOverride,
                displayNameOverrideSource,
                typeId
            });
        } else if (messageMatch && messageMatch[2]) {
            const channelPath = messageMatch[1];
            const messageId = messageMatch[2];
            typeId = `${channelPath}_${messageId}`;
            return this.convertV3MessageReferenceToTypeReference({
                reference,
                breadcrumbs,
                displayNameOverride,
                displayNameOverrideSource,
                typeId
            });
        } else if (simpleMessageMatch && simpleMessageMatch[1]) {
            typeId = simpleMessageMatch[1];
            return this.convertV2MessageReferenceToTypeReference({
                reference,
                breadcrumbs,
                displayNameOverride,
                displayNameOverrideSource,
                typeId
            });
        } else {
            return { ok: false };
        }
    }

    public convertSchemaReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource,
        typeId
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: DisplayNameOverrideSource;
        typeId: string;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        const resolvedReference = this.resolveReference<OpenAPIV3_1.SchemaObject>({ reference, breadcrumbs });
        if (!resolvedReference.resolved) {
            return { ok: false };
        }

        let displayName: string | undefined;

        if (displayNameOverrideSource === "reference_identifier") {
            displayName = displayNameOverride ?? resolvedReference.value.title;
        } else if (
            displayNameOverrideSource === "discriminator_key" ||
            displayNameOverrideSource === "schema_identifier"
        ) {
            displayName = resolvedReference.value.title ?? displayNameOverride;
        }

        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: this.createFernFilepath(),
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                displayName,
                default: undefined,
                inline: false
            })
        };
    }

    public convertV3MessageReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource,
        typeId
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: DisplayNameOverrideSource;
        typeId: string;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        const resolvedReference = this.resolveReference<AsyncAPIV3.ChannelMessage>({
            reference,
            breadcrumbs
        });
        if (!resolvedReference.resolved) {
            return { ok: false };
        }

        let displayName: string | undefined;

        if (displayNameOverrideSource === "reference_identifier") {
            displayName = displayNameOverride ?? resolvedReference.value.name;
        } else if (
            displayNameOverrideSource === "discriminator_key" ||
            displayNameOverrideSource === "schema_identifier"
        ) {
            displayName = resolvedReference.value.name ?? displayNameOverride;
        }

        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: this.createFernFilepath(),
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                displayName,
                default: undefined,
                inline: false
            })
        };
    }

    public convertV2MessageReferenceToTypeReference({
        reference,
        breadcrumbs,
        displayNameOverride,
        displayNameOverrideSource,
        typeId
    }: {
        reference: OpenAPIV3_1.ReferenceObject;
        breadcrumbs?: string[];
        displayNameOverride?: string | undefined;
        displayNameOverrideSource?: DisplayNameOverrideSource;
        typeId: string;
    }): { ok: true; reference: TypeReference } | { ok: false } {
        const resolvedReference = this.resolveReference<AsyncAPIV2.MessageV2>({ reference, breadcrumbs });
        if (!resolvedReference.resolved) {
            return { ok: false };
        }

        let displayName: string | undefined;

        if (displayNameOverrideSource === "reference_identifier") {
            displayName = displayNameOverride ?? resolvedReference.value.messageId ?? resolvedReference.value.name;
        } else if (
            displayNameOverrideSource === "discriminator_key" ||
            displayNameOverrideSource === "schema_identifier"
        ) {
            displayName = resolvedReference.value.messageId ?? resolvedReference.value.name ?? displayNameOverride;
        }

        return {
            ok: true,
            reference: TypeReference.named({
                fernFilepath: this.createFernFilepath(),
                name: this.casingsGenerator.generateName(typeId),
                typeId,
                displayName,
                default: undefined,
                inline: false
            })
        };
    }
}
