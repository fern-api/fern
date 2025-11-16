import { fail } from "node:assert";
import { type Generation } from "../../context/generation-info";
import { type Origin } from "../../context/model-navigator";
import { type TypeScope } from "../../context/name-registry";
import { type ClassInstantiation } from "../code/ClassInstantiation";
import { Literal } from "../code/Literal";
import { Node } from "../core/AstNode";
import type { Writer } from "../core/Writer";
import { type Field } from "./Field";
import { Type } from "./IType";
import { Optional } from "./Type";

export declare namespace ClassReference {
    interface Identity {
        /* The name of the C# class */
        name: string;
        /* The namespace of the C# class */
        namespace?: string;
        /* The enclosing type of the C# class */
        enclosingType?: ClassReference;
    }

    interface Args extends Identity, Node.Args {
        /* The namespace alias for C# class */
        namespaceAlias?: string;
        /* Any generics used in the class reference */
        generics?: Type[];
        /* Whether or not the class reference should be fully-qualified */
        fullyQualified?: boolean;
        /* force global:: qualifier */
        global?: boolean;
        /* Whether or not the class reference is a collection */
        isCollection?: boolean;

        /**
         * The multipart form method name used when this type is added to a multipart/form-data request.
         * For example, primitives use "AddStringPart", while objects use "AddJsonPart".
         *
         * If this is null, then the type does not support adding to a multipart form.
         * If this is undefined, then the type supports adding to a multipart form, and the default method name is used.
         */
        multipartMethodName?: string | null;
        /**
         * The multipart form method name used when a collection of this type is added to a multipart/form-data request.
         * For example, primitives use "AddStringParts", while objects use "AddJsonParts".
         *
         * If this is null, then the type does not support adding to a multipart form.
         * If this is undefined, then the type supports adding to a multipart form, and the default method name is used.
         */
        multipartMethodNameForCollection?: string | null;

        /**
         * Whether or not the class reference is a reference type.
         * If this is undefined, then the type is indeterminate.
         * (interpreted as false, in a lot of cases, but sometimes it's used to see if it's a class reference)
         */
        isReferenceType?: boolean;
    }

    interface CreationArgs extends Args {
        /* the fully qualified name of the class reference */
        fullyQualifiedName: string;
    }
}

export class ClassReference extends Node implements Type {
    public readonly name: string;
    public readonly namespace: string;
    public readonly namespaceAlias: string | undefined;
    public readonly enclosingType: ClassReference | undefined;
    public readonly generics: Type[];
    public readonly fullyQualified: boolean;
    public readonly global: boolean;
    public readonly fullyQualifiedName: string;
    public readonly isCollection: boolean;
    private readonly namespaceSegments: string[];
    public readonly isReferenceType: boolean | undefined;
    public readonly multipartMethodName: string | null;
    public readonly multipartMethodNameForCollection: string | null;

    constructor(
        {
            name,
            namespace,
            namespaceAlias,
            enclosingType,
            generics,
            fullyQualified,
            global,
            fullyQualifiedName,
            origin,
            isCollection,
            multipartMethodName,
            multipartMethodNameForCollection,
            isReferenceType
        }: ClassReference.CreationArgs,
        readonly scope: TypeScope,
        generation: Generation
    ) {
        super(origin, generation);
        this.name = name;
        this.namespace = enclosingType?.namespace ?? namespace ?? "";
        this.namespaceAlias = namespaceAlias;
        this.enclosingType = enclosingType;
        this.generics = generics ?? [];
        this.fullyQualified = fullyQualified ?? false;
        this.global = global ?? false;
        this.namespaceSegments = this.namespace.split(".");
        this.isCollection = isCollection ?? false;
        if (enclosingType != null) {
            this.fullyQualifiedName = enclosingType.fullyQualifiedName
                ? `${enclosingType.fullyQualifiedName}.${name}`
                : name;
        } else {
            this.fullyQualifiedName = fullyQualifiedName ? fullyQualifiedName : name;
        }
        this.multipartMethodName = multipartMethodName === undefined ? "AddJsonPart" : multipartMethodName;
        this.multipartMethodNameForCollection =
            multipartMethodNameForCollection === undefined ? "AddJsonParts" : multipartMethodNameForCollection;
        this.isReferenceType = isReferenceType;
    }

    public write(writer: Writer): void {
        this.writeInternal(writer, false);
    }

    public writeAsAttribute(writer: Writer): void {
        this.writeInternal(writer, true);
    }

    public get scopedName() {
        return this.enclosingType ? `${this.enclosingType.name}.${this.name}` : this.name;
    }

