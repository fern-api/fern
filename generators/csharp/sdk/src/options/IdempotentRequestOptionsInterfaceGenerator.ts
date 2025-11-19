import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export class IdempotentRequestOptionsInterfaceGenerator extends FileGenerator<CSharpFile> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);
        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const interface_ = this.csharp.interface_({
            ...this.Types.IdempotentRequestOptionsInterface,
            access: ast.Access.Internal,
            interfaceReferences: [this.Types.RequestOptionsInterface]
        });
        this.context.getIdempotencyFields(interface_, false);

        interface_.addMethod({
            name: "GetIdempotencyHeaders",
            access: ast.Access.Internal,
            parameters: [],
            return_: this.Types.Headers,
            type: ast.MethodType.INSTANCE,
            noBody: true
        });
        return new CSharpFile({
            clazz: interface_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.core,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.coreFiles,
            RelativeFilePath.of(`${this.Types.IdempotentRequestOptionsInterface.name}.cs`)
        );
    }
}
