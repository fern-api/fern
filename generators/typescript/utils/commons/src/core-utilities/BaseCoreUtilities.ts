import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface BaseCoreUtilities {
    addNonEnumerableProperty: (object: ts.Expression, key: ts.Expression, value: ts.Expression) => ts.Expression;
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "base-core-utilities",
    pathInCoreUtilities: { nameOnDisk: "utils", exportDeclaration: { exportAll: true } },
    getFilesPatterns: () => {
        return { patterns: "src/core/utils/addNonEnumerableProperty.ts" };
    }
};

export class BaseCoreUtilitiesImpl extends CoreUtility implements BaseCoreUtilities {
    public readonly MANIFEST = MANIFEST;

    public addNonEnumerableProperty = this.withExportedName(
        "addNonEnumerableProperty",
        (addNonEnumerableProperty) =>
            (object: ts.Expression, key: ts.Expression, value: ts.Expression): ts.Expression => {
                return ts.factory.createCallExpression(addNonEnumerableProperty.getExpression(), undefined, [
                    object,
                    key,
                    value
                ]);
            }
    );
}
