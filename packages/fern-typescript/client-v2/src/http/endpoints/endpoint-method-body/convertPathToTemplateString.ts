import { HttpPath } from "@fern-fern/ir-model/services";
import { ts } from "ts-morph";
import { ClientConstants } from "../../../constants";

export function convertPathToTemplateString(endpointPath: HttpPath): ts.Expression {
    if (endpointPath.parts.length === 0) {
        return ts.factory.createStringLiteral(endpointPath.head);
    }

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(endpointPath.head),
        endpointPath.parts.map((part, index) => {
            return ts.factory.createTemplateSpan(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER),
                    ts.factory.createIdentifier(part.pathParameter)
                ),
                index === endpointPath.parts.length - 1
                    ? ts.factory.createTemplateTail(part.tail)
                    : ts.factory.createTemplateMiddle(part.tail)
            );
        })
    );
}
