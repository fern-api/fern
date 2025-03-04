import { assertNever } from "@fern-api/core-utils";
import { dynamic } from "@fern-api/ir-sdk";

/**
 * Temporary converter until the dynamic snippet generators are updated to accept the latest IR.
 */
export function convertAuth(auth: dynamic.Auth): Auth | undefined {
    switch (auth.type) {
        case "basic":
            return Auth.basic(auth);
        case "bearer":
            return Auth.bearer(auth);
        case "header":
            return Auth.header(auth);
        case "oauth":
            return undefined;
        default:
            assertNever(auth);
    }
}

export type Auth = dynamic.Auth.Basic | dynamic.Auth.Bearer | dynamic.Auth.Header;

export namespace Auth {
    export interface Basic extends dynamic.BasicAuth, _Utils {
        type: "basic";
    }

    export interface Bearer extends dynamic.BearerAuth, _Utils {
        type: "bearer";
    }

    export interface Header extends dynamic.HeaderAuth, _Utils {
        type: "header";
    }

    export interface _Utils {
        _visit: <_Result>(visitor: dynamic.Auth._Visitor<_Result>) => _Result;
    }

    export interface _Visitor<_Result> {
        basic: (value: dynamic.BasicAuth) => _Result;
        bearer: (value: dynamic.BearerAuth) => _Result;
        header: (value: dynamic.HeaderAuth) => _Result;
        _other: (value: { type: string }) => _Result;
    }
}

export const Auth = {
    basic: (value: dynamic.BasicAuth): dynamic.Auth.Basic => {
        return {
            ...value,
            type: "basic",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.Auth.Basic, visitor: dynamic.Auth._Visitor<_Result>) {
                return dynamic.Auth._visit(this, visitor);
            }
        };
    },

    bearer: (value: dynamic.BearerAuth): dynamic.Auth.Bearer => {
        return {
            ...value,
            type: "bearer",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.Auth.Bearer, visitor: dynamic.Auth._Visitor<_Result>) {
                return dynamic.Auth._visit(this, visitor);
            }
        };
    },

    header: (value: dynamic.HeaderAuth): dynamic.Auth.Header => {
        return {
            ...value,
            type: "header",
            // eslint-disable-next-line object-shorthand
            _visit: function <_Result>(this: dynamic.Auth.Header, visitor: dynamic.Auth._Visitor<_Result>) {
                return dynamic.Auth._visit(this, visitor);
            }
        };
    },

    _visit: <_Result>(value: dynamic.Auth, visitor: dynamic.Auth._Visitor<_Result>): _Result => {
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
