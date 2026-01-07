import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { type ClassReference } from "../types/ClassReference";
import { type Annotation } from "./Annotation";

export declare namespace AnnotationGroup {
    interface Args {
        /* Annotations or references to the annotations in the group */
        items: (Annotation | ClassReference)[];
    }
}

export class AnnotationGroup extends AstNode {
    private items: (Annotation | ClassReference)[];

    constructor(args: AnnotationGroup.Args, generation: Generation) {
        super(generation);
        this.items = args.items;
    }

    public write(writer: Writer): void {
        if (this.items.length === 0) {
            return;
        }

        // Extract references from items and add them to writer
        for (const item of this.items) {
            const reference = this.getReference(item);
            writer.addReference(reference);
        }

        writer.write("[");
        for (let i = 0; i < this.items.length; i++) {
            if (i > 0) {
                writer.write(", ");
            }
            const reference = this.getReference(this.items[i]!);
            reference.writeAsAttribute(writer);
        }
        writer.write("]");
    }

    private getReference(item: Annotation | ClassReference): ClassReference {
        // If it's an Annotation, extract its reference
        if ("reference" in item && item.reference) {
            return item.reference as ClassReference;
        }
        // Otherwise it's already a ClassReference
        return item as ClassReference;
    }
}
