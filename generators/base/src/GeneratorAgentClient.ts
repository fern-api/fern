import { extractErrorMessage } from "@fern-api/core-utils";
import {
    type GenerateReadmeParams,
    type GenerateReferenceParams,
    type GithubPushParams,
    generateReadme as generateReadmeApi,
    generateReference as generateReferenceApi,
    githubPr,
    githubPush
} from "@fern-api/generator-cli";
import { Logger } from "@fern-api/logger";
export class GeneratorAgentClient {
    private logger: Logger;

    constructor({ logger }: { logger: Logger; skipInstall?: boolean; selfHosted?: boolean }) {
        this.logger = logger;
    }

    public async generateReadme({ readmeConfig }: GenerateReadmeParams): Promise<string> {
        this.logger.debug("Generating readme...");
        try {
            const result = await generateReadmeApi({ readmeConfig });
            this.logger.debug(`Generated readme (${result.length} bytes)`);
            return result;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            this.logger.debug(`Failed to generate readme: ${errorMessage}`);
            throw error;
        }
    }

    public async pushToGitHub({
        githubConfig,
        withPullRequest
    }: GithubPushParams & { withPullRequest?: boolean }): Promise<string> {
        this.logger.debug(`Pushing to GitHub (withPullRequest=${withPullRequest})...`);
        try {
            if (withPullRequest) {
                await githubPr({ githubConfig });
            } else {
                await githubPush({ githubConfig });
            }
            return "";
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            this.logger.debug(`Failed to push to GitHub: ${errorMessage}`);
            throw error;
        }
    }

    public async generateReference({ referenceConfig }: GenerateReferenceParams): Promise<string> {
        this.logger.debug("Generating reference...");
        try {
            const result = await generateReferenceApi({ referenceConfig });
            this.logger.debug(`Generated reference (${result.length} bytes)`);
            return result;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            this.logger.debug(`Failed to generate reference: ${errorMessage}`);
            throw error;
        }
    }
}
