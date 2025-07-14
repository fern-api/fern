import { assertNever } from "@fern-api/core-utils";

import { FunctionArgument } from "./FunctionArgument";
import { AstNode, Writer } from "./core";
import { escapeReservedKeyword } from "./syntax/reserved-keywords";

type FunctionCall = {
    type: "function-call";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type RawValue = {
    type: "raw-value";
    value: string;
};

type InternalExpression = FunctionCall | RawValue;

export class Expression extends AstNode {
    private internalExpression: InternalExpression;

    private constructor(internalExpression: InternalExpression) {
        super();
        this.internalExpression = internalExpression;
    }

    public write(writer: Writer): void {
        switch (this.internalExpression.type) {
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

    public static functionCall(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "function-call", unsafeName, arguments_ });
    }
}
