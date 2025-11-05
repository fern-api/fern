import { assertNever, MediaType } from "@fern-api/core-utils";
import { FernOpenapiIr, ResponseWithExample, Source } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../../getExtension";
import { convertSchema } from "../../../../schema/convertSchemas";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { OperationContext } from "../contexts";
import { ERROR_NAMES_BY_STATUS_CODE } from "../convertToHttpError";
import {
    getApplicationJsonSchemaMediaObjectFromContent,
    getSchemaMediaObject,
    getTextEventStreamObject
} from "./getApplicationJsonSchema";

// The converter will attempt to get response in priority order
// (i.e. try for 200, then 201, then 202...)
const SUCCESSFUL_STATUS_CODES = ["200", "201", "202", "204"];

export interface ConvertedResponse {
    value: ResponseWithExample | undefined;
    errors: Record<FernOpenapiIr.StatusCode, FernOpenapiIr.HttpErrorWithExample>;
}

export function convertResponse({
    operationContext,
    responses,
    context,
    responseBreadcrumbs,
    responseStatusCode,
    streamFormat,
    source
}: {
    operationContext: OperationContext;
    streamFormat: "sse" | "json" | undefined;
    responses: OpenAPIV3.ResponsesObject;
    context: AbstractOpenAPIV3ParserContext;
    responseBreadcrumbs: string[];
    responseStatusCode?: number;
    source: Source;
}): ConvertedResponse {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (responses == null) {
        return { value: undefined, errors: {} };
    }
    const errors = markErrorSchemas({ responses, context, source, namespace: context.namespace });

    let successStatusCodePresent = false;
    let convertedResponse: FernOpenapiIr.ResponseWithExample | undefined = undefined;
    for (const statusCode of responseStatusCode != null ? [responseStatusCode] : SUCCESSFUL_STATUS_CODES) {
        const response = responses[statusCode];
        if (response == null) {
            continue;
        }
        successStatusCodePresent = true;
        if (convertedResponse == null) {
            convertedResponse = convertResolvedResponse({
                operationContext,
                response,
                context,
                responseBreadcrumbs,
                streamFormat,
                source,
                namespace: context.namespace,
                statusCode: typeof statusCode === "string" ? parseInt(statusCode) : statusCode
            });
        }
    }

    // If no success status codes have been visited, then try to fallback to the `default` status code
    if (convertedResponse == null && !successStatusCodePresent && responses.default != null) {
        convertedResponse = convertResolvedResponse({
            operationContext,
            response: responses.default,
            context,
            responseBreadcrumbs,
            streamFormat,
            source,
            namespace: context.namespace
        });
    }

    if (convertedResponse != null) {
        switch (convertedResponse.type) {
            case "json":
                return {
                    value: convertedResponse,
                    errors
                };
            case "streamingJson":
            case "streamingSse":
                return {
                    value: convertedResponse,
                    errors
                };
            case "bytes":
            case "file":
            case "text":
            case "streamingText":
                return {
                    value: convertedResponse,
                    errors
                };
            default:
                assertNever(convertedResponse);
        }
    }

    return {
        value: undefined,
        errors
    };
}

