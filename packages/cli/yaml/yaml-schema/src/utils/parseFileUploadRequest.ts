import { HttpRequestSchema, ObjectPropertySchema } from "../schemas";
import { isInlineRequestBody } from "./isInlineRequestBody";

export const FILE_TYPE = "file";

export interface RawFileUploadRequest {
    name: string;
    extends: string | string[] | undefined;
    properties: RawFileUploadRequest.Property[];
}

export declare namespace RawFileUploadRequest {
    export type Property = FileProperty | InlinedRequestBodyProperty;

    export interface FileProperty extends BaseProperty {
        isFile: true;
    }

    export interface InlinedRequestBodyProperty extends BaseProperty {
        isFile: false;
        propertyType: ObjectPropertySchema;
    }

    export interface BaseProperty {
        docs: string | undefined;
        key: string;
    }
}

export function parseFileUploadRequest(request: HttpRequestSchema | string): RawFileUploadRequest | undefined {
    if (
        typeof request === "string" ||
        request.name == null ||
        request.body == null ||
        typeof request.body === "string" ||
        !isInlineRequestBody(request.body) ||
        request.body.properties == null
    ) {
        return undefined;
    }

    const properties = Object.entries(request.body.properties).reduce<RawFileUploadRequest.Property[]>(
        (acc, [key, propertyType]) => {
            const docs = typeof propertyType === "string" ? propertyType : propertyType.docs;
            if (propertyType === FILE_TYPE) {
                acc.push({ isFile: true, key, docs });
            } else {
                acc.push({ isFile: false, key, propertyType, docs });
            }
            return acc;
        },
        []
    );

    if (properties.some((property) => property.isFile)) {
        return {
            name: request.name,
            extends: request.body.extends,
            properties,
        };
    } else {
        return undefined;
    }
}
