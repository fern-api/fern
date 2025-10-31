import { assertNever } from "@fern-api/core-utils";
import { escapeReservedKeyword } from "../syntax";
import { AstNode, Writer } from "./core";
import { FunctionArgument } from "./FunctionArgument";
import { TypeReference } from "./TypeReference";

/**
 * A reference to a variable or constant.
 */
type Reference = {
    type: "reference";
    unsafeName: string;
};

type MemberAccess = {
    type: "member-access";
    target: Expression | TypeReference;
    optionalChain?: true;
    memberName: string;
};

type Equals = {
    type: "equals";
    left: Expression;
    right: Expression;
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
    multiline?: true;
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

type StringLiteral = {
    type: "string-literal";
    value: string;
};

type NumberLiteral = {
    type: "number-literal";
    value: number;
};

type BoolLiteral = {
    type: "bool-literal";
    value: boolean;
};

type DateLiteral = {
    type: "date-literal";
    isoString: string;
};

type CalendarDateLiteral = {
    type: "calendar-date-literal";
    isoString: string;
};

type UUIDLiteral = {
    type: "uuid-literal";
    value: string;
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

type DataLiteral = {
    type: "data-literal";
    value: string;
};

type RawValue = {
    type: "raw-value";
    value: string;
};

type Nop = {
    type: "nop";
};

type InternalExpression =
    | Reference
    | MemberAccess
    | Equals
    | EnumCaseShorthand
    | FunctionCall
    | StructInitialization
    | ClassInitialization
    | MethodCall
    | MethodCallWithTrailingClosure
    | ContextualMethodCall
    | Try
    | OptionalTry
    | ForceTry
    | Await
    | StringLiteral
    | NumberLiteral
    | BoolLiteral
    | DateLiteral
    | CalendarDateLiteral
    | UUIDLiteral
    | DictionaryLiteral
    | ArrayLiteral
    | DataLiteral
    | RawValue
    | Nop;

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

    public isNop() {
        return this.internalExpression.type === "nop";
    }

    public isStructInitialization() {
        return this.internalExpression.type === "struct-initialization";
    }

    public asStructInitializationOrThrow(): StructInitialization {
        if (this.internalExpression.type !== "struct-initialization") {
            throw new Error("Internal error; swift.Expression is not a struct initialization");
        }
        return this.internalExpression;
    }

    public write(writer: Writer): void {
        switch (this.internalExpression.type) {
            case "reference":
                writer.write(escapeReservedKeyword(this.internalExpression.unsafeName));
                break;
            case "member-access":
                this.internalExpression.target.write(writer);
                if (this.internalExpression.optionalChain) {
                    writer.write("?");
                }
                writer.write(".");
                writer.write(this.internalExpression.memberName);
                break;
            case "equals":
                this.internalExpression.left.write(writer);
                writer.write(" == ");
                this.internalExpression.right.write(writer);
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
                writer.write(" {");
                if (this.internalExpression.multiline) {
                    writer.newLine();
                    writer.indent();
                } else {
                    writer.write(" ");
                }
                this.internalExpression.closureBody.write(writer);
                if (this.internalExpression.multiline) {
                    writer.newLine();
                    writer.dedent();
                } else {
                    writer.write(" ");
                }
                writer.write("}");
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
            case "string-literal":
                writer.write(`"${this.internalExpression.value}"`);
                break;
            case "number-literal":
                writer.write(this.internalExpression.value.toString());
                break;
            case "bool-literal":
                writer.write(this.internalExpression.value ? "true" : "false");
                break;
            case "date-literal":
                writer.write(`try! Date("${this.internalExpression.isoString}", strategy: .iso8601)`);
                break;
            case "calendar-date-literal":
                writer.write(`CalendarDate("${this.internalExpression.isoString}")!`);
                break;
            case "uuid-literal":
                writer.write(`UUID(uuidString: "${this.internalExpression.value}")!`);
                break;
            case "dictionary-literal":
                this.writeDictionaryLiteral(writer, this.internalExpression);
                break;
            case "array-literal":
                this.writeArrayLiteral(writer, this.internalExpression);
                break;
            case "data-literal":
                writer.write(`Data("${this.internalExpression.value}".utf8)`);
                break;
            case "raw-value":
                writer.write(this.internalExpression.value);
                break;
            case "nop":
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

    public static equals(left: Expression, right: Expression): Expression {
        return new this({ type: "equals", left, right });
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

    public static stringLiteral(value: string): Expression {
        return new this({ type: "string-literal", value });
    }

    public static numberLiteral(value: number): Expression {
        return new this({ type: "number-literal", value });
    }

    public static boolLiteral(value: boolean): Expression {
        return new this({ type: "bool-literal", value });
    }

    public static dateLiteral(isoStringWithoutFractionalSeconds: string): Expression {
        return new this({ type: "date-literal", isoString: isoStringWithoutFractionalSeconds });
    }

    public static calendarDateLiteral(isoString: string): Expression {
        return new this({ type: "calendar-date-literal", isoString });
    }

    public static uuidLiteral(value: string): Expression {
        return new this({ type: "uuid-literal", value });
    }

    public static dictionaryLiteral(params: Omit<DictionaryLiteral, "type">): Expression {
        return new this({ type: "dictionary-literal", ...params });
    }

    public static arrayLiteral(params: Omit<ArrayLiteral, "type">): Expression {
        return new this({ type: "array-literal", ...params });
    }

    public static dataLiteral(value: string): Expression {
        return new this({ type: "data-literal", value });
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

    public static rawValue(value: string): Expression {
        return new this({ type: "raw-value", value });
    }

    public static nop(): Expression {
        return new this({ type: "nop" });
    }

    // Helpers

    public static nil(): Expression {
        return new this({ type: "raw-value", value: "nil" });
    }

    public static self(): Expression {
        return new this({ type: "raw-value", value: "self" });
    }
}
