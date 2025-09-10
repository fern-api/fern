import { ModelGeneratorCLI } from "./ModelGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new ModelGeneratorCLI();
    await cli.run();
}
