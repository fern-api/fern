import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generateIR } from "./functions/generate-ir";

void tryRunCli();

export const fixtureChoices = [
    "exhaustive", 
    "basic-auth", 
    "custom-auth", 
    "error-property"
];

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);

    const argv = await cli.parse();
    process.stdout.write(JSON.stringify(argv) + "\n");
    const { irVersion, language, fixture } = argv;
    const ir : unknown | unknown[] = await generateIR(String(irVersion), String(language), String(fixture));
    if(ir != null) 
    {
        process.stdout.write("\nIR generated\n");
    }
    process.stdout.write("\nFinished running CLI\n");
}

function addTestCommand(cli: Argv) {
    cli.command(
        "test",
        "Snapshot test generator",
        (yargs) =>
            yargs
                .strict()
                .option("irVersion", {
                    alias: "ir",
                    type: "string",
                    demandOption: false,
                    default: "latest"
                })
                .option("language", {
                    alias: "l",
                    type: "string",
                    choices: ["java", "python", "typescript", "openapi", "postman", "go"],
                    demandOption: true,
                })
                .option("docker", {
                    alias: "d",
                    type: "string",
                    demandOption: true,
                })
                .option("fixture", {
                    alias: "f",
                    type: "string",
                    choices: fixtureChoices,
                    demandOption: false,
                })
                .strict()
                .help("h")
    )
    .demandCommand();
}
