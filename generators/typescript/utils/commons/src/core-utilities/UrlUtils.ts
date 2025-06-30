import { ts } from "ts-morph";
import { CoreUtility } from "./CoreUtility";

export interface UrlUtils {
    joinUrl: {
        _invoke: (args: ts.Expression[]) => ts.CallExpression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "url-utils",
    pathInCoreUtilities: { nameOnDisk: "url.ts", exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => ({
        patterns: ["src/core/url.ts", "tests/unit/url.test.ts"]
    })
};

export class UrlUtilsImpl extends CoreUtility implements UrlUtils {
    public readonly MANIFEST = MANIFEST;
    public readonly joinUrl = {
        _invoke: this.withExportedName(
            "joinUrl",
            (urlUtils) => (args: ts.Expression[]) =>
                ts.factory.createCallExpression(urlUtils.getExpression(), undefined, args)
        )
    };
}
