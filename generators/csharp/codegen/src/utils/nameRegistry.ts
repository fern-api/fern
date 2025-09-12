/**
 * @file Type canonicalization utilities for C# code generation.
 *
 * This module provides functionality to manage and canonicalize C# type names and namespaces
 * to avoid naming conflicts during code generation. It maintains registries of known types,
 * namespaces, and identifiers to ensure generated code follows C# naming conventions and
 * avoids conflicts with built-in types and namespaces.
 *
 * Key features:
 * - Type name conflict detection and resolution
 * - Namespace canonicalization and remapping
 * - Built-in type awareness and conflict avoidance
 * - Type registry persistence and restoration
 *
 */

import { writeFileSync } from "node:fs";
import { ClassReference } from "../ast/ClassReference";
import { type CSharp } from "../csharp";
import { builtIns } from "./knownTypes";

/**
 * Type/name canonicalization utilities for C# code generation.
 *
 * This class provides functionality to manage and canonicalize C# type names and namespaces
 * to avoid naming conflicts during code generation. It maintains registries of known types,
 * namespaces, and identifiers to ensure generated code follows C# naming conventions and
 * avoids conflicts with built-in types and namespaces.
 *
 * Key features:
 * - Type name conflict detection and resolution
 * - Namespace canonicalization and remapping
 * - Built-in type awareness and conflict avoidance
 * - Type registry persistence and restoration
 */
export class NameRegistry {
    /**
     * Registry mapping fully qualified type names to their canonical ClassReference objects.
     * This registry tracks all known types and may contain remapped versions to avoid conflicts.
     *
     * Key format: "Namespace.TypeName" or "Namespace.EnclosingType.TypeName"
     * Value: The canonical ClassReference for the type
     */
    private readonly typeRegistry = new Map<string, ClassReference>();

    /**
     * Registry mapping original namespace names to their canonical (potentially remapped) versions.
     * This is used to track namespace remappings that occur during conflict resolution.
     *
     * Key: Original namespace name
     * Value: Canonical namespace name (may be modified to avoid conflicts)
     */
    private readonly namespaceRegistry = new Map<string, string>();

    /**
     * Registry tracking type names that exist in multiple namespaces, making them ambiguous.
     * These types should be explicitly qualified when used to avoid compilation errors.
     *
     * Key: Type name (e.g., "String", "Object")
     * Value: Set of namespaces where this type name exists
     */
    private readonly typeNames = new Map<string, Set<string>>();


    private readonly implicitNamespaces = new Set<string>();

    /**
     * Set of well-known C# identifiers that should be avoided or handled carefully during code generation.
     * These include common .NET Framework namespaces and types that could cause naming conflicts.
     *
     * This set is populated with:
     * - Common .NET Framework namespace segments
     * - Built-in type names from the builtIns registry
     * - Namespace segments from all known built-in types
     */
    private readonly knownIdentifiers = new Set([
        "Text",
        "Json",
        "Xml",
        "Security",
        "Collections",
        "Data",
        "Diagnostics",
        "Globalization",
        "Math",
        "Reflection",
        "Runtime",
        "Security",
        "Serialization",
        "Threading",
        "Xml"
    ]);

    constructor() {
        this.initializeBuiltIns();
    }

    /**
     * Initialize the known identifiers set with all built-in types and namespace segments.
     * This ensures we're aware of all potential naming conflicts with .NET Framework types.
     */
    private initializeBuiltIns(): void {
        for (const [namespace, types] of Object.entries(builtIns)) {
            // Add each namespace segment to known identifiers
            namespace.split(".").forEach((segment) => this.knownIdentifiers.add(segment));
            // Add each built-in type name to known identifiers
            types.forEach((type) => this.knownIdentifiers.add(type));
        }

        // Initialize the typeNames registry with built-in types to enable conflict detection.
        // This allows us to identify when user-defined types might conflict with .NET Framework types.
        for (const [namespace, names] of Object.entries(builtIns)) {
            for (const name of names) {
                this.typeNames.set(name, new Set([namespace]));
            }

            // and the first word of the namespace itself
            const firstWord = namespace.split(".")[0];
            if (firstWord) {
                this.typeNames.set(firstWord, new Set([namespace]));
            }
        }
        this.typeNames.set("System", new Set(["System"]));
        this.typeNames.set("NUnit", new Set(["NUnit"]));
        this.typeNames.set("OneOf", new Set(["OneOf"]));
    }

