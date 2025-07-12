import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

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

export class SubPackageClientGenerator extends FileGenerator<RustFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private structReference: rust.StructReference;
    private subpackage: Subpackage;
    private serviceId: ServiceId | undefined;
    private service: HttpService | undefined;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.structReference = this.context.getSubpackageStructReference(subpackage);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): RustFile {
        const struct = rust.struct({
            ...this.structReference
        });

        struct.addField(
            rust.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: this.context.getClientOptionsType()
            })
        );
        struct.addField(this.context.rawClient.getField());

        const subpackages = this.getSubpackages();
        struct.addConstructor(this.getConstructorMethod({ subpackages }));
        for (const subpackage of subpackages) {
            struct.addField(this.context.getSubpackageField(subpackage));
        }

        if (this.service != null && this.serviceId != null) {
            for (const endpoint of this.service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    endpoint
                });
                struct.addMethods(methods);
            }
        }

        return new RustFile({
            struct,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod({ subpackages }: { subpackages: Subpackage[] }): rust.Struct.Constructor {
        return {
            parameters: [
                rust.parameter({
                    name: "$client",
                    type: rust.Type.reference(this.context.rawClient.getStructReference())
                }),
                rust.parameter({
                    name: this.context.getClientOptionsName(),
                    type: rust.Type.optional(this.context.getClientOptionsType()),
                    initializer: rust.codeblock("null")
                })
            ],
            body: rust.codeblock((writer) => {
                writer.writeLine(`$this->client = $${this.context.rawClient.getFieldName()};`);
                writer.writeNodeStatement(
                    rust.codeblock((writer) => {
                        writer.write(`$this->${this.context.getClientOptionsName()} = `);
                        writer.writeNode(rust.variable(this.context.getClientOptionsName()));
                        writer.write(" ?? []");
                    })
                );

                for (const subpackage of subpackages) {
                    writer.write(`$this->${subpackage.name.camelCase.safeName} = `);
                    writer.writeNodeStatement(
                        rust.instantiateStruct({
                            structReference: this.context.getSubpackageStructReference(subpackage),
                            arguments_: [
                                rust.codeblock(`$this->${this.context.rawClient.getFieldName()}`),
                                rust.codeblock(`$this->${this.context.getClientOptionsName()}`)
                            ]
                        })
                    );
                }
            })
        };
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
            this.context.getLocationForSubpackage(this.subpackage).directory,
            RelativeFilePath.of(this.structReference.name + ".rs")
        );
    }
}
