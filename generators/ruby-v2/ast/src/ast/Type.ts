import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType = Boolean_ | String_;

interface Boolean_ {
    type: "boolean";
}

interface String_ {
    type: "string";
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "boolean":
                writer.write("T::Boolean");
                break;
            case "string":
                writer.write("String");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a Type */
    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }
}
