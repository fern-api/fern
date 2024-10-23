import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalType = String_;

interface String_ {
    type: "string";
}

export class Type extends AstNode {
    private constructor(public readonly internalType: InternalType) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalType.type) {
            case "string":
                writer.write("string");
                break;
            default:
                assertNever(this.internalType.type);
        }
    }

    /* Static factory methods for creating a Type */
    public static string(): Type {
        return new this({
            type: "string"
        });
    }
}
