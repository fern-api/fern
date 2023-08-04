import yargs from "yargs";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as yaml from "js-yaml";
import path from "path";

const fsp = fs.promises;

void tryRunCli();

export async function tryRunCli() {
    const cli: Argv<{}> = yargs(hideBin(process.argv));

    addTestCommand(cli);

    await cli.parse();
    process.stdout.write("Finished");
    try {
        const configFile = await fsp.readFile(
            path.join(__dirname, "fern", "exhaustive", "definition", "api.yml"),
            "utf8"
        );
        const config = yaml.load(configFile);
        process.stdout.write(JSON.stringify(config));
    } catch (error) {
        process.stderr.write("Error reading or parsing config file:", error);
    }
}

function addTestCommand(cli: Argv<{}>): void {
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
