import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "ts-morph";
import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { FormDataUtils } from "./FormDataUtils";

export class FormDataUtilsImpl extends CoreUtility implements FormDataUtils {
    public readonly MANIFEST = {
        name: "form-data-utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/form-data-utils")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/form-data-utils"),
        pathInCoreUtilities: [{ nameOnDisk: "form-data-utils", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("form-data", "4.0.0");
            dependencyManager.addDependency("form-data-encoder", "^4.0.2");
            dependencyManager.addDependency("formdata-node", "^6.0.3");
        }
    };

    public readonly _instantiate = this.withExportedName(
        "FormDataWrapper",
        (fdw) => () => ts.factory.createNewExpression(fdw.getExpression(), undefined, [])
    );

    public readonly append = ({
        referencetoFormData,
        key,
        value,
        file
    }: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
        file?: boolean;
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        referencetoFormData,
                        file ? ts.factory.createIdentifier("appendFile") : ts.factory.createIdentifier("append")
                    ),
                    undefined,
                    file ? [ts.factory.createStringLiteral(key), value] : [ts.factory.createStringLiteral(key), value]
                )
            )
        );
    };

    public readonly getRequest = ({ referencetoFormData }: { referencetoFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("getRequest")),
            undefined,
            []
        );
    };

    public readonly getBody = ({
        referencetoFormDataRequest
    }: {
        referencetoFormDataRequest: ts.Expression;
    }): ts.Expression => {
        return ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    referencetoFormDataRequest,
                    ts.factory.createIdentifier("getBody")
                ),
                undefined,
                []
            )
        );
    };

    public readonly getHeaders = ({
        referencetoFormDataRequest
    }: {
        referencetoFormDataRequest: ts.Expression;
    }): ts.Expression => {
        return ts.factory.createAwaitExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    referencetoFormDataRequest,
                    ts.factory.createIdentifier("getHeaders")
                ),
                undefined,
                []
            )
        );
    };
}
