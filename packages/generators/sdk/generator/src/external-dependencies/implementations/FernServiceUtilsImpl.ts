import { getGeneratorVersion } from "@fern-typescript/commons-v2";
import { FernServiceUtils } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";

export class FernServiceUtilsImpl extends ExternalDependency implements FernServiceUtils {
    protected override PACKAGE = {
        name: "@fern-typescript/service-utils",
        version: getGeneratorVersion(),
    };
    protected override TYPES_PACKAGE = undefined;

    public readonly Supplier = this.withNamedImport(
        "Supplier",
        (withImport, Supplier) =>
            ({
                _getReferenceToType: withImport((typeArgument: ts.TypeNode) => {
                    return ts.factory.createTypeReferenceNode(Supplier, [typeArgument]);
                }),

                get: withImport((supplierExpression: ts.Expression) => {
                    return ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(Supplier),
                                ts.factory.createIdentifier("get")
                            ),
                            undefined,
                            [supplierExpression]
                        )
                    );
                }),
            } as const)
    );

    public readonly _Response = this.withNamedImport(
        "_Response",
        (withImport, _Response) =>
            ({
                _getReferenceToType: withImport((successType: ts.TypeNode, failureType: ts.TypeNode) => {
                    return ts.factory.createTypeReferenceNode(_Response, [successType, failureType]);
                }),

                OK_DISCRIMINANT: "ok",
                Success: {
                    BODY_PROPERTY_NAME: "body",
                },
                Failure: {
                    BODY_PROPERTY_NAME: "error",
                },
            } as const)
    );

    public readonly Fetcher = this.withNamedImport(
        "FetcherV2",
        (withImport, Fetcher) =>
            ({
                _getReferenceToType: withImport(() => {
                    return ts.factory.createTypeReferenceNode(Fetcher);
                }),

                Parameters: {
                    URL: "url",
                    METHOD: "method",
                    HEADERS: "headers",
                    QUERY_PARAMS: "queryParameters",
                    AUTH_HEADER: "authHeader",
                    BODY: "body",
                },

                Response: {
                    DISCRIMINANT: "type",
                    OK: "ok",
                    BODY: "body",
                },

                ServerResponse: {
                    DISCRIMINANT_VALUE: "server",
                    STATUS_CODE: "statusCode",
                },

                NetworkError: {
                    DISCRIMINANT_VALUE: "networkError",
                },
            } as const)
    );

    public readonly defaultFetcher = this.withNamedImport("defaultFetcherV2", (withImport, defaultFetcher) =>
        withImport((fetcherArgs: ts.Expression) => {
            return ts.factory.createCallExpression(ts.factory.createIdentifier(defaultFetcher), undefined, [
                fetcherArgs,
            ]);
        })
    );

    public readonly NetworkError = this.withNamedImport("_NetworkError", (withImport, _NetworkError) => ({
        ERROR_NAME: "_NetworkError",

        _getReferenceToType: withImport(() => {
            return ts.factory.createTypeReferenceNode(_NetworkError);
        }),
    }));

    public readonly UnknownError = this.withNamedImport("_UnknownError", (withImport, _UnknownError) => ({
        _getReferenceToType: withImport(() => {
            return ts.factory.createTypeReferenceNode(_UnknownError);
        }),
    }));

    public readonly ErrorDetails = this.withNamedImport("ErrorDetails", (withImport, ErrorDetails) => ({
        _getReferenceToType: withImport(() => {
            return ts.factory.createTypeReferenceNode(ErrorDetails);
        }),

        STATUS_CODE: "statusCode",
    }));

    public readonly BearerToken = this.withNamedImport(
        "BearerToken",
        (withImport, BearerToken) =>
            ({
                _getReferenceToType: withImport(() => {
                    return ts.factory.createTypeReferenceNode(BearerToken);
                }),

                toAuthorizationHeader: withImport((token: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(BearerToken),
                            ts.factory.createIdentifier("toAuthorizationHeader")
                        ),
                        undefined,
                        [token]
                    );
                }),

                fromAuthorizationHeader: withImport((header: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(BearerToken),
                            ts.factory.createIdentifier("fromAuthorizationHeader")
                        ),
                        undefined,
                        [header]
                    );
                }),
            } as const)
    );

    public readonly BasicAuth = this.withNamedImport(
        "BasicAuth",
        (withImport, BasicAuth) =>
            ({
                _getReferenceToType: withImport(() => {
                    return ts.factory.createTypeReferenceNode(BasicAuth);
                }),

                toAuthorizationHeader: withImport((token: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(BasicAuth),
                            ts.factory.createIdentifier("toAuthorizationHeader")
                        ),
                        undefined,
                        [token]
                    );
                }),

                fromAuthorizationHeader: withImport((header: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(BasicAuth),
                            ts.factory.createIdentifier("fromAuthorizationHeader")
                        ),
                        undefined,
                        [header]
                    );
                }),
            } as const)
    );
}
