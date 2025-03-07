/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

export type ErrorDiscriminationStrategy =
    | FernIr.ErrorDiscriminationStrategy.StatusCode
    | FernIr.ErrorDiscriminationStrategy.Property;

export namespace ErrorDiscriminationStrategy {
    export interface StatusCode extends _Utils {
        type: "statusCode";
    }

    export interface Property extends FernIr.ErrorDiscriminationByPropertyStrategy, _Utils {
        type: "property";
    }

    export interface _Utils {
        _visit: <_Result>(visitor: FernIr.ErrorDiscriminationStrategy._Visitor<_Result>) => _Result;
    }

    export interface _Visitor<_Result> {
        statusCode: () => _Result;
        property: (value: FernIr.ErrorDiscriminationByPropertyStrategy) => _Result;
        _other: (value: { type: string }) => _Result;
    }
}

export const ErrorDiscriminationStrategy = {
    statusCode: (): FernIr.ErrorDiscriminationStrategy.StatusCode => {
        return {
            type: "statusCode",
            _visit: function <_Result>(
                this: FernIr.ErrorDiscriminationStrategy.StatusCode,
                visitor: FernIr.ErrorDiscriminationStrategy._Visitor<_Result>,
            ) {
                return FernIr.ErrorDiscriminationStrategy._visit(this, visitor);
            },
        };
    },

    property: (value: FernIr.ErrorDiscriminationByPropertyStrategy): FernIr.ErrorDiscriminationStrategy.Property => {
        return {
            ...value,
            type: "property",
            _visit: function <_Result>(
                this: FernIr.ErrorDiscriminationStrategy.Property,
                visitor: FernIr.ErrorDiscriminationStrategy._Visitor<_Result>,
            ) {
                return FernIr.ErrorDiscriminationStrategy._visit(this, visitor);
            },
        };
    },

    _visit: <_Result>(
        value: FernIr.ErrorDiscriminationStrategy,
        visitor: FernIr.ErrorDiscriminationStrategy._Visitor<_Result>,
    ): _Result => {
        switch (value.type) {
            case "statusCode":
                return visitor.statusCode();
            case "property":
                return visitor.property(value);
            default:
                return visitor._other(value as any);
        }
    },
} as const;
