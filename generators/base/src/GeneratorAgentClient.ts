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
        this.logger.debug("GeneratorAgentClient.generateReadme: Calling JS API...");
        try {
            const result = await generateReadmeApi({ readmeConfig });
            this.logger.debug(`GeneratorAgentClient.generateReadme: JS API returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReadme: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }

    public async pushToGitHub({
        githubConfig,
        withPullRequest
    }: GithubPushParams & { withPullRequest?: boolean }): Promise<string> {
        this.logger.debug(`GeneratorAgentClient.pushToGitHub: Calling JS API (withPullRequest=${withPullRequest})...`);
        try {
            if (withPullRequest) {
                await githubPr({ githubConfig });
            } else {
                await githubPush({ githubConfig });
            }
            return "";
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.pushToGitHub: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }

    public async generateReference({ referenceConfig }: GenerateReferenceParams): Promise<string> {
        this.logger.debug("GeneratorAgentClient.generateReference: Calling JS API...");
        try {
            const result = await generateReferenceApi({ referenceConfig });
            this.logger.debug(`GeneratorAgentClient.generateReference: JS API returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReference: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }
}
