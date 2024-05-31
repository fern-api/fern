import { csharp } from "..";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class*/
        namespace: string;
        /* Any generics used in the class reference */
        generics?: csharp.Type[];
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly generics: csharp.Type[];

    constructor({ name, namespace, generics }: ClassReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.generics = generics ?? [];
    }

    public write(writer: Writer): void {
        writer.addReference(this);
        writer.write(`${this.name}`);
        if (this.generics != null && this.generics.length > 0) {
            writer.write("<");
            this.generics.forEach((generic, idx) => {
                writer.writeNode(generic);
                if (idx < this.generics.length - 1) {
                    writer.write(", ");
                }
            });
            writer.write(">");
        }
    }
}

export const OneOfClassReference = new ClassReference({
    name: "OneOf",
    namespace: "OneOf"
});

// TODO: remove this in favor of the one in PrebuiltUtilities
export const StringEnumClassReference = new ClassReference({
    name: "StringEnum",
    namespace: "StringEnum"
});
