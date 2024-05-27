import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { EndpointGenerator } from "../endpoint/EndpointGenerator";
import { RawClient } from "../endpoint/RawClient";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const CLIENT_MEMBER_NAME = "_client";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: csharp.ClassReference;
    private subpackage: Subpackage;
    private serviceId?: ServiceId;
    private service?: HttpService;
    private rawClient: RawClient;
    private endpointGenerator: EndpointGenerator;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
        this.rawClient = new RawClient(context);
        this.service = service;
        this.serviceId = serviceId;
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

        for (const subpackage of this.getSubpackages()) {
            class_.addField(
                csharp.field({
                    access: "public",
                    get: true,
                    name: subpackage.name.pascalCase.safeName,
                    type: csharp.Type.reference(this.context.getSubpackageClassReference(subpackage))
                })
            );
        }

        class_.addConstructor(this.getConstructorMethod());

        if (this.service != null && this.serviceId != null) {
            for (const endpoint of this.service.endpoints) {
                const method = this.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    endpoint,
                    rawClientReference: CLIENT_MEMBER_NAME
                });
                class_.addMethod(method);
            }
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage))
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
                for (const subpackage of this.getSubpackages()) {
                    writer.writeLine(`${subpackage.name.pascalCase.safeName} = `);
                    writer.writeNodeStatement(
                        csharp.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: [csharp.codeblock("_client")]
                        })
                    );
                }
            })
        };
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
