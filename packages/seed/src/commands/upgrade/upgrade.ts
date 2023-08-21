// import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
// import { CONSOLE_LOGGER } from "@fern-api/logger";
import { Octokit } from "@octokit/rest";
// import { loggingExeca } from "@fern-api/logging-execa";
// import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
// import { TaskContext } from "@fern-api/task-context";
// import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export async function bumpGeneratorSeedVersions({
    version
} : {
    version: string
}) : Promise<void>
{
    console.log(version);
    const octokit = new Octokit({ auth: ACCESS_TOKEN });
    // const newBranchName = Object.keys(GenerationLanguage);

    const newBranchName = "schatiwala/test-pr-with-octokit";
    const baseBranch = "main";

    // console.log(baseBranchCommitSHA);

    const configFileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "fern-api",
        repo: "fern-python",
        path: ".circleci/config.yml",
        headers: {
            "X-GitHub-Api-Version": "2022-11-28"
        }
    });

    const configFileSHA = JSON.parse(JSON.stringify(configFileResponse.data)).sha;

    const latestBaseBranchCommit = await octokit.rest.repos.getBranch({
        owner: "fern-api",
        repo: "fern-python",
        branch: baseBranch,
      });


    const baseBranchCommitSHA = latestBaseBranchCommit.data.commit.sha;

    await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
        owner: "fern-api",
        repo: "fern-python",
        ref: `refs/heads/${newBranchName}`,
        sha: baseBranchCommitSHA
    });
    
    console.log("new branch created");

    await octokit.rest.repos.createOrUpdateFileContents({
        owner: "fern-api",
        repo: "fern-python",
        path: ".circleci/config.yml",
        message: "Test update file content",
        content: Buffer.from("inputString", "utf-8").toString("base64"),
        branch: newBranchName,
        sha: configFileSHA
    });

    const pullRequest = await octokit.rest.pulls.create({
        owner: "fern-api",
        repo: "fern-python",
        title: "Test PR with octokit",
        head: newBranchName,
        base: baseBranch
    });

    console.log("Pull request created: ", pullRequest.data.html_url);

}