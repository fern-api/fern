import { SdkGeneratorCli } from "./SdkGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCli();
    await cli.run();
} 