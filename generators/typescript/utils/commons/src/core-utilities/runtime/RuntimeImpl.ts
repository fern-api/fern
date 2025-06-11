import { ts } from "ts-morph";

import { CoreUtility } from "../CoreUtility";
import { Runtime } from "./Runtime";

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
