import { AstNode, Writer } from "./index";
import { Statement } from "./Statement";
import { Type } from "./Type";

export declare namespace Expression {
    type Args =
        | { type: "reference"; name: string }
        | { type: "self" }
        | { type: "field-access"; target: Expression; field: string }
        | {
              type: "method-call";
              target: Expression;
              method: string;
              args: Expression[];
              isAsync?: boolean;
              multiline?: boolean;
          }
        | { type: "method-chain"; calls: MethodCall[] }
        | { type: "function-call"; function: string; args: Expression[]; multiline?: boolean }
        | { type: "await"; expression: Expression }
        | { type: "try"; expression: Expression }
        | { type: "ok"; value: Expression }
        | { type: "err"; value: Expression }
        | { type: "some"; value: Expression }
        | { type: "none" }
        | { type: "string-literal"; value: string }
        | { type: "number-literal"; value: number }
        | { type: "float-literal"; value: number }
        | { type: "boolean-literal"; value: boolean }
        | { type: "format-string"; template: string; args: Expression[] }
        | { type: "vec-literal"; elements: Expression[] }
        | { type: "struct-literal"; name: string; fields: Array<{ name: string; value: Expression }> }
        | { type: "struct-construction"; typeName: string; fields: FieldAssignment[]; useDefault?: boolean }
        | { type: "reference-of"; inner: Expression; mutable?: boolean }
        | { type: "dereference"; inner: Expression }
        | { type: "clone"; expression: Expression }
        | { type: "if-let"; pattern: string; value: Expression; then: Expression; else_?: Expression }
        | { type: "if-condition"; condition: Expression; then: Expression; else_?: Expression }
        | { type: "block"; statements: Statement[]; result?: Expression }
        | { type: "tuple"; elements: Expression[] }
        | { type: "array"; elements: Expression[] }
        | { type: "macro-call"; name: string; args: Expression[] }
        | { type: "closure"; parameters: Array<{ name: string; type?: Type }>; body: Expression }
        | { type: "raw"; value: string };

    interface MethodCall {
        method: string;
        args: Expression[];
        isAsync?: boolean;
    }

    interface FieldAssignment {
        name: string;
        value: Expression;
    }
}

