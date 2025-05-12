import { SdkGeneratorCli } from "@fern-typescript/sdk-generator-cli/lib/SdkGeneratorCli";

import { ServerGeneratorCLI } from "./ServerGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const sdkCli = new SdkGeneratorCli({ targetRuntime: "node" });
    await sdkCli.runCli({ disableNotifications: true, outputSubDirectory: "sdk", unzipOutput: true });
    const serverCli = new ServerGeneratorCLI();
    await serverCli.run({ disableNotifications: true });
}
