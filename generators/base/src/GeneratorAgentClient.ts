import {
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

    public async generateReadme<ReadmeConfig>({ readmeConfig }: { readmeConfig: ReadmeConfig }): Promise<string> {
        this.logger.debug("GeneratorAgentClient.generateReadme: Calling JS API...");
        try {
            const result = await generateReadmeApi({
                readmeConfig: readmeConfig as Parameters<typeof generateReadmeApi>[0]["readmeConfig"]
            });
            this.logger.debug(`GeneratorAgentClient.generateReadme: JS API returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReadme: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }

    public async pushToGitHub<GitHubConfig>({
        githubConfig,
        withPullRequest
    }: {
        githubConfig: GitHubConfig;
        withPullRequest?: boolean;
    }): Promise<string> {
        this.logger.debug(`GeneratorAgentClient.pushToGitHub: Calling JS API (withPullRequest=${withPullRequest})...`);
        try {
            const typedConfig = githubConfig as Parameters<typeof githubPush>[0]["githubConfig"];
            if (withPullRequest) {
                await githubPr({ githubConfig: typedConfig });
            } else {
                await githubPush({ githubConfig: typedConfig });
            }
            return "";
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.pushToGitHub: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }

    public async generateReference<ReferenceConfig>({
        referenceConfig
    }: {
        referenceConfig: ReferenceConfig;
    }): Promise<string> {
        this.logger.debug("GeneratorAgentClient.generateReference: Calling JS API...");
        try {
            const result = await generateReferenceApi({
                referenceConfig: referenceConfig as Parameters<typeof generateReferenceApi>[0]["referenceConfig"]
            });
            this.logger.debug(`GeneratorAgentClient.generateReference: JS API returned ${result.length} bytes`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.debug(`GeneratorAgentClient.generateReference: JS API FAILED: ${errorMessage}`);
            throw error;
        }
    }
}
