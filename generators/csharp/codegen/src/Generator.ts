import { AbstractCsharpGeneratorContext, BaseCsharpCustomConfigSchema } from "./cli";
import { File } from "./utils/File";

export abstract class Generator<
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends AbstractCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public abstract generate(): File;
}
