import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility.js";

export interface Runtime {
    readonly type: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly version: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly os: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly arch: {
        _getReferenceTo: () => ts.Expression;
    };

    readonly userAgent: {
        _invoke: (sdkName: ts.Expression, sdkVersion: ts.Expression) => ts.CallExpression;
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
    public readonly os = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "os")
        )
    };
    public readonly arch = {
        _getReferenceTo: this.withExportedName(
            "RUNTIME",
            (RUNTIME) => () => ts.factory.createPropertyAccessExpression(RUNTIME.getExpression(), "arch")
        )
    };
    public readonly userAgent = {
        _invoke: this.withExportedName(
            "getUserAgent",
            (getUserAgent) => (sdkName: ts.Expression, sdkVersion: ts.Expression) =>
                ts.factory.createCallExpression(getUserAgent.getExpression(), undefined, [sdkName, sdkVersion])
        )
    };
}