export class Expression extends AstNode {
    private constructor(private readonly args: Expression.Args) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.args.type) {
            case "reference":
                writer.write(this.args.name);
                break;

            case "self":
                writer.write("self");
                break;

            case "field-access":
                this.args.target.write(writer);
                writer.write(".");
                writer.write(this.args.field);
                break;

            case "method-call": {
                const methodArgs = this.args as Extract<Expression.Args, { type: "method-call" }>;
                methodArgs.target.write(writer);
                writer.write(".");
                writer.write(methodArgs.method);
                writer.write("(");

                if (methodArgs.multiline && methodArgs.args.length > 0) {
                    writer.newLine();
                    writer.indent();
                    methodArgs.args.forEach((arg, index) => {
                        if (index > 0) {
                            writer.write(",");
                            writer.newLine();
                        }
                        arg.write(writer);
                    });
                    writer.newLine();
                    writer.dedent();
                } else {
                    methodArgs.args.forEach((arg, index) => {
                        if (index > 0) {
                            writer.write(", ");
                        }
                        arg.write(writer);
                    });
                }

                writer.write(")");
                if (methodArgs.isAsync) {
                    writer.write(".await");
                }
                break;
            }

            case "method-chain": {
                const chainArgs = this.args as Extract<Expression.Args, { type: "method-chain" }>;
                chainArgs.calls.forEach((call, index) => {
                    if (index > 0) {
                        writer.write(".");
                    }
                    writer.write(call.method);
                    writer.write("(");
                    call.args.forEach((arg, argIndex) => {
                        if (argIndex > 0) {
                            writer.write(", ");
                        }
                        arg.write(writer);
                    });
                    writer.write(")");
                    if (call.isAsync) {
                        writer.write(".await");
                    }
                });
                break;
            }

            case "function-call": {
                const funcArgs = this.args as Extract<Expression.Args, { type: "function-call" }>;
                writer.write(funcArgs.function);
                writer.write("(");

                if (funcArgs.multiline && funcArgs.args.length > 0) {
                    writer.newLine();
                    writer.indent();
                    funcArgs.args.forEach((arg, index) => {
                        if (index > 0) {
                            writer.write(",");
                            writer.newLine();
                        }
                        arg.write(writer);
                    });
                    writer.newLine();
                    writer.dedent();
                } else {
                    funcArgs.args.forEach((arg, index) => {
                        if (index > 0) {
                            writer.write(", ");
                        }
                        arg.write(writer);
                    });
                }

                writer.write(")");
                break;
            }

            case "await":
                this.args.expression.write(writer);
                writer.write(".await");
                break;

            case "try":
                this.args.expression.write(writer);
                writer.write("?");
                break;

            case "ok":
                writer.write("Ok(");
                this.args.value.write(writer);
                writer.write(")");
                break;

            case "err":
                writer.write("Err(");
                this.args.value.write(writer);
                writer.write(")");
                break;

            case "some":
                writer.write("Some(");
                this.args.value.write(writer);
                writer.write(")");
                break;

            case "none":
                writer.write("None");
                break;

            case "string-literal":
                writer.write(JSON.stringify(this.args.value));
                break;

            case "number-literal":
                writer.write(this.args.value.toString());
                break;

            case "float-literal": {
                // Ensure float literal format: integers become "N.0" for Rust compatibility
                const floatValue = (this.args as Extract<Expression.Args, { type: "float-literal" }>).value;
                const floatStr = Number.isInteger(floatValue) ? `${floatValue}.0` : floatValue.toString();
                writer.write(floatStr);
                break;
            }

            case "boolean-literal":
                writer.write(this.args.value.toString());
                break;

            case "format-string":
                writer.write("format!(");
                writer.write(JSON.stringify(this.args.template));
                this.args.args.forEach((arg) => {
                    writer.write(", ");
                    arg.write(writer);
                });
                writer.write(")");
                break;

            case "vec-literal":
                writer.write("vec![");
                this.args.elements.forEach((elem, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elem.write(writer);
                });
                writer.write("]");
                break;

            case "struct-literal":
                writer.write(this.args.name);
                writer.write(" { ");
                this.args.fields.forEach((field, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    writer.write(field.name);
                    writer.write(": ");
                    field.value.write(writer);
                });
                writer.write(" }");
                break;

            case "struct-construction": {
                const constructArgs = this.args as Extract<Expression.Args, { type: "struct-construction" }>;
                writer.write(constructArgs.typeName);
                writer.write(" {");
                if (constructArgs.fields.length > 0 || constructArgs.useDefault) {
                    writer.newLine();
                    writer.indent();
                    constructArgs.fields.forEach((field, index) => {
                        writer.write(field.name);
                        writer.write(": ");
                        field.value.write(writer);
                        if (index < constructArgs.fields.length - 1 || constructArgs.useDefault) {
                            writer.write(",");
                        }
                        writer.newLine();
                    });
                    if (constructArgs.useDefault) {
                        writer.write("..Default::default()");
                        writer.newLine();
                    }
                    writer.dedent();
                }
                writer.write("}");
                break;
            }

            case "reference-of": {
                const refArgs = this.args as Extract<Expression.Args, { type: "reference-of" }>;
                writer.write("&");
                if (refArgs.mutable) {
                    writer.write("mut ");
                }
                refArgs.inner.write(writer);
                break;
            }

            case "dereference": {
                const derefArgs = this.args as Extract<Expression.Args, { type: "dereference" }>;
                writer.write("*");
                derefArgs.inner.write(writer);
                break;
            }

            case "clone": {
                const cloneArgs = this.args as Extract<Expression.Args, { type: "clone" }>;
                cloneArgs.expression.write(writer);
                writer.write(".clone()");
                break;
            }

            case "if-let": {
                const ifLetArgs = this.args as Extract<Expression.Args, { type: "if-let" }>;
                writer.write("if let ");
                writer.write(ifLetArgs.pattern);
                writer.write(" = ");
                ifLetArgs.value.write(writer);
                writer.write(" { ");
                ifLetArgs.then.write(writer);
                writer.write(" }");
                if (ifLetArgs.else_) {
                    writer.write(" else { ");
                    ifLetArgs.else_.write(writer);
                    writer.write(" }");
                }
                break;
            }

            case "if-condition": {
                const ifArgs = this.args as Extract<Expression.Args, { type: "if-condition" }>;
                writer.write("if ");
                ifArgs.condition.write(writer);
                writer.write(" { ");
                ifArgs.then.write(writer);
                writer.write(" }");
                if (ifArgs.else_) {
                    writer.write(" else { ");
                    ifArgs.else_.write(writer);
                    writer.write(" }");
                }
                break;
            }

            case "block": {
                const blockArgs = this.args as Extract<Expression.Args, { type: "block" }>;
                writer.write("{ ");
                if (blockArgs.statements.length > 0) {
                    writer.newLine();
                    writer.indent();
                    blockArgs.statements.forEach((stmt) => {
                        // @ts-ignore - Statement write method exists
                        stmt.write(writer);
                        writer.newLine();
                    });
                    if (blockArgs.result) {
                        blockArgs.result.write(writer);
                        writer.newLine();
                    }
                    writer.dedent();
                } else if (blockArgs.result) {
                    blockArgs.result.write(writer);
                }
                writer.write(" }");
                break;
            }

            case "tuple": {
                const tupleArgs = this.args as Extract<Expression.Args, { type: "tuple" }>;
                writer.write("(");
                tupleArgs.elements.forEach((elem, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elem.write(writer);
                });
                writer.write(")");
                break;
            }

            case "array": {
                const arrayArgs = this.args as Extract<Expression.Args, { type: "array" }>;
                writer.write("[");
                arrayArgs.elements.forEach((elem, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    elem.write(writer);
                });
                writer.write("]");
                break;
            }

            case "macro-call": {
                const macroArgs = this.args as Extract<Expression.Args, { type: "macro-call" }>;
                writer.write(macroArgs.name);
                writer.write("!(");
                macroArgs.args.forEach((arg, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    arg.write(writer);
                });
                writer.write(")");
                break;
            }

            case "closure": {
                const closureArgs = this.args as Extract<Expression.Args, { type: "closure" }>;
                writer.write("|");
                closureArgs.parameters.forEach((param, index) => {
                    if (index > 0) {
                        writer.write(", ");
                    }
                    writer.write(param.name);
                    if (param.type) {
                        writer.write(": ");
                        param.type.write(writer);
                    }
                });
                writer.write("| ");
                closureArgs.body.write(writer);
                break;
            }

            case "raw": {
                const rawArgs = this.args as Extract<Expression.Args, { type: "raw" }>;
                writer.write(rawArgs.value);
                break;
            }
        }
    }

    // Factory methods
    public static reference(name: string): Expression {
        return new Expression({ type: "reference", name });
    }

    public static variable(name: string): Expression {
        return Expression.reference(name);
    }

    public static self(): Expression {
        return new Expression({ type: "self" });
    }

    public static fieldAccess(target: Expression, field: string): Expression {
        return new Expression({ type: "field-access", target, field });
    }

    public static methodCall(args: {
        target: Expression;
        method: string;
        args: Expression[];
        isAsync?: boolean;
        multiline?: boolean;
    }): Expression {
        return new Expression({
            type: "method-call",
            target: args.target,
            method: args.method,
            args: args.args,
            isAsync: args.isAsync,
            multiline: args.multiline
        });
    }

    public static methodChain(base: Expression, calls: Expression.MethodCall[]): Expression {
        // Start with the base expression and chain method calls
        let result = base;
        for (const call of calls) {
            result = Expression.methodCall({
                target: result,
                method: call.method,
                args: call.args,
                isAsync: call.isAsync
            });
        }
        return result;
    }

    public static functionCall(func: string, args: Expression[], multiline = false): Expression {
        return new Expression({ type: "function-call", function: func, args, multiline });
    }

    public static await(expression: Expression): Expression {
        return new Expression({ type: "await", expression });
    }

    public static try(expression: Expression): Expression {
        return new Expression({ type: "try", expression });
    }

    public static ok(value: Expression): Expression {
        return new Expression({ type: "ok", value });
    }

    public static err(value: Expression): Expression {
        return new Expression({ type: "err", value });
    }

    public static some(value: Expression): Expression {
        return new Expression({ type: "some", value });
    }

    public static none(): Expression {
        return new Expression({ type: "none" });
    }

    public static stringLiteral(value: string): Expression {
        return new Expression({ type: "string-literal", value });
    }

    public static literal(value: string): Expression {
        return Expression.stringLiteral(value);
    }

    public static numberLiteral(value: number): Expression {
        return new Expression({ type: "number-literal", value });
    }

    public static floatLiteral(value: number): Expression {
        return new Expression({ type: "float-literal", value });
    }

    public static booleanLiteral(value: boolean): Expression {
        return new Expression({ type: "boolean-literal", value });
    }

    public static formatString(template: string, args: Expression[]): Expression {
        return new Expression({ type: "format-string", template, args });
    }

    public static vec(elements: Expression[]): Expression {
        return new Expression({ type: "vec-literal", elements });
    }

    public static structLiteral(name: string, fields: Array<{ name: string; value: Expression }>): Expression {
        return new Expression({ type: "struct-literal", name, fields });
    }

    public static structConstruction(
        typeName: string,
        fields: Expression.FieldAssignment[],
        useDefault?: boolean
    ): Expression {
        return new Expression({ type: "struct-construction", typeName, fields, useDefault });
    }

    public static referenceOf(inner: Expression, mutable?: boolean): Expression {
        return new Expression({ type: "reference-of", inner, mutable });
    }

    public static clone(expression: Expression): Expression {
        return new Expression({ type: "clone", expression });
    }

    public static dereference(inner: Expression): Expression {
        return new Expression({ type: "dereference", inner });
    }

    public static ifLet(pattern: string, value: Expression, then: Expression, else_?: Expression): Expression {
        return new Expression({ type: "if-let", pattern, value, then, else_ });
    }

    public static ifCondition(condition: Expression, then: Expression, else_?: Expression): Expression {
        return new Expression({ type: "if-condition", condition, then, else_ });
    }

    public static block(statements: Statement[], result?: Expression): Expression {
        return new Expression({ type: "block", statements, result });
    }

    public static tuple(elements: Expression[]): Expression {
        return new Expression({ type: "tuple", elements });
    }

    public static array(elements: Expression[]): Expression {
        return new Expression({ type: "array", elements });
    }

    public static macroCall(name: string, args: Expression[]): Expression {
        return new Expression({ type: "macro-call", name, args });
    }

    public static closure(parameters: Array<{ name: string; type?: Type }>, body: Expression): Expression {
        return new Expression({ type: "closure", parameters, body });
    }

    public static raw(value: string): Expression {
        return new Expression({ type: "raw", value });
    }

    // Convenience methods for common patterns
    public static unwrapOr(expression: Expression, defaultValue: Expression): Expression {
        return Expression.methodCall({
            target: expression,
            method: "unwrap_or",
            args: [defaultValue]
        });
    }

    public static toString(expression: Expression): Expression {
        return Expression.methodCall({
            target: expression,
            method: "to_string",
            args: []
        });
    }

    public static andThen(expression: Expression, closure: Expression): Expression {
        return Expression.methodCall({
            target: expression,
            method: "and_then",
            args: [closure]
        });
    }

    public static map(expression: Expression, closure: Expression): Expression {
        return Expression.methodCall({
            target: expression,
            method: "map",
            args: [closure]
        });
    }
}
