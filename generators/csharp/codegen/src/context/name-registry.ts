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

import { fail } from "node:assert";
import { at } from "@fern-api/browser-compatible-base-generator";
import { type Field as AstField, ClassReference } from "../ast";
import { Generation } from "../context/generation-info";
import { Origin } from "../context/model-navigator";
import { is } from "../utils/type-guards";
import { builtIns } from "./knownTypes";

// C# Keywords and Reserved Names (from Registry)
const base_keywords = new Set([
    "abstract",
    "as",
    "base",
    "bool",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "checked",
    "class",
    "const",
    "continue",
    "decimal",
    "default",
    "delegate",
    "do",
    "double",
    "else",
    "enum",
    "event",
    "explicit",
    "extern",
    "false",
    "finally",
    "fixed",
    "float",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "int",
    "interface",
    "internal",
    "is",
    "lock",
    "long",
    "namespace",
    "new",
    "null",
    "object",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "ref",
    "return",
    "sbyte",
    "sealed",
    "short",
    "sizeof",
    "stackalloc",
    "static",
    "string",
    "struct",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "uint",
    "ulong",
    "unchecked",
    "unsafe",
    "ushort",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
]);

const acessor_keywords = new Set(["get", "set", "init", "value", "add", "remove"]);
const generic_keywords = new Set(["where"]);
const linq_keywords = new Set(["from", "where", "select", "orderby", "groupby", "into", "let", "join", "on", "equals"]);
const async_keywords = new Set(["async", "await"]);
const iterator_keywords = new Set(["yield"]);
const declarator_keywords = new Set(["var", "dynamic"]);
const using_keywords = new Set(["using", "alias"]);
const namespace_keywords = new Set(["nameof"]);
const modifier_keywords = new Set(["required", "scoped", "unmanaged", "managed"]);
const pattern_keywords = new Set(["when", "and", "or", "not"]);
const member_names = new Set(["Equals", "GetHashCode", "ToString", "GetType", "MemberwiseClone", "Finalize"]);

// Generally, these are the keywords that we'd like to always avoid using for identifiers
const keywords = new Set([
    ...base_keywords,
    ...linq_keywords,
    ...async_keywords,
    ...iterator_keywords,
    ...declarator_keywords,
    ...using_keywords,
    ...modifier_keywords,
    ...pattern_keywords
]);

type JsonPath = string;
type FullyQualifiedName = string;

/**
 * Base class for identifiers in the name registry system.
 * Represents a named entity that is tracked by the NameRegistry.
 */
class Identifier {
    constructor(
        public readonly registry: NameRegistry,
        public readonly name: string,
        public readonly jsonPath?: JsonPath
    ) {}
}

/**
 * An identifier that creates a scope where other identifiers can be nested.
 * Manages forbidden names and ensures unique names within the scope.
 */
class Scope extends Identifier {
    private readonly forbidden = new Set<string>();

    /**
     * Makes a name off-limits within this scope.
     * @param name - The name to forbid
     */
    forbid(name: string) {
        this.forbidden.add(name);
    }

    /**
     * Creates an identifier in this scope with the specified name.
     * Two things cannot exist with the same name in the same scope.
     * @param name - The name to create
     */
    create(name: string) {
        //
    }

    /**
     * Gets a name, appending an underscore if it's forbidden.
     * @param name - The requested name
     * @returns The name with an underscore suffix if forbidden, otherwise the original name
     */
    getName(name: string) {
        if (this.forbidden.has(name)) {
            return `${name}_`;
        }
        return name;
    }
}

/**
 * Collection of members (fields or methods) within a TypeScope.
 * Maintains lookups by name and JSON path, and handles name redirections for conflict resolution.
 */
class Members<T extends Member> implements Iterable<T> {
    constructor(private readonly scope: TypeScope) {}
    private readonly byName = new Map<string, T>();
    private readonly byPath = new Map<JsonPath, T>();
    private readonly redirections = new Map<string, string>();

    [Symbol.iterator](): Iterator<T> {
        return this.byName.values();
    }

