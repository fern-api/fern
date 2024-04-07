import { csharp, CSharpFile, Generator } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class SubClientGenerator extends Generator<SdkCustomConfigSchema, SdkGeneratorContext> {
    constructor(
        context: SdkGeneratorContext,
        private readonly serviceId: ServiceId,
        private readonly service: HttpService
    ) {
        super(context);
    }

    public generate(): CSharpFile {
        const class_ = csharp.class_({
            name: `${this.service.name.fernFilepath.file?.pascalCase.unsafeName}Client`,
            namespace: this.context.getNamespaceForServiceId(this.serviceId),
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
}
