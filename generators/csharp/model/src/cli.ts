import { ModelGeneratorCLI } from "./ModelGeneratorCli";

void runCli();

export async function runCli(): Promise<void> {
    const cli = new ModelGeneratorCLI();

    const pathToConfig = process.argv[process.argv.length - 1];

    if (pathToConfig == null) {
        throw new Error("No argument for config filepath.");
    }

    await cli.run(pathToConfig);

    return;
}
