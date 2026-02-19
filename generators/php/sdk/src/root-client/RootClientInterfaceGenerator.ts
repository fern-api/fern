import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class RootClientInterfaceGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(this.context.getRootClientInterfaceClassName() + ".php"));
    }

    public doGenerate(): PhpFile {
        const interface_ = php.interface_({
            name: this.context.getRootClientInterfaceClassName(),
            namespace: this.context.getRootNamespace()
        });

        const rootServiceId = this.context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = this.context.getHttpServiceOrThrow(rootServiceId);
            for (const endpoint of service.endpoints) {
                const signatures = this.context.endpointGenerator.generateSignatures({
                    serviceId: rootServiceId,
                    service,
                    endpoint
                });
                interface_.addMethods(signatures);
            }
        }

        for (const subpackage of this.getRootSubpackages()) {
            interface_.addMethod(
                php.method({
                    name: this.context.getSubpackageGetterName(subpackage),
                    access: "public",
                    parameters: [],
                    return_: php.Type.reference(this.context.getSubpackageInterfaceClassReference(subpackage)),
                    noBody: true
                })
            );
        }

        return new PhpFile({
            clazz: interface_,
            directory: RelativeFilePath.of(""),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getRootSubpackages(): FernIr.Subpackage[] {
        return this.context.ir.rootPackage.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => this.context.shouldGenerateSubpackageClient(subpackage));
    }
}
