import { validateSchema } from "@fern-typescript/commons";
import { FernTypescriptHelper } from "@fern-typescript/helper-utils";
import { FernTypescriptHelperSchema } from "./helper-schema/FernTypescriptHelperSchema";

export async function loadHelperFromDisk(pathToHelper: string): Promise<FernTypescriptHelper> {
    const { helper } = await import(/* webpackIgnore: true */ pathToHelper);
    return validateSchema<FernTypescriptHelper>(FernTypescriptHelperSchema, helper);
}
