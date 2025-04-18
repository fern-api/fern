#!/usr/bin/env node
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import yaml from "yaml";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { convertChangelogToVersions } from "./convertChangelogToVersionsYml";

async function main() {
    try {
        await yargs(hideBin(process.argv))
            .command(
                "changelog-to-versions",
                "Convert changelog entries to version files",
                (yargs) => {
                    return yargs
                        .option("input", {
                            alias: "i",
                            type: "string",
                            description: "Path to input changelog file",
                            demandOption: true
                        })
                        .option("output", {
                            alias: "o",
                            type: "string",
                            description: "Output directory for version files",
                            demandOption: true
                        })
                        .option("generator", {
                            alias: "g",
                            type: "string",
                            description: "Generator name",
                            demandOption: true
                        });
                },
                async (argv) => {
                    const versionsYml = await convertChangelogToVersions(argv.input, argv.generator);
                    const outputPath = path.resolve(argv.output);
                    await mkdir(outputPath, { recursive: true });
                    await writeFile(path.join(outputPath, "versions.yml"), yaml.stringify(yaml.parse(versionsYml)));
                    // eslint-disable-next-line no-console
                    console.log(`Successfully wrote versions to ${path.join(outputPath, "versions.yml")}`);
                }
            )
            .strict()
            .help()
            .parse();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error:", error);
        process.exit(1);
    }
}

void main();
