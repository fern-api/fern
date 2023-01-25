import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { CoreUtility } from "../CoreUtility";
import { BaseCoreUtilities } from "./BaseCoreUtilities";

export class BaseCoreUtilitiesImpl extends CoreUtility implements BaseCoreUtilities {
    public readonly MANIFEST = {
        name: "base-core-utilities",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/base/src"),
        },
        originalPathOnDocker: "/assets/base-core-utilities" as const,
        pathInCoreUtilities: [{ nameOnDisk: "utils", exportDeclaration: { exportAll: true } }],
    };

    public addNonEnumerableProperty = this.withExportedName(
        "addNonEnumerableProperty",
        (addNonEnumerableProperty) =>
            (object: ts.Expression, key: ts.Expression, value: ts.Expression): ts.Expression => {
                return ts.factory.createCallExpression(addNonEnumerableProperty.getExpression(), undefined, [
                    object,
                    key,
                    value,
                ]);
            }
    );
}
