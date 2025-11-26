import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, lazy } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace RawSubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class RawSubPackageClientGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private classReference: ast.ClassReference;
    private subpackage: Subpackage;
    private serviceId?: ServiceId;
    private service?: HttpService;
    private rawClient: RawClient;

    constructor({ subpackage, context, serviceId, service }: RawSubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getRawSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
        this.rawClient = new RawClient(context);
        this.service = service;
        this.serviceId = serviceId;
    }

    private members = lazy({
        client: () => this.classReference.explicit("_client"),
        clientName: () => this.model.getPropertyNameFor(this.members.client)
    });

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: true,
            access: ast.Access.Public
        });

        class_.addField({
            origin: this.members.client,
            access: ast.Access.Private,
            type: this.Types.RawClient
        });

        class_.addConstructor(this.getConstructorMethod());

        if (this.service != null && this.serviceId != null) {
            this.generateEndpoints(class_);
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage)),
            allNamespaceSegments: this.registry.allNamespacesOf(this.classReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private generateEndpoints(cls: ast.Class) {
        const service = this.service;
        if (!service) {
            throw new Error("Internal error; Service is not defined");
        }
        const serviceId = this.serviceId;
        if (!serviceId) {
            throw new Error("Internal error; ServiceId is not defined");
        }
        service.endpoints.flatMap((endpoint) => {
            this.context.endpointGenerator.generate(cls, {
                serviceId,
                endpoint,
                rawClientReference: this.members.clientName,
                rawClient: this.rawClient,
                generateRawResponse: true
            });
        });
    }

    private getConstructorMethod() {
        const parameters: ast.Parameter[] = [
            this.csharp.parameter({
                name: "client",
                type: this.Types.RawClient
            })
        ];
        return {
            access: ast.Access.Internal,
            parameters,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`${this.members.clientName} = client;`);
            })
        };
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
