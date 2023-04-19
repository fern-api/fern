import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { FormDataUtils } from "./FormDataUtils";

export class FormDataUtilsImpl extends CoreUtility implements FormDataUtils {
    public readonly MANIFEST = {
        name: "form-data-utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("packages/core-utilities/form-data-utils/src"),
        },
        originalPathOnDocker: "/assets/form-data-utils" as const,
        pathInCoreUtilities: [{ nameOnDisk: "form-data-utils", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("form-data", "4.0.0");
        },
    };

    public readonly getFormDataContentLength = this.withExportedName(
        "getFormDataContentLength",
        (getFormDataContentLength) =>
            ({ referenceToFormData }: { referenceToFormData: ts.Expression }) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createParenthesizedExpression(
                            ts.factory.createAwaitExpression(
                                ts.factory.createCallExpression(getFormDataContentLength.getExpression(), undefined, [
                                    referenceToFormData,
                                ])
                            )
                        ),
                        ts.factory.createIdentifier("toString")
                    ),
                    undefined,
                    []
                )
    );
}
