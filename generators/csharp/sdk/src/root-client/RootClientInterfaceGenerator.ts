import { fail } from "node:assert";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class RootClientInterfaceGenerator extends FileGenerator<CSharpFile, SdkGeneratorContext> {
    private serviceId: ServiceId | undefined;

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.serviceId = this.context.ir.rootPackage.service;
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(`I${this.names.classes.rootClient}.cs`));
    }

    public doGenerate(): CSharpFile {
        const interface_ = this.csharp.interface_({
            name: `I${this.names.classes.rootClient}`,
            namespace: this.namespaces.root,
            access: ast.Access.Public,
            partial: true
        });

        for (const subpackage of this.getSubpackages()) {
            if (this.context.subPackageHasEndpointsRecursively(subpackage)) {
                interface_.addField({
                    name: subpackage.name.pascalCase.safeName,
                    enclosingType: interface_,
                    access: ast.Access.Public,
                    get: true,
                    type: this.context.getSubpackageInterfaceReference(subpackage)
                });
            }
        }

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service =
                this.context.getHttpService(rootServiceId) ?? fail(`Service with id ${rootServiceId} not found`);
            for (const endpoint of service.endpoints) {
                this.context.endpointGenerator.generateInterfaceSignature(interface_, {
                    serviceId: rootServiceId,
                    endpoint
                });
            }
        }

        return new CSharpFile({
            clazz: interface_,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private getSubpackages() {
        return this.context.getSubpackages(this.context.ir.rootPackage.subpackages);
    }
}
