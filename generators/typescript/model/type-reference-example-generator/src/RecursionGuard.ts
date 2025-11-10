import { TypeId } from "@fern-fern/ir-sdk/api";

export interface RecursionGuard {
    canRecurse(typeId: TypeId): boolean;
    enter(typeId: TypeId): RecursionGuard;
    withDepthIncrement(): RecursionGuard;
}

export class RecursionGuardImpl implements RecursionGuard {
    private visited: Set<string>;
    private depth: number;
    private maxDepth: number;

    constructor(maxDepth: number = 5, visited: Set<string> = new Set(), depth: number = 0) {
        this.maxDepth = maxDepth;
        this.visited = visited;
        this.depth = depth;
    }

    public canRecurse(typeId: TypeId): boolean {
        if (this.depth >= this.maxDepth) {
            return false;
        }
        return !this.visited.has(typeId);
    }

    public enter(typeId: TypeId): RecursionGuard {
        const newVisited = new Set(this.visited);
        newVisited.add(typeId);
        return new RecursionGuardImpl(this.maxDepth, newVisited, this.depth + 1);
    }

    public withDepthIncrement(): RecursionGuard {
        return new RecursionGuardImpl(this.maxDepth, new Set(this.visited), this.depth + 1);
    }
}
