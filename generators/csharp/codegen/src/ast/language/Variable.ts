import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { type Expression } from "../language/Expression";
import { type ClassReference } from "../types/ClassReference";
import { type Type } from "../types/Type";

export declare namespace Variable {
    interface Args {
        name: string;
        type: ClassReference | Type;
        initialValue: Expression;
    }
}

export class Variable extends AstNode {
    private name: string;
    private type?: ClassReference | Type;
    private initialValue: Expression;

    constructor(name: string, type: ClassReference | Type, initialValue: Expression, generation: Generation) {
        super(generation);
        this.name = name;
        this.type = type;
        this.initialValue = initialValue;
    }

    public write(writer: Writer): void {
        // nothing yet
    }
}
