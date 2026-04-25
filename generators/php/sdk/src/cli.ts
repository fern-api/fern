// TEMP: trigger php-sdk benchmark to validate post-lockfile-fix wiring; reverted in same PR.
import { SdkGeneratorCLI } from "./SdkGeneratorCli.js";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new SdkGeneratorCLI();
    await cli.run();
}
