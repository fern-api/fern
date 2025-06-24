import { HttpEndpoint, IntermediateRepresentation, TypeDeclaration, TypeId, V2ValueExamples } from "@fern-api/ir-sdk";

import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional";
import { getFirstExamples } from "./getV2Examples";

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
