import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { Stream } from "./Stream";

export class StreamImpl extends ExternalDependency implements Stream {
    protected override PACKAGE = { name: "stream" };
    protected override TYPES_PACKAGE = undefined;

    public readonly Readable = {
        _getReferenceToType: this.withNamespaceImport("stream", (withImport, fs) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(fs), "Readable"),
                    []
                );
            })
        )
    };
}
