import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);

    await cli.parse();
    process.stdout.write("Finished");
}

function addTestCommand(cli: Argv): void {
    cli.command(
        "test",
        "Snapshot test generator",
        (yargs) =>
            yargs
                .option("irVersion", {
                    type: "string",
                    demandOption: false,
                })
                .option("irLanguage", {
                    type: "string",
                    demandOption: false,
                })
                .option("docker", {
                    type: "string",
                    demandOption: true,
                }),
        (argv) => {
            process.stdout.write(argv.docker + "\n");
        }
    );
}
