import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const pathToConfig = process.argv[process.argv.length - 1];
    if (pathToConfig == null) {
        throw new Error("No argument for config filepath.");
    }

    const cli = new SdkGeneratorCLI();
    await cli.run(pathToConfig);

    return;
}
