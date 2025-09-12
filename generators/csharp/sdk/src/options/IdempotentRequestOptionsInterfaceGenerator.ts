import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "IIdempotentRequestOptions";
export const IDEMPOTENT_REQUEST_OPTIONS_PARAMETER_NAME = "options";

export class IdempotentRequestOptionsInterfaceGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);
        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const interface_ = this.csharp.interface_({
            ...this.context.getIdempotentRequestOptionsInterfaceClassReference(),
            access: ast.Access.Internal,
            interfaceReferences: [this.context.getRequestOptionsInterfaceReference()]
        });
        interface_.addFields(this.baseOptionsGenerator.getIdempotentRequestOptionFields());
        interface_.addMethod(
            this.csharp.method({
                name: "GetIdempotencyHeaders",
                access: ast.Access.Internal,
                parameters: [],
                return_: this.csharp.Type.reference(this.context.getHeadersClassReference()),
                type: ast.MethodType.INSTANCE,
                noBody: true
            })
        );
        return new CSharpFile({
            clazz: interface_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getCoreNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME}.cs`)
        );
    }
}
