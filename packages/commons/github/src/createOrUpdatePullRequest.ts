import type { Octokit } from "octokit";

interface CreatePRRequest {
    title: string;
    body: string;
    base: string;
    draft?: boolean;
}

interface RepoMetadata {
    owner: string;
    repo: string;
}

function parseRepository(repository: string): RepoMetadata {
    const [owner, repo] = repository.split("/");
    if (owner == null || repo == null) {
        throw new Error(`Failed to parse repository into owner and repo: ${repository}`);
    }
    return {
        owner,
        repo
    };
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

export async function createOrUpdatePullRequest(
    octokit: Octokit,
    inputs: CreatePRRequest,
    baseRepository: string,
    headRepository: string,
    branchName: string
): Promise<string> {
    const [headOwner] = headRepository.split("/");
    const headBranch = `${headOwner}:${branchName}`;

    // Try to create the pull request
    try {
        console.log("Attempting creation of pull request");
        const { data: pull } = await octokit.rest.pulls.create({
            ...parseRepository(baseRepository),
            title: inputs.title,
            head: headBranch,
            head_repo: headRepository,
            base: inputs.base,
            body: inputs.body,
            draft: inputs.draft
        });
        console.log(
            `Created pull request #${pull.number} (${headBranch} => ${inputs.base}), with info ${JSON.stringify({
                number: pull.number,
                html_url: pull.html_url,
                created: true
            })}`
        );

        return pull.html_url;
    } catch (e) {
        if (getErrorMessage(e).includes("A pull request already exists for")) {
            console.error(`A pull request already exists for ${headBranch}`);
        } else {
            throw e;
        }
    }

    // Update the pull request that exists for this branch and base
    console.log("Fetching existing pull request");
    const { data: pulls } = await octokit.rest.pulls.list({
        ...parseRepository(baseRepository),
        state: "open",
        head: headBranch,
        base: inputs.base
    });
    console.log("Attempting update of pull request");

    const pullNumber = pulls[0]?.number;
    if (pullNumber == null) {
        throw new Error(`Failed to retrieve pull request number: ${JSON.stringify(pulls)}`);
    }

    const { data: pull } = await octokit.rest.pulls.update({
        ...parseRepository(baseRepository),
        pull_number: pullNumber,
        title: inputs.title,
        body: inputs.body
    });
    console.log(
        `Updated pull request #${pull.number} (${headBranch} => ${inputs.base}) with information ${JSON.stringify({
            number: pull.number,
            html_url: pull.html_url,
            created: false
        })}`
    );

    return pull.html_url;
}
