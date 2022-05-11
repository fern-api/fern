import { validateSchema } from "@fern-typescript/commons";
import { FernTypescriptPlugin } from "./types/FernTypescriptPlugin";
import { FernTypescriptPluginSchema } from "./types/schemas/FernTypescriptPluginSchema";

export async function loadPluginFromDisk(pathToPlugin: string): Promise<FernTypescriptPlugin> {
    const plugin = await import(/* webpackIgnore: true */ pathToPlugin);
    return validateSchema<FernTypescriptPlugin>(FernTypescriptPluginSchema, plugin);
}
