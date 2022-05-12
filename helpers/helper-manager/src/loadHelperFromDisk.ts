import { validateSchema } from "@fern-typescript/commons";
import { FernTypescriptHelper, FernTypescriptHelperSchema } from "@fern-typescript/helper-commons";
import execa from "execa";

export async function loadHelperFromDisk(pathToPlugin: string): Promise<FernTypescriptHelper> {
    await execa("npm", ["install"], {
        cwd: pathToPlugin,
    });
    const plugin = await import(/* webpackIgnore: true */ pathToPlugin);
    return validateSchema<FernTypescriptHelper>(FernTypescriptHelperSchema, plugin);
}
