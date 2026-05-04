import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { getParameterNameForPositionalPathParameter } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { getClientDefaultValue } from "./isLiteralHeader.js";

export type GetReferenceToPathParameterVariableFromRequest = (pathParameter: FernIr.PathParameter) => ts.Expression;

export function buildUrl({
    endpoint,
    generatedClientClass,
    context,
    includeSerdeLayer,
    retainOriginalCasing,
    omitUndefined,
    parameterNaming,
    getReferenceToPathParameterVariableFromRequest,
    forceInlinePathParameters = false
}: {
    endpoint: {
        sdkRequest: FernIr.SdkRequest | undefined;
        fullPath: FernIr.HttpPath;
        allPathParameters: FernIr.PathParameter[];
        path: FernIr.HttpPath;
    };
    generatedClientClass: GeneratedSdkClientClassImpl;
    context: FileContext;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    omitUndefined: boolean;
    getReferenceToPathParameterVariableFromRequest: GetReferenceToPathParameterVariableFromRequest;
    forceInlinePathParameters?: boolean;
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
                (param) => getOriginalName(param.name) === part.pathParameter
            );
            if (pathParameter == null) {
                throw new Error("Could not locate path parameter: " + part.pathParameter);
            }

            let referenceToPathParameterValue = getReferenceToPathParameter({
                pathParameter,
                generatedClientClass,
                retainOriginalCasing,
                parameterNaming,
                caseConverter: context.case,
                shouldInlinePathParameters:
                    forceInlinePathParameters || context.requestWrapper.shouldInlinePathParameters(endpoint.sdkRequest),
                getReferenceToPathParameterVariableFromRequest
            });

            const clientDefaultVal = getClientDefaultValue(pathParameter.clientDefault);

            if (includeSerdeLayer && pathParameter.valueType.type === "named") {
                const serializerCall = context.typeSchema
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
                if (clientDefaultVal != null) {
                    // When clientDefault is set the param is optional, so guard
                    // the serializer with a null check to avoid passing undefined.
                    referenceToPathParameterValue = ts.factory.createConditionalExpression(
                        ts.factory.createBinaryExpression(
                            referenceToPathParameterValue,
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        serializerCall,
                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                        ts.factory.createStringLiteral(clientDefaultVal.toString())
                    );
                } else {
                    referenceToPathParameterValue = serializerCall;
                }
            } else if (clientDefaultVal != null) {
                // No serde layer or not a named type — simple ?? fallback.
                referenceToPathParameterValue = ts.factory.createBinaryExpression(
                    referenceToPathParameterValue,
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral(clientDefaultVal.toString())
                );
            }

            return ts.factory.createTemplateSpan(
                context.coreUtilities.urlUtils.encodePathParam._invoke(referenceToPathParameterValue),
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
    retainOriginalCasing,
    shouldInlinePathParameters,
    parameterNaming,
    caseConverter,
    getReferenceToPathParameterVariableFromRequest
}: {
    pathParameter: FernIr.PathParameter;
    generatedClientClass: GeneratedSdkClientClassImpl;
    retainOriginalCasing: boolean;
    shouldInlinePathParameters: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
    getReferenceToPathParameterVariableFromRequest: GetReferenceToPathParameterVariableFromRequest;
}): ts.Expression {
    if (pathParameter.variable != null) {
        return generatedClientClass.getReferenceToVariable(pathParameter.variable);
    }
    switch (pathParameter.location) {
        case FernIr.PathParameterLocation.Service:
        case FernIr.PathParameterLocation.Endpoint: {
            if (shouldInlinePathParameters) {
                return getReferenceToPathParameterVariableFromRequest(pathParameter);
            } else {
                const pathParamName = getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing,
                    parameterNaming,
                    caseConverter
                });
                return ts.factory.createIdentifier(pathParamName);
            }
        }
        case FernIr.PathParameterLocation.Root:
            return generatedClientClass.getReferenceToRootPathParameter(pathParameter);
        default:
            assertNever(pathParameter.location);
    }
}
