import { ModelGeneratorCLI } from "./ModelGeneratorCli.js";

void runCli();

export async function runCli(): Promise<void> {
    await new ModelGeneratorCLI().run();
}
