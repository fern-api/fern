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

    /**
     * Returns, for each object type, the set of property wire values that should be
     * generated as `Indirect<...>` in Swift in order to break legal recursive
     * value-type cycles.
     *
     * High-level algorithm:
     * 1. Build a "Swift recursion graph" over object types where edges correspond
     *    to properties whose Swift type is either:
     *      - a named object type `B`, or
     *      - `Optional<B>` / `Nullable<B>`
     *    (We intentionally treat list/set/map/etc. as *safe* containers and do
     *     not add edges for those.)
     * 2. Compute strongly-connected components (SCCs) of that graph.
     * 3. For each SCC that represents a recursive component:
     *      - Always box self-edges (self-recursive properties).
     *      - Among cross-type edges:
     *          * If there are any non-optional edges, box all non-optional edges.
     *          * Otherwise (all edges optional), box all of them.
     */
    public computeIndirectPropertiesMapping(): Map<TypeId, Set<string>> {
        type Edge = {
            from: TypeId;
            to: TypeId;
            isOptionalLike: boolean;
            propertyWireValue: string;
        };

        const edgesByFrom = new Map<TypeId, Edge[]>();
        const nodes = new Set<TypeId>();

        // 1) Build edges for the Swift recursion graph
        for (const [typeId, typeDeclaration] of Object.entries(this.ir.types)) {
            if (typeDeclaration.shape.type !== "object") {
                continue;
            }

            nodes.add(typeId);

            const objectShape = typeDeclaration.shape;
            const allProperties = [...(objectShape.extendedProperties ?? []), ...objectShape.properties];

            for (const property of allProperties) {
                const edgeInfo = this.getSwiftRecursionEdgeForProperty(property.valueType);
                if (edgeInfo == null) {
                    continue;
                }

                const { targetTypeId, isOptionalLike } = edgeInfo;
                const targetTypeDeclaration = this.ir.types[targetTypeId];
                if (targetTypeDeclaration == null || targetTypeDeclaration.shape.type !== "object") {
                    continue;
                }

                const edge: Edge = {
                    from: typeId,
                    to: targetTypeId,
                    isOptionalLike,
                    propertyWireValue: property.name.wireValue
                };
                const list = edgesByFrom.get(typeId) ?? [];
                list.push(edge);
                edgesByFrom.set(typeId, list);
                nodes.add(targetTypeId);
            }
        }

        // If there are no recursion edges at all, there is nothing to box.
        if (edgesByFrom.size === 0) {
            return new Map();
        }

        // Build adjacency list for SCC computation
        const adjacency = new Map<TypeId, TypeId[]>();
        for (const [from, edges] of edgesByFrom.entries()) {
            const neighbors = new Set<TypeId>();
            for (const edge of edges) {
                neighbors.add(edge.to);
            }
            adjacency.set(from, Array.from(neighbors));
        }

        // 2) Compute strongly-connected components
        const sccs = this.computeStronglyConnectedComponents(nodes, adjacency);

        const indirectPropertiesMapping = new Map<TypeId, Set<string>>();

        // 3) Decide which edges inside each SCC should be boxed as Indirect
        for (const scc of sccs) {
            if (scc.length === 0) {
                continue;
            }

            const sccSet = new Set<TypeId>(scc);

            const edgesInScc: Edge[] = [];
            for (const typeId of scc) {
                const edgesFrom = edgesByFrom.get(typeId) ?? [];
                for (const edge of edgesFrom) {
                    if (sccSet.has(edge.to)) {
                        edgesInScc.push(edge);
                    }
                }
            }

            if (edgesInScc.length === 0) {
                continue;
            }

            const selfEdges = edgesInScc.filter((e) => e.from === e.to);
            const crossEdges = edgesInScc.filter((e) => e.from !== e.to);

            // Always box self-recursive properties
            for (const edge of selfEdges) {
                let props = indirectPropertiesMapping.get(edge.from);
                if (props == null) {
                    props = new Set<string>();
                    indirectPropertiesMapping.set(edge.from, props);
                }
                props.add(edge.propertyWireValue);
            }

            if (crossEdges.length === 0) {
                continue;
            }

            const nonOptionalCrossEdges = crossEdges.filter((e) => !e.isOptionalLike);
            const edgesToBox = nonOptionalCrossEdges.length > 0 ? nonOptionalCrossEdges : crossEdges;

            for (const edge of edgesToBox) {
                let props = indirectPropertiesMapping.get(edge.from);
                if (props == null) {
                    props = new Set<string>();
                    indirectPropertiesMapping.set(edge.from, props);
                }
                props.add(edge.propertyWireValue);
            }
        }

        return indirectPropertiesMapping;
    }

    /**
     * For a given property type, returns information about whether it contributes
     * an edge in the Swift recursion graph.
     */
    private getSwiftRecursionEdgeForProperty(
        propertyTypeReference: TypeReference
    ): { targetTypeId: TypeId; isOptionalLike: boolean } | null {
        const resolved = this.resolveAlias(propertyTypeReference);

        if (resolved.type === "named") {
            return {
                targetTypeId: resolved.typeId,
                isOptionalLike: false
            };
        }

        if (resolved.type === "container") {
            switch (resolved.container.type) {
                case "optional":
                case "nullable": {
                    const inner = this.resolveAlias(
                        resolved.container.type === "optional"
                            ? resolved.container.optional
                            : resolved.container.nullable
                    );
                    if (inner.type === "named") {
                        return {
                            targetTypeId: inner.typeId,
                            isOptionalLike: true
                        };
                    }
                    return null;
                }
                case "list":
                case "set":
                case "map":
                case "literal":
                default:
                    // Containers that are collections or literals are treated as
                    // safe for Swift recursion purposes.
                    return null;
            }
        }

        return null;
    }

    /**
     * Tarjan's strongly connected components algorithm.
     */
    private computeStronglyConnectedComponents(nodes: Iterable<TypeId>, adjacency: Map<TypeId, TypeId[]>): TypeId[][] {
        const indexForNode = new Map<TypeId, number>();
        const lowlinkForNode = new Map<TypeId, number>();
        const onStack = new Set<TypeId>();
        const stack: TypeId[] = [];
        const result: TypeId[][] = [];
        let index = 0;

        const strongConnect = (v: TypeId) => {
            indexForNode.set(v, index);
            lowlinkForNode.set(v, index);
            index += 1;
            stack.push(v);
            onStack.add(v);

            const neighbors = adjacency.get(v) ?? [];
            for (const w of neighbors) {
                if (!indexForNode.has(w)) {
                    strongConnect(w);
                    const vLowlink = lowlinkForNode.get(v);
                    const wLowlink = lowlinkForNode.get(w);
                    if (vLowlink != null && wLowlink != null) {
                        lowlinkForNode.set(v, Math.min(vLowlink, wLowlink));
                    }
                } else if (onStack.has(w)) {
                    const vLowlink = lowlinkForNode.get(v);
                    const wIndex = indexForNode.get(w);
                    if (vLowlink != null && wIndex != null) {
                        lowlinkForNode.set(v, Math.min(vLowlink, wIndex));
                    }
                }
            }

            if (lowlinkForNode.get(v) === indexForNode.get(v)) {
                const scc: TypeId[] = [];
                while (true) {
                    const w = stack.pop();
                    if (w == null) {
                        break;
                    }
                    onStack.delete(w);
                    scc.push(w);
                    if (w === v) {
                        break;
                    }
                }
                result.push(scc);
            }
        };

        for (const v of nodes) {
            if (!indexForNode.has(v)) {
                strongConnect(v);
            }
        }

        return result;
    }
}
