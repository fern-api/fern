import { ModelGeneratorCli } from "./ModelGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new ModelGeneratorCli();
    await cli.run();
} 