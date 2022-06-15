export type HttpAuth = "BEARER" | "NONE";

export const HttpAuth = {
    Bearer: "BEARER",
    None: "NONE",

    _visit: <Result>(value: HttpAuth, visitor: HttpAuth._Visitor<Result>): Result => {
        switch (value) {
            case HttpAuth.Bearer:
                return visitor.bearer();
            case HttpAuth.None:
                return visitor.none();
            default:
                return visitor._unknown();
        }
    },

    _values: (): HttpAuth[] => [HttpAuth.Bearer, HttpAuth.None],
} as const;

export declare namespace HttpAuth {
    type Bearer = "BEARER";
    type None = "NONE";

    export interface _Visitor<Result> {
        bearer: () => Result;
        none: () => Result;
        _unknown: () => Result;
    }
}
