import { assertNever } from "@fern-api/core-utils";

import { AstNode, Writer } from "./core";
import { FunctionArgument } from "./FunctionArgument";
import { escapeReservedKeyword } from "./syntax";
import { Type } from "./Type";

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
    multiline?: true;
};

type StructInitialization = {
    type: "struct-initialization";
    unsafeName: string;
    arguments_?: FunctionArgument[];
    multiline?: true;
};

type ClassInitialization = {
    type: "class-initialization";
    unsafeName: string;
    arguments_?: FunctionArgument[];
    multiline?: true;
};

type DictionaryLiteral = {
    type: "dictionary-literal";
    entries?: [Expression, Expression][];
    multiline?: true;
};

type ArrayLiteral = {
    type: "array-literal";
    elements?: Expression[];
    multiline?: true;
};

type MethodCall = {
    type: "method-call";
    target: Expression;
    methodName: string;
    arguments_?: FunctionArgument[];
    multiline?: true;
};

type MethodCallWithTrailingClosure = {
    type: "method-call-with-trailing-closure";
    target: Expression;
    methodName: string;
    closureBody: Expression;
};

type ContextualMethodCall = {
    type: "contextual-method-call";
    methodName: string;
    arguments_?: FunctionArgument[];
    multiline?: true;
};

type Try = {
    type: "try";
    expression: Expression;
};

type OptionalTry = {
    type: "optional-try";
    expression: Expression;
};

