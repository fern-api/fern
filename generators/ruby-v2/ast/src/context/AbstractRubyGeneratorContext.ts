import { AbstractGeneratorContext } from "@fern-api/browser-compatible-base-generator";

import { BaseRubyCustomConfigSchema } from "../custom-config/BaseRubyCustomConfigSchema";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
> extends AbstractGeneratorContext {
    public abstract getCoreAsIsFiles(): string[];
}
