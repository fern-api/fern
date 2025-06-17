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
    public readonly MANIFEST = MANIFEST;
    public readonly type = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "type")
        )
    };
    public readonly version = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "version")
        )
    };
}