    /**
     * Checks if a member with the given name exists in this collection.
     * @param name - The member name to check
     * @returns `true` if a member with this name exists, `false` otherwise
     */
    has(name: string): boolean {
        return this.byName.has(name);
    }

    /**
     * Retrieves a member by its JSON path from the IR.
     * @param jsonPath - The JSON path identifying the member in the IR
     * @returns The member if found, `undefined` otherwise
     */
    getByJsonPath(jsonPath: JsonPath): T | undefined {
        return this.byPath.get(jsonPath);
    }

    /**
     * Retrieves a member by its name.
     * @param name - The member name to look up
     * @returns The member if found, `undefined` otherwise
     */
    getByName(name: string): T | undefined {
        return this.byName.get(name);
    }

    /**
     * Gets the redirected name for a member if one exists.
     * Redirections occur when a member's intended name conflicts with other identifiers.
     * @param name - The original member name
     * @returns The redirected name if one exists, `undefined` otherwise
     */
    getRedirectedName(name: string): string | undefined {
        return this.redirections.get(name);
    }

    /**
     * Adds a member to this collection.
     * Fails if a member with the same name or JSON path already exists.
     * @param member - The member to add
     * @throws Error if the member already exists by name or JSON path
     */
    set(member: T) {
        if (this.byName.has(member.name)) {
            fail(`set: ${member.name} in ${this.scope.fullyQualifiedName} already exists`);
        }
        if (member.jsonPath && this.byPath.has(member.jsonPath)) {
            fail(`set: ${member.name} in ${this.scope.fullyQualifiedName} already exists by jsonPath`);
        }

        this.byName.set(member.name, member);
        if (member.jsonPath) {
            this.byPath.set(member.jsonPath, member);
        }
    }

    /**
     * Registers a name redirection.
     * This is used to track when a member's intended name was changed to avoid conflicts.
     * @param name - The original name
     * @param newName - The redirected name
     * @throws Error if a redirection for this name already exists
     */
    redirect(name: string, newName: string) {
        if (this.redirections.has(name)) {
            fail(`redirect: ${name} in ${this.scope.fullyQualifiedName} already has a redirect`);
        }
        this.redirections.set(name, newName);
    }
}

/**
 * Represents the scope of a type (class, struct, etc.) and manages its members.
 * Handles field and method name registration, conflict detection, and name resolution.
 */
export class TypeScope extends Identifier {
    readonly fields: Members<Field>;
    readonly methods: Members<Method>;

    constructor(
        registry: NameRegistry,
        name: string,
        readonly namespace: string,
        readonly fullyQualifiedName: FullyQualifiedName
    ) {
        super(registry, name);
        this.fields = new Members<Field>(this);
        this.methods = new Members<Method>(this);
    }

    /**
     * Checks if a name is a C# keyword.
     * @param name - The name to check
     * @returns `true` if the name is a C# keyword, `false` otherwise
     */
    isKeyword(name: string) {
        return keywords.has(name);
    }

    /**
     * Checks if a name is a built-in .NET member name (e.g., Equals, GetHashCode, ToString).
     * @param name - The name to check
     * @returns `true` if the name is a built-in member name, `false` otherwise
     */
    isBuiltinMemberName(name: string) {
        return member_names.has(name);
    }

    /**
     * Checks if a name matches this type's name.
     * @param name - The name to check
     * @returns `true` if the name matches this type's name, `false` otherwise
     */
    isTypeName(name: string) {
        return this.name === name;
    }

    /**
     * Checks if a name is already registered as a field in this type.
     * @param name - The name to check
     * @returns `true` if the name is a registered field, `false` otherwise
     */
    isField(name: string) {
        return this.fields.has(name);
    }

    /**
     * Checks if a name is already registered as a method in this type.
     * @param name - The name to check
     * @returns `true` if the name is a registered method, `false` otherwise
     */
    isMethod(name: string) {
        return this.methods.has(name);
    }

    /**
     * Checks if a name is registered as either a field or method in this type.
     * @param name - The name to check
     * @returns `true` if the name is a registered member, `false` otherwise
     */
    isMember(name: string) {
        return this.isField(name) || this.isMethod(name);
    }

