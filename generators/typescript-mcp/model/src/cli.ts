import { ModelGeneratorCLI } from "./ModelGeneratorCli.js";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new ModelGeneratorCLI();
    await cli.run();
}
