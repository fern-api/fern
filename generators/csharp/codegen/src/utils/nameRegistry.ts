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

import { ClassReference } from "../ast/ClassReference";
import { builtIns, NUnit, System } from "./builtIn";

/**
 * Represents a type entry in the type registry for serialization purposes.
 * This interface mirrors the ClassReference structure but is designed for JSON serialization.
 */
export interface TypeRegistryEntry {
    /** The name of the type */
    name: string;
    /** The namespace containing the type */
    namespace: string;
    /** Optional enclosing type for nested types */
    enclosingType?: TypeRegistryEntry;
    /** Optional namespace alias */
    namespaceAlias?: string;
    /** Whether the type should be fully qualified when used */
    fullyQualified?: boolean;
    /** Whether the type is global */
    global?: boolean;
}

/**
 * Complete type registry information that can be serialized and restored.
 * This structure contains all the data needed to reconstruct the type canonicalization state.
 */
export interface TypeRegistryInfo {
    /** Map of fully qualified type names to their registry entries */
    types: Record<string, TypeRegistryEntry>;
    /** Map of original namespace names to their canonical versions */
    namespaces: Record<string, string>;
    /** Map of type names to arrays of namespaces where they exist (for ambiguity detection) */
    names: Record<string, string[]>;
}

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
        }

        // track all the types in the System.* namespace that we use
        this.trackType(System.Exception);
        this.trackType(System.Serializable);
        this.trackType(System.String);
        this.trackType(System.Runtime.Serialization.EnumMember);
        this.trackType(System.Collections.Generic.KeyValuePair(System.String, System.String));
        this.trackType(System.Collections.Generic.List(System.String));
        this.trackType(System.Collections.Generic.IAsyncEnumerable(System.String));
        this.trackType(System.Collections.Generic.HashSet(System.String));
        this.trackType(System.Collections.Generic.Dictionary(System.String, System.String));
        this.trackType(System.Globalization.DateTimeStyles);
        this.trackType(System.Linq.Enumerable);
        this.trackType(System.IO.MemoryStream);
        this.trackType(System.Text.Encoding);
        this.trackType(System.Text.Encoding_UTF8);
        this.trackType(System.Text.Json.JsonElement);
        this.trackType(System.Text.Json.Nodes.JsonObject);
        this.trackType(System.Text.Json.Nodes.JsonNode);
        this.trackType(System.Text.Json.Utf8JsonReader);
        this.trackType(System.Text.Json.JsonSerializerOptions);
        this.trackType(System.Text.Json.Utf8JsonWriter);
        this.trackType(System.Text.Json.JsonException);
        this.trackType(System.Text.Json.Serialization.IJsonOnDeserialized);
        this.trackType(System.Text.Json.Serialization.JsonPropertyName);
        this.trackType(System.Text.Json.Serialization.JsonExtensionData);
        this.trackType(System.Text.Json.Serialization.JsonIgnore);
        this.trackType(System.Text.Json.Serialization.JsonConverter());
        this.trackType(System.Threading.CancellationToken);
        this.trackType(System.Threading.Tasks.Task());
        this.trackType(System.Net.Http.HttpMethod);
        this.trackType(System.Collections.Generic.IEnumerable(System.String));
        this.trackType(System.TimeSpan);
        this.trackType(System.Net.Http.HttpClient);
        this.trackType(NUnit.Framework.TestFixture);
        this.trackType(NUnit.Framework.Test);
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
    public normalizeClassReference(classReference: {
        name: string;
        namespace: string;
        enclosingType?: ClassReference;
    }): string {
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
    public trackType(classReference: ClassReference): ClassReference {
        const { name, namespace, enclosingType } = classReference;
        const fullyQualifiedName = this.normalizeClassReference({ name, namespace, enclosingType });

        if (!this.typeRegistry.has(fullyQualifiedName)) {
            // Register the type in the main registry
            this.typeRegistry.set(fullyQualifiedName, classReference);

            // Register all parent namespaces
            for (const ns of this.allNamespacesOf(namespace)) {
                this.namespaceRegistry.set(ns, ns);
            }

            // Track the type name and its namespace for ambiguity detection
            if (this.typeNames.has(name)) {
                this.typeNames.get(name)?.add(namespace);
            } else {
                this.typeNames.set(name, new Set([namespace]));
            }
        }

        return classReference;
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

    /**
     * Resolves a ClassReference to its canonical version from the type registry.
     * If the type is not found in the registry, returns the original reference unchanged.
     *
     * @param classReference - The ClassReference to resolve
     * @returns The canonical ClassReference from the registry, or the original if not found
     *
     * @example
     * ```typescript
     * const original = new ClassReference({ name: "MyType", namespace: "MyNamespace" });
     * const canonical = nameRegistry.resolveType(original); // Returns canonical version if registered
     * ```
     */
    public resolveType(classReference: ClassReference): ClassReference {
        const classRef = this.typeRegistry.get(this.normalizeClassReference(classReference));

        return classRef
            ? new ClassReference({
                  name: classRef.name,
                  namespace: classRef.namespace,
                  enclosingType: classRef.enclosingType,
                  namespaceAlias: classReference.namespaceAlias,
                  fullyQualified: classReference.fullyQualified,
                  generics: classReference.generics,
                  global: classReference.global
              })
            : classReference;
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

    /**
     * Canonicalizes a ClassReference by resolving namespace conflicts and ensuring unique naming.
     * This is the main function for ensuring that generated types don't conflict with existing types
     * or namespaces. It handles both namespace and type name conflicts by appending underscores.
     *
     * @param classReference - The ClassReference to canonicalize
     * @returns A canonicalized ClassReference that avoids naming conflicts
     *
     * @example
     * ```typescript
     * const typeRef = new ClassReference({ name: "String", namespace: "System" });
     * const canonical = nameRegistry.canonicalizeName(typeRef); // May return "String_" if "String" conflicts
     * ```
     */
    public canonicalizeName(classReference: ClassReference): ClassReference {
        const key = this.normalizeClassReference(classReference);

        // If the type is already registered, return the canonical version
        if (this.typeRegistry.has(key)) {
            return this.resolveType(classReference);
        }

        let modified = false;
        let { name, namespace, enclosingType } = classReference;

        // Resolve any namespace remappings first
        const resolvedNamespace = this.resolveNamespace(namespace);
        if (resolvedNamespace !== namespace) {
            namespace = resolvedNamespace;
            modified = true;
        }

        // Ensure no conflicts with existing types or namespaces
        conflictResolution: while (true) {
            const fullyQualifiedName = this.normalizeClassReference({ name, namespace, enclosingType });
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
                this.namespaceRegistry.set(classReference.namespace, namespace);
            }

            // Check if the fully qualified name conflicts with an existing namespace
            if (this.namespaceRegistry.has(fullyQualifiedName)) {
                // The type name conflicts with an existing namespace, modify the type name
                name = `${name}_`;
                modified = true;
                continue conflictResolution;
            }

            // Check if the type name conflicts with an existing type
            if (this.typeRegistry.has(fullyQualifiedName)) {
                // Note: Currently commented out, but this would handle type name conflicts
                // name = `${name}_`;
                // modified = true;
                // continue conflictResolution;
            }

            // No conflicts found, we're good to go
            break;
        }

        // If no modifications were made, register and return the original reference
        if (!modified) {
            this.trackType(classReference);
            return classReference;
        }

        // Create and register the remapped ClassReference
        const remapped = new ClassReference({
            name,
            namespace,
            enclosingType,
            namespaceAlias: classReference.namespaceAlias,
            fullyQualified: classReference.fullyQualified,
            generics: classReference.generics,
            global: classReference.global
        });

        this.trackType(remapped);
        return remapped;
    }

    /**
     * Serializes the current type registry state to a JSON-serializable object.
     * This allows the canonicalization state to be saved and restored across sessions.
     *
     * @returns A TypeRegistryInfo object containing all registry data
     *
     * @example
     * ```typescript
     * const registryData = nameRegistry.saveTypeRegistry();
     * // Save to file or database
     * fs.writeFileSync('registry.json', JSON.stringify(registryData));
     * ```
     */
    public saveTypeRegistry(): TypeRegistryInfo {
        /**
         * Converts a ClassReference to a TypeRegistryEntry for serialization.
         * Recursively handles nested types.
         */
        const toEntry = (classReference: ClassReference): TypeRegistryEntry => {
            return {
                name: classReference.name,
                namespace: classReference.namespace,
                enclosingType: classReference.enclosingType ? toEntry(classReference.enclosingType) : undefined,
                namespaceAlias: classReference.namespaceAlias,
                fullyQualified: classReference.fullyQualified,
                global: classReference.global
            };
        };

        // Convert the type registry to a serializable format
        const types = {} as Record<string, TypeRegistryEntry>;
        for (const [key, value] of this.typeRegistry.entries()) {
            types[key] = toEntry(value);
        }

        // Convert the type names registry to a serializable format
        const names = {} as Record<string, string[]>;
        for (const [key, value] of this.typeNames.entries()) {
            names[key] = Array.from(value);
        }

        return {
            types,
            namespaces: Object.fromEntries(this.namespaceRegistry.entries()),
            names
        };
    }

    /**
     * Restores the type registry state from a previously saved TypeRegistryInfo object.
     * This clears the current registry state and loads the provided data.
     *
     * @param data - The TypeRegistryInfo object containing the registry data to restore
     *
     * @example
     * ```typescript
     * const registryData = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
     * nameRegistry.loadTypeRegistry(registryData);
     * ```
     */
    public loadTypeRegistry(data: TypeRegistryInfo): void {
        if (!data || typeof data !== "object") {
            throw new Error("Invalid registry data provided");
        }

        // Clear existing registry state
        this.typeRegistry.clear();
        this.namespaceRegistry.clear();
        this.typeNames.clear();

        /**
         * Converts a TypeRegistryEntry back to a ClassReference.
         * Recursively handles nested types.
         */
        const toClassReference = (entry: TypeRegistryEntry): ClassReference => {
            if (!entry || typeof entry !== "object" || !entry.name || !entry.namespace) {
                throw new Error("Invalid TypeRegistryEntry provided");
            }

            return new ClassReference({
                name: entry.name,
                namespace: entry.namespace,
                enclosingType: entry.enclosingType ? toClassReference(entry.enclosingType) : undefined,
                namespaceAlias: entry.namespaceAlias,
                fullyQualified: entry.fullyQualified,
                global: entry.global
            });
        };

        // Restore the type registry
        if (data.types && typeof data.types === "object") {
            for (const [key, value] of Object.entries(data.types)) {
                if (key && value) {
                    this.typeRegistry.set(key, toClassReference(value));
                }
            }
        }

        // Restore the namespace registry
        if (data.namespaces && typeof data.namespaces === "object") {
            for (const [key, value] of Object.entries(data.namespaces)) {
                if (key && typeof value === "string") {
                    this.namespaceRegistry.set(key, value);
                }
            }
        }

        // Restore the type names registry
        if (data.names && typeof data.names === "object") {
            for (const [key, value] of Object.entries(data.names)) {
                if (key && Array.isArray(value)) {
                    this.typeNames.set(key, new Set(value.filter((ns) => typeof ns === "string")));
                }
            }
        }
    }
}

/**
 * This provides a singleton instance of the NameRegistry class.
 */
export const nameRegistry = new NameRegistry();
