import { IntermediateRepresentation, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";

export class CycleDetector {
    public constructor(private readonly ir: IntermediateRepresentation) {}

    public detectIllegalCycles() {
        const dependencyGraph = this.buildRequiredDependencyGraph();
        const visited = new Set<TypeId>();
        const visiting = new Set<TypeId>();
        const stack: TypeId[] = [];

        const typeIds = Object.keys(this.ir.types);

        for (const typeId of typeIds) {
            if (!visited.has(typeId)) {
                const cycle = this.dfsFindCycle(typeId, dependencyGraph, visited, visiting, stack);
                if (cycle != null) {
                    const message = this.formatCycleError(cycle);
                    throw new Error(message);
                }
            }
        }
    }

    /**
     * Returns, for each object type, the set of property names that should be
     * generated as `Indirect<...>` in Swift in order to break legal cycles.
     */
    public computeIndirectPropertiesMapping(): Map<TypeId, Set<string>> {
        const indirectPropertiesMapping = new Map<TypeId, Set<string>>();

        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            if (typeDeclaration.shape.type !== "object") {
                continue;
            }

            const objectShape = typeDeclaration.shape;
            const allProperties = [...(objectShape.extendedProperties ?? []), ...objectShape.properties];

            for (const property of allProperties) {
                if (this.shouldBoxPropertyAsIndirect(typeDeclaration, property.valueType)) {
                    let properties = indirectPropertiesMapping.get(typeId);
                    if (properties == null) {
                        properties = new Set<string>();
                        indirectPropertiesMapping.set(typeId, properties);
                    }
                    properties.add(property.name.wireValue);
                }
            }
        }

        return indirectPropertiesMapping;
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
    private buildRequiredDependencyGraph(): Map<TypeId, TypeId[]> {
        const graph = new Map<TypeId, TypeId[]>();

        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            const deps = this.getRequiredDependenciesForType(typeDeclaration);
            graph.set(typeId, deps);
        }

        return graph;
    }

    private getRequiredDependenciesForType(typeDeclaration: TypeDeclaration): TypeId[] {
        const dependencies = new Set<TypeId>();

        typeDeclaration.shape._visit({
            alias: (aliasShape) => {
                const dep = this.getRequiredNamedDependencyForType(aliasShape.aliasOf);
                if (dep != null) {
                    dependencies.add(dep);
                }
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
                    const dep = this.getRequiredNamedDependencyForType(property.valueType);
                    if (dep != null) {
                        dependencies.add(dep);
                    }
                }
            },
            union: (unionShape) => {
                // Union inheritance is always required
                for (const parent of unionShape.extends) {
                    dependencies.add(parent.typeId);
                }

                // Base properties are present for every union variant
                for (const baseProperty of unionShape.baseProperties) {
                    const dep = this.getRequiredNamedDependencyForType(baseProperty.valueType);
                    if (dep != null) {
                        dependencies.add(dep);
                    }
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

        return Array.from(dependencies);
    }

    private getRequiredNamedDependencyForType(typeReference: TypeReference): TypeId | null {
        const unaliased = this.resolveAlias(typeReference);
        return unaliased.type === "named" ? unaliased.typeId : null;
    }

    /**
     * Determines whether a given object property should be generated as
     * `Indirect<...>` in Swift.
     *
     * Current rules:
     * - The property type must be an alias (possibly nested) whose resolved
     *   underlying type reference is:
     *      container.optional(named(selfType))
     *   i.e., an optional reference back to the containing object type,
     *   with no list/set/map wrappers.
     *
     * This covers patterns like:
     *   BinaryTreeNode.leftChild: optional<BinaryTreeNode>
     *
     * but does NOT require boxing for:
     *   TreeNode.children: list<TreeNode>
     * because the recursion is guarded by a collection.
     */
    private shouldBoxPropertyAsIndirect(owningType: TypeDeclaration, propertyTypeReference: TypeReference): boolean {
        const resolved = this.resolveAlias(propertyTypeReference);

        // We only care about optional container at the top level
        if (resolved.type !== "container" || resolved.container.type !== "optional") {
            return false;
        }

        const inner = this.resolveAlias(resolved.container.optional);
        if (inner.type !== "named") {
            return false;
        }

        // Only box when the optional points back to the same object type
        return inner.typeId === owningType.name.typeId;
    }

    private resolveAlias(typeReference: TypeReference): TypeReference {
        const visitedAliases = new Set<TypeId>();

        const unwrapAlias = (ref: TypeReference): TypeReference => {
            if (ref.type === "named") {
                const typeDeclaration = this.ir.types[ref.typeId];
                if (
                    typeDeclaration != null &&
                    typeDeclaration.shape.type === "alias" &&
                    !visitedAliases.has(ref.typeId)
                ) {
                    visitedAliases.add(ref.typeId);
                    return unwrapAlias(typeDeclaration.shape.aliasOf);
                }
            }
            return typeReference;
        };

        return unwrapAlias(typeReference);
    }

    private dfsFindCycle(
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
            const cycle = this.dfsFindCycle(neighbor, graph, visited, visiting, stack);
            if (cycle != null) {
                return cycle;
            }
        }

        stack.pop();
        visiting.delete(typeId);
        visited.add(typeId);
        return undefined;
    }

    private formatCycleError(cycle: TypeId[]): string {
        const prettyPath = cycle
            .map((typeId) => {
                const typeDeclaration = this.ir.types[typeId];
                const typeName =
                    typeDeclaration?.name?.name?.originalName ??
                    typeDeclaration?.name?.name?.pascalCase?.unsafeName ??
                    typeId;
                return typeName;
            })
            .join(" -> ");

        return [
            "Illegal recursive type cycle detected in IR.",
            `The following types reference each other via required properties: ${prettyPath}.`,
            "Such a cycle cannot be represented as a finite JSON value. Please restructure your types to introduce a finite base case."
        ].join(" ");
    }
}
