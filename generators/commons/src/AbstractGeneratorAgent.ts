import { Logger } from "@fern-api/logger";
import { AbstractGeneratorContext } from "./AbstractGeneratorContext";
import { GeneratorAgentClient } from "./GeneratorAgentClient";

export abstract class AbstractGeneratorAgent<
    GeneratorContext extends AbstractGeneratorContext,
    ReadmeConfig,
    ReferenceConfig
> {
    public README_FILENAME = "README.md";
    public REFERENCE_FILENAME = "reference.md";

    private cli: GeneratorAgentClient;

    public constructor(public readonly logger: Logger) {
        this.cli = new GeneratorAgentClient({
            logger
        });
    }

    public async generateReadme(context: GeneratorContext): Promise<string> {
        const readmeConfig = this.getReadmeConfig(context);
        return this.cli.generateReadme({ readmeConfig });
    }

    public async generateReference(context: GeneratorContext): Promise<string> {
        const referenceConfig = this.getReferenceConfig(context);
        return this.cli.generateReference({ referenceConfig });
    }

    /**
     * Gets the README.md configuration.
     */
    protected abstract getReadmeConfig(context: GeneratorContext): ReadmeConfig;

    /**
     * Gets the reference.md configuration.
     */
    protected abstract getReferenceConfig(context: GeneratorContext): ReferenceConfig;
}
