import { SdkGeneratorCLI } from "./SdkGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    // eslint-disable-next-line no-console
    const pathToConfig = process.argv[process.argv.length - 1];
    if (pathToConfig == null) {
        throw new Error("No argument for config filepath.");
    }

    const cli = new SdkGeneratorCLI();
    await cli.run(pathToConfig);

    return;
}
