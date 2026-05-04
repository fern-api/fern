import { CaseConverter } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace SubClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        subpackage: FernIr.Subpackage;
        serviceId?: FernIr.ServiceId;
        service?: FernIr.HttpService;
    }
}

export class SubPackageClientGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private readonly case: CaseConverter;
    private classReference: php.ClassReference;
    private subpackage: FernIr.Subpackage;
    private serviceId: FernIr.ServiceId | undefined;
    private service: FernIr.HttpService | undefined;

    constructor({ subpackage, context, serviceId, service }: SubClientGenerator.Args) {
        super(context);
        this.case = context.case;
        this.classReference = this.context.getSubpackageClassReference(subpackage);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            ...this.classReference,
            interfaceReferences: this.context.customConfig.generateClientInterfaces
                ? [this.context.getSubpackageInterfaceClassReference(this.subpackage)]
                : undefined
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

        if (this.context.customConfig.generateClientInterfaces) {
            for (const subpackage of subpackages) {
                class_.addMethod(
                    php.method({
                        name: this.context.getSubpackageGetterName(subpackage),
                        access: "public",
                        parameters: [],
                        return_: php.Type.reference(this.context.getSubpackageInterfaceClassReference(subpackage)),
                        body: php.codeblock((writer) => {
                            writer.writeTextStatement(`return $this->${this.case.camelSafe(subpackage.name)}`);
                        })
                    })
                );
            }
        }

        return new PhpFile({
            clazz: class_,
            directory: this.context.getLocationForSubpackage(this.subpackage).directory,
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getConstructorMethod({ subpackages }: { subpackages: FernIr.Subpackage[] }): php.Class.Constructor {
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
                    writer.writeNodeStatement(
                        php.codeblock((writer) => {
                            writer.write(`$this->${this.context.getClientOptionsName()} = []`);
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
                    writer.write(`$this->${this.case.camelSafe(subpackage.name)} = `);

                    const subClientArgs: php.AstNode[] = [
                        php.codeblock(`$this->${this.context.rawClient.getFieldName()}`)
                    ];

                    if (isMultiUrl) {
                        subClientArgs.push(php.codeblock(`$this->environment`));
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

    private getSubpackages(): FernIr.Subpackage[] {
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
