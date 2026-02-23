import { IrVersions } from "../../ir-versions/index.js";
import { convertNameToV2 } from "./convertName.js";

export function convertEnvironment(
    environment: IrVersions.V5.environment.Environment
): IrVersions.V4.environment.Environment {
    return {
        docs: environment.docs,
        id: environment.id,
        url: environment.url,
        name: convertNameToV2(environment.name)
    };
}
