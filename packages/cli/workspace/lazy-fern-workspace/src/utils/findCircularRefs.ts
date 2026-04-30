export interface CircularRefInfo {
    /** JSON path where the circular $ref is located (e.g., "components.schemas.MySchema") */
    path: string;
    /** The $ref value that creates the cycle (e.g., "#/components/schemas/MySchema") */
    ref: string;
    /** The chain of refs forming the cycle */
    cycle: string[];
}

/**
 * Walks a parsed OpenAPI/JSON document and detects circular $ref references.
 * Returns information about each circular reference found, including the JSON path
 * and the ref chain forming the cycle.
 *
 * The detection works by building a graph at the schema level: each $ref found
 * anywhere under a schema (e.g., in nested properties) is treated as an edge
 * from the containing schema to the referenced schema. This correctly detects
 * indirect cycles like Foo.properties.bar -> Bar, Bar.properties.foo -> Foo.
 */
export function findCircularRefs(document: unknown): CircularRefInfo[] {
    const results: CircularRefInfo[] = [];
    if (typeof document !== "object" || document == null) {
        return results;
    }

    // Collect all $ref locations and their targets
    // Key: dot-path to the $ref key (e.g., "components.schemas.Foo.properties.bar.$ref")
    // Value: the $ref string value (e.g., "#/components/schemas/Bar")
    const refMap = new Map<string, string>();
    collectRefs(document, [], refMap);

    // Build adjacency graph at the schema level.
    // For each $ref, we normalize the source to its containing schema-level ancestor
    // so that refs nested deep in properties still create schema-to-schema edges.
    // Key: schema-level pointer (e.g., "/components/schemas/Foo")
    // Value: set of schema-level pointers this schema references
    const graph = new Map<string, Set<string>>();
    // Track which $ref values are associated with each schema-level edge for reporting
    const edgeRefs = new Map<string, Map<string, string>>();

    for (const [sourceDotPath, refValue] of refMap) {
        if (!refValue.startsWith("#/")) {
            continue;
        }
        const targetPointer = refValue.slice(1); // remove leading #

        // The source dot-path ends with ".$ref", strip it to get the $ref's parent
        const sourceParent = sourceDotPath.endsWith(".$ref") ? sourceDotPath.slice(0, -5) : sourceDotPath;

        // Normalize source to its containing schema-level ancestor.
        // For OpenAPI, schemas live at paths like "components.schemas.X" or "definitions.X".
        // A $ref at "components.schemas.Foo.properties.bar" belongs to schema "components.schemas.Foo".
        const sourceSchema = findSchemaAncestor(sourceParent);
        const sourceSchemaPointer =
            sourceSchema != null ? dotPathToPointer(sourceSchema) : dotPathToPointer(sourceParent);

        // Target is already at schema level (it's the $ref target)
        const targetSchemaPointer = targetPointer;

        if (!graph.has(sourceSchemaPointer)) {
            graph.set(sourceSchemaPointer, new Set());
        }
        graph.get(sourceSchemaPointer)?.add(targetSchemaPointer);

        // Track the ref value for this edge
        if (!edgeRefs.has(sourceSchemaPointer)) {
            edgeRefs.set(sourceSchemaPointer, new Map());
        }
        edgeRefs.get(sourceSchemaPointer)?.set(targetSchemaPointer, refValue);
    }

    // DFS to find cycles
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const stackPath: string[] = [];

    function dfs(node: string): void {
        if (inStack.has(node)) {
            const cycleStart = stackPath.indexOf(node);
            const cycle = stackPath.slice(cycleStart);
            cycle.push(node);

            // Find the $ref value for the edge that closes the cycle
            const closingEdgeSource = cycle[cycle.length - 2];
            const closingRefValue = closingEdgeSource != null ? edgeRefs.get(closingEdgeSource)?.get(node) : undefined;

            results.push({
                path: pointerToDotPath(node),
                ref: closingRefValue ?? node,
                cycle: cycle.map((pointer) => pointerToDotPath(pointer))
            });
            return;
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);
        inStack.add(node);
        stackPath.push(node);

        const neighbors = graph.get(node);
        if (neighbors) {
            for (const neighbor of neighbors) {
                dfs(neighbor);
            }
        }

        stackPath.pop();
        inStack.delete(node);
    }

    for (const node of graph.keys()) {
        dfs(node);
    }

    return results;
}

/**
 * Given a dot-path like "components.schemas.Foo.properties.bar.properties.baz",
 * returns the schema-level ancestor: "components.schemas.Foo".
 *
 * Supports common OpenAPI schema locations:
 *   - components.schemas.X
 *   - definitions.X (Swagger 2.0)
 *   - components.requestBodies.X
 *   - components.responses.X
 *   - components.parameters.X
 *
 * Returns undefined if no known schema ancestor is found.
 */
function findSchemaAncestor(dotPath: string): string | undefined {
    const parts = dotPath.split(".");

    // Look for "components.schemas.X", "components.responses.X", etc.
    if (parts.length >= 3 && parts[0] === "components") {
        return parts.slice(0, 3).join(".");
    }

    // Look for "definitions.X" (Swagger 2.0)
    if (parts.length >= 2 && parts[0] === "definitions") {
        return parts.slice(0, 2).join(".");
    }

    return undefined;
}

function collectRefs(obj: unknown, path: string[], refMap: Map<string, string>): void {
    if (typeof obj !== "object" || obj == null) {
        return;
    }
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            collectRefs(obj[i], [...path, String(i)], refMap);
        }
        return;
    }
    const record = obj as Record<string, unknown>;
    if (typeof record.$ref === "string") {
        refMap.set([...path, "$ref"].join("."), record.$ref);
    }
    for (const [key, value] of Object.entries(record)) {
        if (key === "$ref") {
            continue;
        }
        collectRefs(value, [...path, key], refMap);
    }
}

function pointerToDotPath(pointer: string): string {
    return pointer
        .split("/")
        .filter((s) => s.length > 0)
        .join(".");
}

function dotPathToPointer(dotPath: string): string {
    if (dotPath.length === 0) {
        return "/";
    }
    return "/" + dotPath.split(".").join("/");
}