    /**
     * Checks if the given identifier is a well-known C# identifier that should be handled carefully.
     *
     * @param identifier - The identifier to check (e.g., "String", "Collections", "System")
     * @returns `true` if the identifier is a known C# identifier that could cause conflicts, `false` otherwise
     *
     * @example
     * ```typescript
     * nameRegistry.isKnownIdentifier("String"); // true - conflicts with System.String
     * nameRegistry.isKnownIdentifier("MyCustomType"); // false - safe to use
     * ```
     */
    public isKnownIdentifier(identifier: string): boolean {
        if (!identifier || typeof identifier !== "string") {
            return false;
        }
        return this.knownIdentifiers.has(identifier);
    }

    public isKnownNamespace(namespace: string): boolean {
        if (!namespace || typeof namespace !== "string") {
            return false;
        }
        return this.namespaceRegistry.has(namespace);
    }

    public isRegistered(typeName: string): boolean {
        return this.typeRegistry.has(typeName);
    }

    /**
     * Determines if a type name is ambiguous (exists in multiple namespaces).
     * Ambiguous type names should be explicitly qualified when used to avoid compilation errors.
     *
     * @param name - The type name to check for ambiguity (optional)
     * @returns `true` if the type name exists in multiple namespaces and is ambiguous, `false` otherwise
     *
     * @example
     * ```typescript
     * nameRegistry.isAmbiguousTypeName("String"); // true - exists in System and other namespaces
     * nameRegistry.isAmbiguousTypeName("MyUniqueType"); // false - only exists in one namespace
     * nameRegistry.isAmbiguousTypeName(); // false - no name provided
     * ```
     */
    public isAmbiguousTypeName(name?: string): boolean {
        return name ? (this.typeNames.get(name)?.size ?? 0) > 1 : false;
    }

    /**
     * Normalizes a class reference into a consistent string format for registry keys.
     *
     * @param classReference - The class reference to normalize
     * @param classReference.name - The type name
     * @param classReference.namespace - The namespace containing the type
     * @param classReference.enclosingType - Optional enclosing type for nested types
     * @returns A normalized string representation of the class reference
     *
     * @internal
     */
    public static fullyQualifiedNameOf(classReference: ClassReference.Identity): string {
        // Create a consistent string representation for registry keys
        return classReference.enclosingType
            ? `${classReference.namespace}.${classReference.enclosingType.name}.${classReference.name}`
            : `${classReference.namespace}.${classReference.name}`;
    }

    /**
     * Registers a type in the type registry and updates related tracking data structures.
     * This function is called when a new type is encountered during code generation.
     *
     * @param classReference - The ClassReference to register
     * @returns The same ClassReference that was passed in (for chaining)
     *
     * @example
     * ```typescript
     * const typeRef = csharp.classReference({ name: "MyType", namespace: "MyNamespace" });
     * nameRegistry.trackType(typeRef); // Registers the type and returns the same reference
     * ```
     */
    public trackType(classReference: ClassReference, originalFullyQualifiedName?: string): ClassReference {
        const { name, namespace, enclosingType, fullyQualifiedName } = classReference;

        // if we were given an original name for the class reference, then register the type
        if (
            originalFullyQualifiedName &&
            originalFullyQualifiedName !== fullyQualifiedName &&
            !this.typeRegistry.has(originalFullyQualifiedName)
        ) {
            this.typeRegistry.set(originalFullyQualifiedName, classReference);
        }

        if (!this.typeRegistry.has(fullyQualifiedName)) {
            // Register the type in the main registry
            this.typeRegistry.set(fullyQualifiedName, classReference);

            // Register all parent namespaces
            for (const ns of this.allNamespacesOf(namespace)) {
                this.namespaceRegistry.set(ns, ns);
            }
            // Track the type name and its namespace for ambiguity detection
            if (!classReference.enclosingType) {
                // Implementation Note:
                // if the classReference is actually a nested type, we're going to skip
                // tracking it for ambiguity for the moment, as the ambiguity would only be if the type
                // was rendered in the enclosing type, and I don't think that happens.
                // regardless, if we wanted to make sure that worked, we'd have to know the scope where
                // the node was being rendered
                // (ie, in the code generator, keep track of where we are, not *just* the current namespace)
                if (this.typeNames.has(name)) {
                    this.typeNames.get(name)?.add(namespace);
                } else {
                    this.typeNames.set(name, new Set([namespace]));
                }
            }

            for( const each of this.implicitNamespaces) {
                if( namespace.startsWith(each)) {
                    // get the next word of the namespace
                    const trimmed = namespace.split(".")[each.split(".").length];

                    if( trimmed) {
                        this.trackTypeName(trimmed, namespace);
                    }
                }
            }
        }

        return classReference;
    }

