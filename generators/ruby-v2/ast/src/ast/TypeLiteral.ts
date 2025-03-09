import { assertNever } from "@fern-api/core-utils";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

type InternalTypeLiteral = Boolean_ | String_;

interface Boolean_ {
    type: "boolean";
    value: boolean;
}

interface String_ {
    type: "string";
    value: string;
}

export class TypeLiteral extends AstNode {
    private constructor(public readonly internalTypeLiteral: InternalTypeLiteral) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.internalTypeLiteral.type) {
            case "boolean":
                writer.write(this.internalTypeLiteral.value.toString());
                break;
            case "string":
                writer.write(`"${this.internalTypeLiteral.value}"`);
                break;
            default:
                assertNever(this.internalTypeLiteral);
        }
    }

    /* Static factory methods for creating a Type */
    public static boolean(value: boolean): TypeLiteral {
        return new this({
            type: "boolean",
            value
        });
    }

    public static string(value: string): TypeLiteral {
        return new this({
            type: "string",
            value
        });
    }
}
