import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { DependencyManager } from "../../dependency-manager/DependencyManager";
import { CoreUtility } from "../CoreUtility";
import { FormDataUtils } from "./FormDataUtils";

export class FormDataUtilsImpl extends CoreUtility implements FormDataUtils {
    public readonly MANIFEST = {
        name: "form-data-utils",
        repoInfoForTesting: {
            path: RelativeFilePath.of("generators/typescript/utils/core-utilities/fetcher/src/form-data-utils")
        },
        unitTests: {
            fromDirectory: RelativeFilePath.of("__test__"),
            findAndReplace: {
                "../FormDataWrapper": "../../../src/core/form-data-utils/FormDataWrapper"
            }
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/fetcher/form-data-utils"),
        pathInCoreUtilities: [{ nameOnDisk: "form-data-utils", exportDeclaration: { exportAll: true } }],
        addDependencies: (dependencyManager: DependencyManager): void => {
            dependencyManager.addDependency("form-data", "^4.0.0");
            dependencyManager.addDependency("form-data-encoder", "^4.0.2");
            dependencyManager.addDependency("formdata-node", "^6.0.3");
        }
    };

    public readonly newFormData = this.withExportedName(
        "newFormData",
        (fdw) => () =>
            ts.factory.createAwaitExpression(ts.factory.createCallExpression(fdw.getExpression(), undefined, []))
    );

    public readonly append = ({
        referencetoFormData,
        key,
        value
    }: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        referencetoFormData,
                        ts.factory.createIdentifier("append")
                    ),
                    undefined,
                    [ts.factory.createStringLiteral(key), value]
                )
            )
        );
    };

    public readonly appendFile = ({
        referencetoFormData,
        key,
        value,
        filename
    }: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
        filename?: ts.Expression;
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        referencetoFormData,
                        ts.factory.createIdentifier("appendFile")
                    ),
                    undefined,
                    filename
                        ? [ts.factory.createStringLiteral(key), value, filename]
                        : [ts.factory.createStringLiteral(key), value]
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

    public readonly getBody = ({ referencetoFormData }: { referencetoFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("body"));
    };

    public readonly getHeaders = ({ referencetoFormData }: { referencetoFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("headers"));
    };

    public readonly getDuplexSetting = ({
        referencetoFormData
    }: {
        referencetoFormData: ts.Expression;
    }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("duplex"));
    };
}
