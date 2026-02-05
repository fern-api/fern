import { IntermediateRepresentation, TypeDeclaration, TypeId, TypeReference } from "@fern-fern/ir-sdk/api";

/**
 * Detects illegal recursive type cycles in the IR that cannot be represented in Rust.
 *
 * An illegal cycle occurs when types reference each other through REQUIRED properties
 * without any finite base case (no Option, Vec, HashMap, etc. to break the cycle).
 *
 * Example of illegal cycle:
 * ```rust
 * struct A { b: B }
 * struct B { a: A }  // Error: no finite base case
 * ```
 *
 * Example of legal cycle:
 * ```rust
 * struct A { b: Option<B> }  // OK: Option provides finite base case (None)
 * struct B { a: A }
 * ```
 */
export class RustCycleDetector {
    public constructor(private readonly ir: IntermediateRepresentation) {}

    /**
     * Detects illegal cycles and throws an error if any are found.
     * Should be called during generator initialization.
     */
    public detectIllegalCycles(): void {
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
     * Builds a graph where there is a directed edge A -> B iff every value of A
     * must (transitively) contain a value of B. In practice, this means:
     *
     * - Edges through required properties whose type is a non-container,
     *   non-nullable, non-optional named type (after alias resolution)
     * - Edges through object/union inheritance (`extends`)
     *
     * Edges through containers (Vec, HashMap, HashSet) and Option/Nullable wrappers
     * are intentionally ignored, because those provide a finite base case:
     * - Option<T> can be None
     * - Vec<T> can be empty []
     * - HashMap<K, V> can be empty {}
     *
     * This makes such cycles representable in Rust and valid.
     */
    private buildRequiredDependencyGraph(): Map<TypeId, TypeId[]> {
        const graph = new Map<TypeId, TypeId[]>();

        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            const deps = this.getRequiredDependenciesForType(typeDeclaration);
            graph.set(typeId, deps);
        }

        return graph;
    }

    /**
     * Gets the set of types that this type MUST contain (i.e., no finite base case).
     */
    private getRequiredDependenciesForType(typeDeclaration: TypeDeclaration): TypeId[] {
        const dependencies = new Set<TypeId>();

        typeDeclaration.shape._visit({
            alias: (aliasShape) => {
                // Aliases inherit the requirements of their aliased type
                const dep = this.getRequiredNamedDependencyForType(aliasShape.aliasOf);
                if (dep != null) {
                    dependencies.add(dep);
                }
            },
            enum: () => {
                // Enums have no recursive structure
            },
            object: (objectShape) => {
                // Inheritance is always required (no way to have "no parent")
                for (const parent of objectShape.extends) {
                    dependencies.add(parent.typeId);
                }

                // Check all properties to see if they create required dependencies
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

                // Base properties are present for every union variant, so they're required
                for (const baseProperty of unionShape.baseProperties) {
                    const dep = this.getRequiredNamedDependencyForType(baseProperty.valueType);
                    if (dep != null) {
                        dependencies.add(dep);
                    }
                }

                // Individual union variants provide alternatives, not requirements.
                // If at least one variant doesn't create a cycle, the type has a finite base case.
                // So we intentionally ignore variant-specific properties here.
            },
            undiscriminatedUnion: () => {
                // Members of an undiscriminated union are alternatives, not requirements.
                // At least one member will not create a cycle, providing a finite base case.
            },
            _other: () => {
                // Future-proof for new shapes
            }
        });

        return Array.from(dependencies);
    }

    /**
     * Checks if a type reference creates a required dependency (i.e., must always contain the target type).
     * Returns the target type ID only if:
     * - The type is a named type (after alias resolution)
     * - It's NOT wrapped in Option or Nullable
     * - It's NOT inside a container (Vec, HashMap, HashSet)
     */
    private getRequiredNamedDependencyForType(typeReference: TypeReference): TypeId | null {
        const unaliased = this.resolveAlias(typeReference);

        // Only named types can create dependencies
        if (unaliased.type === "named") {
            return unaliased.typeId;
        }

        // Container types provide finite base cases, so they don't create required dependencies
        if (unaliased.type === "container") {
            return unaliased.container._visit<TypeId | null>({
                // Option and Nullable provide finite base cases (None, null)
                optional: () => null,
                nullable: () => null,
                // Collections provide finite base cases (empty collection)
                list: () => null,
                map: () => null,
                set: () => null,
                literal: () => null,
                _other: () => null
            });
        }

        return null;
    }

    /**
     * Resolves type aliases to their underlying type.
     * Handles alias chains: A -> B -> C resolves to C.
     */
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
            return ref;
        };

        return unwrapAlias(typeReference);
    }

    /**
     * Performs depth-first search to find cycles in the required dependency graph.
     * Uses the "visiting" set to detect back-edges (cycles).
     */
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
                // Found a back-edge (cycle)! Extract the cycle from the stack
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

    /**
     * Formats a user-friendly error message showing the cycle path.
     */
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
            "Illegal recursive type cycle detected in Rust generator.",
            `The following types reference each other via required properties: ${prettyPath}.`,
            "Such a cycle cannot be represented in Rust because it has no finite base case.",
            "To fix this, wrap at least one of the properties in Option<T>, Vec<T>, or another container type."
        ].join(" ");
    }
}
