import { validateSchema } from "@fern-typescript/commons";
import { FernTypescriptHelper, FernTypescriptHelperSchema } from "@fern-typescript/helper-commons";

export async function loadHelperFromDisk(pathToPlugin: string): Promise<FernTypescriptHelper> {
    const plugin = await import(/* webpackIgnore: true */ pathToPlugin);
    return validateSchema<FernTypescriptHelper>(FernTypescriptHelperSchema, plugin);
}
