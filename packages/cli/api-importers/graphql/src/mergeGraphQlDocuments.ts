import {
    ASTNode,
    ConstDirectiveNode,
    DefinitionNode,
    DocumentNode,
    Kind,
    NamedTypeNode,
    OperationTypeDefinitionNode,
    parse,
    print,
    TypeDefinitionNode,
    TypeExtensionNode
} from "graphql";

/**
 * Directives that describe how a federated graph is composed at runtime rather than what a
 * consumer can call. Apollo strips these when it derives the client-facing API schema from a
 * supergraph, so they are dropped here too. Standard directives such as `@deprecated` are kept.
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
    "policy"
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
    members: Map<string, MergedMember>;
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
    const directiveDefinitions = new Map<string, DefinitionNode>();
    const operationTypes = new Map<string, OperationTypeDefinitionNode>();
    const otherDefinitions: DefinitionNode[] = [];

    for (const source of sources) {
        for (const definition of parse(source.sdl).definitions) {
            if (definition.kind === Kind.DIRECTIVE_DEFINITION) {
                if (!FEDERATION_DIRECTIVES.has(definition.name.value)) {
                    directiveDefinitions.set(definition.name.value, definition);
                }
                continue;
            }

            if (definition.kind === Kind.SCHEMA_DEFINITION || definition.kind === Kind.SCHEMA_EXTENSION) {
                for (const operationType of definition.operationTypes ?? []) {
                    operationTypes.set(operationType.operation, operationType);
                }
                continue;
            }

            if (isTypeExtension(definition)) {
                mergeTypeDefinition(typeExtensionToDefinition(definition), source.filePath, types, conflicts);
                continue;
            }

            if (isTypeDefinition(definition)) {
                mergeTypeDefinition(definition, source.filePath, types, conflicts);
                continue;
            }

            otherDefinitions.push(definition);
        }
    }

    const definitions: DefinitionNode[] = [
        ...directiveDefinitions.values(),
        ...otherDefinitions,
        ...[...types.values()].map((type) => type.definition)
    ];

    if (operationTypes.size > 0) {
        definitions.push({ kind: Kind.SCHEMA_DEFINITION, operationTypes: [...operationTypes.values()] });
    }

    return { document: { kind: Kind.DOCUMENT, definitions }, conflicts };
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

function cleanTypeDefinition(definition: TypeDefinitionNode): TypeDefinitionNode {
    const directives = stripFederationDirectives(definition.directives);
    switch (definition.kind) {
        case Kind.OBJECT_TYPE_DEFINITION:
        case Kind.INTERFACE_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                fields: definition.fields?.map((field) => ({
                    ...field,
                    directives: stripFederationDirectives(field.directives),
                    arguments: field.arguments?.map((argument) => ({
                        ...argument,
                        directives: stripFederationDirectives(argument.directives)
                    }))
                }))
            };
        case Kind.INPUT_OBJECT_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                fields: definition.fields?.map((field) => ({
                    ...field,
                    directives: stripFederationDirectives(field.directives)
                }))
            };
        case Kind.ENUM_TYPE_DEFINITION:
            return {
                ...definition,
                directives,
                values: definition.values?.map((value) => ({
                    ...value,
                    directives: stripFederationDirectives(value.directives)
                }))
            };
        case Kind.SCALAR_TYPE_DEFINITION:
        case Kind.UNION_TYPE_DEFINITION:
            return { ...definition, directives };
    }
}

function mergeTypeDefinition(
    incoming: TypeDefinitionNode,
    filePath: string,
    types: Map<string, MergedType>,
    conflicts: GraphQlDocumentConflict[]
): void {
    const name = incoming.name.value;
    const cleaned = cleanTypeDefinition(incoming);
    const existing = types.get(name);

    if (existing == null) {
        const members = new Map<string, MergedMember>();
        for (const member of getMembers(cleaned)) {
            members.set(member.name.value, { filePath, signature: memberSignature(member) });
        }
        types.set(name, { definition: cleaned, members });
        return;
    }

    if (existing.definition.kind !== cleaned.kind) {
        conflicts.push({
            typeName: name,
            memberName: "<declaration>",
            kept: existing.members.values().next().value?.filePath ?? filePath,
            dropped: filePath
        });
        return;
    }

    existing.definition = mergeMembers(existing, cleaned, filePath, conflicts);
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
                if (owner.filePath !== filePath && owner.signature !== signature) {
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
