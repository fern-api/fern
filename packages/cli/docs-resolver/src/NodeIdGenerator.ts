import { FernNavigation } from "@fern-api/fdr-sdk";

export class NodeIdGenerator {
    public static init(id: string): NodeIdGenerator {
        return new NodeIdGenerator(id, new Set([id]));
    }
    private constructor(private id: string, private ids: Set<string>) {}

    public get(): FernNavigation.NodeId {
        return FernNavigation.NodeId(this.id);
    }

    public append(part: string): NodeIdGenerator {
        let id = `${this.id}.${part}`;
        if (this.ids.has(id)) {
            let i = 1;
            while (this.ids.has(`${id}-${i}`)) {
                i++;
            }
            id = `${id}-${i}`;
        }

        this.ids.add(id);
        return new NodeIdGenerator(id, this.ids);
    }
}
