import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";
import { URLSearchParams } from "./URLSearchParams";

export class URLSearchParamsImpl extends ExternalDependency implements URLSearchParams {
    protected override PACKAGE = { name: "@ungap/url-search-params", version: "0.2.2" };
    protected override TYPES_PACKAGE = undefined;

    public readonly instantiate = this.withDefaultImport(
        "URLSearchParams",
        (withImport, URLSearchParams) =>
            withImport(() => {
                return ts.factory.createNewExpression(ts.factory.createIdentifier(URLSearchParams), undefined, []);
            }),
        { isSynthetic: true }
    );

    public append = ({
        key,
        value,
        referenceToUrlSearchParams,
    }: {
        key: ts.Expression;
        value: ts.Expression;
        referenceToUrlSearchParams: ts.Expression;
    }): ts.Expression =>
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToUrlSearchParams, "append"),
            undefined,
            [key, value]
        );
}
