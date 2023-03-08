import { ts } from "ts-morph";

export interface Fs {
    ReadStream: {
        _getReferenceToType: () => ts.TypeNode;
    };
}
