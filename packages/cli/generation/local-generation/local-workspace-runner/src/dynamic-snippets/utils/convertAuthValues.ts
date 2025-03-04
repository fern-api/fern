import { assertNever } from "@fern-api/core-utils";
import { dynamic } from "@fern-api/ir-sdk";

/**
 * Temporary converter until the dynamic snippet generators are updated to accept the latest IR.
 */
export function convertAuthValues(auth: dynamic.AuthValues): AuthValues | undefined {
    switch (auth.type) {
        case "basic":
            return AuthValues.basic(auth);
        case "bearer":
            return AuthValues.bearer(auth);
        case "header":
            return dynamic.AuthValues.header(auth);
        case "oauth":
            return undefined;
        default:
            assertNever(auth);
    }
}

/**
 * Temporary type until the dynamic snippet generators are updated to accept the latest IR.
 */
export type AuthValues = dynamic.AuthValues.Basic | dynamic.AuthValues.Bearer | dynamic.AuthValues.Header;

namespace AuthValues {
    export interface Basic extends dynamic.BasicAuthValues, _Utils {
        type: "basic";
    }

    export interface Bearer extends dynamic.BearerAuthValues, _Utils {
        type: "bearer";
    }

    export interface Header extends dynamic.HeaderAuthValues, _Utils {
        type: "header";
    }

    export interface _Utils {
        _visit: <_Result>(visitor: dynamic.AuthValues._Visitor<_Result>) => _Result;
    }

    export interface _Visitor<_Result> {
        basic: (value: dynamic.BasicAuthValues) => _Result;
        bearer: (value: dynamic.BearerAuthValues) => _Result;
        header: (value: dynamic.HeaderAuthValues) => _Result;
        _other: (value: { type: string }) => _Result;
    }
}

const AuthValues = {
    basic: (value: dynamic.BasicAuthValues): dynamic.AuthValues.Basic => {
        return {
            ...value,
            type: "basic",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.AuthValues.Basic, visitor: dynamic.AuthValues._Visitor<_Result>) {
                return dynamic.AuthValues._visit(this, visitor);
            }
        };
    },

    bearer: (value: dynamic.BearerAuthValues): dynamic.AuthValues.Bearer => {
        return {
            ...value,
            type: "bearer",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.AuthValues.Bearer, visitor: dynamic.AuthValues._Visitor<_Result>) {
                return dynamic.AuthValues._visit(this, visitor);
            }
        };
    },

    header: (value: dynamic.HeaderAuthValues): dynamic.AuthValues.Header => {
        return {
            ...value,
            type: "header",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.AuthValues.Header, visitor: dynamic.AuthValues._Visitor<_Result>) {
                return dynamic.AuthValues._visit(this, visitor);
            }
        };
    },

    _visit: <_Result>(value: dynamic.AuthValues, visitor: dynamic.AuthValues._Visitor<_Result>): _Result => {
        switch (value.type) {
            case "basic":
                return visitor.basic(value);
            case "bearer":
                return visitor.bearer(value);
            case "header":
                return visitor.header(value);
            default:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return visitor._other(value as any);
        }
    }
} as const;
