import * as model from "../..";

export type Encoding = Encoding.Json | Encoding.Custom;

export declare namespace Encoding {
    interface Json {
        _type: "json";
    }

    interface Custom extends model.CustomWireMessageEncoding {
        _type: "custom";
    }

    export interface _Visitor<Result> {
        json: () => Result;
        custom: (value: model.CustomWireMessageEncoding) => Result;
        _unknown: () => Result;
    }
}

export const Encoding = {
    json: (): Encoding.Json => ({
        _type: "json",
    }),

    custom: (value: model.CustomWireMessageEncoding): Encoding.Custom => ({
        ...value,
        _type: "custom",
    }),

    _visit: <Result>(value: Encoding, visitor: Encoding._Visitor<Result>): Result => {
        switch (value._type) {
            case "json":
                return visitor.json();
            case "custom":
                return visitor.custom(value);
            default:
                return visitor._unknown();
        }
    },

    _types: (): Encoding["_type"][] => ["json", "custom"],
} as const;
