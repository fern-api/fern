import { fail } from "node:assert";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, lazy } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId } from "@fern-fern/ir-sdk/api";
import { RawClient } from "../endpoint/http/RawClient";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class RawRootClientGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private rawClient: RawClient;
    private serviceId: ServiceId | undefined;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.rawClient = new RawClient(context);
        this.serviceId = this.context.ir.rootPackage.service;
    }

    private members = lazy({
        client: () => this.Types.RawRootClient.explicit("_client"),
        clientName: () => this.model.getPropertyNameFor(this.members.client)
    });

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`Raw${this.names.classes.rootClient}.cs`));
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.RawRootClient,
            partial: true,
            access: ast.Access.Public
        });

        class_.addField({
            access: ast.Access.Private,
            origin: this.members.client,
            type: this.Types.RawClient,
            readonly: true
        });

        class_.addConstructor(this.getConstructorMethod());

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service =
                this.context.getHttpService(rootServiceId) ?? fail(`Service with id ${rootServiceId} not found`);
            this.generateEndpoints(class_, rootServiceId, service);
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private generateEndpoints(cls: ast.Class, serviceId: ServiceId, service: HttpService) {
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
}
