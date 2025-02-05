import crypto from "crypto";

import { FernNavigation } from "@fern-api/fdr-sdk";

function hash(id: string): string {
    return crypto.createHash("sha256").update(id).digest("hex");
}

export class NodeIdGenerator {
    public static init(): NodeIdGenerator {
        return new NodeIdGenerator();
    }
    private constructor() {}

    #ids = new Map<string, number>();
    #visited = new Set<string>();

    #getHashedId(id: string): string {
        const count = this.#ids.get(id) ?? 0;
        this.#ids.set(id, count + 1);
        const hashedId = hash(count === 0 ? id : `${id}-${count}`);
        return hashedId;
    }

    #getUniqueId(id: string): string {
        let hashedId = this.#getHashedId(id);
        let loop = 0;
        while (this.#visited.has(hashedId)) {
            hashedId = this.#getHashedId(id);
            loop++;
            if (loop > 100) {
                throw new Error(`Infinite loop detected for id: ${id}`);
            }
        }
        return hashedId;
    }

    public get(id: string): FernNavigation.V1.NodeId {
        return FernNavigation.V1.NodeId(this.#getUniqueId(id));
    }
}
