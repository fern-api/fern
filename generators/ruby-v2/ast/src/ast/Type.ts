import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType = Untyped | Boolean_ | Integer | String_;

interface Untyped {
    type: "untyped";
}

interface Boolean_ {
    type: "boolean";
}

interface Integer {
    type: "integer";
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
            case "untyped":
                writer.write("untyped");
                break;
            case "boolean":
                writer.write("bool");
                break;
            case "integer":
                writer.write("Integer");
                break;
            case "string":
                writer.write("String");
                break;
            default:
                assertNever(this.internalType);
        }
    }

    /* Static factory methods for creating a Type */
    public static untyped(): Type {
        return new this({
            type: "untyped"
        });
    }

    public static boolean(): Type {
        return new this({
            type: "boolean"
        });
    }

    public static integer(): Type {
        return new this({
            type: "integer"
        });
    }

    public static string(): Type {
        return new this({
            type: "string"
        });
    }
}
