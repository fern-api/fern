import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { Octokit } from "@octokit/rest";
import { createPullRequest } from "octokit-plugin-create-pull-request";

const OWNER = "fern-api";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export async function bumpGeneratorSeedVersions({ version }: { version: string }): Promise<void> {
    Object.values(GenerationLanguage).forEach(async (language) => {
        if (language !== "go") {
            await bumpGeneratorSeedVersion({
                version,
                generatorLanguage: language,
            });
        }
    });
}

async function bumpGeneratorSeedVersion({
    version,
    generatorLanguage,
}: {
    version: string;
    generatorLanguage: GenerationLanguage;
}): Promise<void> {
    const newOctokit = Octokit.plugin(createPullRequest);
    const octokit = new newOctokit({ auth: ACCESS_TOKEN });

    const repo = `fern-${generatorLanguage}`;

    const prBranchName = "fern-bot/seed-upgrade";
    const baseBranch = "main";

    const pullRequest = await octokit.createPullRequest({
        owner: OWNER,
        repo,
        head: prBranchName,
        base: baseBranch,
        title: "Update Seed Version based on latest release",
        body: `Updated Seed to version ${version}`,
        update: true,
        changes: [
            {
                files: {
                    ".circleci/config.yml": ({ content }) => {
                        const configFileContents = Buffer.from(content, "base64").toString();
                        // console.log(fileContents);
                        const configFileLines = configFileContents.split("\n");

                        const lineWithSeedInstall = configFileLines.find((line) => line.includes("@fern-api/seed-cli"));
                        if (lineWithSeedInstall != null) {
                            const indexOfLineWithSeedInstall = configFileLines.indexOf(lineWithSeedInstall);
                            const startOfVersionIndex = lineWithSeedInstall.indexOf("seed-cli@") + 9;
                            const newLineWithSeedInstall = lineWithSeedInstall.slice(0, startOfVersionIndex) + version;
                            configFileLines[indexOfLineWithSeedInstall] = newLineWithSeedInstall;
                        }

                        return configFileLines.join("\n");
                    },
                },
                commit: `Updated Seed version to ${version} in ${generatorLanguage} generator`,
            },
        ],
    });

    if (pullRequest != null) {
        CONSOLE_LOGGER.info("Pull request created: ", pullRequest.data.html_url);
    } else {
        CONSOLE_LOGGER.info("Pull request failed");
    }
}
