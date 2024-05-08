import { MediaType } from "@fern-api/core-utils";
import { HttpRequestSchema, ObjectPropertySchema } from "../schemas";
import { isInlineRequestBody } from "./isInlineRequestBody";
import { parseRawFileType } from "./parseRawFileType";

export interface RawFileUploadRequest {
    name: string;
    extends: string | string[] | undefined;
    properties: RawFileUploadRequest.Property[];
}

export declare namespace RawFileUploadRequest {
    export type Property = FileProperty | InlinedRequestBodyProperty;

    export interface FileProperty extends BaseProperty {
        isFile: true;
        isOptional: boolean;
        isArray: boolean;
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
    if (typeof request === "string" || !MediaType.parse(request["content-type"])?.isMultiPartFormData()) {
        return undefined;
    }

    // We expect request.body to be an inline request body
    if (request.body == null || typeof request.body === "string" || !isInlineRequestBody(request.body)) {
        return undefined;
    }

    const properties = Object.entries(request.body.properties ?? []).reduce<RawFileUploadRequest.Property[]>(
        (acc, [key, propertyType]) => {
            const docs = typeof propertyType !== "string" ? propertyType.docs : undefined;
            const maybeParsedFileType = parseRawFileType(
                typeof propertyType === "string" ? propertyType : propertyType.type
            );
            if (maybeParsedFileType != null) {
                acc.push({
                    isFile: true,
                    key,
                    docs,
                    isOptional: maybeParsedFileType.isOptional,
                    isArray: maybeParsedFileType.isArray
                });
            } else {
                acc.push({ isFile: false, key, propertyType, docs });
            }
            return acc;
        },
        []
    );

    if (request.body["extra-properties"]) {
        // TODO: handle extra properties
    }

    // TODO: handle case where request.name is undefined
    if (request.name == null) {
        return undefined;
    }

    return {
        name: request.name,
        extends: request.body.extends,
        properties
    };
}