    public addImplicitNamespace(namespace: string): void {
        this.implicitNamespaces.add(namespace);
    }

    public trackTypeName(name: string, namespace: string): void {
        if (this.typeNames.has(name)) {
            this.typeNames.get(name)?.add(namespace);
        } else {
            this.typeNames.set(name, new Set([namespace]));
        }
    }

    /**
     * Generates all parent namespaces for a given namespace string.
     * For example, "System.Collections.Generic" would return ["System", "System.Collections", "System.Collections.Generic"].
     *
     * @param namespace - The namespace to decompose into parent namespaces
     * @returns A Set containing all parent namespaces, including the full namespace itself
     *
     * @example
     * ```typescript
     * nameRegistry.allNamespacesOf("System.Collections.Generic");
     * // Returns: Set(["System", "System.Collections", "System.Collections.Generic"])
     * ```
     */
    public allNamespacesOf(namespace: string): Set<string> {
        if (!namespace || typeof namespace !== "string") {
            return new Set();
        }

        let fqNamespace = "";
        const result = new Set<string>();

        for (const part of namespace.split(".")) {
            if (part.trim()) {
                // Skip empty parts
                fqNamespace = fqNamespace ? `${fqNamespace}.${part}` : `${part}`;
                result.add(fqNamespace);
            }
        }

        return result;
    }

    public createClassReference(
        classReferenceArgs: ClassReference.Args,
        fullyQualifiedName: string,
        csharp: CSharp
    ): ClassReference {
        // do we have a class reference already that matches
        const classRef = this.typeRegistry.get(fullyQualifiedName);
        if (classRef) {
            // return the new instance of the class reference for the caller
            return new ClassReference(
                {
                    name: classRef.name,
                    namespace: classRef.namespace,
                    enclosingType: classRef.enclosingType,
                    fullyQualifiedName: classRef.fullyQualifiedName,

                    namespaceAlias: classReferenceArgs.namespaceAlias,
                    fullyQualified: classReferenceArgs.fullyQualified,
                    generics: classReferenceArgs.generics,
                    global: classReferenceArgs.global
                },
                csharp
            );
        }

        // no, we've never seen this class reference before.
        // check to see if we have to adjust it to avoid conflicts
        let modified = false;
        let { name, namespace, enclosingType } = classReferenceArgs;

        // Resolve any namespace remappings first
        const resolvedNamespace = this.resolveNamespace(namespace);
        if (resolvedNamespace !== namespace) {
            namespace = resolvedNamespace;
            modified = true;
        }

        // Ensure no conflicts with existing types or namespaces
        conflictResolution: while (true) {
            const fullyQualifiedName = NameRegistry.fullyQualifiedNameOf({ name, namespace, enclosingType });
            let fqNamespace = "";
            const parts = namespace.split(".");

            // Check each namespace segment for conflicts with existing types
            for (let i = 0; i < parts.length; i++) {
                fqNamespace = fqNamespace ? `${fqNamespace}.${parts[i]}` : `${parts[i]}`;

                if (this.typeRegistry.has(fqNamespace)) {
                    // Found a conflict with an existing type, modify the namespace segment
                    parts[i] = `${parts[i]}_`;
                    namespace = parts.join(".");
                    modified = true;
                    continue conflictResolution;
                }
            }

            // Cache namespace modifications
            if (modified) {
                this.namespaceRegistry.set(classReferenceArgs.namespace, namespace);
            }

            // Check if the fully qualified name conflicts with an existing namespace
            if (this.namespaceRegistry.has(fullyQualifiedName)) {
                // The type name conflicts with an existing namespace, modify the type name
                name = `${name}_`;
                modified = true;
                continue conflictResolution;
            }

            // No conflicts found, we're good to go
            break;
        }

        // If no modifications were made, register and return the original reference
        if (!modified) {
            // create the new class reference
            this.trackType(new ClassReference({ ...classReferenceArgs, fullyQualifiedName }, csharp));
        }

        // Create and register the remapped ClassReference
        // forward the 'original' type to the new remapped type
        return this.trackType(
            new ClassReference(
                {
                    name,
                    namespace,
                    enclosingType,
                    namespaceAlias: classReferenceArgs.namespaceAlias,
                    fullyQualified: classReferenceArgs.fullyQualified,
                    generics: classReferenceArgs.generics,
                    global: classReferenceArgs.global,
                    fullyQualifiedName: NameRegistry.fullyQualifiedNameOf({ name, namespace, enclosingType })
                },
                csharp
            ),
            fullyQualifiedName
        );
    }

