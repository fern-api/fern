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
        generics?: (csharp.Type | csharp.TypeParameter)[];
        /* Whether or not the class reference should be fully-qualified */
        fullyQualified?: boolean;
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly namespace: string;
    public readonly namespaceAlias: string | undefined;
    public readonly generics: (csharp.Type | csharp.TypeParameter)[];
    public readonly fullyQualified: boolean;
    private readonly namespaceSegments: string[];

    constructor({ name, namespace, namespaceAlias, generics, fullyQualified }: ClassReference.Args) {
        super();
        this.name = name;
        this.namespace = namespace;
        this.namespaceAlias = namespaceAlias;
        this.generics = generics ?? [];
        this.fullyQualified = fullyQualified ?? false;
        this.namespaceSegments = namespace.split(".");
    }

    public write(writer: Writer): void {
        this.writeInternal(writer, false);
    }

    public writeAsAttribute(writer: Writer): void {
        this.writeInternal(writer, true);
    }

    private writeInternal(writer: Writer, isAttribute: boolean): void {
        if (this.namespaceAlias != null) {
            const alias = writer.addNamespaceAlias(this.namespaceAlias, this.namespace);
            writer.write(`${alias}.${this.name}`);
        } else if (this.fullyQualified) {
            writer.addReference(this);
            writer.write(`${this.namespace}.${this.name}`);
        } else if (this.qualifiedTypeNameRequired(writer, isAttribute)) {
            const typeQualification = this.getTypeQualification({
                classReferenceNamespace: this.namespace,
                namespaceToBeWrittenTo: writer.getNamespace(),
                isAttribute
            });
            writer.write(`${typeQualification}${this.name}`);
        } else if (writer.skipImports) {
            const typeQualification = this.getTypeQualification({
                classReferenceNamespace: this.namespace,
                namespaceToBeWrittenTo: writer.getNamespace(),
                isAttribute
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
    /**
     * Fast check for naming conflicts between class name and namespace segments
     */
    private hasNamespaceConflict(className: string, currentNamespace: string): boolean {
        // Fast path: check last segment first (most common case)
        const lastDotIndex = currentNamespace.lastIndexOf(".");
        const lastSegment = lastDotIndex === -1 ? currentNamespace : currentNamespace.substring(lastDotIndex + 1);

        if (lastSegment === className) {
            return true;
        }

        // Check if class name matches any segment in the CURRENT namespace
        // (not the target namespace - that's what we're trying to reference)
        const currentNamespaceSegments = currentNamespace.split(".");
        return currentNamespaceSegments.includes(className);
    }

    private getTypeQualification({
        classReferenceNamespace,
        namespaceToBeWrittenTo,
        isAttribute
    }: {
        classReferenceNamespace: string;
        namespaceToBeWrittenTo: string;
        isAttribute?: boolean;
    }): string {
        // If the class is in the exact same namespace, no qualification needed
        if (classReferenceNamespace === namespaceToBeWrittenTo) {
            return "";
        }

        // Check if we can use a shorter qualification by checking if the target namespace
        // is a child of the current namespace - in this case, minimal qualification is preferred
        if (classReferenceNamespace.startsWith(namespaceToBeWrittenTo + ".")) {
            // The target is a child namespace, so we only need the relative path
            const relativePath = classReferenceNamespace.substring(namespaceToBeWrittenTo.length + 1);
            return `${relativePath}.`;
        }

        // Check for sibling namespaces with common root - use minimal qualification
        const nameToCheck = isAttribute && !this.name.endsWith("Attribute") ? `${this.name}Attribute` : this.name;
        const hasConflict = this.hasNamespaceConflict(nameToCheck, namespaceToBeWrittenTo);

        if (hasConflict) {
            // If there's a namespace conflict, use full qualification
            // Only use global:: when the entire namespace is just the class name
            if (namespaceToBeWrittenTo.indexOf(".") === -1 && namespaceToBeWrittenTo === nameToCheck) {
                return `global::${classReferenceNamespace}.`;
            }
            return `${classReferenceNamespace}.`;
        }

        // Find the common root and use minimal qualification from divergence point
        const classReferenceSegments = this.namespaceSegments;
        const namespaceToBeWrittenSegments = namespaceToBeWrittenTo.split(".");

        let commonPrefixLength = 0;
        const minLength = Math.min(classReferenceSegments.length, namespaceToBeWrittenSegments.length);
        while (
            commonPrefixLength < minLength &&
            classReferenceSegments[commonPrefixLength] === namespaceToBeWrittenSegments[commonPrefixLength]
        ) {
            commonPrefixLength++;
        }

        // If we have a common root, use qualification from divergence point
        if (commonPrefixLength > 0 && commonPrefixLength < classReferenceSegments.length) {
            const remainingSegments = classReferenceSegments.slice(commonPrefixLength);
            return `${remainingSegments.join(".")}.`;
        }

        // No common prefix or we're referencing the exact namespace, use full qualification
        return `${classReferenceNamespace}.`;
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
    private qualifiedTypeNameRequired(writer: Writer, isAttribute: boolean): boolean {
        const currentNamespace = writer.getNamespace();

        if (this.namespace === currentNamespace) {
            return false;
        }

        const nameToDeconflict = isAttribute && !this.name.endsWith("Attribute") ? `${this.name}Attribute` : this.name;

        // Check for direct namespace conflicts first
        if (this.hasNamespaceConflict(nameToDeconflict, currentNamespace)) {
            return true;
        }

        // For child namespaces (like SeedCsharpNamespaceConflict.A.Aa from SeedCsharpNamespaceConflict.A),
        // we generally don't need qualification unless there's a specific conflict
        if (this.namespace.startsWith(currentNamespace + ".")) {
            // Only require qualification if there's an actual naming conflict
            return this.potentialConflictWithGeneratedType(writer);
        }

        // Check for potential conflicts with generated types regardless of namespace
        // This handles both internal and external types consistently
        return this.potentialConflictWithGeneratedType(writer);
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

        if (matchingNamespacesCopy.size === 0) {
            // Even if there's no type conflict, check for namespace conflicts
            // This handles cases like class "A" conflicting with namespace "A"
            return this.hasProjectNamespaceConflict(writer);
        }

        const currentNamespace = writer.getNamespace();
        // Check if any of the conflicting namespaces would actually cause ambiguity
        for (const conflictingNamespace of matchingNamespacesCopy) {
            // Only consider it a real conflict if the conflicting type is in the same namespace
            // or a parent namespace that would make qualification ambiguous
            if (conflictingNamespace === currentNamespace || currentNamespace.startsWith(conflictingNamespace + ".")) {
                return true;
            }
        }

        // Also check if the class name matches any namespace segment in the project
        return this.hasProjectNamespaceConflict(writer);
    }

    private hasProjectNamespaceConflict(writer: Writer): boolean {
        const allNamespaceSegments = writer.getAllNamespaceSegments();
        return allNamespaceSegments.has(this.name);
    }

    public toQualified(): ClassReference {
        return new ClassReference({
            name: this.name,
            namespace: this.namespace,
            namespaceAlias: this.namespaceAlias,
            generics: this.generics,
            fullyQualified: true
        });
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
