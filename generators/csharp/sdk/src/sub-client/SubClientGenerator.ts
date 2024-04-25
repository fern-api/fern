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

        class_.addField(
            csharp.field({
                access: "private",
                name: "_client",
                type: csharp.Type.reference(this.context.getRawClientClassReference())
            })
        );

        class_.addConstructor(this.getConstructorMethod());

        for (const endpoint of this.service.endpoints) {
            class_.addMethod(
                csharp.method({
                    name: this.context.getEndpointMethodName(endpoint),
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

    private getConstructorMethod(): csharp.Class.Constructor {
        return {
            access: "public",
            parameters: [
                csharp.parameter({
                    name: "client",
                    type: csharp.Type.reference(this.context.getRawClientClassReference())
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.writeLine("_client = client;");
            })
        };
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
