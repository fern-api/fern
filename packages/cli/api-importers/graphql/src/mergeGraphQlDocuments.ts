import {
    ASTNode,
    ConstDirectiveNode,
    DefinitionNode,
    DocumentNode,
    InputValueDefinitionNode,
    Kind,
    NamedTypeNode,
    OperationTypeDefinitionNode,
    parse,
    print,
    TypeDefinitionNode,
    TypeExtensionNode,
    TypeNode
} from "graphql";

/**
 * `@inaccessible` marks a member that composition omits from the client-facing API schema, so it is
 * removed rather than merely having its directive stripped.
 */
const INACCESSIBLE_DIRECTIVE = "inaccessible";

/**
 * Directives that describe how a federated graph is composed at runtime rather than what a
 * consumer can call. Apollo strips these when it derives the client-facing API schema from a
 * supergraph, so they are dropped here too. Standard directives such as `@deprecated` are kept.
 *
 * A subgraph never defines these itself -- it imports them via `@link` -- so any that survive
 * stripping leave `buildASTSchema` with an unknown directive, which forces the whole schema onto
 * the `assumeValidSDL` fallback and silences validation for everything else in the file. Keep this
 * list current with the federation spec: it covers v1 through v2.9.
 */
const FEDERATION_DIRECTIVES = new Set([
    "link",
    "key",
    "external",
    "requires",
    "provides",
    "shareable",
    "inaccessible",
    "override",
    "extends",
    "composeDirective",
    "interfaceObject",
    "tag",
    "authenticated",
    "requiresScopes",
    "policy",
    // federation v2.8
    "context",
    "fromContext",
    // federation v2.9 (demand control)
    "cost",
    "listSize"
]);

export interface GraphQlSource {
    /** Only used to describe conflicts back to the user. */
    filePath: string;
    sdl: string;
}

export interface GraphQlDocumentConflict {
    typeName: string;
    memberName: string;
    kept: string;
    dropped: string;
}

export interface MergedGraphQlDocument {
    document: DocumentNode;
    conflicts: GraphQlDocumentConflict[];
}

interface MergedMember {
    /** Source file the member came from, for conflict reporting. */
    filePath: string;
    /** Shape of the member, so only incompatible redeclarations are reported as conflicts. */
    signature: string;
}

interface MergedType {
    definition: TypeDefinitionNode;
    /** File the type was first declared in, so a conflicting redeclaration names the right file. */
    filePath: string;
    members: Map<string, MergedMember>;
    /**
     * Whether the definition so far only comes from `extend type X`. An extension carries no
     * description or type-level directives of its own, so the real definition -- which may be
     * parsed later, since file order is arbitrary -- has to replace it as the base.
     */
    fromExtension: boolean;
}

interface InaccessibleState {
    /** Types declared `@inaccessible`, which are removed along with every reference to them. */
    types: Set<string>;
    /** Whether anything at all was marked `@inaccessible`, so the pruning pass can be skipped. */
    seen: boolean;
}

/**
 * Merges any number of SDL documents into a single document that `buildASTSchema` can consume.
 *
 * Federation subgraphs are not standalone schemas: they reference types owned by sibling subgraphs
 * and extend the same root types. This composes them the way a supergraph composition would, for
 * documentation purposes only -- runtime ownership semantics are intentionally not modeled.
 */
