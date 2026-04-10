import { SdkGeneratorCLI } from "./SdkGeneratorCli.js";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run();
}
