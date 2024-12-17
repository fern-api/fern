import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, PathParameter, PathParameterLocation } from "@fern-fern/ir-sdk/api";
import {
    getParameterNameForPositionalPathParameter,
    getParameterNameForPropertyPathParameter
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";

export function buildUrl({
    endpoint,
    generatedClientClass,
    context,
    includeSerdeLayer,
    retainOriginalCasing,
    omitUndefined
}: {
    endpoint: HttpEndpoint;
    generatedClientClass: GeneratedSdkClientClassImpl;
    context: SdkContext;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    omitUndefined: boolean;
}): ts.Expression | undefined {
    if (endpoint.allPathParameters.length === 0) {
        if (endpoint.fullPath.head.length === 0) {
            return undefined;
        }
        return ts.factory.createStringLiteral(endpoint.fullPath.head);
    }

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(endpoint.fullPath.head),
        endpoint.fullPath.parts.map((part, index) => {
            const pathParameter = endpoint.allPathParameters.find(
                (param) => param.name.originalName === part.pathParameter
            );
            if (pathParameter == null) {
                throw new Error("Could not locate path parameter: " + part.pathParameter);
            }

            let referenceToPathParameterValue = getReferenceToPathParameter({
                pathParameter,
                generatedClientClass,
                retainOriginalCasing,
                includeSerdeLayer,
                requestVariableName: endpoint.sdkRequest?.requestParameterName.camelCase.safeName ?? "request",
                shouldInlinePathParameters: context.requestWrapper.shouldInlinePathParameters(endpoint.sdkRequest)
            });

            if (includeSerdeLayer && pathParameter.valueType.type === "named") {
                referenceToPathParameterValue = context.typeSchema
                    .getSchemaOfNamedType(pathParameter.valueType, {
                        isGeneratingSchema: false
                    })
                    .jsonOrThrow(referenceToPathParameterValue, {
                        unrecognizedObjectKeys: "fail",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                        omitUndefined
                    });
            }

            return ts.factory.createTemplateSpan(
                ts.factory.createCallExpression(ts.factory.createIdentifier("encodeURIComponent"), undefined, [
                    referenceToPathParameterValue
                ]),
                index === endpoint.fullPath.parts.length - 1
                    ? ts.factory.createTemplateTail(part.tail)
                    : ts.factory.createTemplateMiddle(part.tail)
            );
        })
    );
}

function getReferenceToPathParameter({
    pathParameter,
    generatedClientClass,
    includeSerdeLayer,
    retainOriginalCasing,
    requestVariableName,
    shouldInlinePathParameters
}: {
    pathParameter: PathParameter;
    generatedClientClass: GeneratedSdkClientClassImpl;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    requestVariableName: string;
    shouldInlinePathParameters: boolean;
}): ts.Expression {
    if (pathParameter.variable != null) {
        return generatedClientClass.getReferenceToVariable(pathParameter.variable);
    }
    switch (pathParameter.location) {
        case PathParameterLocation.Service:
        case PathParameterLocation.Endpoint: {
            if (shouldInlinePathParameters) {
                const pathParamName = getParameterNameForPropertyPathParameter({
                    pathParameter,
                    retainOriginalCasing,
                    includeSerdeLayer
                });
                return ts.factory.createIdentifier(`${requestVariableName}.${pathParamName}`);
            } else {
                const pathParamName = getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing
                });
                return ts.factory.createIdentifier(pathParamName);
            }
        }
        case PathParameterLocation.Root:
            return generatedClientClass.getReferenceToRootPathParameter(pathParameter);
        default:
            assertNever(pathParameter.location);
    }
}
