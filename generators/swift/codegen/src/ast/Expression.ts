import { assertNever } from "@fern-api/core-utils";

import { FunctionArgument } from "./FunctionArgument";
import { AstNode, Writer } from "./core";
import { escapeReservedKeyword } from "./syntax/reserved-keywords";

/**
 * A reference to a variable or constant.
 */
type Reference = {
    type: "reference";
    unsafeName: string;
};

type FunctionCall = {
    type: "function-call";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type RawValue = {
    type: "raw-value";
    value: string;
};

type InternalExpression = Reference | FunctionCall | RawValue;

export class Expression extends AstNode {
    private internalExpression: InternalExpression;

    private constructor(internalExpression: InternalExpression) {
        super();
        this.internalExpression = internalExpression;
    }

    public write(writer: Writer): void {
        switch (this.internalExpression.type) {
            case "reference":
                writer.write(escapeReservedKeyword(this.internalExpression.unsafeName));
                break;
            case "function-call":
                writer.write(escapeReservedKeyword(this.internalExpression.unsafeName));
                writer.write("(");
                this.internalExpression.arguments_?.forEach((argument, argumentIdx) => {
                    if (argumentIdx > 0) {
                        writer.write(", ");
                    }
                    argument.write(writer);
                });
                writer.write(")");
                break;
            case "raw-value":
                writer.write(this.internalExpression.value);
                break;
            default:
                assertNever(this.internalExpression);
        }
    }

    public static reference(unsafeName: string): Expression {
        return new this({ type: "reference", unsafeName });
    }

    public static functionCall(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "function-call", unsafeName, arguments_ });
    }

    public static rawStringValue(value: string): Expression {
        return new this({ type: "raw-value", value: `"${value}"` });
    }

    public static rawValue(value: string): Expression {
        return new this({ type: "raw-value", value });
    }
}
