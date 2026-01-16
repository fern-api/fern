import {
    AvailabilityUnionSchema,
    ObjectPropertySchema,
    WebhookInlinedPayloadSchema,
    WebhookReferencedPayloadSchema,
    WebhookSchema
} from "../schemas";
import { isFileInGeneric } from "./generics/isFileInGeneric";
import { parseGenericNested } from "./generics/parseGenericNested";
import { parseRawFileType } from "./parseRawFileType";

export interface RawFileUploadWebhookPayload {
    name: string;
    extends: string | string[] | undefined;
    properties: RawFileUploadWebhookPayload.Property[];
}

export declare namespace RawFileUploadWebhookPayload {
    export type Property = FileProperty | InlinedPayloadProperty;

    export interface FileProperty extends BaseProperty {
        isFile: true;
        isOptional: boolean;
        isArray: boolean;
    }

    export interface InlinedPayloadProperty extends BaseProperty {
        isFile: false;
        propertyType: ObjectPropertySchema;
    }

    export interface BaseProperty {
        docs: string | undefined;
        availability?: AvailabilityUnionSchema | undefined;
        key: string;
    }
}

function isReferencedWebhookPayloadSchema(
    payload: WebhookSchema["payload"]
): payload is WebhookReferencedPayloadSchema {
    return typeof payload !== "string" && "type" in payload && typeof payload.type === "string" && !("name" in payload);
}

function isFileUploadWebhookPayload(webhook: WebhookSchema): boolean {
    const payload = webhook.payload;
    if (typeof payload === "string" || isReferencedWebhookPayloadSchema(payload)) {
        return false;
    }

    // Check if any property has a file type
    if (Object.values(payload.properties ?? {}).some(doesPropertyHaveFile)) {
        return true;
    }

    return false;
}

export function parseFileUploadWebhookPayload(webhook: WebhookSchema): RawFileUploadWebhookPayload | undefined {
    if (!isFileUploadWebhookPayload(webhook)) {
        return undefined;
    }

    const payload = webhook.payload;
    if (typeof payload === "string" || isReferencedWebhookPayloadSchema(payload)) {
        return undefined;
    }

    return createRawFileUploadWebhookPayload(payload);
}

function createRawFileUploadWebhookPayload(
    payload: WebhookInlinedPayloadSchema
): RawFileUploadWebhookPayload | undefined {
    const properties = Object.entries(payload.properties ?? {}).reduce<RawFileUploadWebhookPayload.Property[]>(
        (acc, [key, propertyType]) => {
            const docs = typeof propertyType !== "string" ? propertyType.docs : undefined;
            const availability = typeof propertyType !== "string" ? propertyType.availability : undefined;
            const maybeParsedFileType = parseRawFileType(
                typeof propertyType === "string" ? propertyType : propertyType.type
            );
            if (maybeParsedFileType != null) {
                acc.push({
                    isFile: true,
                    key,
                    docs,
                    availability,
                    isOptional: maybeParsedFileType.isOptional,
                    isArray: maybeParsedFileType.isArray
                });
            } else {
                acc.push({ isFile: false, key, propertyType, docs, availability });
            }
            return acc;
        },
        []
    );

    return {
        name: payload.name,
        extends: payload.extends,
        properties
    };
}

function doesPropertyHaveFile(property: ObjectPropertySchema): boolean {
    const propertyType = typeof property === "string" ? property : property.type;
    if (propertyType === "file") {
        return true;
    }
    if (!propertyType.includes("file")) {
        // fast check to avoid unnecessary parsing
        return false;
    }
    const generic = parseGenericNested(propertyType);
    if (generic == null) {
        return false;
    }

    return isFileInGeneric(generic);
}
