import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();
// CHRISM - force change in v2
export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run({
        // We disable notifications because the `go-v2` generator notifications
        // prevent the `go` generator from succeeding in remote code generation
        // environments.
        disableNotifications: true
    });
}
