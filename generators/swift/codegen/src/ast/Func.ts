import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { AccessLevel, FunctionModifier, Param } from "../swift";

export declare namespace Func {
    interface Args {
        accessLevel?: AccessLevel,
        modifier?: FunctionModifier,
        name: string,
        params?: Param[];
        async?: "async";
        throws?: "throws";
        returnObject?: string;
    }
}

export class Func extends AstNode {

    public readonly accessLevel?: AccessLevel;
    public readonly modifier?: FunctionModifier;
    public readonly name: string;
    public readonly params?: Param[];
    public readonly async?: "async";
    public readonly throws?: "throws";
    public readonly returnObject?: string;

    constructor({ 
        accessLevel = undefined,
        modifier = undefined,
        name,
        params,
        async,
        throws,
        returnObject,
    }: Func.Args) {
        super(Swift.indentSize);
        this.accessLevel = accessLevel;
        this.modifier = modifier,
        this.name = name,
        this.params = params;
        this.async = async;
        this.throws = throws;
        this.returnObject = returnObject;
    }
 
    public write(writer: Writer): void {

        let parameters = "";

        if (this.params) {
            parameters = this.params.map(param => param.toString()).join(", ");
        }

        const func = `${this.name}(${parameters})`;

        const result = this.returnObject ? `-> ${this.returnObject}` : undefined;

        writer.openBlock([this.accessLevel, this.modifier, "func", func, this.async, this.throws, result], "{", () => {
            writer.write("print(\"Hey!\")");
        }, "}");

    }
    
}
