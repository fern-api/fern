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
        if (this.qualifiedTypeNameRequired(writer)) {
            writer.write(`${this.namespace}.${this.name}`);
        } else {
            writer.addReference(this);
            writer.write(`${this.name}`);
        }
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

    /**
     *
     * This method is used to help address an edge case with namespace and type name imports. If a class name
     * matches a base namespace in the project, this name name must be fully qualified when referenced outside
     * of the base namespace where the class is defined.
     *
     *
     * -- Exploration supporting this --
     *
     * LEGEND: <Class name> -- <Namespace of class>
     * SETUP: Company.Net is the root namespace (the name of the project)
     *
     * Do require full qualification outside of their base namespace:
     * - Guarantor -- Company.Net.Guarantor.V1
     * - ImportInvoice -- Company.Net.ImportInvoice.V1
     * - ImportInvoice -- Company.Net.Guarantor.V1 (assuming Candid.Net.ImportInvoice.V1 also exists)
     *
     * Do not require full qualification outside of their base namespace:
     * - V1 -- Company.Net.Guarantor.V1
     * - V1 -- Company.Net.Guarantor.V1.Types
     * - Net -- Company.Net
     *
     */
    private qualifiedTypeNameRequired(writer: Writer): boolean {
        // ex: .Core
        const afterRootNamespace = this.namespace.slice(writer.getRootNamespace().length);
        // ex: Core
        const baseNamespace = `${afterRootNamespace.split(".")[1]}`;
        return (
            writer.getAllBaseNamespaces().has(this.name) &&
            // qualified type name not required if we're in the same base namespace as the conflicting type
            !writer.getNamespace()?.startsWith(`${writer.getRootNamespace()}.${baseNamespace}`)
        );
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
