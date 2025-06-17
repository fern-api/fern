import { ts } from "ts-morph";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { CoreUtility } from "./CoreUtility";

export interface Auth {
    BearerToken: {
        _getReferenceToType: () => ts.TypeNode;

        toAuthorizationHeader: (token: ts.Expression) => ts.Expression;
        fromAuthorizationHeader: (header: ts.Expression) => ts.Expression;
    };

    BasicAuth: {
        _getReferenceToType: () => ts.TypeNode;

        toAuthorizationHeader: (username: ts.Expression, password: ts.Expression) => ts.Expression;
        fromAuthorizationHeader: (header: ts.Expression) => ts.Expression;
    };

    OAuthTokenProvider: {
        _getExpression: () => ts.Expression;
        _getReferenceToType: () => ts.TypeNode;
    };
}

const DEFAULT_PACKAGE_PATH = "src";
const DEFAULT_TEST_PATH = "tests";

export class AuthImpl extends CoreUtility implements Auth {
    private packagePath: string;
    public readonly MANIFEST: CoreUtility.Manifest;

    constructor({ getReferenceToExport, packagePath }: CoreUtility.Init & { packagePath: string }) {
        super({ getReferenceToExport });
        this.packagePath = packagePath;
        this.MANIFEST = {
            name: "auth",
            pathInCoreUtilities: { nameOnDisk: "auth", exportDeclaration: { exportAll: true } },
            addDependencies: (dependencyManager: DependencyManager): void => {
                dependencyManager.addDependency("js-base64", "3.7.7");
            },
            getFilesPatterns: () => {
                return {
                    patterns: [
                        `${this.getRelativePackagePath()}/core/auth/**`,
                        `${this.getRelativeTestPath()}/unit/auth/**`
                    ]
                };
            }
        };
    }

    public readonly BearerToken = {
        _getReferenceToType: this.withExportedName("BearerToken", (BearerToken) => () => BearerToken.getTypeNode()),
        toAuthorizationHeader: this.withExportedName(
            "BearerToken",
            (BearerToken) =>
                (token: ts.Expression): ts.Expression => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            BearerToken.getExpression(),
                            ts.factory.createIdentifier("toAuthorizationHeader")
                        ),
                        undefined,
                        [token]
                    );
                }
        ),
        fromAuthorizationHeader: this.withExportedName(
            "BearerToken",
            (BearerToken) =>
                (header: ts.Expression): ts.Expression => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            BearerToken.getExpression(),
                            ts.factory.createIdentifier("fromAuthorizationHeader")
                        ),
                        undefined,
                        [header]
                    );
                }
        )
    };

    public readonly BasicAuth = {
        _getReferenceToType: this.withExportedName("BasicAuth", (BasicAuth) => () => BasicAuth.getTypeNode()),
        toAuthorizationHeader: this.withExportedName(
            "BasicAuth",
            (BasicAuth) =>
                (username: ts.Expression, password: ts.Expression): ts.Expression => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            BasicAuth.getExpression(),
                            ts.factory.createIdentifier("toAuthorizationHeader")
                        ),
                        undefined,
                        [
                            ts.factory.createObjectLiteralExpression(
                                [
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("username"),
                                        username
                                    ),
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier("password"),
                                        password
                                    )
                                ],
                                true
                            )
                        ]
                    );
                }
        ),
        fromAuthorizationHeader: this.withExportedName(
            "BasicAuth",
            (BasicAuth) =>
                (header: ts.Expression): ts.Expression => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            BasicAuth.getExpression(),
                            ts.factory.createIdentifier("fromAuthorizationHeader")
                        ),
                        undefined,
                        [header]
                    );
                }
        )
    };

    public readonly OAuthTokenProvider = {
        _getExpression: this.withExportedName(
            "OAuthTokenProvider",
            (OAuthTokenProvider) => () => OAuthTokenProvider.getExpression()
        ),
        _getReferenceToType: this.withExportedName(
            "OAuthTokenProvider",
            (OAuthTokenProvider) => () => OAuthTokenProvider.getTypeNode()
        )
    };

    private getRelativePackagePath(): string {
        if (this.packagePath === DEFAULT_PACKAGE_PATH) {
            return DEFAULT_PACKAGE_PATH;
        }

        return this.packagePath;
    }

    private getRelativeTestPath(): string {
        if (this.packagePath === DEFAULT_PACKAGE_PATH) {
            return DEFAULT_TEST_PATH;
        }

        return `${this.packagePath}/tests`;
    }
}
