import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";

export class UrlJoin extends ExternalDependency {
    protected PACKAGE_NAME = "url-join";
    protected VERSION = "4.0.1";

    public readonly invoke = this.withDefaultImport("urlJoin", (addImport, urlJoin) => (paths: ts.Expression[]) => {
        addImport();
        return ts.factory.createCallExpression(ts.factory.createIdentifier(urlJoin), undefined, paths);
    });
}
