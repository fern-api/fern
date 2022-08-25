import { getTextOfTsNode } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure } from "ts-morph";
import { ClientConstants } from "../../constants";
import { ParsedClientEndpoint } from "./parse-endpoint/ParsedClientEndpoint";

export function getHttpRequestParameters(
    endpoint: ParsedClientEndpoint
): OptionalKind<ParameterDeclarationStructure>[] {
    if (endpoint.request == null) {
        return [];
    }

    if (endpoint.request.isWrapped) {
        return [
            {
                name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                type: getTextOfTsNode(endpoint.request.referenceToWrapper),
            },
        ];
    }

    return [
        {
            name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
            type: getTextOfTsNode(
                endpoint.request.referenceToBody.isOptional
                    ? endpoint.request.referenceToBody.typeNodeWithoutUndefined
                    : endpoint.request.referenceToBody.typeNode
            ),
            hasQuestionToken: endpoint.request.referenceToBody.isOptional,
        },
    ];
}
