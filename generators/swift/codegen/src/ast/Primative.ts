import { assertNever } from "@fern-api/core-utils";
import { SwiftClass } from "..";

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

export type PrimativeKey = "string" | "boolean" | "integer" | "long" | "uint" | "uint64" | "float" | "double" | "date" | "dateTime" | "uuid" | "base64" | "bigInteger" | undefined;

export declare namespace Primative {
    interface Args {
        key?: PrimativeKey
    }
}

export class Primative extends SwiftClass {

    public readonly key?: PrimativeKey;

    constructor(args: Primative.Args) {
        super({ name: Primative.getNameForKey(args.key) });
        this.key = args.key;
    }

    public static getNameForKey(key?: PrimativeKey): string {
        switch (key) {
            case "integer": return "Int";
            case "long": return "Int64";
            case "uint64": return "Int64";
            case "string": return "String";
            case "boolean": return "Bool";
            case "double": return "Double";
            case "bigInteger": return "NSDecimalNumber";
            default: { assertNever(key as never); }
        }
    }

}
