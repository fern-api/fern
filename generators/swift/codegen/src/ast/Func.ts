import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, Class_, FunctionModifier, Param } from "..";

/*

Builds Swift Functions
======================

Example:

private static func addNumbers(a: Int, b: Int) -> Int {
    return a + b
}

Breakdown:

{accessLevel} {modifier} func {name}({params}) {async} {throws} -> {returnType} {
    ...
}

*/

export declare namespace Func {
    interface Args {
        /* The access level of the function */
        accessLevel?: AccessLevel;
        /* The modifier of the function, such as static or override */
        modifier?: FunctionModifier;
        /* The name of the function */
        name: string;
        /* The parameters of the function */
        params?: Param[];
        /* Indicates if the function is asynchronous */
        async?: boolean;
        /* Indicates if the function throws an error */
        throws?: boolean;
        /* The return type of the function */
        returnClass?: Class_;
    }
}

export class Func extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly modifier?: FunctionModifier;
    public readonly name: string;
    public readonly params?: Param[];
    public readonly async: boolean;
    public readonly throws: boolean;
    public readonly returnClass?: Class_;

    constructor(args: Func.Args) {
        super(Swift.indentSize);
        this.accessLevel = args.accessLevel;
        this.modifier = args.modifier,
        this.name = args.name,
        this.params = args.params;
        this.async = args.async ?? false;
        this.throws = args.throws ?? false;
        this.returnClass = args.returnClass;
    }
 
    public write(writer: Writer): void {

        let parameters = "";

        if (this.params) {
            parameters = this.params.map((param) => param.render()).join(", ");
        }

        const func = `${this.name}(${parameters})`;

        const result = this.returnClass ? `-> ${this.returnClass.name}` : undefined;

        // Attach trailing modifiers
        const trailingModifiers = [];
        if (this.async) {
            trailingModifiers.push("async");
        }
        if (this.throws) {
            trailingModifiers.push("throws");
        }

        writer.openBlock([this.accessLevel, this.modifier, "func", func, ...trailingModifiers, result], "{", () => {
            writer.write("print(\"Hey!\")");
        }, "}");

    }
    
}