    /**
     * Determines why a name is blocked from use, if at all.
     * @param name - The name to check
     * @returns The reason the name is blocked, or `undefined` if available
     */
    nameBlocked(name: string): "keyword" | "builtin" | "typeName" | "field" | "method" | undefined {
        if (this.isKeyword(name)) {
            return "keyword";
        }
        if (this.isBuiltinMemberName(name)) {
            return "builtin";
        }
        if (this.isTypeName(name)) {
            return "typeName";
        }
        if (this.isField(name)) {
            return "field";
        }
        if (this.isMethod(name)) {
            return "method";
        }
        return undefined;
    }

    /**
     * Generates an alternative name when the requested name is blocked.
     * Appends underscores and numbers until an available name is found.
     * @param name - The blocked name
     * @returns An available alternative name (e.g., "name_", "name_2", "name_3", etc.)
     */
    getAlternativeName(name: string): string {
        // first append an underscore.
        let newName = `${name}_`;

        let i = 2;
        while (this.nameBlocked(newName)) {
            newName = `${name}_${i}`;
            i++;
        }

        return newName;
    }

    /**
     * Retrieves a field by its JSON path from the IR.
     * @param jsonPath - The JSON path identifying the field
     * @returns The field if found, `undefined` otherwise
     */
    getFieldByJsonPath(jsonPath?: string): Member | undefined {
        return jsonPath !== undefined ? this.fields.getByJsonPath(jsonPath) : undefined;
    }

    /**
     * Retrieves a field by its name.
     * @param name - The field name to look up
     * @returns The field if found, `undefined` otherwise
     */
    getFieldByName(name: string): Member | undefined {
        return this.fields.getByName(name);
    }

    /**
     * Gets the redirected name for a field if one exists.
     * @param name - The original field name
     * @returns The redirected name if one exists, `undefined` otherwise
     */
    getRedirectedFieldName(name: string): string | undefined {
        return this.fields.getRedirectedName(name);
    }

    /**
     * Registers a field in this type scope with conflict resolution.
     * If the expected name is unavailable, an alternative name is chosen and a redirection is registered.
     * @param expectedName - The desired field name
     * @param origin - The IR origin node for this field
     * @param field - The AST field object
     * @returns The actual field name (may differ from expectedName if conflicts occurred)
     */
    registerField(expectedName: string, origin?: Origin, field?: AstField): string {
        const jsonPath = this.registry.model.jsonPath(origin);
        if (jsonPath) {
            // quick lookup by json paths
            const member = this.fields.getByJsonPath(jsonPath);
            if (member) {
                return member.name;
            }
        }

        // lookup
        const member = this.fields.getByName(expectedName);

        if (member && jsonPath === member.jsonPath) {
            // the origin the same, assume it's the same member.
            return expectedName;
        }

        switch (this.nameBlocked(expectedName)) {
            case "field":
                // if the name we're asking for is already a field
                // and they are creating a new field with the same name - this should only happen if the generator is trying to create a field with a specific name like "Value" and
                // there is a property that came from the IR called "Value" that is already registered. (so if the origin is an explicitly named member we'll give them a new name)

                if (!(origin && is.Provenance(origin) && origin.explicit)) {
                    fail(
                        `Field ${expectedName} already exists - attempting to add a duplicate field with the same name that is not an explicitly named property`
                    );
                }
                break;

            case "keyword":
            case "builtin":
            case "typeName":
            case "method":
                // if we're blocked because the name is a keyword/builtin/typename or an existing method, we can just get a new name, and the redirect will work fine.
                break;

            default:
                // name is available, register it and return the name
                this.fields.set(new Field(this.registry, expectedName, this, jsonPath, field));
                this.registry.setFieldNameShortcut(jsonPath, expectedName);
                return expectedName;
        }

        const newName = this.getAlternativeName(expectedName);
        this.fields.set(new Field(this.registry, newName, this, jsonPath, field));
        this.fields.redirect(expectedName, newName);
        this.registry.setFieldNameShortcut(jsonPath, newName);

        return newName;
    }

