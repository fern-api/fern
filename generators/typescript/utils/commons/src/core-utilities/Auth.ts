import { ts } from "ts-morph";

import { DependencyManager } from "../dependency-manager/DependencyManager";
import { MANIFEST as Base64Manifest } from "./Base64Utils";
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

export const MANIFEST: CoreUtility.Manifest = {
    name: "auth",
    pathInCoreUtilities: { nameOnDisk: "auth", exportDeclaration: { exportAll: true } },
    dependsOn: [Base64Manifest],
    getFilesPatterns: () => {
        return { patterns: ["src/core/auth/**", "tests/unit/auth/**"] };
    }
};

export class AuthImpl extends CoreUtility implements Auth {
    public readonly MANIFEST = MANIFEST;

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
}
