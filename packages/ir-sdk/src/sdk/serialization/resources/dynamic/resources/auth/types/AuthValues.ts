/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../index";
import * as FernIr from "../../../../../../api/index";
import * as core from "../../../../../../core";
import { BasicAuthValues } from "./BasicAuthValues";
import { BearerAuthValues } from "./BearerAuthValues";
import { HeaderAuthValues } from "./HeaderAuthValues";

export const AuthValues: core.serialization.Schema<serializers.dynamic.AuthValues.Raw, FernIr.dynamic.AuthValues> =
    core.serialization
        .union("type", {
            basic: BasicAuthValues,
            bearer: BearerAuthValues,
            header: HeaderAuthValues,
        })
        .transform<FernIr.dynamic.AuthValues>({
            transform: (value) => {
                switch (value.type) {
                    case "basic":
                        return FernIr.dynamic.AuthValues.basic(value);
                    case "bearer":
                        return FernIr.dynamic.AuthValues.bearer(value);
                    case "header":
                        return FernIr.dynamic.AuthValues.header(value);
                    default:
                        return value as FernIr.dynamic.AuthValues;
                }
            },
            untransform: ({ _visit, ...value }) => value as any,
        });

export declare namespace AuthValues {
    type Raw = AuthValues.Basic | AuthValues.Bearer | AuthValues.Header;

    interface Basic extends BasicAuthValues.Raw {
        type: "basic";
    }

    interface Bearer extends BearerAuthValues.Raw {
        type: "bearer";
    }

    interface Header extends HeaderAuthValues.Raw {
        type: "header";
    }
}
