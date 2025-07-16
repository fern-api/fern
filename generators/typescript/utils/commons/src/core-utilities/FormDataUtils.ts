import { ts } from "ts-morph"

import { DependencyManager } from "../dependency-manager/DependencyManager"
import { CoreUtility } from "./CoreUtility"
import { MANIFEST as RuntimeManifest } from "./Runtime"
import { MANIFEST as UrlManifest } from "./UrlUtils"

export interface FormDataUtils {
    newFormData: () => ts.AwaitExpression

    append: (args: {
        referenceToFormData: ts.Expression
        key: string | ts.Expression
        value: ts.Expression
    }) => ts.Statement
    encodeAsFormParameter: (args: { referenceToArgument: ts.Expression }) => ts.CallExpression
    appendFile: (args: {
        referenceToFormData: ts.Expression
        key: string
        value: ts.Expression
        filename?: ts.Expression
    }) => ts.Statement

    getBody: (args: { referenceToFormData: ts.Expression }) => ts.Expression
    getHeaders: (args: { referenceToFormData: ts.Expression }) => ts.Expression
    getRequest: (args: { referenceToFormData: ts.Expression }) => ts.Expression
    getDuplexSetting: (args: { referenceToFormData: ts.Expression }) => ts.Expression
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "form-data-utils",
    pathInCoreUtilities: { nameOnDisk: "form-data-utils", exportDeclaration: { exportAll: true } },
    addDependencies: (dependencyManager: DependencyManager, { formDataSupport }): void => {
        if (formDataSupport === "Node16") {
            dependencyManager.addDependency("form-data", "^4.0.0")
            dependencyManager.addDependency("formdata-node", "^6.0.3")
            dependencyManager.addDependency("form-data-encoder", "^4.0.2")
        }
    },
    dependsOn: [RuntimeManifest, UrlManifest],
    getFilesPatterns: ({ formDataSupport }) => {
        const glob = {
            patterns: ["src/core/form-data-utils/**", "tests/unit/form-data-utils/**"],
            ignore: [] as string[]
        }
        if (formDataSupport === "Node16") {
            glob.ignore.push("tests/unit/form-data-utils/formDataWrapper.browser.test.ts")
        }
        return glob
    }
}

export class FormDataUtilsImpl extends CoreUtility implements FormDataUtils {
    public readonly MANIFEST = MANIFEST
    public readonly newFormData = this.withExportedName(
        "newFormData",
        (fdw) => () =>
            ts.factory.createAwaitExpression(ts.factory.createCallExpression(fdw.getExpression(), undefined, []))
    )

    public readonly encodeAsFormParameter = this.withExportedName(
        "encodeAsFormParameter",
        (encodeAsFormParameter) =>
            ({ referenceToArgument }: { referenceToArgument: ts.Expression }): ts.CallExpression =>
                ts.factory.createCallExpression(encodeAsFormParameter.getExpression(), undefined, [referenceToArgument])
    )

    public readonly append = ({
        referenceToFormData,
        key,
        value
    }: {
        referenceToFormData: ts.Expression
        key: string | ts.Expression
        value: ts.Expression
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referenceToFormData, ts.factory.createIdentifier("append")),
                undefined,
                [typeof key === "string" ? ts.factory.createStringLiteral(key) : key, value]
            )
        )
    }

    public readonly appendFile = ({
        referenceToFormData,
        key,
        value,
        filename
    }: {
        referenceToFormData: ts.Expression
        key: string
        value: ts.Expression
        filename?: ts.Expression
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        referenceToFormData,
                        ts.factory.createIdentifier("appendFile")
                    ),
                    undefined,
                    filename
                        ? [ts.factory.createStringLiteral(key), value, filename]
                        : [ts.factory.createStringLiteral(key), value]
                )
            )
        )
    }

    public readonly getRequest = ({ referenceToFormData }: { referenceToFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToFormData, ts.factory.createIdentifier("getRequest")),
            undefined,
            []
        )
    }

    public readonly getBody = ({ referenceToFormData }: { referenceToFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referenceToFormData, ts.factory.createIdentifier("body"))
    }

    public readonly getHeaders = ({ referenceToFormData }: { referenceToFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referenceToFormData, ts.factory.createIdentifier("headers"))
    }

    public readonly getDuplexSetting = ({
        referenceToFormData
    }: {
        referenceToFormData: ts.Expression
    }): ts.Expression => {
        return ts.factory.createPropertyAccessExpression(referenceToFormData, ts.factory.createIdentifier("duplex"))
    }
}
