import { validateSchema } from "@fern-typescript/commons";
import { FernTypescriptHelper, FernTypescriptHelperSchema } from "@fern-typescript/helper-commons";

export async function loadHelperFromDisk(pathToHelper: string): Promise<FernTypescriptHelper> {
    const { helper } = await import(/* webpackIgnore: true */ pathToHelper);
    return validateSchema<FernTypescriptHelper>(FernTypescriptHelperSchema, helper);
}
