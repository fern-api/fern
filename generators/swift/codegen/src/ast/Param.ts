import Swift, { Type } from "..";
import { AstNode, Writer } from "./core";

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
        type: Type;
        /* Original value. Optional because it may not exist */
        defaultValue?: Type;
    }
}

export class Param extends AstNode {
    public readonly title: string;
    public readonly type: Type;
    public readonly defaultValue?: Type;

    constructor({ title, type, defaultValue }: Param.Args) {
        super();
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
            title += " =  FIX THIS";
        }

        writer.write(title);
    }
}
