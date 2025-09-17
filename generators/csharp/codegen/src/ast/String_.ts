import { escapeForCSharpString } from "..";
import { type CSharp } from "../csharp";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace String_ {
    interface Args {
        string: string;
    }
}

export class String_ extends AstNode {
    private string: string;

    constructor(args: String_.Args, csharp: CSharp) {
        super(csharp);
        this.string = args.string;
    }

    public write(writer: Writer): void {
        writer.write(`"${escapeForCSharpString(this.string)}"`);
    }
}
