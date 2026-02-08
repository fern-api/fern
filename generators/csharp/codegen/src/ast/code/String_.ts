import { type Generation } from "../../context/generation-info.js";
import { escapeForCSharpString } from "../../utils/escapeForCSharpString.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";

export declare namespace String_ {
    interface Args {
        string: string;
    }
}

export class String_ extends AstNode {
    private string: string;

    constructor(args: String_.Args, generation: Generation) {
        super(generation);
        this.string = args.string;
    }

    public write(writer: Writer): void {
        writer.write(`"${escapeForCSharpString(this.string)}"`);
    }
}
