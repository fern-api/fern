import { SdkGeneratorCLI } from "./ModelGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    // eslint-disable-next-line no-console
    const cli = new SdkGeneratorCLI();

    const pathToConfig = process.argv[process.argv.length - 1];

    if (pathToConfig == null) {
        throw new Error("No argument for config filepath.");
    }

    await cli.run(pathToConfig);

    return;
}
