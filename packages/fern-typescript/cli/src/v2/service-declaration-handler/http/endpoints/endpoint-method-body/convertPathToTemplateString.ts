import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ParsedClientEndpoint } from "../parse-endpoint/parseEndpointAndGenerateEndpointModule";

export function convertPathToTemplateString(endpoint: ParsedClientEndpoint): ts.Expression {
    if (endpoint.path.parts.length === 0 || endpoint.request == null) {
        return ts.factory.createStringLiteral(endpoint.path.head);
    }

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(endpoint.path.head),
        endpoint.path.parts.map((part, index) => {
            return ts.factory.createTemplateSpan(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                    ts.factory.createIdentifier(part.pathParameter)
                ),
                index === endpoint.path.parts.length - 1
                    ? ts.factory.createTemplateTail(part.tail)
                    : ts.factory.createTemplateMiddle(part.tail)
            );
        })
    );
}
