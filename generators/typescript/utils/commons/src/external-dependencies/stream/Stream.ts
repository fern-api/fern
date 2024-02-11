import { ts } from "ts-morph";

export interface Stream {
    Readable: {
        _getReferenceToType: () => ts.TypeNode;
    };
}
