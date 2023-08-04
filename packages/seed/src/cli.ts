import * as fs from "fs";
import * as yaml from "js-yaml";
import path from "path";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

const fsp = fs.promises;

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);

    await cli.parse();

    try {
        const configFile = await fsp.readFile(
            path.join(__dirname, "fern", "exhaustive", "definition", "api.yml"),
            "utf8"
        );
        const config = yaml.load(configFile);
        process.stdout.write(JSON.stringify(config));
    } catch (error) {
        process.stderr.write(JSON.stringify(error));
    }

    process.stdout.write("Finished running CLI");
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
