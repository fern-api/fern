import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

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

export class SubPackageClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private classReference: php.ClassReference;
    private subpackage: Subpackage;
    private serviceId: ServiceId | undefined;
    private service: HttpService | undefined;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.classReference = this.context.getSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.classReference
        });

        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";

        class_.addField(
            php.field({
                name: `$${this.context.getClientOptionsName()}`,
                access: "private",
                type: this.context.getClientOptionsType(),
                docs: "@phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator"
            })
        );
        class_.addField(this.context.rawClient.getField());

        if (isMultiUrl) {
            class_.addField(
                php.field({
                    name: "$environment",
                    access: "private",
                    type: php.Type.reference(this.context.getEnvironmentsClassReference())
                })
            );
        }

        const subpackages = this.getSubpackages();
        class_.addConstructor(this.getConstructorMethod({ subpackages }));
        for (const subpackage of subpackages) {
            class_.addField(this.context.getSubpackageField(subpackage));
        }

        if (this.service != null && this.serviceId != null) {
            for (const endpoint of this.service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    endpoint
                });
                class_.addMethods(methods);
            }
        }

        return new PhpFile({
            clazz: class_,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod({ subpackages }: { subpackages: Subpackage[] }): php.Class.Constructor {
        const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";

        const parameters: php.Parameter[] = [
            php.parameter({
                name: "$client",
                type: php.Type.reference(this.context.rawClient.getClassReference())
            })
        ];

        if (isMultiUrl) {
            parameters.push(
                php.parameter({
                    name: "environment",
                    type: php.Type.reference(this.context.getEnvironmentsClassReference())
                })
            );
            // Add options parameter for multi-URL mode to support refreshable auth headers
            parameters.push(
                php.parameter({
                    name: this.context.getClientOptionsName(),
                    type: php.Type.optional(this.context.getClientOptionsType()),
                    initializer: php.codeblock("null")
                })
            );
        } else {
            parameters.push(
                php.parameter({
                    name: this.context.getClientOptionsName(),
                    type: php.Type.optional(this.context.getClientOptionsType()),
                    initializer: php.codeblock("null")
                })
            );
        }

        return {
            parameters,
            body: php.codeblock((writer) => {
                writer.writeLine(`$this->client = $${this.context.rawClient.getFieldName()};`);

                if (isMultiUrl) {
                    writer.writeTextStatement("$this->environment = $environment");
                    // Use options parameter to support refreshable auth headers in multi-URL mode
                    writer.writeNodeStatement(
                        php.codeblock((writer) => {
                            writer.write(`$this->${this.context.getClientOptionsName()} = `);
                            writer.writeNode(php.variable(this.context.getClientOptionsName()));
                            writer.write(" ?? []");
                        })
                    );
                } else {
                    writer.writeNodeStatement(
                        php.codeblock((writer) => {
                            writer.write(`$this->${this.context.getClientOptionsName()} = `);
                            writer.writeNode(php.variable(this.context.getClientOptionsName()));
                            writer.write(" ?? []");
                        })
                    );
                }

                for (const subpackage of subpackages) {
                    writer.write(`$this->${subpackage.name.camelCase.safeName} = `);

                    const subClientArgs: php.AstNode[] = [
                        php.codeblock(`$this->${this.context.rawClient.getFieldName()}`)
                    ];

                    if (isMultiUrl) {
                        subClientArgs.push(php.codeblock(`$this->environment`));
                        // Pass options to nested subpackage clients for refreshable auth headers
                        subClientArgs.push(php.codeblock(`$this->${this.context.getClientOptionsName()}`));
                    } else {
                        subClientArgs.push(php.codeblock(`$this->${this.context.getClientOptionsName()}`));
                    }

                    writer.writeNodeStatement(
                        php.instantiateClass({
                            classReference: this.context.getSubpackageClassReference(subpackage),
                            arguments_: subClientArgs
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
            RelativeFilePath.of(this.classReference.name + ".php")
        );
    }
}
