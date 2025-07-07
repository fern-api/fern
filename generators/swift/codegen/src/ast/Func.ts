import Swift, { AccessLevel, FunctionModifier, Param, Type } from "..";
import { AstNode, Writer } from "./core";

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
        returnType?: Type;
    }
}

export class Func extends AstNode {
    public readonly accessLevel?: AccessLevel;
    public readonly modifier?: FunctionModifier;
    public readonly name: string;
    public readonly params?: Param[];
    public readonly async: boolean;
    public readonly throws: boolean;
    public readonly returnType?: Type;

    constructor({ accessLevel, modifier, name, params, async, throws, returnType }: Func.Args) {
        super();
        this.accessLevel = accessLevel;
        (this.modifier = modifier), (this.name = name), (this.params = params);
        this.async = async ?? false;
        this.throws = throws ?? false;
        this.returnType = returnType;
    }

    public write(writer: Writer): void {
        let parameters = "";

        if (this.params) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            parameters = this.params.map((param) => param.toString()).join(", ");
        }

        const func = `${this.name}(${parameters})`;

        const result = this.returnType ? `-> ${this.returnType.name}` : undefined;

        // Attach trailing modifiers
        const trailingModifiers = [];
        if (this.async) {
            trailingModifiers.push("async");
        }
        if (this.throws) {
            trailingModifiers.push("throws");
        }

        writer.openBlock(
            [this.accessLevel, this.modifier, "func", func, ...trailingModifiers, result],
            "{",
            () => {
                writer.write('print("Hey!")');
            },
            "}"
        );
    }
}
