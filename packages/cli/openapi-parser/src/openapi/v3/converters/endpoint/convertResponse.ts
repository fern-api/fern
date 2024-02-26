import { assertNever } from "@fern-api/core-utils";
import { ResponseWithExample, StatusCode } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { convertSchema } from "../../../../schema/convertSchemas";
import { convertSchemaWithExampleToSchema } from "../../../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { OperationContext } from "../contexts";
import { getApplicationJsonSchemaMediaObject } from "./getApplicationJsonSchema";

const APPLICATION_OCTET_STREAM_CONTENT = "application/octet-stream";
const APPLICATION_PDF = "application/pdf";
const AUDIO_MPEG = "audio/mpeg";
const TEXT_PLAIN_CONTENT = "text/plain";

// The converter will attempt to get response in priority order
// (i.e. try for 200, then 201, then 204)
const SUCCESSFUL_STATUS_CODES = ["200", "201", "204"];

export interface ConvertedResponse {
    value: ResponseWithExample | undefined;
    errorStatusCodes: StatusCode[];
}

export function convertResponse({
    operationContext,
    responses,
    context,
    responseBreadcrumbs,
    responseStatusCode,
    isStreaming
}: {
    operationContext: OperationContext;
    isStreaming: boolean;
    responses: OpenAPIV3.ResponsesObject;
    context: AbstractOpenAPIV3ParserContext;
    responseBreadcrumbs: string[];
    responseStatusCode?: number;
}): ConvertedResponse {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (responses == null) {
        return { value: undefined, errorStatusCodes: [] };
    }
    const errorStatusCodes = markErrorSchemas({ responses, context });
    for (const statusCode of responseStatusCode != null ? [responseStatusCode] : SUCCESSFUL_STATUS_CODES) {
        const response = responses[statusCode];
        if (response == null) {
            continue;
        }

        const convertedResponse = convertResolvedResponse({
            operationContext,
            response,
            context,
            responseBreadcrumbs,
            isStreaming
        });
        if (convertedResponse != null) {
            switch (convertedResponse.type) {
                case "json":
                    return {
                        value: convertedResponse,
                        errorStatusCodes
                    };
                case "streamingJson":
                    return {
                        value: convertedResponse,
                        errorStatusCodes
                    };
                case "file":
                case "text":
                case "streamingText":
                    return {
                        value: convertedResponse,
                        errorStatusCodes: []
                    };
                default:
                    assertNever(convertedResponse);
            }
        }
    }

    return {
        value: undefined,
        errorStatusCodes
    };
}

function convertResolvedResponse({
    operationContext,
    isStreaming,
    response,
    context,
    responseBreadcrumbs
}: {
    operationContext: OperationContext;
    isStreaming: boolean;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject;
    context: AbstractOpenAPIV3ParserContext;
    responseBreadcrumbs: string[];
}): ResponseWithExample | undefined {
    const resolvedResponse = isReferenceObject(response) ? context.resolveResponseReference(response) : response;
    const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedResponse.content ?? {});
    if (jsonMediaObject != null) {
        if (isStreaming) {
            return ResponseWithExample.streamingJson({
                description: resolvedResponse.description,
                responseProperty: undefined,
                schema: convertSchemaWithExampleToSchema(
                    convertSchema(jsonMediaObject.schema, false, context, responseBreadcrumbs)
                )
            });
        }
        return ResponseWithExample.json({
            description: resolvedResponse.description,
            schema: convertSchema(jsonMediaObject.schema, false, context, responseBreadcrumbs),
            responseProperty: getExtension<string>(operationContext.operation, FernOpenAPIExtension.RESPONSE_PROPERTY),
            fullExamples: jsonMediaObject.examples
        });
    }

    if (resolvedResponse.content?.[APPLICATION_OCTET_STREAM_CONTENT]?.schema != null) {
        return ResponseWithExample.file({ description: resolvedResponse.description });
    }

    if (resolvedResponse.content?.[APPLICATION_PDF]?.schema != null) {
        return ResponseWithExample.file({ description: resolvedResponse.description });
    }

    if (resolvedResponse.content?.[TEXT_PLAIN_CONTENT]?.schema != null) {
        const textPlainSchema = resolvedResponse.content[TEXT_PLAIN_CONTENT]?.schema;
        if (textPlainSchema == null) {
            return ResponseWithExample.text({ description: resolvedResponse.description });
        }
        const resolvedTextPlainSchema = isReferenceObject(textPlainSchema)
            ? context.resolveSchemaReference(textPlainSchema)
            : textPlainSchema;
        if (resolvedTextPlainSchema.type === "string" && resolvedTextPlainSchema.format === "byte") {
            return;
        }
        return ResponseWithExample.text({ description: resolvedResponse.description });
    }

    if (resolvedResponse.content?.[AUDIO_MPEG] != null) {
        return ResponseWithExample.file({ description: resolvedResponse.description });
    }

    return undefined;
}

function markErrorSchemas({
    responses,
    context
}: {
    responses: OpenAPIV3.ResponsesObject;
    context: AbstractOpenAPIV3ParserContext;
}): StatusCode[] {
    const errorStatusCodes: StatusCode[] = [];
    for (const [statusCode, response] of Object.entries(responses)) {
        if (statusCode === "default") {
            continue;
        }
        const parsedStatusCode = parseInt(statusCode);
        if (parsedStatusCode < 400 || parsedStatusCode > 600) {
            // if status code is not between [400, 600], then it won't count as an error
            continue;
        }
        errorStatusCodes.push(parsedStatusCode);
        const resolvedResponse = isReferenceObject(response) ? context.resolveResponseReference(response) : response;
        const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedResponse.content ?? {});
        context.markSchemaForStatusCode(parsedStatusCode, jsonMediaObject?.schema ?? {}); // defaults to unknown schema
    }
    return errorStatusCodes;
}
