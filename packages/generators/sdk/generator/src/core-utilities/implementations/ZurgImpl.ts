import { RelativeFilePath } from "@fern-api/core-utils";
import { Zurg } from "@fern-typescript/sdk-declaration-handler";
import { CoreUtility } from "../CoreUtility";

export class ZurgImpl extends CoreUtility implements Zurg {
    public readonly MANIFEST = {
        originalPathInRepo: RelativeFilePath.of("packages/zurg/src"),
        originalPathOnDocker: "/assets/zurg" as const,
        pathInCoreUtilities: [{ nameOnDisk: "schemas" }],
    };

    public object = (): never => {
        throw new Error("Not implmemented");
    };

    public list = (): never => {
        throw new Error("Not implmemented");
    };

    public string = (): never => {
        throw new Error("Not implmemented");
    };

    public number = (): never => {
        throw new Error("Not implmemented");
    };

    public boolean = (): never => {
        throw new Error("Not implmemented");
    };
}
