import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class BaseExceptionGenerator extends FileGenerator<RustFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RustFile {
        const class_ = rust.struct({
            ...this.context.getBaseExceptionStructReference(),
            parentClassReference: this.context.getExceptionClassReference(),
            docs: "Base exception class for all exceptions thrown by the SDK."
        });
        return new RustFile({
            struct: class_,
            directory: this.context.getLocationForBaseException().directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`${this.context.getBaseExceptionStructReference().name}.rs`));
    }
}
