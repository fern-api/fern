import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace SubPackageClientInterfaceGenerator {
    interface Args {
        context: SdkGeneratorContext;
        subpackage: FernIr.Subpackage;
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
    }
}

export class SubPackageClientInterfaceGenerator extends FileGenerator<
    PhpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private subpackage: FernIr.Subpackage;
    private serviceId: FernIr.ServiceId;
    private service: FernIr.HttpService;

    constructor({ context, subpackage, serviceId, service }: SubPackageClientInterfaceGenerator.Args) {
        super(context);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    protected getFilepath(): RelativeFilePath {
        const interfaceName = `${this.subpackage.name.pascalCase.unsafeName}ClientInterface`;
        return join(
            this.context.getLocationForSubpackage(this.subpackage).directory,
            RelativeFilePath.of(interfaceName + ".php")
        );
    }

    public doGenerate(): PhpFile {
        const interfaceName = `${this.subpackage.name.pascalCase.unsafeName}ClientInterface`;
        const interface_ = php.interface_({
            name: interfaceName,
            namespace: this.context.getLocationForSubpackage(this.subpackage).namespace
        });

        for (const endpoint of this.service.endpoints) {
            const signatures = this.context.endpointGenerator.generateSignatures({
                serviceId: this.serviceId,
                service: this.service,
                endpoint
            });
            interface_.addMethods(signatures);
        }

        return new PhpFile({
            clazz: interface_,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }
}
