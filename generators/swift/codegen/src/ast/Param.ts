import { AstNode, Writer } from "@fern-api/generator-commons";
import Swift, { SwiftClass } from "..";

/*

Builds Swift Params
===================

Example:

number: Int = 4

Breakdown:

{title}: {type} = {defaultValue}

*/

export declare namespace Param {
    interface Args {
        /* param name */
        title: string;
        /* Type of the value */
        class: SwiftClass;
        /* Original value. Optional because it may not exist */
        defaultValue?: string;
    }
}

export class Param extends AstNode {

    public readonly title: string;
    public readonly type: SwiftClass;
    public readonly defaultValue?: string; // TODO

    constructor(args: Param.Args) {
        super(Swift.indentSize);
        this.title = args.title;
        this.type = args.class;
        this.defaultValue = args.defaultValue;
    }

    public write(writer: Writer): void {
        let title = [`${this.title}:`, this.type].join(" ");

        // if (this.defaultValue) {
        //     title += ` = ${this.defaultValue}`;
        // }

        if (this.defaultValue) {
            title += " =  FIX THIS";
        }

        writer.write(title);
        
    }
    
}
