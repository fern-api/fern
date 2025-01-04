import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile, php } from "@fern-api/php-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseExceptionGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.context.getBaseExceptionClassReference(),
            parentClassReference: this.context.getExceptionClassReference(),
            docs: "Base exception class for all exceptions thrown by the SDK."
        });
        return new PhpFile({
            clazz: class_,
            directory: this.context.getLocationForBaseException().directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`${this.context.getBaseExceptionClassReference().name}.php`));
    }
}
