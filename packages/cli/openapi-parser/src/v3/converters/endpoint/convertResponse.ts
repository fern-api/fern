import { assertNever } from "@fern-api/core-utils";
import { StatusCode } from "@fern-fern/openapi-ir-model/commons";
import { ResponseWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getExtension } from "../../extensions/getExtension";
import { convertSchemaWithExampleToSchema } from "../../utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { OperationContext } from "../contexts";
import { convertSchema } from "../convertSchemas";
import { getApplicationJsonSchemaFromMedia } from "./getApplicationJsonSchema";

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
    const jsonResponseSchema = getApplicationJsonResponse(resolvedResponse);
    if (jsonResponseSchema != null) {
        if (isStreaming) {
            return {
                type: "streamingJson",
                description: resolvedResponse.description,
                responseProperty: undefined,
                schema: convertSchemaWithExampleToSchema(
                    convertSchema(jsonResponseSchema, false, context, responseBreadcrumbs)
                )
            };
        }
        return {
            type: "json",
            description: resolvedResponse.description,
            schema: convertSchema(jsonResponseSchema, false, context, responseBreadcrumbs),
            responseProperty: getExtension<string>(operationContext.operation, FernOpenAPIExtension.RESPONSE_PROPERTY)
        };
    }

    if (resolvedResponse.content?.[APPLICATION_OCTET_STREAM_CONTENT]?.schema != null) {
        return {
            type: "file",
            description: resolvedResponse.description
        };
    }

    if (resolvedResponse.content?.[APPLICATION_PDF]?.schema != null) {
        return {
            type: "file",
            description: resolvedResponse.description
        };
    }

    if (resolvedResponse.content?.[TEXT_PLAIN_CONTENT]?.schema != null) {
        const textPlainSchema = resolvedResponse.content[TEXT_PLAIN_CONTENT]?.schema;
        if (textPlainSchema == null) {
            return {
                type: "text",
                description: resolvedResponse.description
            };
        }
        const resolvedTextPlainSchema = isReferenceObject(textPlainSchema)
            ? context.resolveSchemaReference(textPlainSchema)
            : textPlainSchema;
        if (resolvedTextPlainSchema.type === "string" && resolvedTextPlainSchema.format === "byte") {
            return {
                type: "streamingText",
                description: resolvedResponse.description
            };
        }
        return {
            type: "text",
            description: resolvedResponse.description
        };
    }

    if (resolvedResponse.content?.[AUDIO_MPEG] != null) {
        return {
            type: "file",
            description: resolvedResponse.description
        };
    }

    return undefined;
}

function getApplicationJsonResponse(
    response: OpenAPIV3.ResponseObject
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return getApplicationJsonSchemaFromMedia(response.content ?? {});
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
        const errorSchema = getApplicationJsonResponse(resolvedResponse) ?? {}; // unknown response
        context.markSchemaForStatusCode(parsedStatusCode, errorSchema);
    }
    return errorStatusCodes;
}
