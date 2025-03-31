import { ts } from "ts-morph";

import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { CoreUtility } from "../CoreUtility";
import { RawResponse } from "./RawResponse";

export class RawResponseImpl extends CoreUtility implements RawResponse {
    public readonly MANIFEST = {
        name: "RawResponse",
        repoInfoForTesting: {
            path: RelativeFilePath.of("")
        },
        originalPathOnDocker: AbsoluteFilePath.of("/assets/RawResponse.ts"),
        pathInCoreUtilities: [{
            nameOnDisk: "RawResponse.ts", exportDeclaration: { exportAll: true } ,
        }],
        addDependencies: (): void => {}
    };
    public readonly RawResponse = {
        _getReferenceToType: this.withExportedName("RawResponse", (RawResponse) => () => RawResponse.getTypeNode())
    };
    public readonly toRawResponse = {
        _getReferenceToType: this.withExportedName("toRawResponse", (RawResponse) => () => RawResponse.getTypeNode())
    };
    public readonly WithRawResponse = {
        _getReferenceToType: this.withExportedName("WithRawResponse", (RawResponse) => () => RawResponse.getTypeNode()),
        create: (typeArgs: ts.TypeNode[]): ts.Node => {
            return this.withExportedName(
                "WithRawResponse",
                (RawResponse) => () => ts.factory.createTypeReferenceNode(RawResponse.getEntityName(), typeArgs)
            )();
        }
    };
}
