import { HttpPath } from "@fern-api/api";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";

export function convertPathToTemplateString(path: HttpPath): ts.Expression {
    if (path.parts.length === 0) {
        return ts.factory.createStringLiteral(path.head);
    }

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(path.head),
        path.parts.map((part, index) => {
            return ts.factory.createTemplateSpan(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                    ts.factory.createIdentifier(part.pathParameter)
                ),
                index === path.parts.length - 1
                    ? ts.factory.createTemplateTail(part.tail)
                    : ts.factory.createTemplateMiddle(part.tail)
            );
        })
    );
}
