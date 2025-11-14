import { IntermediateRepresentation, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";

export function detectProhibitedCycles(ir: IntermediateRepresentation) {
    const dependencyGraph = buildRequiredDependencyGraph(ir);
    const visited = new Set<TypeId>();
    const visiting = new Set<TypeId>();
    const stack: TypeId[] = [];

    const typeIds = Object.keys(ir.types) as TypeId[];

    for (const typeId of typeIds) {
        if (!visited.has(typeId)) {
            const cycle = dfsFindCycle(typeId, dependencyGraph, visited, visiting, stack);
            if (cycle != null) {
                const message = formatCycleError(cycle, ir);
                throw new Error(message);
            }
        }
    }
}

/**
 * Builds a graph where there is a directed edge A -> B iff every value of A
 * must (transitively) contain a value of B. In practice, this means:
 *
 * - edges through required object properties whose type is a non-container,
 *   non-nullable, non-optional named type (after alias resolution)
 * - edges through object/union inheritance (`extends`)
 *
 * Edges through containers (list, set, map, literal) and optional/nullable
 * wrappers are intentionally ignored, because those provide a finite base case
 * (e.g. empty collection or null), which makes such cycles representable in JSON.
 */
function buildRequiredDependencyGraph(ir: IntermediateRepresentation): Map<TypeId, TypeId[]> {
    const graph = new Map<TypeId, TypeId[]>();

    for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
        const dependencies = new Set<TypeId>();
        addRequiredDependenciesForType({ ir, typeDeclaration, dependencies });
        graph.set(typeId, Array.from(dependencies));
    }

    return graph;
}

function addRequiredDependenciesForType({
    ir,
    typeDeclaration,
    dependencies
}: {
    ir: IntermediateRepresentation;
    typeDeclaration: TypeDeclaration;
    dependencies: Set<TypeId>;
}): void {
    typeDeclaration.shape._visit({
        alias: (aliasShape) => {
            const deps = getRequiredNamedDependencies(aliasShape.aliasOf, ir);
            deps.forEach((dep) => dependencies.add(dep));
        },
        enum: () => {
            // enums have no recursive structure
        },
        object: (objectShape) => {
            // Inheritance is always required
            for (const parent of objectShape.extends) {
                dependencies.add(parent.typeId);
            }

            // All properties that are effectively required (see helper) contribute edges
            const allProperties = [...(objectShape.extendedProperties ?? []), ...objectShape.properties];
            for (const property of allProperties) {
                const deps = getRequiredNamedDependencies(property.valueType, ir);
                deps.forEach((dep) => dependencies.add(dep));
            }
        },
        union: (unionShape) => {
            // Union inheritance is always required
            for (const parent of unionShape.extends) {
                dependencies.add(parent.typeId);
            }

            // Base properties are present for every union variant
            for (const baseProperty of unionShape.baseProperties) {
                const deps = getRequiredNamedDependencies(baseProperty.valueType, ir);
                deps.forEach((dep) => dependencies.add(dep));
            }

            // We intentionally ignore the individual union variants here.
            // Some variants may introduce recursive references, but as long as
            // there exists at least one alternative that does not, the type
            // still has a finite base case. Handling that precisely is more
            // involved and can be added later if needed.
        },
        undiscriminatedUnion: () => {
            // Members of an undiscriminated union are alternatives, not
            // requirements, so they do not participate in this "required"
            // dependency graph.
        },
        _other: () => {
            // future-proof for new shapes
        }
    });
}

/**
 * Returns the set of named types that are *required* when using the given
 * type reference as a property type. A dependency is considered required if
 * there is no container/optional/nullable wrapper providing a finite base case.
 *
 * Examples:
 *   - `CircularWorkspace.project: CircularProject` (required object property)
 *       -> edge CircularWorkspace -> CircularProject
 *   - `Tree.children: list<Tree>` (collection can be empty)
 *       -> no edge
 *   - `Child.parent: optional<Parent>`
 *       -> no edge
 */
function getRequiredNamedDependencies(typeReference: TypeReference, ir: IntermediateRepresentation): Set<TypeId> {
    const result = new Set<TypeId>();

    const unaliased = unwrapAlias(typeReference, ir, new Set<TypeId>());

    switch (unaliased.type) {
        case "container":
            // Any container (list, set, map, optional, nullable, literal)
            // introduces a base case (empty collection or null), so it cannot
            // force an infinitely large JSON value on its own.
            return result;
        case "named":
            result.add(unaliased.typeId);
            return result;
        case "primitive":
        case "unknown":
        default:
            return result;
    }
}

/**
 * Recursively resolves alias type declarations, stopping at:
 *   - a non-alias type reference
 *   - a previously visited alias (to avoid infinite recursion)
 */
function unwrapAlias(
    typeReference: TypeReference,
    ir: IntermediateRepresentation,
    visitedAliases: Set<TypeId>
): TypeReference {
    if (typeReference.type === "named") {
        const typeDeclaration = ir.types[typeReference.typeId];
        if (
            typeDeclaration != null &&
            typeDeclaration.shape.type === "alias" &&
            !visitedAliases.has(typeReference.typeId)
        ) {
            visitedAliases.add(typeReference.typeId);
            return unwrapAlias(typeDeclaration.shape.aliasOf, ir, visitedAliases);
        }
    }
    return typeReference;
}

function dfsFindCycle(
    typeId: TypeId,
    graph: Map<TypeId, TypeId[]>,
    visited: Set<TypeId>,
    visiting: Set<TypeId>,
    stack: TypeId[]
): TypeId[] | undefined {
    visiting.add(typeId);
    stack.push(typeId);

    const neighbors = graph.get(typeId) ?? [];
    for (const neighbor of neighbors) {
        if (visited.has(neighbor)) {
            continue;
        }
        if (visiting.has(neighbor)) {
            // Found a back-edge; extract the cycle from the stack
            const startIndex = stack.indexOf(neighbor);
            if (startIndex !== -1) {
                return stack.slice(startIndex).concat(neighbor);
            }
            continue;
        }
        const cycle = dfsFindCycle(neighbor, graph, visited, visiting, stack);
        if (cycle != null) {
            return cycle;
        }
    }

    stack.pop();
    visiting.delete(typeId);
    visited.add(typeId);
    return undefined;
}

function formatCycleError(cycle: TypeId[], ir: IntermediateRepresentation): string {
    const prettyPath = cycle
        .map((typeId) => {
            const typeDeclaration = ir.types[typeId];
            const typeName =
                typeDeclaration?.name?.name?.originalName ??
                typeDeclaration?.name?.name?.pascalCase?.unsafeName ??
                typeId;
            return typeName;
        })
        .join(" -> ");

    return [
        "Prohibited recursive type cycle detected in IR.",
        `The following types reference each other via required properties with no nullable/optional/container base case: ${prettyPath}.`,
        "Such a cycle cannot be represented as a finite JSON value. Please introduce a nullable/optional/container field somewhere in this cycle or restructure your types."
    ].join(" ");
}