function convertResolvedResponse({
    operationContext,
    streamFormat,
    response,
    context,
    responseBreadcrumbs,
    source,
    namespace,
    statusCode
}: {
    operationContext: OperationContext;
    streamFormat: "sse" | "json" | undefined;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject;
    context: AbstractOpenAPIV3ParserContext;
    responseBreadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
    statusCode?: number;
}): ResponseWithExample | undefined {
    const resolvedResponse = isReferenceObject(response) ? context.resolveResponseReference(response) : response;

    if (resolvedResponse.content != null) {
        const binaryContent = Object.entries(resolvedResponse.content).find(([_, mediaObject]) => {
            if (mediaObject.schema == null) {
                return false;
            }
            const resolvedSchema = isReferenceObject(mediaObject.schema)
                ? context.resolveSchemaReference(mediaObject.schema)
                : mediaObject.schema;
            return resolvedSchema.type === "string" && resolvedSchema.format === "binary";
        });
        if (binaryContent) {
            if (context.options.useBytesForBinaryResponse && streamFormat == null) {
                return ResponseWithExample.bytes({ description: resolvedResponse.description, source, statusCode });
            } else {
                return ResponseWithExample.file({ description: resolvedResponse.description, source, statusCode });
            }
        }
    }

    const textEventStreamObject = getTextEventStreamObject(resolvedResponse.content ?? {}, context);
    if (textEventStreamObject != null && streamFormat != null) {
        switch (streamFormat) {
            case "json":
                return ResponseWithExample.streamingJson({
                    statusCode,
                    description: resolvedResponse.description,
                    responseProperty: getExtension<string>(
                        operationContext.operation,
                        FernOpenAPIExtension.RESPONSE_PROPERTY
                    ),
                    fullExamples: textEventStreamObject.examples,
                    schema: convertSchema(
                        textEventStreamObject.schema,
                        false,
                        false,
                        context,
                        responseBreadcrumbs,
                        source,
                        namespace
                    ),
                    source
                });
            case "sse":
                return ResponseWithExample.streamingSse({
                    description: resolvedResponse.description,
                    responseProperty: undefined,
                    fullExamples: textEventStreamObject.examples,
                    schema: convertSchema(
                        textEventStreamObject.schema,
                        false,
                        false,
                        context,
                        responseBreadcrumbs,
                        source,
                        namespace
                    ),
                    source,
                    statusCode
                });
        }
    }

    const jsonMediaObject = getApplicationJsonSchemaMediaObjectFromContent({
        context,
        content: resolvedResponse.content ?? {}
    });
    if (jsonMediaObject) {
        if (streamFormat != null) {
            switch (streamFormat) {
                case "json":
                    return ResponseWithExample.streamingJson({
                        description: resolvedResponse.description,
                        responseProperty: undefined,
                        fullExamples: jsonMediaObject.examples,
                        schema: convertSchema(
                            jsonMediaObject.schema,
                            false,
                            false,
                            context,
                            responseBreadcrumbs,
                            source,
                            namespace
                        ),
                        source,
                        statusCode
                    });
                case "sse":
                    return ResponseWithExample.streamingSse({
                        description: resolvedResponse.description,
                        responseProperty: undefined,
                        fullExamples: jsonMediaObject.examples,
                        schema: convertSchema(
                            jsonMediaObject.schema,
                            false,
                            false,
                            context,
                            responseBreadcrumbs,
                            source,
                            namespace
                        ),
                        source,
                        statusCode
                    });
            }
        }
        return ResponseWithExample.json({
            description: resolvedResponse.description,
            schema: convertSchema(
                jsonMediaObject.schema,
                false,
                false,
                context,
                responseBreadcrumbs,
                source,
                namespace
            ),
            responseProperty: getExtension<string>(operationContext.operation, FernOpenAPIExtension.RESPONSE_PROPERTY),
            fullExamples: jsonMediaObject.examples,
            source,
            statusCode
        });
    }

    for (const [mediaType, mediaObject] of Object.entries(resolvedResponse.content ?? {})) {
        const mimeType = MediaType.parse(mediaType);
        if (mimeType == null) {
            continue;
        }

        if (
            mimeType.isOctetStream() ||
            mimeType.isPDF() ||
            mimeType.isAudio() ||
            mimeType.isImage() ||
            mimeType.isVideo() ||
            mimeType.isMultiPartMixed()
        ) {
            return ResponseWithExample.file({ description: resolvedResponse.description, source, statusCode });
        }

        if (mimeType.isPlainText()) {
            const textPlainSchema = mediaObject.schema;
            if (textPlainSchema == null) {
                return ResponseWithExample.text({ description: resolvedResponse.description, source, statusCode });
            }
            const resolvedTextPlainSchema = isReferenceObject(textPlainSchema)
                ? context.resolveSchemaReference(textPlainSchema)
                : textPlainSchema;
            if (resolvedTextPlainSchema.type === "string" && resolvedTextPlainSchema.format === "byte") {
                return ResponseWithExample.file({ description: resolvedResponse.description, source, statusCode });
            }
            return ResponseWithExample.text({ description: resolvedResponse.description, source, statusCode });
        }
    }

    return undefined;
}

function markErrorSchemas({
    responses,
    context,
    source,
    namespace
}: {
    responses: OpenAPIV3.ResponsesObject;
    context: AbstractOpenAPIV3ParserContext;
    source: Source;
    namespace: string | undefined;
}): Record<FernOpenapiIr.StatusCode, FernOpenapiIr.HttpErrorWithExample> {
    const errors: Record<FernOpenapiIr.StatusCode, FernOpenapiIr.HttpErrorWithExample> = {};
    for (const [statusCode, response] of Object.entries(responses)) {
        if (statusCode === "default") {
            continue;
        }
        const parsedStatusCode = parseInt(statusCode);
        if (parsedStatusCode < 400 || parsedStatusCode > 600) {
            // if status code is not between [400, 600], then it won't count as an error
            continue;
        }
        const resolvedResponse = isReferenceObject(response) ? context.resolveResponseReference(response) : response;
        const mediaObject = getSchemaMediaObject(resolvedResponse.content ?? {}, context);
        const errorName = ERROR_NAMES_BY_STATUS_CODE[parsedStatusCode];
        if (errorName == null) {
            context.logger.warn(`No error name found for status code ${statusCode}`);
            continue;
        }
        errors[parsedStatusCode] = {
            statusCode: parsedStatusCode,
            nameOverride: undefined,
            generatedName: errorName,
            description: resolvedResponse.description,
            schema: convertSchema(
                mediaObject?.schema ?? {},
                false,
                false,
                context,
                [errorName, "Body"],
                source,
                namespace
            ),
            fullExamples: mediaObject?.examples,
            source
        };
    }
    return errors;
}
