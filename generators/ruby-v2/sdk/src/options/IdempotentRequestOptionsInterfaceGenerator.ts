import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { join, RelativeFilePath } from "@fern-api/path-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IIdempotentRequestOptions";
export const IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME = "options";

export class IdempotentRequestOptionsInterfaceGenerator extends FileGenerator<
    RubyFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
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
            filename: `${IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME}.rb`,
            customConfig: this.context.customConfig
        });
    }

    public getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("TODO")
    }

    // public doGenerate(): CSharpFile {
    //     const interface_ = csharp.interface_({
    //         ...this.context.getIdempotentRequestOptionsInterfaceClassReference(),
    //         access: csharp.Access.Internal,
    //         interfaceReferences: [this.context.getRequestOptionsInterfaceReference()]
    //     });
    //     interface_.addFields(this.baseOptionsGenerator.getIdempotentRequestOptionFields());
    //     interface_.addMethod(
    //         csharp.method({
    //             name: "GetIdempotencyHeaders",
    //             access: csharp.Access.Internal,
    //             parameters: [],
    //             return_: csharp.Type.reference(this.context.getHeadersClassReference()),
    //             type: csharp.MethodType.INSTANCE,
    //             noBody: true
    //         })
    //     );
    //     return new CSharpFile({
    //         clazz: interface_,
    //         directory: this.context.getCoreDirectory(),
    //         allNamespaceSegments: this.context.getAllNamespaceSegments(),
    //         allTypeClassReferences: this.context.getAllTypeClassReferences(),
    //         namespace: this.context.getCoreNamespace(),
    //         customConfig: this.context.customConfig
    //     });
    // }

    // protected getFilepath(): RelativeFilePath {
    //     return join(
    //         this.context.project.filepaths.getCoreFilesDirectory(),
    //         RelativeFilePath.of(`${IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME}.cs`)
    //     );
    // }
}
