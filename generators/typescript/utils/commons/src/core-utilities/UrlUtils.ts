import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface UrlUtils {
    join: {
        _invoke: (args: ts.Expression[]) => ts.CallExpression;
    };
    toQueryString: {
        _invoke: (args: ts.Expression[]) => ts.CallExpression;
    };
    encodePathParam: {
        _invoke: (arg: ts.Expression) => ts.CallExpression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "url-utils",
    pathInCoreUtilities: { nameOnDisk: "url", exportDeclaration: { namespaceExport: "url" } },
    getFilesPatterns: () => ({
        patterns: ["src/core/url/**", "tests/unit/url/**"]
    })
};

export class UrlUtilsImpl extends CoreUtility implements UrlUtils {
    public readonly MANIFEST: CoreUtility.Manifest = MANIFEST;
    public readonly join: UrlUtils["join"] = {
        _invoke: this.withExportedName(
            "join",
            (join) =>
                (args: ts.Expression[]): ts.CallExpression =>
                    ts.factory.createCallExpression(join.getExpression(), undefined, args)
        )
    };
    public readonly toQueryString: UrlUtils["toQueryString"] = {
        _invoke: this.withExportedName(
            "toQueryString",
            (toQueryString) =>
                (args: ts.Expression[]): ts.CallExpression =>
                    ts.factory.createCallExpression(toQueryString.getExpression(), undefined, args)
        )
    };
    public readonly encodePathParam: UrlUtils["encodePathParam"] = {
        _invoke: this.withExportedName(
            "encodePathParam",
            (encodePathParam) =>
                (arg: ts.Expression): ts.CallExpression =>
                    ts.factory.createCallExpression(encodePathParam.getExpression(), undefined, [arg])
        )
    };
}
