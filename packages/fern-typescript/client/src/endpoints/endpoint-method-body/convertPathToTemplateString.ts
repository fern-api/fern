import { ts } from "ts-morph";
import { ENDPOINT_PARAMETER_NAME } from "../../constants";

const TEMPLATE_SPAN_REGEX = /\{(.*?)\}([^{]*)/g;

export function convertPathToTemplateString(path: string): ts.Expression {
    const head = path.slice(0, path.indexOf("{"));
    const matches = [...path.matchAll(TEMPLATE_SPAN_REGEX)];

    if (matches.length === 0) {
        return ts.factory.createStringLiteral(path);
    }

    return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(head),
        matches.map(([, expression, literal], index) => {
            if (expression == null || literal == null) {
                throw new Error("Failed to generate template string for path: " + path);
            }
            return ts.factory.createTemplateSpan(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier(ENDPOINT_PARAMETER_NAME),
                    ts.factory.createIdentifier(expression)
                ),
                index === matches.length - 1
                    ? ts.factory.createTemplateTail(literal)
                    : ts.factory.createTemplateMiddle(literal)
            );
        })
    );
}
