import { type Generation } from "../../context/generation-info.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";
import { type Expression } from "../language/Expression.js";
import { type ClassReference } from "../types/ClassReference.js";
import { type Type } from "../types/IType.js";

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
