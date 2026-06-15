import { type Generation } from "../../context/generation-info.js";
import { AstNode } from "../core/index.js";
import { Writer } from "../core/Writer.js";
import { ClassReference } from "../types/ClassReference.js";
import { Type } from "../types/IType.js";
import { Annotation } from "./Annotation.js";

export declare namespace Parameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The type of the parameter */
        type: ClassReference | Type;
        /* Docs for the parameter */
        docs?: string;
        /* The initializer for the parameter */
        initializer?: string;
        ref?: boolean;
        out?: boolean;
        /* Attributes applied to the parameter (e.g. [EnumeratorCancellation]) */
        annotations?: Annotation[];
    }
}

export class Parameter extends AstNode {
    public readonly name: string;
    public readonly docs: string | undefined;
    public readonly initializer: string | undefined;
    public readonly type: Type;
    private readonly ref: boolean;
    private readonly out: boolean;
    private readonly annotations: Annotation[];

    constructor({ name, type, docs, initializer, ref, out, annotations }: Parameter.Args, generation: Generation) {
        super(generation);
        this.name = name;
        this.type = type;
        this.docs = docs;
        this.initializer = initializer;
        this.ref = ref ?? false;
        this.out = out ?? false;
        this.annotations = annotations ?? [];
    }

    public write(writer: Writer): void {
        for (const annotation of this.annotations) {
            writer.writeNode(annotation);
            writer.write(" ");
        }
        if (this.ref) {
            writer.write("ref ");
        }
        if (this.out) {
            writer.write("out ");
        }
        writer.writeNode(this.type);
        writer.write(` ${this.name}`);
        if (this.initializer != null) {
            writer.write(` = ${this.initializer}`);
        }
    }
}
