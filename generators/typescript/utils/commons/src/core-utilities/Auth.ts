import { ts } from "ts-morph";

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

    AuthRequest: {
        _getReferenceToType: () => ts.TypeNode;
        getHeaders: (instanceExpression: ts.Expression) => ts.Expression;
    };

    AuthProvider: {
        _getReferenceToType: () => ts.TypeNode;
        getAuthRequest: {
            invoke: (instanceExpression: ts.Expression, metadata?: ts.Expression) => ts.Expression;
            getReturnTypeNode: () => ts.TypeNode;
        };
    };

    NoOpAuthProvider: {
        _getReferenceTo: () => ts.Expression;
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
    public readonly MANIFEST: CoreUtility.Manifest = MANIFEST;

    public readonly BearerToken: Auth["BearerToken"] = {
        _getReferenceToType: this.withExportedName(
            "BearerToken",
            (BearerToken) => (): ts.TypeNode => BearerToken.getTypeNode()
        ),
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

    public readonly BasicAuth: Auth["BasicAuth"] = {
        _getReferenceToType: this.withExportedName(
            "BasicAuth",
            (BasicAuth) => (): ts.TypeNode => BasicAuth.getTypeNode()
        ),
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

    public readonly AuthRequest: Auth["AuthRequest"] = {
        _getReferenceToType: this.withExportedName(
            "AuthRequest",
            (AuthRequest) => (): ts.TypeNode => AuthRequest.getTypeNode()
        ),
        getHeaders: (instanceExpression: ts.Expression): ts.Expression => {
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        instanceExpression,
                        ts.factory.createIdentifier("getHeaders")
                    ),
                    undefined,
                    []
                )
            );
        }
    };

    public readonly AuthProvider: Auth["AuthProvider"] = {
        _getReferenceToType: this.withExportedName(
            "AuthProvider",
            (AuthProvider) => (): ts.TypeNode => AuthProvider.getTypeNode()
        ),
        getAuthRequest: {
            invoke: (instanceExpression: ts.Expression, metadata?: ts.Expression): ts.AwaitExpression => {
                return ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            instanceExpression,
                            ts.factory.createIdentifier("getAuthRequest")
                        ),
                        undefined,
                        metadata ? [metadata] : []
                    )
                );
            },
            getReturnTypeNode: (): ts.TypeReferenceNode =>
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                    this.AuthRequest._getReferenceToType()
                ])
        }
    };

    public readonly NoOpAuthProvider: Auth["NoOpAuthProvider"] = {
        _getReferenceTo: this.withExportedName(
            "NoOpAuthProvider",
            (NoOpAuthProvider) => (): ts.Expression => NoOpAuthProvider.getExpression()
        )
    };
}
