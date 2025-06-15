import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SubClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        subpackage: Subpackage;
        serviceId?: ServiceId;
        service?: HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: go.TypeReference;
    private subpackage: Subpackage;
    private serviceId: ServiceId | undefined;
    private service: HttpService | undefined;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getSubpackageClientClassReference(subpackage);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            ...this.classReference
        });

        const subpackages = this.getSubpackages();
        for (const subpackage of subpackages) {
            struct.addField(this.context.getSubpackageClientField(subpackage));
        }

        if (this.service != null && this.serviceId != null) {
            for (const endpoint of this.service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    endpoint
                });
                for (const method of methods) {
                    struct.addMethod(method);
                }
            }
        }

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.context.getClientPackageName(),
            importPath: this.context.getSubpackageClientClassReference(this.subpackage).importPath,
            directory: this.context.getSubpackageClientFileLocation(this.subpackage).directory,
            filename: this.context.getClientFilename(),
            customConfig: this.context.customConfig
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages
            .map((subpackageId) => {
                return this.context.getSubpackageOrThrow(subpackageId);
            })
            .filter((subpackage) => this.context.shouldGenerateSubpackageClient(subpackage));
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.getSubpackageClientFileLocation(this.subpackage).directory,
            RelativeFilePath.of(this.context.getClientFilename())
        );
    }
}
