import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { Type } from "../swift";

export declare namespace Param {
    interface Args {
        title: string;
        type: Type;
        defaultValue?: Type;
    }
}

export class Param extends AstNode {

    public readonly title: string;
    public readonly type: Type;
    public readonly defaultValue?: Type;

    constructor({ 
        title,
        type,
        defaultValue,
    }: Param.Args) {
        super(Swift.indentSize);
        this.title = title;
        this.type = type;
        this.defaultValue = defaultValue;
    }

    public write(writer: Writer): void {

        let title = [`${this.title}:`, this.type].join(" ");

        // if (this.defaultValue) {
        //     title += ` = ${this.defaultValue}`;
        // }

        if (this.defaultValue) {
            title += ` =  FIX THIS`;
        }

        writer.write(title);
        
    }
    
}
