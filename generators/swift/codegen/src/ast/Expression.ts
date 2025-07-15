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

type MemberAccess = {
    type: "member-access";
    target: Expression;
    memberName: string;
};

type FunctionCall = {
    type: "function-call";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type MethodCall = {
    type: "method-call";
    target: Expression;
    methodName: string;
    arguments_?: FunctionArgument[];
};

type Try = {
    type: "try";
    expression: Expression;
};

type RawValue = {
    type: "raw-value";
    value: string;
};

type InternalExpression = Reference | MemberAccess | FunctionCall | MethodCall | Try | RawValue;

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
            case "member-access":
                this.internalExpression.target.write(writer);
                writer.write(".");
                writer.write(this.internalExpression.memberName);
                break;
            case "function-call":
                writer.write(escapeReservedKeyword(this.internalExpression.unsafeName));
                writer.write("(");
                this.internalExpression.arguments_?.forEach((argument: FunctionArgument, argumentIdx: number) => {
                    if (argumentIdx > 0) {
                        writer.write(", ");
                    }
                    argument.write(writer);
                });
                writer.write(")");
                break;
            case "method-call":
                this.internalExpression.target.write(writer);
                writer.write(".");
                writer.write(this.internalExpression.methodName);
                writer.write("(");
                this.internalExpression.arguments_?.forEach((argument: FunctionArgument, argumentIdx: number) => {
                    if (argumentIdx > 0) {
                        writer.write(", ");
                    }
                    argument.write(writer);
                });
                writer.write(")");
                break;
            case "try":
                writer.write("try ");
                this.internalExpression.expression.write(writer);
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

    public static memberAccess(target: Expression, memberName: string): Expression {
        return new this({ type: "member-access", target, memberName });
    }

    public static functionCall(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "function-call", unsafeName, arguments_ });
    }

    public static methodCall(target: Expression, methodName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "method-call", target, methodName, arguments_ });
    }

    public static try(expression: Expression): Expression {
        return new this({ type: "try", expression });
    }

    public static rawStringValue(value: string): Expression {
        return new this({ type: "raw-value", value: `"${value}"` });
    }

    public static rawValue(value: string): Expression {
        return new this({ type: "raw-value", value });
    }
}