type ForceTry = {
    type: "force-try";
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
    | DictionaryLiteral
    | ArrayLiteral
    | MethodCall
    | MethodCallWithTrailingClosure
    | ContextualMethodCall
    | Try
    | OptionalTry
    | ForceTry
    | Await
    | RawValue;

type WriteCallableExpressionParams = {
    writer: Writer;
    target: string;
    arguments_?: FunctionArgument[];
    multiline: boolean;
};

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
                this.writeCallableExpression({
                    writer,
                    target: escapeReservedKeyword(this.internalExpression.unsafeName),
                    arguments_: this.internalExpression.arguments_,
                    multiline: !!this.internalExpression.multiline
                });
                break;
            case "struct-initialization":
                this.writeCallableExpression({
                    writer,
                    target: escapeReservedKeyword(this.internalExpression.unsafeName),
                    arguments_: this.internalExpression.arguments_,
                    multiline: !!this.internalExpression.multiline
                });
                break;
            case "class-initialization":
                this.writeCallableExpression({
                    writer,
                    target: escapeReservedKeyword(this.internalExpression.unsafeName),
                    arguments_: this.internalExpression.arguments_,
                    multiline: !!this.internalExpression.multiline
                });
                break;
            case "dictionary-literal":
                this.writeDictionaryLiteral(writer, this.internalExpression);
                break;
            case "array-literal":
                this.writeArrayLiteral(writer, this.internalExpression);
                break;
            case "method-call":
                this.internalExpression.target.write(writer);
                writer.write(".");
                this.writeCallableExpression({
                    writer,
                    target: this.internalExpression.methodName,
                    arguments_: this.internalExpression.arguments_,
                    multiline: !!this.internalExpression.multiline
                });
                break;
            case "method-call-with-trailing-closure":
                this.internalExpression.target.write(writer);
                writer.write(".");
                writer.write(this.internalExpression.methodName);
                writer.write(" { ");
                this.internalExpression.closureBody.write(writer);
                writer.write(" }");
                break;
            case "contextual-method-call":
                writer.write(".");
                this.writeCallableExpression({
                    writer,
                    target: this.internalExpression.methodName,
                    arguments_: this.internalExpression.arguments_,
                    multiline: !!this.internalExpression.multiline
                });
                break;
            case "try":
                writer.write("try ");
                this.internalExpression.expression.write(writer);
                break;
            case "optional-try":
                writer.write("try? ");
                this.internalExpression.expression.write(writer);
                break;
            case "force-try":
                writer.write("try! ");
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

    private writeCallableExpression({ writer, target, arguments_, multiline }: WriteCallableExpressionParams): void {
        writer.write(target);
        writer.write("(");
        if (multiline) {
            writer.newLine();
            writer.indent();
        }
        arguments_?.forEach((argument: FunctionArgument, argumentIdx: number) => {
            if (argumentIdx > 0) {
                writer.write(",");
                if (multiline) {
                    writer.newLine();
                } else {
                    writer.write(" ");
                }
            }
            argument.write(writer);
        });
        if (multiline) {
            writer.newLine();
            writer.dedent();
        }
        writer.write(")");
    }

    private writeDictionaryLiteral(writer: Writer, dictLiteral: DictionaryLiteral): void {
        if (!dictLiteral.entries || dictLiteral.entries.length === 0) {
            writer.write("[:]");
            return;
        }
        writer.write("[");
        const multiline = !!dictLiteral.multiline;
        if (multiline) {
            writer.newLine();
            writer.indent();
        }
        dictLiteral.entries?.forEach(([key, value], entryIdx) => {
            if (entryIdx > 0) {
                writer.write(", ");
                if (multiline) {
                    writer.newLine();
                }
            }
            key.write(writer);
            writer.write(": ");
            value.write(writer);
        });
        if (multiline) {
            writer.newLine();
            writer.dedent();
        }
        writer.write("]");
    }

    private writeArrayLiteral(writer: Writer, arrayLiteral: ArrayLiteral): void {
        if (!arrayLiteral.elements || arrayLiteral.elements.length === 0) {
            writer.write("[]");
            return;
        }
        writer.write("[");
        const multiline = !!arrayLiteral.multiline;
        if (multiline) {
            writer.newLine();
            writer.indent();
        }
        arrayLiteral.elements?.forEach((element, elementIdx) => {
            if (elementIdx > 0) {
                writer.write(",");
                if (multiline) {
                    writer.newLine();
                } else {
                    writer.write(" ");
                }
            }
            element.write(writer);
        });
        if (multiline) {
            writer.newLine();
            writer.dedent();
        }
        writer.write("]");
    }

    public static reference(unsafeName: string): Expression {
        return new this({ type: "reference", unsafeName });
    }

    public static memberAccess(params: Omit<MemberAccess, "type">): Expression {
        return new this({ type: "member-access", ...params });
    }

    public static enumCaseShorthand(caseName: string): Expression {
        return new this({ type: "enum-case-shorthand", caseName });
    }

    public static functionCall(params: Omit<FunctionCall, "type">): Expression {
        return new this({ type: "function-call", ...params });
    }

    public static structInitialization(params: Omit<StructInitialization, "type">): Expression {
        return new this({ type: "struct-initialization", ...params });
    }

    public static classInitialization(params: Omit<ClassInitialization, "type">): Expression {
        return new this({ type: "class-initialization", ...params });
    }

    public static dictionaryLiteral(params: Omit<DictionaryLiteral, "type">): Expression {
        return new this({ type: "dictionary-literal", ...params });
    }

    public static arrayLiteral(params: Omit<ArrayLiteral, "type">): Expression {
        return new this({ type: "array-literal", ...params });
    }

    public static methodCall(params: Omit<MethodCall, "type">): Expression {
        return new this({ type: "method-call", ...params });
    }

    public static methodCallWithTrailingClosure(params: Omit<MethodCallWithTrailingClosure, "type">): Expression {
        return new this({ type: "method-call-with-trailing-closure", ...params });
    }

    public static contextualMethodCall(params: Omit<ContextualMethodCall, "type">): Expression {
        return new this({ type: "contextual-method-call", ...params });
    }

    public static try(expression: Expression): Expression {
        return new this({ type: "try", expression });
    }

    public static optionalTry(expression: Expression): Expression {
        return new this({ type: "optional-try", expression });
    }

    public static forceTry(expression: Expression): Expression {
        return new this({ type: "force-try", expression });
    }

    public static await(expression: Expression): Expression {
        return new this({ type: "await", expression });
    }

    public static rawStringValue(value: string): Expression {
        return new this({ type: "raw-value", value: `"${value}"` });
    }

    public static nil(): Expression {
        return new this({ type: "raw-value", value: "nil" });
    }

    public static rawValue(value: string): Expression {
        return new this({ type: "raw-value", value });
    }
}
