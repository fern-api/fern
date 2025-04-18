import { mkdir } from "fs/promises";

import { AbstractProject } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractRubyGeneratorContext, BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";

/**
 * In memory representation of a Ruby project.
 */
export class RubyProject extends AbstractProject<AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>> {
    public constructor({ context }: { context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema> }) {
        super(context);
    }

    public async persist(): Promise<void> {
        await this.writeRawFiles();
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}
