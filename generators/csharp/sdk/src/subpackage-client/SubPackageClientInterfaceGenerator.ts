import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubPackageClientInterfaceGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientInterfaceGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private interfaceReference: ast.ClassReference;
    private subpackage: Subpackage;
    private serviceId?: ServiceId;
    private service?: HttpService;

    constructor({ subpackage, context, serviceId, service }: SubPackageClientInterfaceGenerator.Args) {
        super(context);
        this.interfaceReference = this.context.getSubpackageInterfaceReference(subpackage);
        this.subpackage = subpackage;
        this.service = service;
        this.serviceId = serviceId;
    }

    public doGenerate(): CSharpFile {
        const interface_ = this.csharp.interface_({
            name: this.interfaceReference.name,
            namespace: this.interfaceReference.namespace,
            access: ast.Access.Public,
            partial: true
        });

        for (const childSubpackage of this.getSubpackages()) {
            if (this.context.subPackageHasEndpointsRecursively(childSubpackage)) {
                // Use concrete class reference (not interface) to match the implementing class's property type
                // C# requires exact type match when implementing interface properties
                interface_.addField({
                    name: childSubpackage.name.pascalCase.safeName,
                    enclosingType: interface_,
                    access: ast.Access.Public,
                    get: true,
                    type: this.context.getSubpackageClassReference(childSubpackage)
                });
            }
        }

        if (this.service != null && this.serviceId != null) {
            this.generateEndpointSignatures(interface_);
        }

        return new CSharpFile({
            clazz: interface_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackage(this.subpackage)),
            allNamespaceSegments: this.registry.allNamespacesOf(this.interfaceReference.namespace),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private generateEndpointSignatures(interface_: ast.Interface): void {
        const service = this.service;
        if (!service) {
            throw new Error("Internal error; Service is not defined");
        }
        const serviceId = this.serviceId;
        if (!serviceId) {
            throw new Error("Internal error; ServiceId is not defined");
        }
        for (const endpoint of service.endpoints) {
            this.context.endpointGenerator.generateInterfaceSignature(interface_, {
                serviceId,
                endpoint
            });
        }
    }

    private getSubpackages(): Subpackage[] {
        return this.context.getSubpackages(this.subpackage.subpackages);
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.interfaceReference.name}.cs`));
    }
}
