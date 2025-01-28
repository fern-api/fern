import { assertNever } from "@fern-api/core-utils";

import { Type } from "./Type";

/*

Builds Swift Primitives
========================

Int = "integer"
Double = "double"
String = "string"
Bool = "boolean"
Int64 = "long"
NSDecimalNumber = "bigInteger"

*/

export type PrimitiveKey = "integer" | "double" | "string" | "boolean" | "long" | "bigInteger";

export declare namespace Primitive {
    interface Args {
        key?: PrimitiveKey;
    }
}

export class Primitive extends Type {
    public readonly key?: PrimitiveKey;

    constructor(args: Primitive.Args) {
        super({
            name: Primitive.getNameForKey(args.key)
        });
        this.key = args.key;
    }

    public static getNameForKey(key?: PrimitiveKey): string {
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
