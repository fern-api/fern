import { csharp } from "..";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassReference {
    interface Args {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class */
        namespace: string;
        /* The namespace alias for C# class */
        namespaceAlias?: string;
        /* Any generics used in the class reference */
        generics?: csharp.Type[];
        /* Whether or not the class reference should be fully-qualified */
        fullyQualified?: boolean;
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly namespaceAlias: string | undefined;
    public readonly generics: csharp.Type[];
    public readonly fullyQualified: boolean;

    constructor({ name, namespace, namespaceAlias, generics, fullyQualified }: ClassReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.namespaceAlias = namespaceAlias;
        this.generics = generics ?? [];
        this.fullyQualified = fullyQualified ?? false;
    }

    public write(writer: Writer): void {
        if (this.namespaceAlias != null) {
            const alias = writer.addNamespaceAlias(this.namespaceAlias, this.namespace);
            writer.write(`${alias}.${this.name}`);
        } else if (this.fullyQualified) {
            writer.addReference(this);
            writer.write(`${this.namespace}.${this.name}`);
        } else if (this.qualifiedTypeNameRequired(writer)) {
            const typeQualification = this.getTypeQualification({
                classReferenceNamespace: this.namespace,
                namespaceToBeWrittenTo: writer.getNamespace()
            });
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
    private getTypeQualification({
        classReferenceNamespace,
        namespaceToBeWrittenTo
    }: {
        classReferenceNamespace: string;
        namespaceToBeWrittenTo: string;
    }): string {
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
        return this.potentialConflictWithNamespaceSegment(writer) || this.potentialConflictWithGeneratedType(writer);
    }

    private potentialConflictWithNamespaceSegment(writer: Writer) {
        return writer.getAllNamespaceSegments().has(this.name);
    }

    private potentialConflictWithGeneratedType(writer: Writer) {
        const matchingNamespaces = writer.getAllTypeClassReferences().get(this.name);
        if (matchingNamespaces == null) {
            return false;
        }
        // If there's a ClassReference besides the one that we're writing with the same name,
        // then there may be conflict, so return true
        const matchingNamespacesCopy = new Set(matchingNamespaces);
        matchingNamespacesCopy.delete(this.namespace);
        return matchingNamespacesCopy.size > 0;
    }
}

export const OneOfClassReference = new ClassReference({
    name: "OneOf",
    namespace: "OneOf"
});

export const OneOfBaseClassReference = new ClassReference({
    name: "OneOfBase",
    namespace: "OneOf"
});

// TODO: remove this in favor of the one in PrebuiltUtilities
export const StringEnumClassReference = new ClassReference({
    name: "StringEnum",
    namespace: "StringEnum"
});
