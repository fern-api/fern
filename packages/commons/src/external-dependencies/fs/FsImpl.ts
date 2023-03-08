import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";
import { Fs } from "./Fs";

export class FsImpl extends ExternalDependency implements Fs {
    protected override PACKAGE = { name: "fs" };
    protected override TYPES_PACKAGE = undefined;

    public readonly ReadStream = {
        _getReferenceToType: this.withNamespaceImport("fs", (withImport, fs) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(fs), "ReadStream"),
                    []
                );
            })
        ),
    };
}
