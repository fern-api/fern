import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run();
}
