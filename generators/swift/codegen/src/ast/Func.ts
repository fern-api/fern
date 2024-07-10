import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, FunctionModifier, Param, Type } from "../swift";

/*

Builds Swift Functions

Example:

func addNumbers(a: Int, b: Int) -> Int {
    return a + b
}

*/

export declare namespace Func {
    interface Args {
        accessLevel?: AccessLevel,
        modifier?: FunctionModifier,
        name: string,
        params?: Param[];
        async?: boolean;
        throws?: boolean;
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

    constructor({ 
        accessLevel,
        modifier,
        name,
        params,
        async,
        throws,
        returnType,
    }: Func.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.modifier = modifier,
        this.name = name,
        this.params = params;
        this.async = async ?? false;
        this.throws = throws ?? false;
        this.returnType = returnType;
    }
 
    public write(writer: Writer): void {

        let parameters = "";

        if (this.params) {
            parameters = this.params.map(param => param.toString()).join(", ");
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

        writer.openBlock([this.accessLevel, this.modifier, "func", func, ...trailingModifiers, result], "{", () => {
            writer.write("print(\"Hey!\")");
        }, "}");

    }
    
}
