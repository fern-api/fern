import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { UrlJoin } from "./UrlJoin";

export class UrlJoinImpl extends ExternalDependency implements UrlJoin {
    protected override PACKAGE = { name: "url-join", version: "4.0.1" };
    protected override TYPES_PACKAGE = { name: "@types/url-join", version: "4.0.1" };

    public readonly invoke = this.withDefaultImport("urlJoin", (withImport, urlJoin) =>
        withImport((paths: ts.Expression[]) => {
            return ts.factory.createCallExpression(ts.factory.createIdentifier(urlJoin), undefined, paths);
        })
    );
}
