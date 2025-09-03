import { ClassReference } from "../ast/ClassReference";
import { builtIns } from "./builtIn";

// maps fully qualified names to class references (may be remapped)
// Map<fully-qualified-name, canonical-class-reference>
const typeRegistry = new Map<string, ClassReference>();

// maps namespaces to actual namespace names (may be remapped)
// Map<original-namespace, canonical-namespace>
const namespaceRegistry = new Map<string, string>();

// types that have names that could be ambiguous, and should be explicitly qualified when used.
// Map<typename, Set<namespace>>
const typeNames = new Map<string, Set<string>>();

// well-known identifiers that we should be aware of.
const knownIdentifiers = new Set([
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

// add all the namespaces and built in types to known identifiers
for (const [namespace, types] of Object.entries(builtIns)) {
    namespace.split(".").forEach((segment) => knownIdentifiers.add(segment));
    types.forEach((type) => knownIdentifiers.add(type));
}

// set up typeName map with built in types, so we can identify potential conflicts with them.
for (const [namespace, names] of Object.entries(builtIns)) {
    for (const name of names) {
        typeNames.set(name, new Set([namespace]));
    }
}

export function isKnownIdentifier(identifier: string) {
    return knownIdentifiers.has(identifier);
}

export function isAmbiguousTypeName(name: string): boolean {
    return (typeNames.get(name)?.size ?? 0) > 1;
}

function normalizeClassReference(classReference: {
    name: string;
    namespace: string;
    enclosingType?: ClassReference;
}): string {
    // stringify the class reference, but in a consistent format
    return classReference.enclosingType
        ? `${classReference.namespace}.${classReference.enclosingType.name}.${classReference.name}`
        : `${classReference.namespace}.${classReference.name}`;
}

export function trackType(classReference: ClassReference) {
    const { name, namespace, enclosingType } = classReference;
    const fullyQualifiedName = enclosingType ? `${namespace}.${enclosingType.name}.${name}` : `${namespace}.${name}`;
    if (!typeRegistry.has(fullyQualifiedName)) {
        typeRegistry.set(fullyQualifiedName, classReference);
        for (const ns of allNamespacesOf(namespace)) {
            namespaceRegistry.set(ns, ns);
        }
        // track the type name and what namespaces it is in.
        if (typeNames.has(name)) {
            typeNames.get(name)?.add(namespace);
        } else {
            typeNames.set(name, new Set([namespace]));
        }
    }
    return classReference;
}

export function allNamespacesOf(namespace: string): Set<string> {
    let fqNamespace = "";
    const result = new Set<string>();
    for (const part of namespace.split(".")) {
        fqNamespace = fqNamespace ? `${fqNamespace}.${part}` : `${part}`;
        result.add(fqNamespace);
    }
    return result;
}

/** returns the canonicalized class reference for the given class reference. */
export function resolveType(classReference: ClassReference): ClassReference {
    const classRef = typeRegistry.get(normalizeClassReference(classReference));

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

export function resolveNamespace(namespace: string): string {
    if (namespaceRegistry.has(namespace)) {
        return namespaceRegistry.get(namespace) as string;
    }

    // parent namespaces have to be looked at to see if they are already remapped too.
    let fqNamespace = "";

    // work backwards starting with the full namespace and then each parent namespace
    const parts = namespace.split(".");
    for (let i = parts.length - 1; i >= 0; i--) {
        const ns = parts.slice(0, i).join(".");
        if (namespaceRegistry.has(ns)) {
            const newNamespace = `${namespaceRegistry.get(ns)}.${parts.slice(i).join(".")}`;
            namespaceRegistry.set(namespace, newNamespace);
            return newNamespace;
        }
    }

    return namespace;
}

export function canonicalizeNamespace(originalNamespace: string): string {
    if (namespaceRegistry.has(originalNamespace)) {
        return namespaceRegistry.get(originalNamespace) as string;
    }
    let modified = false;
    let namespace = originalNamespace;

    // we need to make sure that we're not conflicting with any existing classes or namespaces.
    loop: while (true) {
        // get the partial namespaces for the namespace
        let fqNamespace = "";

        const parts = namespace.split(".");
        for (let i = 0; i < parts.length; i++) {
            fqNamespace = fqNamespace ? `${fqNamespace}.${parts[i]}` : `${parts[i]}`;

            if (typeRegistry.has(fqNamespace)) {
                // the class that is being created has a namespace that will conflict with
                // an existing known
                // modify the namespace to avoid the conflict.
                parts[i] = `${parts[i]}_`;
                namespace = parts.join(".");
                modified = true;
                continue loop;
            }
        }

        if (modified) {
            namespaceRegistry.set(originalNamespace, namespace);
        }

        // seems that we're good to go
        break;
    }

    return namespace;
}

export function canonicalizeName(classReference: ClassReference) {
    let key = normalizeClassReference(classReference);
    if (typeRegistry.has(key)) {
        return resolveType(classReference);
    }

    let modified = false;
    let { name, namespace, enclosingType } = classReference;
    const ns = resolveNamespace(namespace);

    if (ns !== namespace) {
        namespace = ns;
        modified = true;
    }

    let fullyQualifiedName = key;

    // we need to make sure that we're not conflicting with any existing classes or namespaces.
    loop: while (true) {
        // regenerate the fully qualified name.
        fullyQualifiedName = normalizeClassReference({ name, namespace, enclosingType });

        // get the partial namespaces for the namespace
        let fqNamespace = "";

        const parts = namespace.split(".");
        for (let i = 0; i < parts.length; i++) {
            fqNamespace = fqNamespace ? `${fqNamespace}.${parts[i]}` : `${parts[i]}`;

            if (typeRegistry.has(fqNamespace)) {
                // the class that is being created has a namespace that will conflict with
                // an existing known
                // modify the namespace to avoid the conflict.
                parts[i] = `${parts[i]}_`;
                namespace = parts.join(".");
                modified = true;
                continue loop;
            }
        }

        if (modified) {
            namespaceRegistry.set(classReference.namespace, namespace);
        }

        // Check if the fully qualified name is already in the set of known namespaces.
        if (namespaceRegistry.has(fullyQualifiedName)) {
            // about to have a name conflict with an existing namespace.
            // modify the class name to avoid the conflict.
            name = `${name}_`;
            modified = true;
            continue loop;
        }

        if (typeRegistry.has(fullyQualifiedName)) {
            // about to have a name conflict with an existing known
            // modify the class name to avoid the conflict.
            // name = `${name}_`;
            // continue loop;
        }
        // seems that we're good to go
        break;
    }

    if (!modified) {
        // we didn't modify the class reference, so we can just return it as we found it.
        trackType(classReference);
        return classReference;
    }

    const remapped = new ClassReference({
        name,
        namespace,
        enclosingType,
        namespaceAlias: classReference.namespaceAlias,
        fullyQualified: classReference.fullyQualified,
        generics: classReference.generics,
        global: classReference.global
    });
    trackType(remapped);
    return remapped;
}

export interface TypeRegistryEntry {
    name: string;
    namespace: string;
    enclosingType?: TypeRegistryEntry;
    namespaceAlias?: string;
    fullyQualified?: boolean;
    global?: boolean;
}

export interface TypeRegistryInfo {
    types: Record<string, TypeRegistryEntry>;
    namespaces: Record<string, string>;
    names: Record<string, string[]>;
}

export function saveTypeRegistry(): TypeRegistryInfo {
    function toEntry(classReference: ClassReference): TypeRegistryEntry {
        return {
            name: classReference.name,
            namespace: classReference.namespace,
            enclosingType: classReference.enclosingType ? toEntry(classReference.enclosingType) : undefined,
            namespaceAlias: classReference.namespaceAlias,
            fullyQualified: classReference.fullyQualified,
            global: classReference.global
        };
    }

    // return an object that can be serialized via JSON
    const types = {} as Record<string, TypeRegistryEntry>;

    for (const [key, value] of typeRegistry.entries()) {
        types[key] = toEntry(value);
    }

    const names = {} as Record<string, string[]>;
    for (const [key, value] of typeNames.entries()) {
        names[key] = Array.from(value);
    }

    return {
        types,
        namespaces: Object.fromEntries(namespaceRegistry.entries()),
        names
    };
}

export function loadTypeRegistry(data: TypeRegistryInfo) {
    typeRegistry.clear();
    namespaceRegistry.clear();

    function toClassReference(entry: TypeRegistryEntry): ClassReference {
        return new ClassReference({
            name: entry.name,
            namespace: entry.namespace,
            enclosingType: entry.enclosingType ? toClassReference(entry.enclosingType) : undefined,
            namespaceAlias: entry.namespaceAlias,
            fullyQualified: entry.fullyQualified,
            global: entry.global
        });
    }
    for (const [key, value] of Object.entries(data.types)) {
        typeRegistry.set(key, toClassReference(value));
    }
    for (const [key, value] of Object.entries(data.namespaces)) {
        namespaceRegistry.set(key, value);
    }
    for (const [key, value] of Object.entries(data.names)) {
        typeNames.set(key, new Set(value));
    }
}
