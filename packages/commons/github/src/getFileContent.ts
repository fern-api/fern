import { Octokit } from "octokit";

import { parseRepository } from "./parseRepository.js";

/**
 * Fetches the content of a file from a GitHub repository's default branch.
 *
 * If the GITHUB_TOKEN environment variable is set, it will be used to authenticate
 * requests to the GitHub API, enabling access to private repositories.
 *
 * @param githubRepository a string with the format `owner/repo`
 * @param filePath the path to the file within the repository (e.g., ".fern/metadata.json")
 * @param options.authToken optional GitHub auth token (defaults to process.env.GITHUB_TOKEN)
 * @returns The decoded file content as a string, or undefined if the file doesn't exist
 */
export async function getFileContent(
    githubRepository: string,
    filePath: string,
    options?: { authToken?: string }
): Promise<string | undefined> {
    const { owner, repo } = parseRepository(githubRepository);

    const token = options?.authToken ?? process.env.GITHUB_TOKEN;
    const octokit = token != null ? new Octokit({ auth: token }) : new Octokit();

    try {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: filePath
        });

        // getContent returns a file object with content when the path is a file
        const data = response.data;
        if (!Array.isArray(data) && data.type === "file" && data.content != null) {
            return Buffer.from(data.content, "base64").toString("utf-8");
        }

        return undefined;
    } catch (error) {
        // File doesn't exist (404), repo is private without auth (403), or other error
        return undefined;
    }
}
