import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Expression } from "./Expression";

export declare namespace Pattern {
    type Args =
        | { type: "literal"; value: string | number | boolean }
        | { type: "wildcard" }
        | { type: "variable"; name: string }
        | { type: "some"; inner: Pattern }
        | { type: "none" }
        | { type: "ok"; inner: Pattern }
        | { type: "err"; inner: Pattern }
        | { type: "struct"; name: string; fields: PatternField[] }
        | { type: "tuple"; elements: Pattern[] }
        | { type: "reference"; inner: Pattern; mutable?: boolean }
        | { type: "slice"; elements: Pattern[] }
        | { type: "range"; start: string | number; end: string | number; inclusive?: boolean }
        | { type: "raw"; value: string };

    interface PatternField {
        name: string;
        pattern?: Pattern; // If undefined, uses shorthand syntax
    }
}

export class Pattern extends AstNode {
    private constructor(private readonly args: Pattern.Args) {
        super();
    }

    public write(writer: Writer): void {
        switch (this.args.type) {
            case "literal":
                if (typeof this.args.value === "string") {
                    writer.write(JSON.stringify(this.args.value));
                } else {
                    writer.write(this.args.value.toString());
                }
                break;

            case "wildcard":
                writer.write("_");
                break;

            case "variable":
                writer.write(this.args.name);
                break;

            case "some":
                writer.write("Some(");
                this.args.inner.write(writer);
                writer.write(")");
                break;

            case "none":
                writer.write("None");
                break;

            case "ok":
                writer.write("Ok(");
                this.args.inner.write(writer);
                writer.write(")");
                break;

            case "err":
                writer.write("Err(");
                this.args.inner.write(writer);
                writer.write(")");
                break;

            case "struct": {
                const structArgs = this.args as Extract<Pattern.Args, { type: "struct" }>;
                writer.write(structArgs.name);
                if (structArgs.fields.length > 0) {
                    writer.write(" { ");
                    structArgs.fields.forEach((field, index) => {
                        if (index > 0) writer.write(", ");
                        writer.write(field.name);
                        if (field.pattern) {
                            writer.write(": ");
                            field.pattern.write(writer);
                        }
                    });
                    writer.write(" }");
                }
                break;
            }

            case "tuple": {
                const tupleArgs = this.args as Extract<Pattern.Args, { type: "tuple" }>;
                writer.write("(");
                tupleArgs.elements.forEach((elem, index) => {
                    if (index > 0) writer.write(", ");
                    elem.write(writer);
                });
                writer.write(")");
                break;
            }

            case "reference": {
                const refArgs = this.args as Extract<Pattern.Args, { type: "reference" }>;
                writer.write("&");
                if (refArgs.mutable) writer.write("mut ");
                refArgs.inner.write(writer);
                break;
            }

            case "slice": {
                const sliceArgs = this.args as Extract<Pattern.Args, { type: "slice" }>;
                writer.write("[");
                sliceArgs.elements.forEach((elem, index) => {
                    if (index > 0) writer.write(", ");
                    elem.write(writer);
                });
                writer.write("]");
                break;
            }

            case "range": {
                const rangeArgs = this.args as Extract<Pattern.Args, { type: "range" }>;
                writer.write(rangeArgs.start.toString());
                writer.write(rangeArgs.inclusive ? "..=" : "..");
                writer.write(rangeArgs.end.toString());
                break;
            }

            case "raw":
                writer.write(this.args.value);
                break;
        }
    }

    // Factory methods
    public static literal(value: string | number | boolean): Pattern {
        return new Pattern({ type: "literal", value });
    }

    public static wildcard(): Pattern {
        return new Pattern({ type: "wildcard" });
    }

    public static variable(name: string): Pattern {
        return new Pattern({ type: "variable", name });
    }

    public static some(inner: Pattern): Pattern {
        return new Pattern({ type: "some", inner });
    }

    public static none(): Pattern {
        return new Pattern({ type: "none" });
    }

    public static ok(inner: Pattern): Pattern {
        return new Pattern({ type: "ok", inner });
    }

    public static err(inner: Pattern): Pattern {
        return new Pattern({ type: "err", inner });
    }

    public static struct(name: string, fields: Pattern.PatternField[]): Pattern {
        return new Pattern({ type: "struct", name, fields });
    }

    public static tuple(elements: Pattern[]): Pattern {
        return new Pattern({ type: "tuple", elements });
    }

    public static reference(inner: Pattern, mutable?: boolean): Pattern {
        return new Pattern({ type: "reference", inner, mutable });
    }

    public static slice(elements: Pattern[]): Pattern {
        return new Pattern({ type: "slice", elements });
    }

    public static range(start: string | number, end: string | number, inclusive = false): Pattern {
        return new Pattern({ type: "range", start, end, inclusive });
    }

    public static raw(value: string): Pattern {
        return new Pattern({ type: "raw", value });
    }
}
