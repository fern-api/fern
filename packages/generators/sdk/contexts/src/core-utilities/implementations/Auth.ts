import { ts } from "ts-morph";

export interface Auth {
    BearerToken: {
        _getReferenceToType: () => ts.TypeNode;

        toAuthorizationHeader: (token: ts.Expression) => ts.Expression;
        fromAuthorizationHeader: (header: ts.Expression) => ts.Expression;
    };

    BasicAuth: {
        _getReferenceToType: () => ts.TypeNode;

        toAuthorizationHeader: (basicAuth: ts.Expression) => ts.Expression;
        fromAuthorizationHeader: (header: ts.Expression) => ts.Expression;
    };
}
