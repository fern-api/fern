import { AbstractGeneratorContext } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";

export interface FileLocation {
    namespace: string;
    directory: RelativeFilePath;
}

export abstract class AbstractJavaGeneratorContext<
    CustomConfig extends BaseJavaCustomConfigSchema
> extends AbstractGeneratorContext {}