    /**
     * Resolves a namespace to its canonical version, checking for parent namespace remappings.
     * This function handles cases where parent namespaces have been remapped due to conflicts.
     *
     * @param namespace - The namespace to resolve
     * @returns The canonical namespace, which may be the original or a remapped version
     *
     * @example
     * ```typescript
     * // If "System" was remapped to "System_", then:
     * nameRegistry.resolveNamespace("System.Collections"); // Returns "System_.Collections"
     * nameRegistry.resolveNamespace("MyNamespace"); // Returns "MyNamespace" (unchanged)
     * ```
     */
    public resolveNamespace(namespace: string): string {
        const cached = this.namespaceRegistry.get(namespace);
        if (cached !== undefined) {
            return cached;
        }

        // Check if any parent namespaces have been remapped
        const parts = namespace.split(".");

        // Work backwards from the full namespace to each parent namespace
        for (let i = parts.length - 1; i >= 0; i--) {
            const parentNamespace = parts.slice(0, i).join(".");

            if (this.namespaceRegistry.has(parentNamespace)) {
                // Found a remapped parent namespace, construct the new full namespace
                const remappedParent = this.namespaceRegistry.get(parentNamespace);
                if (remappedParent !== undefined) {
                    const remainingParts = parts.slice(i).join(".");
                    const newNamespace = `${remappedParent}.${remainingParts}`;

                    // Cache the result for future lookups
                    this.namespaceRegistry.set(namespace, newNamespace);
                    return newNamespace;
                }
            }
        }

        return namespace;
    }

    /**
     * Canonicalizes a namespace by ensuring it doesn't conflict with existing types or namespaces.
     * If conflicts are detected, the namespace is modified by appending underscores to conflicting segments.
     *
     * @param originalNamespace - The original namespace to canonicalize
     * @returns The canonicalized namespace, which may be modified to avoid conflicts
     *
     * @example
     * ```typescript
     * // If "System" already exists as a type:
     * nameRegistry.canonicalizeNamespace("System.MyNamespace"); // Returns "System_.MyNamespace"
     * nameRegistry.canonicalizeNamespace("MyNamespace"); // Returns "MyNamespace" (unchanged)
     * ```
     */
    public canonicalizeNamespace(originalNamespace: string): string {
        const cached = this.namespaceRegistry.get(originalNamespace);
        if (cached !== undefined) {
            return cached;
        }

        let modified = false;
        let namespace = originalNamespace;

        // Ensure the namespace doesn't conflict with existing types or namespaces
        conflictResolution: while (true) {
            let fqNamespace = "";
            const parts = namespace.split(".");

            // Check each namespace segment for conflicts
            for (let i = 0; i < parts.length; i++) {
                fqNamespace = fqNamespace ? `${fqNamespace}.${parts[i]}` : `${parts[i]}`;

                if (this.typeRegistry.has(fqNamespace)) {
                    // Found a conflict with an existing type, modify the namespace segment
                    parts[i] = `${parts[i]}_`;
                    namespace = parts.join(".");
                    modified = true;
                    continue conflictResolution;
                }
            }

            // No conflicts found, we're good to go
            break;
        }

        // Cache the result if we made modifications
        if (modified) {
            this.namespaceRegistry.set(originalNamespace, namespace);
        }

        return namespace;
    }


    public log(): void {
        const unmodified: string[] = [];
        const modified: string[] = [];

        for (const [fqName, cr] of this.typeRegistry.entries()) {
            const crName = NameRegistry.fullyQualifiedNameOf(cr);
            if (crName === fqName) {
                unmodified.push(fqName);
            } else {
                modified.push(fqName);
            }
        }
        let text = "==== UNMODIFIED ====";
        for (const each of unmodified) {
            text += `\n${each}`;
        }
        text += "\n==== MODIFIED ====";
        for (const each of modified) {
            text += `\n${each}`;
        }
        writeFileSync("/tmp/nameRegistry.log", text);
    }
}
