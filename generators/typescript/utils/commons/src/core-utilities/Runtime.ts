import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface Runtime {
    readonly type: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly version: {
        _getReferenceTo: () => ts.Expression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "runtime",
    pathInCoreUtilities: { nameOnDisk: "runtime", exportDeclaration: { exportAll: true } },
    addDependencies: (): void => {
        return;
    },
    getFilesPatterns: () => {
        return { patterns: "src/core/runtime/**" };
    }
};

export class RuntimeImpl extends CoreUtility implements Runtime {
    public readonly MANIFEST: CoreUtility.Manifest = MANIFEST;
    public readonly type: Runtime["type"] = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => (): ts.PropertyAccessExpression =>
                ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "type")
        )
    };
    public readonly version: Runtime["version"] = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => (): ts.PropertyAccessExpression =>
                ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "version")
        )
    };
}
