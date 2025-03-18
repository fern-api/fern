import { SdkGeneratorCli } from "./SdkGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    await new SdkGeneratorCli().run();
}
