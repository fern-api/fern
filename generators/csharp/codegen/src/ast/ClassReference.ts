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
            const typeQualification = this.getTypeQualification(this.namespace, writer.getNamespace());
            writer.write(`${typeQualification}${this.name}`);
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
     * Computes the type qualification starting at the point where the namespace of the type
     * differs from the namespace being written to.
     *
     * Example:
     * - classReferenceNamespace: Company.Employee.Engineer.Backend
     * - namespaceToBeWrittenTo: Company.Employee.Janitor
     *
     * Result: Engineer.Backend.
     */
    private getTypeQualification(classReferenceNamespace: string, namespaceToBeWrittenTo: string): string {
        const classReferenceSegments = classReferenceNamespace.split(".");
        const namespaceToBeWrittenSegments = namespaceToBeWrittenTo.split(".");

        let i = 0;
        // Find the length of the longest matching segment prefix
        while (
            i < classReferenceSegments.length &&
            i < namespaceToBeWrittenSegments.length &&
            classReferenceSegments[i] === namespaceToBeWrittenSegments[i]
        ) {
            i++;
        }
        // Join the remaining segments of 'classReferenceNamespace' after the matching prefix
        const typeQualification = classReferenceSegments.slice(i).join(".");
        return `${typeQualification}${typeQualification ? "." : ""}`;
    }

    /**
     * This method addresses an edge case involving namespace and type conflicts.
     * When a class name matches any segment of a namespace within the project, the .NET compiler
     * might require references to that class to be qualified to avoid conflicts.
     * The rules governing this behavior are complex, so this method errs on the side of caution
     * by performing a simple check.
     *
     * -- Exploration supporting this --
     *
     * LEGEND: <Class Name> -- <Namespace of Class>
     * SETUP: Company.Net is the root namespace (i.e., the project name).
     *
     * Full qualification required:
     * - Guarantor -- Company.Net.Guarantor.V1
     * - ImportInvoice -- Company.Net.ImportInvoice.V1
     * - ImportInvoice -- Company.Net.Guarantor.V1 (if Candid.Net.ImportInvoice.V1 also exists)
     *
     * Qualification not required:
     * - V1 -- Company.Net.Guarantor.V1
     * - V1 -- Company.Net.Guarantor.V1.Types
     * - Net -- Company.Net
     */
    private qualifiedTypeNameRequired(writer: Writer): boolean {
        return (
            writer.getAllNamespaceSegmentsAndTypes().has(this.name) ||
            Array.from(writer.getAllNamespaceSegmentsAndTypes()).find(
                (thing) =>
                    thing instanceof ClassReference && thing.name === this.name && thing.namespace !== this.namespace
            ) != null
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
