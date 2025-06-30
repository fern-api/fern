import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface QsUtils {
    stringify: {
        _invoke: (args: ts.Expression[]) => ts.CallExpression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "qs-utils",
    pathInCoreUtilities: { nameOnDisk: "qs.ts", exportDeclaration: { exportAll: false } },
    getFilesPatterns: () => ({
        patterns: ["src/core/qs.ts", "tests/unit/qs.test.ts"]
    })
};

export class QsUtilsImpl extends CoreUtility implements QsUtils {
    public readonly MANIFEST = MANIFEST;
    public readonly stringify = {
        _invoke: this.withExportedName(
            "stringify",
            (stringify) => (args: ts.Expression[]) =>
                ts.factory.createCallExpression(stringify.getExpression(), undefined, args)
        )
    };
}
