import { validateSchema } from "@fern-api/config-management-commons";
import { FernTypescriptHelper } from "@fern-typescript/helper-utils";
import path from "path";
import { FernTypescriptHelperSchema } from "./helper-schema/FernTypescriptHelperSchema";

export async function loadHelperFromDisk(pathToHelper: string): Promise<FernTypescriptHelper> {
    const {
        default: { helper },
    } = await import(/* webpackIgnore: true */ path.join(pathToHelper, "dist", "bundle.js"));
    return validateSchema<FernTypescriptHelper>(FernTypescriptHelperSchema, helper);
}