export function mergeGraphQlDocuments(sources: readonly GraphQlSource[]): MergedGraphQlDocument {
    const conflicts: GraphQlDocumentConflict[] = [];
    const types = new Map<string, MergedType>();
    const directiveDefinitions = new Map<string, { definition: DefinitionNode; filePath: string }>();
    const operationTypes = new Map<string, { operationType: OperationTypeDefinitionNode; filePath: string }>();
    const otherDefinitions: DefinitionNode[] = [];
    const inaccessible: InaccessibleState = { types: new Set(), seen: false };

    for (const source of sources) {
        for (const definition of parseSource(source).definitions) {
            if (definition.kind === Kind.DIRECTIVE_DEFINITION) {
                const directiveName = definition.name.value;
                if (FEDERATION_DIRECTIVES.has(directiveName)) {
                    continue;
                }
                const owner = directiveDefinitions.get(directiveName);
                if (owner == null) {
                    directiveDefinitions.set(directiveName, { definition, filePath: source.filePath });
                } else if (print(owner.definition) !== print(definition)) {
                    // First-wins, as for types: letting a later file replace the definition would
                    // leave earlier usages referencing arguments that no longer exist.
                    conflicts.push({
                        typeName: `@${directiveName}`,
                        memberName: "<declaration>",
                        kept: owner.filePath,
                        dropped: source.filePath
                    });
                }
                continue;
            }

            if (definition.kind === Kind.SCHEMA_DEFINITION || definition.kind === Kind.SCHEMA_EXTENSION) {
                for (const operationType of definition.operationTypes ?? []) {
                    const owner = operationTypes.get(operationType.operation);
                    if (owner == null) {
                        operationTypes.set(operationType.operation, { operationType, filePath: source.filePath });
                    } else if (owner.operationType.type.name.value !== operationType.type.name.value) {
                        // First-wins, as for types: the root operation type a later file names would
                        // orphan every operation the earlier one contributed.
                        conflicts.push({
                            typeName: "schema",
                            memberName: operationType.operation,
                            kept: owner.filePath,
                            dropped: source.filePath
                        });
                    }
                }
                continue;
            }

            if (isTypeExtension(definition)) {
                mergeTypeDefinition({
                    incoming: typeExtensionToDefinition(definition),
                    isExtension: true,
                    filePath: source.filePath,
                    types,
                    conflicts,
                    inaccessible
                });
                continue;
            }

            if (isTypeDefinition(definition)) {
                mergeTypeDefinition({
                    incoming: definition,
                    isExtension: false,
                    filePath: source.filePath,
                    types,
                    conflicts,
                    inaccessible
                });
                continue;
            }

            if (definition.kind === Kind.OPERATION_DEFINITION || definition.kind === Kind.FRAGMENT_DEFINITION) {
                // An executable document (a query or fragment) contributes nothing to the schema, so
                // it is dropped rather than emitted into the merged type system document.
                continue;
            }

            otherDefinitions.push(definition);
        }
    }

    if (inaccessible.seen) {
        const queryRootName = queryRootTypeName(operationTypes, types);
        pruneInaccessibleTypes(types, inaccessible.types);
        pruneUnsatisfiedInterfaces(types);
        // Dropping an emptied `Mutation` still leaves a usable schema, but dropping the query root
        // leaves nothing at all -- `buildASTSchema` then yields a schema with no types and the docs
        // silently lose the whole API. That is always a mis-specified schema, so say so.
        if (queryRootName != null && !types.has(queryRootName)) {
            throw new Error(
                `Every field on the GraphQL query root "${queryRootName}" returns a type marked @inaccessible ` +
                    `(${[...inaccessible.types].sort().join(", ")}), so the merged schema has no reachable ` +
                    "operations. Remove @inaccessible from at least one reachable type, or exclude these files " +
                    "from the docs."
            );
        }
    }

    const definitions: DefinitionNode[] = [
        ...[...directiveDefinitions.values()].map((entry) => entry.definition),
        ...otherDefinitions,
        ...[...types.values()].map((type) => type.definition)
    ];

    const rootOperationTypes = [...operationTypes.values()]
        .map((entry) => entry.operationType)
        .filter((operationType) => types.has(operationType.type.name.value));
    if (rootOperationTypes.length > 0) {
        definitions.push({ kind: Kind.SCHEMA_DEFINITION, operationTypes: rootOperationTypes });
    }

    return { document: { kind: Kind.DOCUMENT, definitions }, conflicts };
}

/**
 * Name of the type serving as the query root: whatever `schema { query: ... }` declares, else the
 * conventional `Query`. Returns undefined when the merged sources have no query root to begin with,
 * which is not this function's problem to report.
 */
function queryRootTypeName(
    operationTypes: ReadonlyMap<string, { operationType: OperationTypeDefinitionNode }>,
    types: ReadonlyMap<string, MergedType>
): string | undefined {
    const declared = operationTypes.get("query")?.operationType.type.name.value;
    if (declared != null) {
        return types.has(declared) ? declared : undefined;
    }
    return types.has("Query") ? "Query" : undefined;
}

