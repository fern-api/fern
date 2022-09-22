import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/ParsedClientEndpoint";

export function convertPathToTemplateString(endpoint: ParsedClientEndpoint): ts.Expression {
    if (endpoint.path.parts.length === 0) {
        return ts.factory.createStringLiteral(endpoint.path.head);
    }

    if (endpoint.request == null || !endpoint.request.isWrapped) {
        throw new Error("Request with path parameters is not wrapped.");
    }

    const { pathParameters: pathParametersInWrapper } = endpoint.request;

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(endpoint.path.head),
        endpoint.path.parts.map((part, index) => {
            const pathParameterInWrapper = pathParametersInWrapper.find(
                (parameter) => parameter.originalData.name.originalValue === part.pathParameter
            );
            if (pathParameterInWrapper == null) {
                throw new Error("Path parameter does not exist: " + part.pathParameter);
            }
            return ts.factory.createTemplateSpan(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                    ts.factory.createIdentifier(pathParameterInWrapper.key)
                ),
                index === endpoint.path.parts.length - 1
                    ? ts.factory.createTemplateTail(part.tail)
                    : ts.factory.createTemplateMiddle(part.tail)
            );
        })
    );
}
