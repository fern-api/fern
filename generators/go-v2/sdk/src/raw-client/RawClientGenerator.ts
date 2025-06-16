import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import { HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace RawClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        subpackage: Subpackage;
        serviceId: ServiceId;
        service: HttpService;
    }
}

export class RawClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private subpackage: Subpackage | undefined;
    private serviceId: ServiceId;
    private service: HttpService;

    constructor({ subpackage, context, serviceId, service }: RawClientGenerator.Args) {
        super(context);
        this.subpackage = subpackage;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            ...this.getClassReference()
        });

        struct.addConstructor(this.getConstructor());

        struct.addField(
            go.field({
                name: "baseURL",
                type: go.Type.string()
            }),
            this.context.caller.getField(),
            go.field({
                name: "header",
                type: go.Type.reference(this.context.getNetHttpHeaderTypeReference())
            })
        );

        for (const endpoint of this.service.endpoints) {
            const methods = this.context.endpointGenerator.generateRaw({
                serviceId: this.serviceId,
                service: this.service,
                endpoint
            });
            struct.addMethod(...methods);
        }

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.getPackageName(),
            importPath: this.getImportPath(),
            directory: this.getDirectory(),
            filename: this.context.getRawClientFilename(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.context.getRawClientFilename()));
    }

    private getConstructor(): go.Struct.Constructor {
        return {
            parameters: [
                go.parameter({
                    name: "opts",
                    type: this.context.getVariadicRequestOptionType()
                })
            ],
            body: go.codeblock((writer) => {
                writer.write("options := ");
                writer.writeNode(this.context.callNewRequestOptions(go.codeblock("opts...")));
                writer.newLine();
                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: this.getClassReference(),
                        fields: [
                            {
                                name: "baseURL",
                                value: go.TypeInstantiation.reference(
                                    go.selector({
                                        on: go.codeblock("options"),
                                        selector: go.codeblock("BaseURL")
                                    })
                                )
                            },
                            {
                                name: "caller",
                                value: go.TypeInstantiation.reference(
                                    this.context.caller.instantiate({
                                        client: go.TypeInstantiation.reference(
                                            go.selector({
                                                on: go.codeblock("options"),
                                                selector: go.codeblock("HTTPClient")
                                            })
                                        ),
                                        maxAttempts: go.TypeInstantiation.reference(
                                            go.selector({
                                                on: go.codeblock("options"),
                                                selector: go.codeblock("MaxAttempts")
                                            })
                                        )
                                    })
                                )
                            },
                            {
                                name: "header",
                                value: go.TypeInstantiation.reference(
                                    go.selector({
                                        on: go.codeblock("options"),
                                        selector: go.codeblock("ToHeader()")
                                    })
                                )
                            }
                        ]
                    })
                );
            })
        };
    }

    private getClassReference(): go.TypeReference {
        return this.subpackage != null
            ? this.context.getSubpackageRawClientClassReference(this.subpackage)
            : this.context.getRootRawClientClassReference();
    }

    private getPackageName(): string {
        return this.subpackage != null
            ? this.context.getSubpackageClientPackageName(this.subpackage)
            : this.context.getClientPackageName();
    }

    private getDirectory(): RelativeFilePath {
        return this.subpackage != null
            ? this.context.getSubpackageClientFileLocation(this.subpackage).directory
            : this.context.getRootClientDirectory();
    }

    private getImportPath(): string {
        return this.subpackage != null
            ? this.context.getSubpackageClientClassReference(this.subpackage).importPath
            : this.context.getRootClientImportPath();
    }
}