/** Parses a source, naming the file in the error so one bad spec in a group can be identified. */
function parseSource(source: GraphQlSource): DocumentNode {
    try {
        return parse(source.sdl);
    } catch (error) {
        throw new Error(`${source.filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function isTypeDefinition(definition: DefinitionNode): definition is TypeDefinitionNode {
    return (
        definition.kind === Kind.SCALAR_TYPE_DEFINITION ||
        definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.INTERFACE_TYPE_DEFINITION ||
        definition.kind === Kind.UNION_TYPE_DEFINITION ||
        definition.kind === Kind.ENUM_TYPE_DEFINITION ||
        definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
    );
}

function isTypeExtension(definition: DefinitionNode): definition is TypeExtensionNode {
    return (
        definition.kind === Kind.SCALAR_TYPE_EXTENSION ||
        definition.kind === Kind.OBJECT_TYPE_EXTENSION ||
        definition.kind === Kind.INTERFACE_TYPE_EXTENSION ||
        definition.kind === Kind.UNION_TYPE_EXTENSION ||
        definition.kind === Kind.ENUM_TYPE_EXTENSION ||
        definition.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION
    );
}

/**
 * `extend type X { ... }` carries the same members as a definition, so it is normalized into one
 * and then merged with whichever file declares the base type.
 */
function typeExtensionToDefinition(extension: TypeExtensionNode): TypeDefinitionNode {
    switch (extension.kind) {
        case Kind.SCALAR_TYPE_EXTENSION:
            return { ...extension, kind: Kind.SCALAR_TYPE_DEFINITION, description: undefined };
        case Kind.OBJECT_TYPE_EXTENSION:
            return { ...extension, kind: Kind.OBJECT_TYPE_DEFINITION, description: undefined };
        case Kind.INTERFACE_TYPE_EXTENSION:
            return { ...extension, kind: Kind.INTERFACE_TYPE_DEFINITION, description: undefined };
        case Kind.UNION_TYPE_EXTENSION:
            return { ...extension, kind: Kind.UNION_TYPE_DEFINITION, description: undefined };
        case Kind.ENUM_TYPE_EXTENSION:
            return { ...extension, kind: Kind.ENUM_TYPE_DEFINITION, description: undefined };
        case Kind.INPUT_OBJECT_TYPE_EXTENSION:
            return { ...extension, kind: Kind.INPUT_OBJECT_TYPE_DEFINITION, description: undefined };
    }
}

function stripFederationDirectives(
    directives: readonly ConstDirectiveNode[] | undefined
): readonly ConstDirectiveNode[] | undefined {
    if (directives == null) {
        return undefined;
    }
    return directives.filter((directive) => !FEDERATION_DIRECTIVES.has(directive.name.value));
}

function isInaccessible(node: { directives?: readonly ConstDirectiveNode[] }): boolean {
    return node.directives?.some((directive) => directive.name.value === INACCESSIBLE_DIRECTIVE) ?? false;
}

function cleanArguments(
    args: readonly InputValueDefinitionNode[] | undefined,
    inaccessible: InaccessibleState
): readonly InputValueDefinitionNode[] | undefined {
    return args?.filter(keepAccessible(inaccessible)).map((argument) => ({
        ...argument,
        directives: stripFederationDirectives(argument.directives)
    }));
}

function keepAccessible(
    inaccessible: InaccessibleState
): (node: { directives?: readonly ConstDirectiveNode[] }) => boolean {
    return (node) => {
        if (!isInaccessible(node)) {
            return true;
        }
        inaccessible.seen = true;
        return false;
    };
}

function cleanTypeDefinition(definition: TypeDefinitionNode, inaccessible: InaccessibleState): TypeDefinitionNode {
    const directives = stripFederationDirectives(definition.directives);
    if (isInaccessible(definition)) {
        inaccessible.seen = true;
        inaccessible.types.add(definition.name.value);
    }
    const keep = keepAccessible(inaccessible);
    switch (definition.kind) {
        case Kind.OBJECT_TYPE_DEFINITION:
        case Kind.INTERFACE_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                fields: definition.fields?.filter(keep).map((field) => ({
                    ...field,
                    directives: stripFederationDirectives(field.directives),
                    arguments: cleanArguments(field.arguments, inaccessible)
                }))
            };
        case Kind.INPUT_OBJECT_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                fields: definition.fields?.filter(keep).map((field) => ({
                    ...field,
                    directives: stripFederationDirectives(field.directives)
                }))
            };
        case Kind.ENUM_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                values: definition.values?.filter(keep).map((value) => ({
                    ...value,
                    directives: stripFederationDirectives(value.directives)
                }))
            };
        case Kind.SCALAR_TYPE_DEFINITION:
        case Kind.UNION_TYPE_DEFINITION:
            return { ...definition, directives };
    }
}

function namedTypeName(type: TypeNode): string {
    switch (type.kind) {
        case Kind.NAMED_TYPE:
            return type.name.value;
        case Kind.LIST_TYPE:
        case Kind.NON_NULL_TYPE:
            return namedTypeName(type.type);
    }
}

/**
 * Removes types declared `@inaccessible` together with every member that references them, repeating
 * until nothing changes: a type left with no members is itself unreachable and has to go, otherwise
 * the merged document would contain a dangling reference or an empty type.
 */
function pruneInaccessibleTypes(types: Map<string, MergedType>, inaccessibleTypes: ReadonlySet<string>): void {
    const removed = new Set<string>();
    for (const typeName of inaccessibleTypes) {
        if (types.delete(typeName)) {
            removed.add(typeName);
        }
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const [typeName, type] of types) {
            const pruned = pruneReferences(type.definition, removed);
            if (pruned == null) {
                types.delete(typeName);
                removed.add(typeName);
                changed = true;
                continue;
            }
            if (pruned !== type.definition) {
                type.definition = pruned;
                changed = true;
            }
        }
    }
}

function fieldNamesOf(definition: TypeDefinitionNode): ReadonlySet<string> {
    if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION && definition.kind !== Kind.INTERFACE_TYPE_DEFINITION) {
        return new Set();
    }
    return new Set((definition.fields ?? []).map((field) => field.name.value));
}

/**
 * Drops `implements I` wherever the `@inaccessible` cascade left a type without a field `I` requires.
 * `buildASTSchema` accepts such a document but `validateSchema` rejects it, so without this the merge
 * can only produce an invalid schema; showing the type without the interface is the lesser loss.
 */
function pruneUnsatisfiedInterfaces(types: Map<string, MergedType>): void {
    for (const type of types.values()) {
        const definition = type.definition;
        if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION && definition.kind !== Kind.INTERFACE_TYPE_DEFINITION) {
            continue;
        }
        const declared = definition.interfaces ?? [];
        const ownFields = fieldNamesOf(definition);
        const interfaces = declared.filter((node) => {
            const implemented = types.get(node.name.value);
            if (implemented == null) {
                return false;
            }
            return [...fieldNamesOf(implemented.definition)].every((fieldName) => ownFields.has(fieldName));
        });
        if (interfaces.length !== declared.length) {
            type.definition = { ...definition, interfaces };
        }
    }
}

/** Returns the definition with references to removed types dropped, or `null` if it is now empty. */
function pruneReferences(definition: TypeDefinitionNode, removed: ReadonlySet<string>): TypeDefinitionNode | null {
    switch (definition.kind) {
        case Kind.OBJECT_TYPE_DEFINITION:
        case Kind.INTERFACE_TYPE_DEFINITION: {
            const fields = (definition.fields ?? []).filter(
                (field) =>
                    !removed.has(namedTypeName(field.type)) &&
                    !(field.arguments ?? []).some((argument) => removed.has(namedTypeName(argument.type)))
            );
            if (fields.length === 0) {
                return null;
            }
            const interfaces = (definition.interfaces ?? []).filter((node) => !removed.has(node.name.value));
            if (
                fields.length === definition.fields?.length &&
                interfaces.length === (definition.interfaces ?? []).length
            ) {
                return definition;
            }
            return { ...definition, fields, interfaces };
        }
        case Kind.INPUT_OBJECT_TYPE_DEFINITION: {
            const fields = (definition.fields ?? []).filter((field) => !removed.has(namedTypeName(field.type)));
            if (fields.length === 0) {
                return null;
            }
            return fields.length === definition.fields?.length ? definition : { ...definition, fields };
        }
        case Kind.UNION_TYPE_DEFINITION: {
            const members = (definition.types ?? []).filter((node) => !removed.has(node.name.value));
            if (members.length === 0) {
                return null;
            }
            return members.length === definition.types?.length ? definition : { ...definition, types: members };
        }
        case Kind.ENUM_TYPE_DEFINITION:
            return definition.values?.length === 0 ? null : definition;
        case Kind.SCALAR_TYPE_DEFINITION:
            return definition;
    }
}

function mergeTypeDefinition({
    incoming,
    isExtension,
    filePath,
    types,
    conflicts,
    inaccessible
}: {
    incoming: TypeDefinitionNode;
    isExtension: boolean;
    filePath: string;
    types: Map<string, MergedType>;
    conflicts: GraphQlDocumentConflict[];
    inaccessible: InaccessibleState;
}): void {
    const name = incoming.name.value;
    const cleaned = cleanTypeDefinition(incoming, inaccessible);
    const existing = types.get(name);

    if (existing == null) {
        types.set(name, initMergedType(cleaned, filePath, isExtension));
        return;
    }

    if (existing.definition.kind !== cleaned.kind) {
        conflicts.push({
            typeName: name,
            memberName: "<declaration>",
            kept: existing.filePath,
            dropped: filePath
        });
        return;
    }

    if (existing.fromExtension && !isExtension) {
        // The real definition owns the description, the type-level directives and the member order,
        // so it becomes the base and the extension's members are appended to it.
        const promoted = initMergedType(cleaned, filePath, false);
        promoted.definition = mergeMembers(promoted, existing.definition, existing.filePath, conflicts);
        types.set(name, promoted);
        return;
    }

    existing.definition = mergeMembers(existing, cleaned, filePath, conflicts);
}

function initMergedType(definition: TypeDefinitionNode, filePath: string, fromExtension: boolean): MergedType {
    const members = new Map<string, MergedMember>();
    for (const member of getMembers(definition)) {
        members.set(member.name.value, { filePath, signature: memberSignature(member) });
    }
    return { definition, filePath, members, fromExtension };
}

function getMembers(definition: TypeDefinitionNode): readonly (ASTNode & { name: { value: string } })[] {
    switch (definition.kind) {
        case Kind.OBJECT_TYPE_DEFINITION:
        case Kind.INTERFACE_TYPE_DEFINITION:
        case Kind.INPUT_OBJECT_TYPE_DEFINITION:
            return definition.fields ?? [];
        case Kind.ENUM_TYPE_DEFINITION:
            return definition.values ?? [];
        case Kind.UNION_TYPE_DEFINITION:
            return definition.types ?? [];
        case Kind.SCALAR_TYPE_DEFINITION:
            return [];
    }
}

/**
 * Compares members by shape only. Descriptions and directives are ignored, so a value type that two
 * subgraphs declare identically is not treated as a conflict just because one of them documents it.
 */
function memberSignature(member: ASTNode & { name: { value: string } }): string {
    if (member.kind === Kind.FIELD_DEFINITION) {
        const args = (member.arguments ?? []).map((argument) => `${argument.name.value}:${print(argument.type)}`);
        return `${print(member.type)}(${args.join(",")})`;
    }
    if (member.kind === Kind.INPUT_VALUE_DEFINITION) {
        return print(member.type);
    }
    return member.name.value;
}

function mergeMembers(
    existing: MergedType,
    incoming: TypeDefinitionNode,
    filePath: string,
    conflicts: GraphQlDocumentConflict[]
): TypeDefinitionNode {
    const base = existing.definition;
    const description = base.description ?? incoming.description;
    const typeName = base.name.value;

    const dedupe = <T extends ASTNode & { name: { value: string } }>(
        current: readonly T[] | undefined,
        additional: readonly T[] | undefined
    ): T[] => {
        const merged = [...(current ?? [])];
        for (const member of additional ?? []) {
            const memberName = member.name.value;
            const signature = memberSignature(member);
            const owner = existing.members.get(memberName);
            if (owner != null) {
                // Subgraphs routinely redeclare a shared field (`id: ID! @external`) so they can
                // reference an entity; only a differing shape is an actual conflict.
                if (owner.signature !== signature) {
                    conflicts.push({ typeName, memberName, kept: owner.filePath, dropped: filePath });
                }
                continue;
            }
            existing.members.set(memberName, { filePath, signature });
            merged.push(member);
        }
        return merged;
    };

    if (base.kind === Kind.OBJECT_TYPE_DEFINITION && incoming.kind === Kind.OBJECT_TYPE_DEFINITION) {
        return {
            ...base,
            description,
            interfaces: dedupeNamedTypes(base.interfaces, incoming.interfaces),
            fields: dedupe(base.fields, incoming.fields)
        };
    }
    if (base.kind === Kind.INTERFACE_TYPE_DEFINITION && incoming.kind === Kind.INTERFACE_TYPE_DEFINITION) {
        return {
            ...base,
            description,
            interfaces: dedupeNamedTypes(base.interfaces, incoming.interfaces),
            fields: dedupe(base.fields, incoming.fields)
        };
    }
    if (base.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && incoming.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION) {
        return { ...base, description, fields: dedupe(base.fields, incoming.fields) };
    }
    if (base.kind === Kind.ENUM_TYPE_DEFINITION && incoming.kind === Kind.ENUM_TYPE_DEFINITION) {
        return { ...base, description, values: dedupe(base.values, incoming.values) };
    }
    if (base.kind === Kind.UNION_TYPE_DEFINITION && incoming.kind === Kind.UNION_TYPE_DEFINITION) {
        return { ...base, description, types: dedupeNamedTypes(base.types, incoming.types) };
    }
    return { ...base, description };
}

function dedupeNamedTypes(
    current: readonly NamedTypeNode[] | undefined,
    additional: readonly NamedTypeNode[] | undefined
): NamedTypeNode[] {
    const seen = new Set((current ?? []).map((type) => type.name.value));
    const merged = [...(current ?? [])];
    for (const type of additional ?? []) {
        if (!seen.has(type.name.value)) {
            seen.add(type.name.value);
            merged.push(type);
        }
    }
    return merged;
}
