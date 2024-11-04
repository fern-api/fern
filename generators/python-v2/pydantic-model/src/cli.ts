import { ModelGeneratorCLI } from "./ModelGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    await new ModelGeneratorCLI().run();
}
