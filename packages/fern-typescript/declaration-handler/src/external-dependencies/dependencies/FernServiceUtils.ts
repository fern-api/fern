import { ts } from "ts-morph";

export interface FernServiceUtils {
    Supplier: {
        _getReferenceToType: (typeArgument: ts.TypeNode) => ts.TypeNode;
        get: (supplierExpression: ts.Expression) => ts.Expression;
    };

    _Response: {
        _getReferenceToType: (successType: ts.TypeNode, failureType: ts.TypeNode) => ts.TypeNode;
        OK_DISCRIMINANT: string;
        Success: {
            BODY_PROPERTY_NAME: string;
        };
        Failure: {
            BODY_PROPERTY_NAME: string;
        };
    };

    Fetcher: {
        _getReferenceToType: () => ts.TypeNode;
        Parameters: {
            URL: string;
            METHOD: string;
            HEADERS: string;
            QUERY_PARAMS: string;
            AUTH_HEADER: string;
            BODY: string;
        };
        ReturnValue: {
            OK: string;
            BODY: string;
        };
    };

    defaultFetcher: (fetcherArgs: ts.Expression) => ts.Expression;

    NetworkError: {
        ERROR_NAME: string;

        _getReferenceToType: () => ts.TypeNode;
    };

    UnknownError: {
        _getReferenceToType: () => ts.TypeNode;
    };
}