    private writeInternal(writer: Writer, isAttribute: boolean): void {
        // if the name (or the enclosing type name) is ambiguous
        const isAmbiguous =
            this.registry.isAmbiguousTypeName(this.name) ||
            this.registry.isAmbiguousTypeName(this.enclosingType?.name) ||
            // check if the type is registered in another referenced namespace
            writer
                .getReferencedNamespaces()
                .some((each) => each !== this.namespace && this.registry.isRegisteredTypeName(`${each}.${this.name}`));

        const shouldGlobal =
            // if the type is global, then we need to globally qualify the type
            this.global ||
            // if the first segment in a FQN is ambiguous, then we need to globally qualify the type if it gets expanded
            this.registry.isAmbiguousTypeName(this.namespaceSegments[0]) ||
            this.registry.isAmbiguousNamespaceName(this.namespaceSegments[0]) ||
            // or we always are going to be using fully qualified namespaces
            writer.generation.settings.useFullyQualifiedNamespaces;

        // the fully qualified name of the type (with global:: qualifier if it necessary)
        const fqName = `${shouldGlobal ? "global::" : ""}${this.fullyQualifiedName}`;

        if (!this.namespace) {
            writer.write(this.name);
            return;
        }
        if (this.namespaceAlias != null) {
            const alias = writer.addNamespaceAlias(this.namespaceAlias, this.resolveNamespace());
            writer.write(`${alias}.${this.scopedName}`);
        } else {
            if (writer.skipImports) {
                writer.write(this.scopedName);
            } else {
                if (this.fullyQualified) {
                    writer.write(fqName);
                } else {
                    // if the class needs to be partially qualified, or we're skipping imports,
                    // we need to at least partially qualify the type
                    if (this.qualifiedTypeNameRequired(writer, isAttribute) || writer.skipImports) {
                        const typeQualification = this.getTypeQualification({
                            classReferenceNamespace: this.resolveNamespace(),
                            namespaceToBeWrittenTo: writer.namespace,
                            isAttribute
                        });
                        // check to see if the abbreviation would be ambiguous
                        const segments = typeQualification.split(".");
                        if (
                            this.registry.isAmbiguousTypeName(segments[0]) ||
                            this.registry.isAmbiguousNamespaceName(segments[0])
                        ) {
                            writer.write(fqName);
                        } else {
                            writer.write(`${typeQualification}${this.scopedName}`);
                        }
                    } else if (isAmbiguous && this.resolveNamespace() !== writer.namespace) {
                        // If the class is ambiguous and not in this specific namespace
                        // we must to fully qualify the type
                        // writer.addReference(this);
                        writer.write(fqName);
                    } else {
                        // If the class is not ambiguous and is in this specific namespace,
                        // we can use the short name
                        writer.addReference(this);
                        writer.write(this.scopedName);
                    }
                }
            }
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
        if (classReferenceNamespace.startsWith(`${namespaceToBeWrittenTo}.`)) {
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
        const currentNamespace = writer.namespace;

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
        if (this.namespace.startsWith(`${currentNamespace}.`)) {
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

        const currentNamespace = writer.namespace;
        // Check if any of the conflicting namespaces would actually cause ambiguity
        for (const conflictingNamespace of matchingNamespacesCopy) {
            // Only consider it a real conflict if the conflicting type is in the same namespace
            // or a parent namespace that would make qualification ambiguous
            if (conflictingNamespace === currentNamespace || currentNamespace.startsWith(`${conflictingNamespace}.`)) {
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

    public resolveNamespace(): string {
        return this.registry.resolveNamespace(this.namespace);
    }

    /** returns this class reference as a fully qualified class reference */
    public asFullyQualified() {
        return this.csharp.classReferenceInternal({
            ...this,
            fullyQualified: true
        });
    }

    /** returns a class instantiation node for this class reference */
    public new(args?: Omit<ClassInstantiation.Args, "classReference">) {
        args = args ?? { arguments_: [] };
        return this.csharp.instantiateClass({
            ...args,
            classReference: this
        });
    }

    public explicit(name: string) {
        if (!this.origin) {
            fail(
                `Cannot create explicitly named member '${name}' on '${this.name}' because the class is not bound to an origin.`
            );
        }
        return this.model.explicit(this.origin, name);
    }

    public registerField(expectedName: string, origin?: Origin, field?: Field): string {
        return this.scope.registerField(expectedName, origin, field);
    }

    public getFieldName(origin: Origin, expectedName: string): string | undefined {
        return this.scope.getFieldName(origin, expectedName);
    }

    public registerMethod(name: string, origin?: Origin): string {
        return name;
    }

    public get isOptional(): boolean {
        return false;
    }

    public asOptional(): Type {
        return new Optional(this, this.generation);
    }

    public asNonOptional(): Type {
        return this;
    }
    public get defaultValue(): Literal {
        return this.csharp.Literal.null();
    }
    /** returns true if this class reference is the IAsyncEnumerable class */
    public get isAsyncEnumerable() {
        return this.name === "IAsyncEnumerable" && this.namespace === "System.Collections.Generic";
    }
}
