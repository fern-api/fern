import { Response, StatusCode } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema } from "../convertSchemas";

const APPLICATION_JSON_CONTENT = "application/json";
const APPLICATION_JSON_UTF_8_CONTENT = "application/json; charset=utf-8";
const TEXT_PLAIN_CONTENT = "text/plain";

const APPLICATION_OCTET_STREAM_CONTENT = "application/octet-stream";

// The converter will attempt to get response in priority order
// (i.e. try for 200, then 201, then 204)
const SUCCESSFUL_STATUS_CODES = ["200", "201", "204"];

export interface ConvertedResponse {
    value: Response | undefined;
    errorStatusCodes: StatusCode[];
}

export function convertResponse({
    responses,
    context,
    responseBreadcrumbs,
}: {
    responses: OpenAPIV3.ResponsesObject;
    context: OpenAPIV3ParserContext;
    responseBreadcrumbs: string[];
}): ConvertedResponse {
    const errorStatusCodes = markErrorSchemas({ responses, context });
    for (const statusCode of SUCCESSFUL_STATUS_CODES) {
        const response = responses[statusCode];

        if (response == null) {
            continue;
        }

        const resolvedResponse = isReferenceObject(response) ? context.resolveResponseReference(response) : response;
        const responseSchema =
            resolvedResponse.content?.[APPLICATION_JSON_CONTENT]?.schema ??
            resolvedResponse.content?.[APPLICATION_JSON_UTF_8_CONTENT]?.schema;
        if (responseSchema != null) {
            return {
                value: {
                    type: "json",
                    description: resolvedResponse.description,
                    schema: convertSchema(responseSchema, false, context, responseBreadcrumbs),
                },
                errorStatusCodes,
            };
        }

        const fileResponseSchema =
            resolvedResponse.content?.[APPLICATION_OCTET_STREAM_CONTENT]?.schema ??
            resolvedResponse.content?.[TEXT_PLAIN_CONTENT]?.schema;
        if (fileResponseSchema != null) {
            return {
                value: {
                    type: "file",
                    description: resolvedResponse.description,
                },
                errorStatusCodes: [],
            };
        }
    }
    return {
        value: undefined,
        errorStatusCodes,
    };
}

function markErrorSchemas({
    responses,
    context,
}: {
    responses: OpenAPIV3.ResponsesObject;
    context: OpenAPIV3ParserContext;
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
        const errorSchema =
            resolvedResponse.content?.[APPLICATION_JSON_CONTENT]?.schema ??
            resolvedResponse.content?.[APPLICATION_JSON_UTF_8_CONTENT]?.schema ??
            {}; // unknown response
        context.markSchemaForStatusCode(parsedStatusCode, errorSchema);
    }
    return errorStatusCodes;
}
