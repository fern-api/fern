import { assertNever } from "@fern-api/core-utils";

import { Type } from "./Type";

/*

Builds Swift Primiatives
========================

Int = "integer"
Double = "double"
String = "string"
Bool = "boolean"
Int64 = "long"
NSDecimalNumber = "bigInteger"

*/

export type PrimativeKey = "integer" | "double" | "string" | "boolean" | "long" | "bigInteger";

export declare namespace Primative {
    interface Args {
        key?: PrimativeKey;
    }
}

export class Primative extends Type {
    public readonly key?: PrimativeKey;

    constructor(args: Primative.Args) {
        super({
            name: Primative.getNameForKey(args.key)
        });
        this.key = args.key;
    }

    public static getNameForKey(key?: PrimativeKey): string {
        switch (key) {
            case "integer":
                return "Int";
            case "long":
                return "Int64";
            case "string":
                return "String";
            case "boolean":
                return "Bool";
            case "double":
                return "Double";
            case "bigInteger":
                return "NSDecimalNumber";
            default: {
                assertNever(key as never);
            }
        }
    }
}
