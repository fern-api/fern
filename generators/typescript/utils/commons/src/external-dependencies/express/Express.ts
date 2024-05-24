import { ts } from "ts-morph";

export type ExpressHttpVerb = "get" | "post" | "put" | "patch" | "delete";

export interface Express {
    Express: () => ts.TypeNode;
    RequestHandler: () => ts.TypeNode;
    Request: {
        body: "body";
        _getReferenceToType: (args: {
            pathParameters: ts.TypeNode | undefined;
            request: ts.TypeNode | undefined;
            response: ts.TypeNode | undefined;
            queryParameters: ts.TypeNode | undefined;
        }) => ts.TypeNode;
    };
    Response: {
        json: (args: {
            referenceToExpressResponse: ts.Expression;
            valueToSend: ts.Expression;
            status?: number;
        }) => ts.Expression;
        cookie: {
            _getBoundReference: (args: { referenceToExpressResponse: ts.Expression }) => ts.Expression;
        };
        status: (args: { referenceToExpressResponse: ts.Expression; status: number }) => ts.Expression;
        sendStatus: (args: { referenceToExpressResponse: ts.Expression; status: number }) => ts.Expression;
        locals: (args: { referenceToExpressResponse: ts.Expression }) => ts.Expression;
        _getReferenceToType: () => ts.TypeNode;
    };
    NextFunction: {
        _getReferenceToType: () => ts.TypeNode;
    };
    App: {
        use: (args: { referenceToApp: ts.Expression; path: ts.Expression; router: ts.Expression }) => ts.Expression;
    };
    Router: {
        use: (args: { referenceToRouter: ts.Expression; handlers: ts.Expression[] }) => ts.Expression;
        _instantiate: (args?: { mergeParams?: boolean }) => ts.Expression;
        _getReferenceToType: () => ts.TypeNode;
        _addRoute: (args: {
            referenceToRouter: ts.Expression;
            method: ExpressHttpVerb;
            path: string;
            buildHandler: (args: {
                expressRequest: ts.Expression;
                expressResponse: ts.Expression;
                next: ts.Expression;
            }) => ts.ConciseBody;
        }) => ts.Statement;
    };
    CookieOptions: {
        _getReferenceToType: () => ts.TypeNode;
    };
    json: (args?: { strict?: boolean }) => ts.Expression;
}
