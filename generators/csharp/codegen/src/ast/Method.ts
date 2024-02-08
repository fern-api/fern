import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Parameter } from "./Parameter";
import { Type } from "./Type";

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The access of the method */
        access: Access;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The return type of the method */
        return: Type;
        /* Defaults to false */
        body: string | ((writer: Writer) => void);
        /* Docs for the method */
        docs: string | undefined;
    }


}

/* A C# class */
export class Method extends AstNode {
    private parameters: Parameter[] = [];

    constructor(private readonly args: Method.Args) {
        super();
    }

    public addParameter(parameter: Parameter): void {
        this.parameters.push(parameter);
    }

    protected write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
