import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { join, RelativeFilePath } from "@fern-api/path-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";

export class RequestOptionsGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): RubyFile {
        const todoModule = this.context.getRootModule();
        todoModule.addStatement(ruby.class_({ name: "TODO" }));
        return new RubyFile({
            node: todoModule,
            directory: RelativeFilePath.of("TODO"),
            filename: `${REQUEST_OPTIONS_CLASS_NAME}.rb`,
            customConfig: this.context.customConfig
        });
    }

    public getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("TODO")
    }

    // public doGenerate(): RubyFile {
    //     const class_ = ruby.class_({
    //         ...this.context.getRequestOptionsClassReference(),
    //         partial: true,
    //         access: ruby.Access.Public,
    //         interfaceReferences: [this.context.getRequestOptionsInterfaceReference()],
    //         annotations: [this.context.getSerializableAttribute()]
    //     });
    //     class_.addFields(this.baseOptionsGenerator.getRequestOptionFields());
    //     return new RubyFile({
    //         clazz: class_,
    //         directory: this.context.getPublicCoreDirectory(),
    //         allNamespaceSegments: this.context.getAllNamespaceSegments(),
    //         allTypeClassReferences: this.context.getAllTypeClassReferences(),
    //         namespace: this.context.getPublicCoreNamespace(),
    //         customConfig: this.context.customConfig
    //     });
    // }

    // protected getFilepath(): RelativeFilePath {
    //     return join(
    //         this.context.project.filepaths.getPublicCoreFilesDirectory(),
    //         RelativeFilePath.of(`${REQUEST_OPTIONS_CLASS_NAME}.cs`)
    //     );
    // }
}