    /**
     * Retrieves the name of a field given an origin and expected name.
     * This method performs intelligent lookup considering IR origins and explicit property names.
     *
     * IMPORTANT: This method DOES NOT register the field in the type scope.
     *
     * @param node - The IR origin node for the field
     * @param expectedName - The expected field name
     * @returns The actual field name if found or inferred, `undefined` otherwise
     */
    getFieldName(node: Origin, expectedName: string): string | undefined {
        // if we have already identified this node's name then return that quickly.
        const result = this.getFieldByJsonPath(this.registry.model.jsonPath(node))?.name;
        if (result) {
            return result;
        }

        // we are being asked to find a field that we didn't get a match on the jsonPath.
        // given the origin however, we can are going to make a pretty good guess as to what the consumer is actually looking for.

        if (is.Provenance(node)) {
            // if the origin is an explicitly named property (aka one that the name is hand-coded in the generator)
            // then we should check to see if that has been redirected.  If it has, then we can return the redirected name.
            const redirectedName = this.getRedirectedFieldName(expectedName);
            if (redirectedName) {
                return redirectedName;
            }

            // if it hasn't been redirected, and there is a property by that name,
            const property = this.getFieldByName(expectedName);
            if (property) {
                // does the property have an IR origin, if so, then this is not a good match (a hand-coded name shouldn't match a property that has an IR origin)
                const provenance = this.registry.model.provenance(property.jsonPath);
                if (provenance?.explicit) {
                    // this is a good match, return the expected name
                    return expectedName;
                }
                // this is not a good match (the hand-coded property should have been redirected)
                // `BAD: getFieldName: ${this.fullyQualifiedName} for ${expectedName} found a IR-based property, but is being requested for an explicitly named property.`
                // We should register a redirect
                return `${expectedName}_`;
            }

            // there is no property by that name, so we're going to return the expected name
            // `BAD: getFieldName: ${this.fullyQualifiedName} for ${expectedName} found no property by that name. You should register it before use.`
            return expectedName;
        }

        // the origin is an IR node.

        const property = this.getFieldByName(expectedName);
        if (property) {
            // there is an existing property by that name.
            // if the property has an IR origin, then we're going to assume that these two are intended to be the same.
            const provenance = this.registry.model.provenance(property.jsonPath);

            if (provenance?.explicit) {
                // if the origin is an IR node and the property has an explictly named origin, then it will not be a match,
                // this should have been redirected (this should be avoided if possible by making explictly named properties created after properties that are IR-based)
                // `BAD: getFieldName: ${this.fullyQualifiedName} for ${expectedName} found a IR-based property, but is being requested for an explictly named property.`
                // You should redirect the explictly named property
                return expectedName;
            }

            // this is a good match, (or at least it's not an explictly named property) we'll return the name

            return property.name;
        }

        // there is no registered property, we can check for a redirect
        const actualName = this.getRedirectedFieldName(expectedName);

        if (actualName) {
            return actualName;
        }

        // there was no redirect. Is there a method by the expected name?
        if (this.isMethod(expectedName)) {
            // this means we have a method where we think we wanted a property.
            // `BAD: getFieldName: ${this.fullyQualifiedName} for ${expectedName} found a method, but is being requested for a property.`
            return undefined;
        }

        // there is no member by this name registered, I can't tell you that it is OK to use.
        return undefined;
    }
}

/**
 * Base class representing a member (field or method) within a TypeScope.
 */
class Member extends Identifier {
    constructor(
        registry: NameRegistry,
        name: string,
        public readonly scope: TypeScope,
        jsonPath?: JsonPath
    ) {
        super(registry, name, jsonPath);
    }
}

/**
 * Represents a field member within a type.
 */
class Field extends Member {
    constructor(
        registry: NameRegistry,
        name: string,
        scope: TypeScope,
        jsonPath?: JsonPath,
        readonly field?: AstField
    ) {
        super(registry, name, scope, jsonPath);
    }
}

/**
 * Represents a method member within a type.
 */
