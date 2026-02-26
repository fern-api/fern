import { ModelGeneratorCli } from "./ModelGeneratorCli.js";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new ModelGeneratorCli();
    await cli.run();
}
