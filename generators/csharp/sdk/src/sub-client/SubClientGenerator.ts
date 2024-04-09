import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class SubClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference;

    constructor(
        context: SdkGeneratorContext,
        private readonly serviceId: ServiceId,
        private readonly service: HttpService
    ) {
        super(context);
        this.classReference = this.context.getServiceClassReference(serviceId);
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: "public"
        });

        for (const endpoint of this.service.endpoints) {
            class_.addMethod(
                csharp.method({
                    name: endpoint.name.pascalCase.safeName,
                    access: "public",
                    isAsync: true,
                    parameters: [],
                    summary: endpoint.docs
                })
            );
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForServiceId(this.serviceId))
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
