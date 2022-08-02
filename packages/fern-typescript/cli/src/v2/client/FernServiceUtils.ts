import { ts } from "ts-morph";
import { ImportDeclaration } from "./imports-manager/ImportsManager";
import { ModuleSpecifier } from "./types";

const PACKAGE_NAME = "@fern-typescript/service-utils";
const VERSION = "0.0.155";
const EXPORTS = {
    Supplier: "Supplier",
    isResponseOk: "isResponseOk",
    Response: "Response",
    defaultFetcher: "defaultFetcher",
};

export interface FernServiceUtils {
    Supplier: FernServiceUtils.Supplier;

    isResponseOk: (supplier: ts.Expression) => ts.Expression;

    Response: {
        OK_DISCRIMINANT: string;
        Success: {
            BODY_PROPERTY_NAME: string;
        };
        Failure: {
            BODY_PROPERTY_NAME: string;
        };

        of: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;
    };

    Fetcher: {
        Parameters: {
            URL: string;
            METHOD: string;
            HEADERS: string;
            QUERY_PARAMS: string;
            AUTH_HEADER: string;
            BODY: string;
        };
    };

    defaultFetcher: (args: ts.Expression) => ts.Expression;
}

export declare namespace FernServiceUtils {
    export interface Supplier {
        _getReferenceToType: (typeArgument: ts.TypeNode) => ts.TypeNode;
        get: (supplier: ts.Expression) => ts.Expression;
    }
}

export declare namespace createFernServiceUtils {
    export interface Args {
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    }
}

export function createFernServiceUtils({ addImport, addDependency }: createFernServiceUtils.Args): FernServiceUtils {
    function addNamedImport(namedImport: string) {
        addDependency(PACKAGE_NAME, VERSION);
        addImport(PACKAGE_NAME, {
            namedImports: [namedImport],
        });
    }

    return {
        Supplier: {
            _getReferenceToType: (typeArgument) => {
                addNamedImport(EXPORTS.Supplier);
                return ts.factory.createTypeReferenceNode(EXPORTS.Supplier, [typeArgument]);
            },

            get: (supplier) => {
                addNamedImport(EXPORTS.Supplier);
                return ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(EXPORTS.Supplier),
                            ts.factory.createIdentifier("get")
                        ),
                        undefined,
                        [supplier]
                    )
                );
            },
        },

        isResponseOk: (response) => {
            addNamedImport(EXPORTS.isResponseOk);
            return ts.factory.createCallExpression(ts.factory.createIdentifier(EXPORTS.isResponseOk), undefined, [
                response,
            ]);
        },

        Response: {
            OK_DISCRIMINANT: "ok",
            Success: {
                BODY_PROPERTY_NAME: "body",
            },
            Failure: {
                BODY_PROPERTY_NAME: "error",
            },

            of: (successType, failureType) => {
                addNamedImport(EXPORTS.Response);
                return ts.factory.createTypeReferenceNode(EXPORTS.Response, [successType, failureType]);
            },
        },

        Fetcher: {
            Parameters: {
                URL: "url",
                METHOD: "method",
                HEADERS: "headers",
                QUERY_PARAMS: "queryParameters",
                AUTH_HEADER: "authHeader",
                BODY: "body",
            },
        },

        defaultFetcher: (args) => {
            addNamedImport(EXPORTS.defaultFetcher);
            return ts.factory.createCallExpression(ts.factory.createIdentifier(EXPORTS.defaultFetcher), undefined, [
                args,
            ]);
        },
    };
}
