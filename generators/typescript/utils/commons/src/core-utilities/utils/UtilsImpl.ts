import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { CoreUtility } from "../CoreUtility";
import { Utils } from "./Utils";

export class UtilsImpl extends CoreUtility implements Utils {
    public readonly MANIFEST = {
        name: "utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/utils/src/utils")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/utils"),
        pathInCoreUtilities: [{ nameOnDisk: "utils", exportDeclaration: { exportAll: true } }]
    };

    public setObjectProperty = {
        _invoke: this.withExportedName(
            "setObjectProperty",
            (setObjectProperty) =>
                ({
                    referenceToObject,
                    path,
                    value
                }: {
                    referenceToObject: ts.Expression;
                    path: string;
                    value: ts.Expression;
                }) =>
                    ts.factory.createCallExpression(setObjectProperty.getExpression(), undefined, [
                        referenceToObject,
                        ts.factory.createStringLiteral(path),
                        value
                    ])
        )
    };
}
