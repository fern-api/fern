import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export type InternalType = "untyped" | "boolean" | "integer" | "string";

declare namespace Type {
    interface Args {
        internalType: InternalType;
        optional?: boolean;
    }
}

export class Type extends AstNode {
    public readonly internalType: InternalType;
    public readonly optional_: boolean;

    private constructor({ internalType, optional }: Type.Args) {
        super();
        this.internalType = internalType;
        this.optional_ = optional ?? false;
    }

    // TODO: Should this be `writeTypeDefinition` instead, and `write` should do nothing?
    public write(writer: Writer): void {
        if (this.optional_ && this.internalType !== "untyped") {
            writer.write("?");
        }

        switch (this.internalType) {
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
            internalType: "untyped"
        });
    }

    public static boolean(): Type {
        return new this({
            internalType: "boolean"
        });
    }

    public static integer(): Type {
        return new this({
            internalType: "integer"
        });
    }

    public static string(): Type {
        return new this({
            internalType: "string"
        });
    }

    public optional(): Type {
        return new Type({ internalType: this.internalType, optional: true });
    }
}
