import { FernNavigation } from "@fern-api/fdr-sdk";

export class NodeIdGenerator {
    public static init(): NodeIdGenerator {
        return new NodeIdGenerator();
    }
    private constructor() {}

    #ids = new Map<string, number>();

    public get(id: string): FernNavigation.V1.NodeId {
        const count = this.#ids.get(id) ?? 0;
        this.#ids.set(id, count + 1);
        return FernNavigation.V1.NodeId(count === 0 ? id : `${id}-${count}`);
    }
}
