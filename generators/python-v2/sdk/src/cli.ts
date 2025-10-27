import { SdkGeneratorCli } from "./SdkGeneratorCli";

void runCli();
// CHRISM - force change in v2
export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCli();
    await cli.run({
        // We disable notifications because the `python-v2` generator notifications
        // prevent the `python` generator from succeeding in remote code generation
        // environments.
        disableNotifications: true
    });
}
