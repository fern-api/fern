export type HttpMethod = HttpMethod.GET | HttpMethod.POST | HttpMethod.PUT | HttpMethod.DELETE;

export const HttpMethod = {
    GET: "GET" as HttpMethod.GET,
    POST: "POST" as HttpMethod.POST,
    PUT: "PUT" as HttpMethod.PUT,
    DELETE: "DELETE" as HttpMethod.DELETE,

    visit: <R>(value: HttpMethod, visitor: HttpMethod.Visitor<R>): R => {
        switch (value) {
            case HttpMethod.GET:
                return visitor.GET();
            case HttpMethod.POST:
                return visitor.POST();
            case HttpMethod.PUT:
                return visitor.PUT();
            case HttpMethod.DELETE:
                return visitor.DELETE();
            default:
                return visitor.unknown(value);
        }
    },
};

export declare namespace HttpMethod {
    export type GET = "GET" & {
        "__fern.HttpMethod": void;
    };
    export type POST = "POST" & {
        "__fern.HttpMethod": void;
    };
    export type PUT = "PUT" & {
        "__fern.HttpMethod": void;
    };
    export type DELETE = "DELETE" & {
        "__fern.HttpMethod": void;
    };

    export interface Visitor<R> {
        GET: () => R;
        POST: () => R;
        PUT: () => R;
        DELETE: () => R;
        unknown: (value: string) => R;
    }
}
