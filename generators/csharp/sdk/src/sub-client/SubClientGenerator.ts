import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { EndpointGenerator } from "./EndpointGenerator";
import { RawClient } from "./RawClient";

export const CLIENT_MEMBER_NAME = "_client";

export class SubClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference;
    private rawClient: RawClient;
    private endpointGenerator: EndpointGenerator;

    constructor(
        context: SdkGeneratorContext,
        private readonly serviceId: ServiceId,
        private readonly service: HttpService
    ) {
        super(context);
        this.classReference = this.context.getServiceClassReference(serviceId);
        this.rawClient = new RawClient(context);
        this.endpointGenerator = new EndpointGenerator(context, this.rawClient);
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
                name: CLIENT_MEMBER_NAME,
                type: csharp.Type.reference(this.context.getRawClientClassReference())
            })
        );

        class_.addConstructor(this.getConstructorMethod());

        for (const endpoint of this.service.endpoints) {
            const method = this.endpointGenerator.generate({ endpoint, rawClientReference: CLIENT_MEMBER_NAME });
            class_.addMethod(method);
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
