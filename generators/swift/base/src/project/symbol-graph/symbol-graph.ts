class SymbolGraphNode {
    public readonly id: string;
    #parent: SymbolGraphNode | undefined;
    #childrenById: Map<string, SymbolGraphNode>;

    public constructor(id: string) {
        this.id = id;
        this.#parent = undefined;
        this.#childrenById = new Map();
    }

    public get parent() {
        return this.#parent;
    }

    private set parent(parent: SymbolGraphNode | undefined) {
        this.#parent = parent;
    }

    public setChild(child: SymbolGraphNode) {
        this.#childrenById.set(child.id, child);
        child.parent = this;
    }
}

export type { SymbolGraphNode };

export class SymbolGraph {
    private nodesById: Map<string, SymbolGraphNode>;

    public constructor() {
        this.nodesById = new Map();
    }

    /**
     * @throws {Error} if a node with the given ID already exists.
     */
    public createNode(nodeId: string) {
        if (this.nodesById.has(nodeId)) {
            throw new Error(`A node with the ID "${nodeId}" already exists in the symbol graph.`);
        }
        const node = new SymbolGraphNode(nodeId);
        this.nodesById.set(nodeId, node);
        return node;
    }

    /**
     * @param nodeId - The ID of the node to get.
     */
    public getNode(nodeId: string) {
        return this.nodesById.get(nodeId) ?? undefined;
    }
}
