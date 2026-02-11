import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { Fs } from "./Fs";

export class FsImpl extends ExternalDependency implements Fs {
    protected override PACKAGE = { name: "fs" };
    protected override TYPES_PACKAGE = undefined;

    public readonly ReadStream: Fs["ReadStream"] = {
        _getReferenceToType: this.withNamespaceImport("fs", (withImport, fs) =>
            withImport((): ts.TypeReferenceNode => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(ts.factory.createIdentifier(fs), "ReadStream"),
                    []
                );
            })
        )
    };

    public readonly createReadStream: (filename: ts.Expression) => ts.CallExpression = this.withNamespaceImport(
        "fs",
        (withImport, fs) =>
            withImport((filename: ts.Expression): ts.CallExpression => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(fs), "createReadStream"),
                    undefined,
                    [filename]
                );
            })
    );
}
