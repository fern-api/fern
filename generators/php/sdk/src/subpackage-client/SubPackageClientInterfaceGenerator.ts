import { CaseConverter } from "@fern-api/base-generator";
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
        serviceId?: FernIr.ServiceId;
        service?: FernIr.HttpService;
    }
}

export class SubPackageClientInterfaceGenerator extends FileGenerator<
    PhpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private readonly case: CaseConverter;
    private subpackage: FernIr.Subpackage;
    private serviceId: FernIr.ServiceId | undefined;
    private service: FernIr.HttpService | undefined;

    constructor({ context, subpackage, serviceId, service }: SubPackageClientInterfaceGenerator.Args) {
        super(context);
        this.case = context.case;
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    protected getFilepath(): RelativeFilePath {
        const interfaceName = `${this.case.pascalUnsafe(this.subpackage.name)}ClientInterface`;
        return join(
            this.context.getLocationForSubpackage(this.subpackage).directory,
            RelativeFilePath.of(interfaceName + ".php")
        );
    }

    public doGenerate(): PhpFile {
        const interfaceName = `${this.case.pascalUnsafe(this.subpackage.name)}ClientInterface`;
        const interface_ = php.interface_({
            name: interfaceName,
            namespace: this.context.getLocationForSubpackage(this.subpackage).namespace
        });

        if (this.service != null && this.serviceId != null) {
            for (const endpoint of this.service.endpoints) {
                const signatures = this.context.endpointGenerator.generateSignatures({
                    serviceId: this.serviceId,
                    service: this.service,
                    endpoint
                });
                interface_.addMethods(signatures);
            }
        }

        for (const childSubpackage of this.getChildSubpackages()) {
            interface_.addMethod(
                php.method({
                    name: this.context.getSubpackageGetterName(childSubpackage),
                    access: "public",
                    parameters: [],
                    return_: php.Type.reference(this.context.getSubpackageInterfaceClassReference(childSubpackage)),
                    noBody: true
                })
            );
        }

        return new PhpFile({
            clazz: interface_,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getChildSubpackages(): FernIr.Subpackage[] {
        return this.subpackage.subpackages
            .map((subpackageId) => this.context.getSubpackageOrThrow(subpackageId))
            .filter((subpackage) => this.context.shouldGenerateSubpackageClient(subpackage));
    }
}
