import { AstNode, Writer } from "@fern-api/generator-commons";
import Lang from "../lang";
import { AccessLevel } from "./AccessLevel";
import { FunctionModifier } from "./FunctionModifier";
import { Param } from "./Param";

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
        super(Lang.indentSize);
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

        const title = [this.accessLevel, this.modifier, "func", func, this.async, this.throws, result, "{"].filter(value => value !== undefined).join(" ");

        writer.write(title);

        writer.openIndent();
        writer.write("// CODE HERE");
        writer.closeIndent();

        writer.write("}");

    }
    
}
