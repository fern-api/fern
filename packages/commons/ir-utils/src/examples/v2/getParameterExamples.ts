import { HttpEndpoint, IntermediateRepresentation, TypeDeclaration, TypeId, V2ValueExamples } from "@fern-api/ir-sdk";

import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional.js";
import { getFirstExamples } from "./getV2Examples.js";

export function getParameterExamples({
    ir,
    endpoint,
    skipOptionalRequestProperties
}: {
    ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
    endpoint: HttpEndpoint;
    skipOptionalRequestProperties: boolean;
}): {
    pathParameters: V2ValueExamples;
    queryParameters: V2ValueExamples;
    headers: V2ValueExamples;
} {
    const typeDeclarations: Record<TypeId, TypeDeclaration> = ir.types;
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
        const paramName = typeof parameter.name === "string" ? parameter.name : parameter.name.originalName;

        if (userExample !== undefined) {
            result.pathParameters[paramName] = userExample;
        } else if (autoExample !== undefined) {
            result.pathParameters[paramName] = autoExample;
        }
    }

    for (const parameter of endpoint.queryParameters) {
        const { userExample, autoExample } = getFirstExamples(parameter.v2Examples);

        const queryName =
            typeof parameter.name.name === "string" ? parameter.name.name : parameter.name.name.originalName;

        if (userExample !== undefined) {
            result.queryParameters[queryName] = userExample;
        } else if (autoExample !== undefined) {
            if (
                skipOptionalRequestProperties &&
                isTypeReferenceOptional({ typeReference: parameter.valueType, typeDeclarations })
            ) {
                continue;
            }

            result.queryParameters[queryName] = autoExample;
        }
    }

    const combinedHeaders = [...endpoint.headers, ...ir.headers, ...ir.idempotencyHeaders];
    for (const parameter of combinedHeaders) {
        const { userExample, autoExample } = getFirstExamples(parameter.v2Examples);

        if (userExample !== undefined) {
            result.headers[parameter.name.wireValue] = userExample;
        } else if (autoExample !== undefined) {
            if (
                skipOptionalRequestProperties &&
                isTypeReferenceOptional({ typeReference: parameter.valueType, typeDeclarations })
            ) {
                continue;
            }

            result.headers[parameter.name.wireValue] = autoExample;
        }
    }

    return result;
}
