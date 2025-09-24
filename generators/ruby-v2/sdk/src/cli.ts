import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();
//  force an update
export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run();
}
