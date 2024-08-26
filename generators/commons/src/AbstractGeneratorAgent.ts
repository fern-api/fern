import { Logger } from "@fern-api/logger";
import { GeneratorAgentClient } from "./GeneratorAgentClient";

export abstract class AbstractGeneratorAgent<Context, ReadmeConfig, ReferenceConfig> {
    public README_FILENAME = "README.md";
    public REFERENCE_FILENAME = "reference.md";

    private cli: GeneratorAgentClient;

    public constructor(public readonly logger: Logger) {
        this.cli = new GeneratorAgentClient({
            logger
        });
    }

    public async generateReadme(context: Context): Promise<string> {
        const readmeConfig = this.getReadmeConfig(context);
        return this.cli.generateReadme({ readmeConfig });
    }

    public async generateReference(context: Context): Promise<string> {
        const referenceConfig = this.getReferenceConfig(context);
        return this.cli.generateReference({ referenceConfig });
    }

    /**
     * Gets the README.md configuration.
     */
    protected abstract getReadmeConfig(context: Context): ReadmeConfig;

    /**
     * Gets the reference.md configuration.
     */
    protected abstract getReferenceConfig(context: Context): ReferenceConfig;
}
