import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Type } from "./Type";

export declare namespace Expression {
    type Args = 
        | { type: "reference"; name: string }
        | { type: "self" }
        | { type: "field-access"; target: Expression; field: string }
        | { type: "method-call"; target: Expression; method: string; args: Expression[]; isAsync?: boolean }
        | { type: "function-call"; function: string; args: Expression[] }
        | { type: "await"; expression: Expression }
        | { type: "try"; expression: Expression }
        | { type: "ok"; value: Expression }
        | { type: "err"; value: Expression }
        | { type: "some"; value: Expression }
        | { type: "none" }
        | { type: "string-literal"; value: string }
        | { type: "format-string"; template: string; args: Expression[] }
        | { type: "vec-literal"; elements: Expression[] }
        | { type: "struct-literal"; name: string; fields: Array<{ name: string; value: Expression }> }
        | { type: "reference-of"; inner: Expression; mutable?: boolean }
        | { type: "clone"; expression: Expression }
        | { type: "raw"; value: string };
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
            
            case "method-call":
                this.args.target.write(writer);
                writer.write(".");
                writer.write(this.args.method);
                writer.write("(");
                this.args.args.forEach((arg, index) => {
                    if (index > 0) writer.write(", ");
                    arg.write(writer);
                });
                writer.write(")");
                if (this.args.isAsync) {
                    writer.write(".await");
                }
                break;
            
            case "function-call":
                writer.write(this.args.function);
                writer.write("(");
                this.args.args.forEach((arg, index) => {
                    if (index > 0) writer.write(", ");
                    arg.write(writer);
                });
                writer.write(")");
                break;
            
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
            
            case "format-string":
                writer.write("format!(");
                writer.write(JSON.stringify(this.args.template));
                this.args.args.forEach(arg => {
                    writer.write(", ");
                    arg.write(writer);
                });
                writer.write(")");
                break;
            
            case "vec-literal":
                writer.write("vec![");
                this.args.elements.forEach((elem, index) => {
                    if (index > 0) writer.write(", ");
                    elem.write(writer);
                });
                writer.write("]");
                break;
            
            case "struct-literal":
                writer.write(this.args.name);
                writer.write(" { ");
                this.args.fields.forEach((field, index) => {
                    if (index > 0) writer.write(", ");
                    writer.write(field.name);
                    writer.write(": ");
                    field.value.write(writer);
                });
                writer.write(" }");
                break;
            
            case "reference-of":
                writer.write("&");
                if (this.args.mutable) writer.write("mut ");
                this.args.inner.write(writer);
                break;
            
            case "clone":
                this.args.expression.write(writer);
                writer.write(".clone()");
                break;
            
            case "raw":
                writer.write(this.args.value);
                break;
        }
    }

    // Factory methods
    public static reference(name: string): Expression {
        return new Expression({ type: "reference", name });
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
        isAsync?: boolean 
    }): Expression {
        return new Expression({ 
            type: "method-call", 
            target: args.target, 
            method: args.method, 
            args: args.args,
            isAsync: args.isAsync
        });
    }

    public static functionCall(func: string, args: Expression[]): Expression {
        return new Expression({ type: "function-call", function: func, args });
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

    public static formatString(template: string, args: Expression[]): Expression {
        return new Expression({ type: "format-string", template, args });
    }

    public static vec(elements: Expression[]): Expression {
        return new Expression({ type: "vec-literal", elements });
    }

    public static structLiteral(name: string, fields: Array<{ name: string; value: Expression }>): Expression {
        return new Expression({ type: "struct-literal", name, fields });
    }

    public static referenceOf(inner: Expression, mutable?: boolean): Expression {
        return new Expression({ type: "reference-of", inner, mutable });
    }

    public static clone(expression: Expression): Expression {
        return new Expression({ type: "clone", expression });
    }

    public static raw(value: string): Expression {
        return new Expression({ type: "raw", value });
    }
} 