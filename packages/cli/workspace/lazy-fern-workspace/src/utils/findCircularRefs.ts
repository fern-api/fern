interface CircularRefInfo {
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
 */
export function findCircularRefs(document: unknown): CircularRefInfo[] {
    const results: CircularRefInfo[] = [];
    if (typeof document !== "object" || document == null) {
        return results;
    }

    // Collect all $ref locations and their targets
    const refMap = new Map<string, string>();
    collectRefs(document, [], refMap);

    // Build adjacency graph from ref pointer targets to detect cycles
    // Key: JSON pointer path (e.g., "/components/schemas/MySchema")
    // Value: set of JSON pointer paths that this path references
    const graph = new Map<string, Set<string>>();
    for (const [sourcePath, refValue] of refMap) {
        if (!refValue.startsWith("#/")) {
            continue;
        }
        const targetPointer = refValue.slice(1); // remove leading #
        const targetDotPath = pointerToDotPath(targetPointer);

        // The source of the $ref is the parent of the "$ref" key
        const sourceParent = sourcePath.endsWith(".$ref") ? sourcePath.slice(0, -5) : sourcePath;
        const sourcePointer = dotPathToPointer(sourceParent);

        if (!graph.has(sourcePointer)) {
            graph.set(sourcePointer, new Set());
        }
        graph.get(sourcePointer)?.add(dotPathToPointer(targetDotPath));
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
            const refValue = refMap.get(`${pointerToDotPath(node)}.$ref`);
            results.push({
                path: pointerToDotPath(node),
                ref: refValue ?? node,
                cycle: cycle.map((p) => pointerToDotPath(p))
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