class Method extends Member {}

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
     * Registry mapping JSON paths from the IR to their ClassReference objects.
     * Provides fast lookup of class references by their IR origin.
     */
    private readonly classReferenceByJsonPath = new Map<JsonPath, ClassReference>();

    /**
     * Registry mapping fully qualified type names to their canonical ClassReference objects.
     * This registry tracks all known types and may contain remapped versions to avoid conflicts.
     *
     * Key format: "Namespace.TypeName" or "Namespace.EnclosingType.TypeName"
     * Value: The canonical ClassReference for the type
     */
    private readonly typeRegistry = new Map<FullyQualifiedName, ClassReference>();

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
     * Registry tracking namespace names that appear in multiple contexts.
     * Used for detecting ambiguous namespace references.
     *
     * Key: Namespace segment (e.g., "Collections", "Data")
     * Value: Set of parent namespace paths where this segment appears
     */
    private readonly namespaceNames = new Map<string, Set<string>>();

    /**
     * Set of namespaces that are implicitly imported/available.
     * Types in nested namespaces under these prefixes are tracked for ambiguity detection.
     */
    private readonly implicitNamespaces = new Set<string>();

    /**
     * Shortcut mapping JSON paths to field names for fast lookup.
     * Enables quick field name resolution without needing to know the containing type.
     */
    private readonly shortcuts = new Map<string, string>();

    /**
     * Set of well-known C# identifiers that should be avoided or handled carefully during code generation.
     * These include common .NET Framework namespaces and types that could cause naming conflicts.
     *
     * This set is populated with:
     * - Common .NET Framework namespace segments
     * - Built-in type names from the builtIns registry
     * - Namespace segments from all known built-in types
     */
    private readonly knownBuiltInIdentifiers = new Set([
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

    constructor(readonly generation: Generation) {
        this.initializeBuiltIns();
    }

    /**
     * Gets the CSharp generation context.
     * @returns The CSharp generation context
     */
    get csharp() {
        return this.generation.csharp;
    }

    /**
     * Gets the model navigator for accessing the IR.
     * @returns The model navigator
     */
    get model() {
        return this.generation.model;
    }

    /**
     * Initializes the known identifiers set with all built-in types and namespace segments.
     * This populates the registry with .NET Framework types to enable conflict detection
     * and ensures generated code doesn't conflict with framework types.
     */
    private initializeBuiltIns(): void {
        for (const [namespace, types] of Object.entries(builtIns)) {
            // Add each namespace segment to known identifiers
            namespace.split(".").forEach((segment) => this.knownBuiltInIdentifiers.add(segment));
            // Add each built-in type name to known identifiers
            types.forEach((type) => this.knownBuiltInIdentifiers.add(type));
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
     * Registers a shortcut mapping from JSON path to field name.
     * This enables fast field name lookup by IR origin without knowing the containing type.
     * @param jsonPath - The JSON path from the IR
     * @param name - The field name to associate with this JSON path
     */
    setFieldNameShortcut(jsonPath: JsonPath | undefined, name: string): void {
        if (jsonPath) {
            const current = this.shortcuts.get(jsonPath);
            if (current && current !== name) {
                fail(
                    `BAD_BAD_BAD setFieldNameShortcut: ${jsonPath} already has a name: ${current} - while setting to ${name} - if this is happening, then you could be getting back the wrong name later!`
                );
            }
            this.shortcuts.set(jsonPath, name);
        }
    }

    /**
     * Retrieves the name of a previously registered field using only its IR origin.
     *
     * This provides a shortcut for field name lookup without needing to know the containing type,
     * which is particularly useful when generating examples and snippets.
     *
     * Note: It is remotely possible that two fields generated from the same IR origin node could
     * have different names. This scenario is detected and logged by `setFieldNameShortcut`.
     * If this becomes an issue, the type must be resolved before retrieving the field name.
     *
     * @param origin - The IR origin node for the field
     * @returns The field name if found, `undefined` otherwise
     */
    getFieldNameByOrigin(origin: Origin | undefined): string | undefined {
        return this.shortcuts.get(this.model.jsonPath(origin) ?? ">ignore<");
    }

    /**
     * Checks if the given identifier is a well-known C# identifier that should be handled carefully.
     *
     * @param identifier - The identifier to check (e.g., "String", "Collections", "System")
     * @returns `true` if the identifier is a known C# identifier that could cause conflicts, `false` otherwise
     *
     * @example
     * ```typescript
     * nameRegistry.isKnownBuiltInIdentifier("String"); // true - conflicts with System.String
     * nameRegistry.isKnownBuiltInIdentifier("MyCustomType"); // false - safe to use
     * ```
     */
    public isKnownBuiltInIdentifier(identifier: string): boolean {
        if (!identifier || typeof identifier !== "string") {
            return false;
        }
        return this.knownBuiltInIdentifiers.has(identifier);
    }

    /**
     * Checks if a namespace has been registered in the namespace registry.
     * This includes both original namespaces and their canonical (potentially remapped) versions.
     *
     * @param namespace - The namespace to check
     * @returns `true` if the namespace is known/registered, `false` otherwise
     *
     * @example
     * ```typescript
     * nameRegistry.isKnownNamespace("System"); // true - registered during initialization
     * nameRegistry.isKnownNamespace("MyNamespace"); // false - not yet registered
     * ```
     */
    public isKnownNamespace(namespace: string): boolean {
        if (!namespace || typeof namespace !== "string") {
            return false;
        }
        return this.namespaceRegistry.has(namespace);
    }

    /**
     * Checks if a fully qualified type name is registered in the type registry.
     * This indicates whether the type has been encountered and processed during code generation.
     *
     * @param typeName - The fully qualified type name to check (e.g., "System.String", "MyNamespace.MyType")
     * @returns `true` if the type is registered, `false` otherwise
     *
     * @example
     * ```typescript
     * nameRegistry.isRegisteredTypeName("System.String"); // true - built-in type
     * nameRegistry.isRegisteredTypeName("MyNamespace.MyType"); // false - not yet registered
     * ```
     */
    public isRegisteredTypeName(typeName: string): boolean {
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
     * Determines if a namespace name is ambiguous (appears in multiple contexts).
     * @param name - The namespace name to check for ambiguity (optional)
     * @returns `true` if the namespace name appears in multiple contexts, `false` otherwise
     */
    public isAmbiguousNamespaceName(name?: string): boolean {
        return name ? (this.namespaceNames.get(name)?.size ?? 0) > 1 : false;
    }

    /**
     * Generates a fully qualified name string from a class reference identity.
     * For nested types, includes the enclosing type in the qualified name.
     *
     * @param classReference - The class reference identity to convert to a qualified name
     * @param classReference.name - The type name
     * @param classReference.namespace - The namespace containing the type
     * @param classReference.enclosingType - Optional enclosing type for nested types
     * @returns A fully qualified name string (e.g., "Namespace.TypeName" or "Namespace.EnclosingType.TypeName")
     */
    public static fullyQualifiedNameOf(classReference: ClassReference.Identity): string {
        // Create a consistent string representation for registry keys
        return classReference.enclosingType
            ? `${classReference.namespace}.${classReference.enclosingType.name}.${classReference.name}`
            : `${classReference.namespace}.${classReference.name}`;
    }

    /**
     * Registers a namespace mapping, recording when an original namespace is remapped to a different name.
     * Logs an error if attempting to register conflicting mappings for the same namespace.
     * @param from - The original namespace name
     * @param to - The canonical namespace name (potentially modified to avoid conflicts)
     */
    registerNamespace(from: string, to: string): void {
        if (this.namespaceRegistry.has(from) && this.namespaceRegistry.get(from) !== to) {
            this.generation.logger.warn(
                `NAMESPACE ALIAS: ${from} to ${to} already exists as ${this.namespaceRegistry.get(from)}`
            );
            this.generation.logger.warn(at({ filterFunctions: ["LoggerImpl", "Array.forEach"], multiline: true }));
            return;
        }

        this.namespaceRegistry.set(from, to);
    }

    /**
     * Registers a type in the type registry and updates related tracking data structures.
     * This method is called when a new type is encountered during code generation.
     * It handles JSON path mapping, namespace registration, and ambiguity tracking.
     *
     * @param classReference - The ClassReference to register
     * @param originalFullyQualifiedName - Optional original fully qualified name before any remapping
     * @returns The same ClassReference that was passed in (for method chaining)
     *
     * @example
     * ```typescript
     * const typeRef = csharp.classReference({ name: "MyType", namespace: "MyNamespace" });
     * nameRegistry.trackType(typeRef); // Registers the type
     * nameRegistry.trackType(typeRef, "OriginalNamespace.MyType"); // Also registers under original name
     * ```
     */
    public trackType(classReference: ClassReference, originalFullyQualifiedName?: FullyQualifiedName): ClassReference {
        const { name, namespace, enclosingType, fullyQualifiedName, origin } = classReference;

        if (origin) {
            const jsonPath =
                this.model.jsonPath(origin) ??
                fail(`JsonPath not found for origin: ${JSON.stringify(origin).substring(0, 100)}`);

            this.classReferenceByJsonPath.set(jsonPath, classReference);
        }

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
                this.registerNamespace(ns, ns);
            }
            // Track the type name and its namespace for ambiguity detection
            if (!enclosingType) {
                // Implementation Note:
                // if the classReference is actually a nested type, we're going to skip
                // tracking it for ambiguity for the moment, as the ambiguity would only be if the type
                // was rendered in the enclosing type, and I don't think that happens.
                // regardless, if we wanted to make sure that worked, we'd have to know the scope where
                // the node was being rendered
                // (ie, in the code generator, keep track of where we are, not *just* the current namespace)
                this.trackTypeName(name, namespace);
            }

            for (const each of [this.generation.namespaces.root, ...this.implicitNamespaces]) {
                if (namespace.startsWith(each)) {
                    // get the next word of the namespace
                    const trimmed = namespace.split(".")[each.split(".").length];

                    if (trimmed) {
                        this.trackTypeName(trimmed, namespace);
                    }
                }
            }
        }

        return classReference;
    }

    /**
     * Adds a namespace to the set of implicit namespaces.
     * Implicit namespaces are used to automatically track type names from nested namespaces
     * that start with the implicit namespace prefix.
     *
     * @param namespace - The namespace to add as an implicit namespace
     *
     * @example
     * ```typescript
     * nameRegistry.addImplicitNamespace("MyCompany");
     * // Now types in "MyCompany.Products" will automatically track "Products" as a type name
     * ```
     */
    public addImplicitNamespace(namespace: string): void {
        this.implicitNamespaces.add(namespace);
    }

    public isNamespaceImplicit(namespace: string): boolean {
        return this.implicitNamespaces.has(namespace);
    }

    public get implicitlyImportedNamespaces(): string[] {
        return [...this.implicitNamespaces];
    }
    /**
     * Tracks a type name and its namespace for ambiguity detection.
     * This method updates the typeNames registry to track which namespaces contain each type name,
     * enabling detection of ambiguous type names that exist in multiple namespaces.
     *
     * @param name - The type name to track
     * @param namespace - The namespace where this type name exists
     *
     * @example
     * ```typescript
     * nameRegistry.trackTypeName("String", "System");
     * nameRegistry.trackTypeName("String", "MyNamespace");
     * nameRegistry.isAmbiguousTypeName("String"); // true - exists in multiple namespaces
     * ```
     */
    public trackTypeName(name: string, namespace: string): void {
        if (this.typeNames.has(name)) {
            this.typeNames.get(name)?.add(namespace);
        } else {
            this.typeNames.set(name, new Set([namespace]));
        }
        // add namespace part names to the list of namespace names that we want to track for ambiguity
        const parts = namespace.split(".");
        let ns = "";
        for (const each of parts) {
            if (this.namespaceNames.has(each)) {
                this.namespaceNames.get(each)?.add(ns);
            } else {
                this.namespaceNames.set(each, new Set([ns]));
            }
            ns = ns ? `${ns}.${each}` : each;
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

    /**
     * Creates and registers a new ClassReference with automatic conflict resolution.
     * This is the primary method for creating class references. It ensures proper registration
     * and resolves any naming conflicts with existing types or namespaces.
     *
     * The method performs several checks:
     * - Looks up existing class references by IR origin (JSON path)
     * - Resolves namespace remappings
     * - Detects and resolves conflicts between types and namespaces
     * - Handles duplicate type names from different IR origins
     *
     * @param classReferenceArgs - The arguments for creating the class reference
     * @param expectedFQN - The expected fully qualified name before conflict resolution
     * @returns A new or existing ClassReference, potentially with modified names to avoid conflicts
     *
     * @example
     * ```typescript
     * const classRef = nameRegistry.registerClassReference(
     *   { name: "MyType", namespace: "MyNamespace", origin: irNode },
     *   "MyNamespace.MyType"
     * );
     * ```
     */
    public registerClassReference(
        classReferenceArgs: ClassReference.Args & { namespace: string },
        expectedFQN: string
    ): ClassReference {
        let { name, namespace, enclosingType, origin } = classReferenceArgs;

        // look it up by origin first, because if we have that, then we're dead-on accurate.
        const callerJsonPath = this.model.jsonPath(origin);

        // do we have a class reference already that matches (by origin, or failing that by name)
        const classRef =
            (callerJsonPath ? this.classReferenceByJsonPath.get(callerJsonPath) : undefined) ??
            this.typeRegistry.get(expectedFQN);

        const existingJsonPath = this.model.jsonPath(classRef?.origin);

        // if the caller and the registered class reference have an origin, then then should be the same.
        // if either of them don't have an origin, we can't make the comparison, and so have to trust the caller knows what they are asking for.
        // (over time, we should be ensuring that all class references get an origin set.)
        let quality =
            existingJsonPath && callerJsonPath
                ? existingJsonPath === callerJsonPath
                    ? "match"
                    : "mismatch"
                : "no origin";

        if (classRef && quality !== "mismatch") {
            // we have a class reference that *should* be what we're looking for and
            // either the origin matches or we don't have an origin on one end or the other to compare with.
            // return the new instance of the class reference for the caller
            // creates a clone

            return new ClassReference(
                {
                    name: classRef.name,
                    namespace: classRef.namespace,
                    enclosingType: classRef.enclosingType,
                    fullyQualifiedName: classRef.fullyQualifiedName,

                    namespaceAlias: classReferenceArgs.namespaceAlias,
                    fullyQualified: classReferenceArgs.fullyQualified,
                    generics: classReferenceArgs.generics,
                    global: classReferenceArgs.global,
                    origin: classRef.origin ?? origin
                },
                // reuse the type scope from the existing class reference, because it's the common data across all copies of a class reference
                classRef.scope,
                this.generation
            );
        }

        // no, we've never seen this class reference before.
        // check to see if we have to adjust it to avoid conflicts
        let modified = false;

        // Resolve any namespace remappings first
        const resolvedNamespace = this.resolveNamespace(namespace);
        if (resolvedNamespace !== namespace) {
            namespace = resolvedNamespace;
            modified = true;
        }

        // Ensure no conflicts with existing types or namespaces
        let fullyQualifiedName: FullyQualifiedName;
        conflictResolution: while (true) {
            fullyQualifiedName = NameRegistry.fullyQualifiedNameOf({ name, namespace, enclosingType });
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

                    // `RENAMING NAMESPACE: ${classReferenceArgs.namespace} to ${namespace} with existing fqNamespace: ${fqNamespace} caller: ${callerJsonPath} / existing: ${existingJsonPath}`

                    continue conflictResolution;
                }
            }

            // Cache namespace modifications
            if (modified) {
                this.registerNamespace(classReferenceArgs.namespace, namespace);
            }

            if (quality === "mismatch" && classRef?.name === name) {
                // the origin mismatch means that the caller is asking for a different class reference, so we need to modify the type name
                // this can be expected when there are multiple types with the same name (pagination!)

                name = `${name}_`;
                modified = true;
                continue conflictResolution;
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

        // Create and register the ClassReference
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
                    fullyQualifiedName,
                    origin
                },
                // the typescope is the common data across all copies of a class referecne
                new TypeScope(this, name, namespace, fullyQualifiedName),
                this.generation
            ),
            expectedFQN
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
                    this.registerNamespace(namespace, newNamespace);
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
            this.registerNamespace(originalNamespace, namespace);
        }

        return namespace;
    }
}
