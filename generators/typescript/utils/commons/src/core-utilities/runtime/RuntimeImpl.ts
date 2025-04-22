import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { Runtime } from "./Runtime";

export const MANIFEST: CoreUtility.Manifest = {
    name: "runtime",
    repoInfoForTesting: {
        path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/runtime")
    },
    originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/runtime"),
    pathInCoreUtilities: [{ nameOnDisk: "runtime", exportDeclaration: { exportAll: true } }],
    addDependencies: (dependencyManager: DependencyManager): void => {
        return;
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
