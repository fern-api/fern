import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { Blob_ } from "./Blob";

export class BlobImpl extends ExternalDependency implements Blob_ {
    protected override PACKAGE = { name: "buffer" };
    protected override TYPES_PACKAGE = undefined;

    public readonly Blob = {
        _getReferenceToType: this.withNamedImport("Blob", (withImport, buffer) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode("Blob");
            })
        )
    };
}
