import { ts } from "ts-morph";
import { ExternalDependency } from "./ExternalDependency";

export class FernServiceUtils extends ExternalDependency {
    protected PACKAGE_NAME = "@fern-typescript/service-utils";
    protected VERSION = "0.0.155";

    public Supplier = this.withNamedImport("Supplier", (addImport, supplierType) => ({
        _getReferenceToType: (typeArgument: ts.TypeNode) => {
            addImport();
            return ts.factory.createTypeReferenceNode(supplierType, [typeArgument]);
        },

        get: (supplierExpression: ts.Expression) => {
            addImport();
            return ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(supplierType),
                        ts.factory.createIdentifier("get")
                    ),
                    undefined,
                    [supplierExpression]
                )
            );
        },
    }));

    public isResponseOk = this.withNamedImport(
        "isResponseOk",
        (addImport, isResponseOk) => (responseExpression: ts.Expression) => {
            addImport();
            return ts.factory.createCallExpression(ts.factory.createIdentifier(isResponseOk), undefined, [
                responseExpression,
            ]);
        }
    );

    public Response = {
        OK_DISCRIMINANT: "ok",
        Success: {
            BODY_PROPERTY_NAME: "body",
        },
        Failure: {
            BODY_PROPERTY_NAME: "error",
        },

        of: this.withNamedImport(
            "Response",
            (addImport, responseType) => (successType: ts.TypeNode, failureType: ts.TypeNode) => {
                addImport();
                return ts.factory.createTypeReferenceNode(responseType, [successType, failureType]);
            }
        ),
    };

    public Fetcher = {
        Parameters: {
            URL: "url",
            METHOD: "method",
            HEADERS: "headers",
            QUERY_PARAMS: "queryParameters",
            AUTH_HEADER: "authHeader",
            BODY: "body",
        },
    };

    public defaultFetcher = this.withNamedImport(
        "defaultFetcher",
        (addImport, defaultFetcher) => (fetcherArgs: ts.Expression) => {
            addImport();
            return ts.factory.createCallExpression(ts.factory.createIdentifier(defaultFetcher), undefined, [
                fetcherArgs,
            ]);
        }
    );
}
