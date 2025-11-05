import { type AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import fs from "fs";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import { generateReadmeToStream, generateReferenceToStream, githubPr, githubPush } from "./api";
import { githubRelease } from "./api/github-release";
import { loadGitHubConfig } from "./configuration/loadGitHubConfig";
import { loadReadmeConfig } from "./configuration/loadReadmeConfig";
import { loadReferenceConfig } from "./configuration/loadReferenceConfig";

void yargs(hideBin(process.argv))
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    .scriptName(process.env.CLI_NAME ?? "generator-cli")
    .strict()
    .command(
        "generate readme",
        "Generate a README.md using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true
                })
                .option("original-readme", {
                    string: true,
                    required: false
                })
                .option("output", {
                    string: true,
                    required: false
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const readmeConfig = await loadReadmeConfig({
                absolutePathToConfig: resolve(wd, argv.config)
            });
            const originalReadmeContent =
                argv.originalReadme != null ? await readFile(argv.originalReadme, "utf8") : undefined;
            await generateReadmeToStream({
                originalReadmeContent,
                readmeConfig,
                outputStream: await createWriteStream(argv.output)
            });
            process.exit(0);
        }
    )
    .command(
        "generate-reference",
        "Generate an SDK reference (`reference.md`) using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true
                })
                .option("output", {
                    string: true,
                    required: false
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const referenceConfig = await loadReferenceConfig({
                absolutePathToConfig: resolve(wd, argv.config)
            });
            await generateReferenceToStream({
                referenceConfig,
                outputStream: await createWriteStream(argv.output)
            });
            process.exit(0);
        }
    )
    .command("github", "GitHub operations", (yargs) => {
        return yargs
            .command(
                "push",
                "Push changes to GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        process.exit(1);
                    }
                    const wd = cwd();
                    const githubConfig = await loadGitHubConfig({
                        absolutePathToConfig: resolve(wd, argv.config)
                    });
                    await githubPush({ githubConfig });
                    process.exit(0);
                }
            )
            .command(
                "pr",
                "Create a pull request on GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        process.exit(1);
                    }
                    const wd = cwd();
                    const githubConfig = await loadGitHubConfig({
                        absolutePathToConfig: resolve(wd, argv.config)
                    });
                    await githubPr({ githubConfig });
                    // Implementation for github pr command
                    process.stderr.write(`Creating PR on GitHub with config: ${resolve(wd, argv.config)}\n`);
                    process.exit(0);
                }
            )
            .command(
                "release",
                "Create a release on GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        const wd = cwd();
                        const githubConfig = await loadGitHubConfig({
                            absolutePathToConfig: resolve(wd, argv.config)
                        });
                        await githubRelease({ githubConfig });
                        process.exit(1);
                    }
                    const wd = cwd();
                    // Implementation for github release command
                    process.stderr.write(`Creating release on GitHub with config: ${resolve(wd, argv.config)}\n`);
                    process.exit(0);
                }
            )
            .demandCommand();
    })
    .demandCommand()
    .showHelpOnFail(true)
    .parse();

async function createWriteStream(outputPath: string | undefined): Promise<fs.WriteStream | NodeJS.Process["stdout"]> {
    return outputPath != null ? await createWriteStreamFromFile(resolve(cwd(), outputPath)) : process.stdout;
}

async function createWriteStreamFromFile(filepath: AbsoluteFilePath): Promise<fs.WriteStream> {
    if (!(await doesPathExist(filepath))) {
        await mkdir(path.dirname(filepath), { recursive: true });
    }
    return fs.createWriteStream(filepath);
}
