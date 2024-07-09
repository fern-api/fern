import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, FunctionModifier, Param, Type } from "../swift";

export declare namespace Func {
    interface Args {
        accessLevel?: AccessLevel,
        modifier?: FunctionModifier,
        name: string,
        params?: Param[];
        async?: "async";
        throws?: "throws";
        returnType?: Type;
    }
}

export class Func extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly modifier?: FunctionModifier;
    public readonly name: string;
    public readonly params?: Param[];
    public readonly async?: "async";
    public readonly throws?: "throws";
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
        this.async = async;
        this.throws = throws;
        this.returnType = returnType;
    }
 
    public write(writer: Writer): void {

        let parameters = "";

        if (this.params) {
            parameters = this.params.map(param => param.toString()).join(", ");
        }

        const func = `${this.name}(${parameters})`;

        const result = this.returnType ? `-> ${this.returnType.name}` : undefined;

        writer.openBlock([this.accessLevel, this.modifier, "func", func, this.async, this.throws, result], "{", () => {
            writer.write("print(\"Hey!\")");
        }, "}");

    }
    
}
