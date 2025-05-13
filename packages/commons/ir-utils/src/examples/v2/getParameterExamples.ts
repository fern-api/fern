import { HttpEndpoint, HttpService, TypeDeclaration, TypeId, V2ValueExamples } from "@fern-api/ir-sdk";

import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional";
import { getFirstExamples } from "./getFirstExamples";

export function getParameterExamples({
    service,
    endpoint,
    typeDeclarations,
    skipOptionalRequestProperties
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
}): {
    pathParameters: V2ValueExamples;
    queryParameters: V2ValueExamples;
    headers: V2ValueExamples;
} {
    const result: {
        pathParameters: V2ValueExamples;
        queryParameters: V2ValueExamples;
        headers: V2ValueExamples;
    } = {
        pathParameters: {},
        queryParameters: {},
        headers: {}
    };

    for (const parameter of endpoint.pathParameters) {
        const { userExample, autoExample } = getFirstExamples(parameter.v2Examples);

        if (userExample !== undefined) {
            result.pathParameters[parameter.name.originalName] = userExample;
        } else if (autoExample !== undefined) {
            result.pathParameters[parameter.name.originalName] = autoExample;
        }
    }

    for (const parameter of endpoint.queryParameters) {
        const { userExample, autoExample } = getFirstExamples(parameter.v2Examples);

        if (userExample !== undefined) {
            result.queryParameters[parameter.name.name.originalName] = userExample;
        } else if (autoExample !== undefined) {
            if (
                skipOptionalRequestProperties &&
                isTypeReferenceOptional({ typeReference: parameter.valueType, typeDeclarations })
            ) {
                continue;
            }

            result.queryParameters[parameter.name.name.originalName] = autoExample;
        }
    }

    for (const parameter of endpoint.headers) {
        const { userExample, autoExample } = getFirstExamples(parameter.v2Examples);

        if (userExample !== undefined) {
            result.headers[parameter.name.name.originalName] = userExample;
        } else if (autoExample !== undefined) {
            if (
                skipOptionalRequestProperties &&
                isTypeReferenceOptional({ typeReference: parameter.valueType, typeDeclarations })
            ) {
                continue;
            }

            result.headers[parameter.name.name.originalName] = autoExample;
        }
    }

    return result;
}
