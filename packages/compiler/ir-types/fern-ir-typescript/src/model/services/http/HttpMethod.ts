export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const HttpMethod = {
    Get: "GET",
    Post: "POST",
    Put: "PUT",
    Patch: "PATCH",
    Delete: "DELETE",

    _visit: <Result>(value: HttpMethod, visitor: HttpMethod._Visitor<Result>): Result => {
        switch (value) {
            case HttpMethod.Get:
                return visitor.get();
            case HttpMethod.Post:
                return visitor.post();
            case HttpMethod.Put:
                return visitor.put();
            case HttpMethod.Patch:
                return visitor.patch();
            case HttpMethod.Delete:
                return visitor.delete();
            default:
                return visitor._unknown();
        }
    },

    _values: (): HttpMethod[] => [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete],
} as const;

export declare namespace HttpMethod {
    type Get = "GET";
    type Post = "POST";
    type Put = "PUT";
    type Patch = "PATCH";
    type Delete = "DELETE";

    export interface _Visitor<Result> {
        get: () => Result;
        post: () => Result;
        put: () => Result;
        patch: () => Result;
        delete: () => Result;
        _unknown: () => Result;
    }
}
