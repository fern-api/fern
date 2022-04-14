export type HttpVerb =
    | HttpVerb.GET
    | HttpVerb.POST
    | HttpVerb.PUT
    | HttpVerb.DELETE;

export const HttpVerb = {
    GET: "GET" as HttpVerb.GET,
    POST: "POST" as HttpVerb.POST,
    PUT: "PUT" as HttpVerb.PUT,
    DELETE: "DELETE" as HttpVerb.DELETE,

    visit: <R>(value: HttpVerb, visitor: HttpVerb.Visitor<R>) => {
        switch (value) {
            case HttpVerb.GET: return visitor.GET();
            case HttpVerb.POST: return visitor.POST();
            case HttpVerb.PUT: return visitor.PUT();
            case HttpVerb.DELETE: return visitor.DELETE();
            default: return visitor.unknown(value);
        }
    },
};

export declare namespace HttpVerb {
    export type GET = "GET" & {
        "__fern.HttpVerb": void,
    };
    export type POST = "POST" & {
        "__fern.HttpVerb": void,
    };
    export type PUT = "PUT" & {
        "__fern.HttpVerb": void,
    };
    export type DELETE = "DELETE" & {
        "__fern.HttpVerb": void,
    };

    export interface Visitor<R> {
        GET: () => R;
        POST: () => R;
        PUT: () => R;
        DELETE: () => R;
        unknown: (value: string) => R;
    }
}
