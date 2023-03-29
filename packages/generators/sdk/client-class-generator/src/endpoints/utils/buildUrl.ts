import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, PathParameter, PathParameterLocation } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { getParameterNameForPathParameter } from "./getParameterNameForPathParameter";

export function buildUrl({
    endpoint,
    generatedClientClass,
    context,
}: {
    endpoint: HttpEndpoint;
    generatedClientClass: GeneratedSdkClientClassImpl;
    context: SdkClientClassContext;
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

            let referenceToPathParameterValue = getReferenceToPathParameter({ pathParameter, generatedClientClass });

            if (pathParameter.valueType._type === "named") {
                referenceToPathParameterValue = context.typeSchema
                    .getSchemaOfNamedType(pathParameter.valueType, {
                        isGeneratingSchema: false,
                    })
                    .jsonOrThrow(referenceToPathParameterValue, {
                        unrecognizedObjectKeys: "fail",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                    });
            }

            return ts.factory.createTemplateSpan(
                referenceToPathParameterValue,
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
}: {
    pathParameter: PathParameter;
    generatedClientClass: GeneratedSdkClientClassImpl;
}): ts.Expression {
    switch (pathParameter.location) {
        case PathParameterLocation.Service:
        case PathParameterLocation.Endpoint:
            return ts.factory.createIdentifier(getParameterNameForPathParameter(pathParameter));
        case PathParameterLocation.Root:
            return generatedClientClass.getReferenceToRootPathParameter(pathParameter);
        default:
            assertNever(pathParameter.location);
    }
}
