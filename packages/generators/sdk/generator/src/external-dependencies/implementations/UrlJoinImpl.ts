import { UrlJoin } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";

export class UrlJoinImpl extends ExternalDependency implements UrlJoin {
    protected PACKAGE = { name: "url-join", version: "4.0.1" };
    protected TYPES_PACKAGE = { name: "@types/url-join", version: "4.0.1" };

    public readonly invoke = this.withDefaultImport("urlJoin", (addImport, urlJoin) => (paths: ts.Expression[]) => {
        addImport();
        return ts.factory.createCallExpression(ts.factory.createIdentifier(urlJoin), undefined, paths);
    });
}
