import { assertNever } from "@fern-api/core-utils";

import { FunctionArgument } from "./FunctionArgument";
import { Type } from "./Type";
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
    target: Expression | Type;
    memberName: string;
};

/**
 * A reference to an enum case with shorthand (dot) syntax.
 */
type EnumCaseShorthand = {
    type: "enum-case-shorthand";
    caseName: string;
};

type FunctionCall = {
    type: "function-call";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type StructInitialization = {
    type: "struct-initialization";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type ClassInitialization = {
    type: "class-initialization";
    unsafeName: string;
    arguments_?: FunctionArgument[];
};

type MethodCall = {
    type: "method-call";
    target: Expression;
    methodName: string;
    arguments_?: FunctionArgument[];
};

type ContextualMethodCall = {
    type: "contextual-method-call";
    methodName: string;
    arguments_?: FunctionArgument[];
};

type Try = {
    type: "try";
    expression: Expression;
};

type Await = {
    type: "await";
    expression: Expression;
};

type RawValue = {
    type: "raw-value";
    value: string;
};

type InternalExpression =
    | Reference
    | MemberAccess
    | EnumCaseShorthand
    | FunctionCall
    | StructInitialization
    | ClassInitialization
    | MethodCall
    | ContextualMethodCall
    | Try
    | Await
    | RawValue;

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
            case "enum-case-shorthand":
                writer.write(".");
                writer.write(this.internalExpression.caseName);
                break;
            case "function-call":
                this.writeCallableExpression(
                    writer,
                    escapeReservedKeyword(this.internalExpression.unsafeName),
                    this.internalExpression.arguments_
                );
                break;
            case "struct-initialization":
                this.writeCallableExpression(
                    writer,
                    escapeReservedKeyword(this.internalExpression.unsafeName),
                    this.internalExpression.arguments_
                );
                break;
            case "class-initialization":
                this.writeCallableExpression(
                    writer,
                    escapeReservedKeyword(this.internalExpression.unsafeName),
                    this.internalExpression.arguments_
                );
                break;
            case "method-call":
                this.internalExpression.target.write(writer);
                writer.write(".");
                this.writeCallableExpression(
                    writer,
                    this.internalExpression.methodName,
                    this.internalExpression.arguments_
                );
                break;
            case "contextual-method-call":
                writer.write(".");
                this.writeCallableExpression(
                    writer,
                    this.internalExpression.methodName,
                    this.internalExpression.arguments_
                );
                break;
            case "try":
                writer.write("try ");
                this.internalExpression.expression.write(writer);
                break;
            case "await":
                writer.write("await ");
                this.internalExpression.expression.write(writer);
                break;
            case "raw-value":
                writer.write(this.internalExpression.value);
                break;
            default:
                assertNever(this.internalExpression);
        }
    }

    private writeCallableExpression(writer: Writer, target: string, arguments_?: FunctionArgument[]): void {
        writer.write(target);
        writer.write("(");
        arguments_?.forEach((argument: FunctionArgument, argumentIdx: number) => {
            if (argumentIdx > 0) {
                writer.write(", ");
            }
            argument.write(writer);
        });
        writer.write(")");
    }

    public static reference(unsafeName: string): Expression {
        return new this({ type: "reference", unsafeName });
    }

    public static memberAccess(target: Expression | Type, memberName: string): Expression {
        return new this({ type: "member-access", target, memberName });
    }

    public static enumCaseShorthand(caseName: string): Expression {
        return new this({ type: "enum-case-shorthand", caseName });
    }

    public static functionCall(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "function-call", unsafeName, arguments_ });
    }

    public static structInitialization(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "struct-initialization", unsafeName, arguments_ });
    }

    public static classInitialization(unsafeName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "class-initialization", unsafeName, arguments_ });
    }

    public static methodCall(target: Expression, methodName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "method-call", target, methodName, arguments_ });
    }

    public static contextualMethodCall(methodName: string, arguments_?: FunctionArgument[]): Expression {
        return new this({ type: "contextual-method-call", methodName, arguments_ });
    }

    public static try(expression: Expression): Expression {
        return new this({ type: "try", expression });
    }

    public static await(expression: Expression): Expression {
        return new this({ type: "await", expression });
    }

    public static rawStringValue(value: string): Expression {
        return new this({ type: "raw-value", value: `"${value}"` });
    }

    public static rawValue(value: string): Expression {
        return new this({ type: "raw-value", value });
    }
}
