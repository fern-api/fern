import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();
// Force update to swift and see if PR triggers.
export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run();
}
