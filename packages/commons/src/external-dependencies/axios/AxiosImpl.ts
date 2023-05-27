import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";
import { Axios } from "./Axios";

export class AxiosImpl extends ExternalDependency implements Axios {
    protected override PACKAGE = { name: "axios", version: "1.4.0" };
    protected override TYPES_PACKAGE = undefined;

    public readonly AxiosProgressEvent = {
        _getReferenceToType: this.withNamespaceImport("axios", (withImport, axios) =>
            withImport(() => {
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(axios),
                        ts.factory.createIdentifier("AxiosProgressEvent")
                    ),
                    undefined
                );
            })
        ),
    };
}
