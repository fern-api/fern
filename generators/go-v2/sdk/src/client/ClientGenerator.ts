import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { go } from "@fern-api/go-ast";
import { FileGenerator, GoFile } from "@fern-api/go-base";

import {
    BasicAuthScheme,
    BearerAuthScheme,
    FernFilepath,
    HeaderAuthScheme,
    HttpService,
    Name,
    ServiceId,
    Subpackage,
    SubpackageId
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace ClientGenerator {
    interface Args {
        context: SdkGeneratorContext;
        fernFilepath: FernFilepath;
        subpackage: Subpackage | undefined;
        nestedSubpackages: SubpackageId[];
        serviceId: ServiceId | undefined;
        service: HttpService | undefined;
    }
}

export class ClientGenerator extends FileGenerator<GoFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private fernFilepath: FernFilepath;
    private nestedSubpackages: SubpackageId[] = [];
    private subpackage: Subpackage | undefined;
    private serviceId: ServiceId | undefined;
    private service: HttpService | undefined;

    constructor({ fernFilepath, subpackage, nestedSubpackages, context, serviceId, service }: ClientGenerator.Args) {
        super(context);
        this.fernFilepath = fernFilepath;
        this.subpackage = subpackage;
        this.nestedSubpackages = nestedSubpackages;
        this.serviceId = serviceId;
        this.service = service;
    }

    public doGenerate(): GoFile {
        const struct = go.struct({
            ...this.context.getClientClassReference({
                fernFilepath: this.fernFilepath,
                subpackage: this.subpackage
            })
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

        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            struct.addField(
                go.field({
                    name: this.context.getClassName(subpackage.name),
                    type: go.Type.pointer(
                        go.Type.reference(
                            this.context.getClientClassReference({ fernFilepath: subpackage.fernFilepath, subpackage })
                        )
                    )
                })
            );
        }

        if (this.serviceId != null && this.service != null) {
            for (const endpoint of this.service.endpoints) {
                const methods = this.context.endpointGenerator.generate({
                    serviceId: this.serviceId,
                    service: this.service,
                    subpackage: this.subpackage,
                    endpoint
                });
                struct.addMethod(...methods);
            }
            if (this.service.endpoints.length > 0) {
                struct.addField(
                    go.field({
                        name: "WithRawResponse",
                        type: go.Type.pointer(
                            go.Type.reference(
                                this.context.getRawClientClassReference({
                                    fernFilepath: this.service.name.fernFilepath,
                                    subpackage: this.subpackage
                                })
                            )
                        )
                    })
                );
            }
        }

        return new GoFile({
            node: struct,
            rootImportPath: this.context.getRootImportPath(),
            packageName: this.getPackageName(),
            importPath: this.getImportPath(),
            directory: this.getDirectory(),
            filename: this.context.getClientFilename(this.subpackage),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.context.getClientFilename(this.subpackage)));
    }

    private getConstructor(): go.Struct.Constructor {
        const fields = [
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
        ];
        for (const subpackageId of this.nestedSubpackages) {
            const subpackage = this.context.getSubpackageOrThrow(subpackageId);
            if (!this.context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }
            fields.push({
                name: this.context.getClassName(subpackage.name),
                value: this.instantiateClient({ subpackage })
            });
        }
        if (this.service != null && this.service.endpoints.length > 0) {
            fields.push({
                name: "WithRawResponse",
                value: this.instantiateRawClient()
            });
        }
        return {
            name: this.context.getClientConstructorName(this.subpackage),
            parameters: [this.context.getVariadicRequestOptionParameter()],
            body: go.codeblock((writer) => {
                writer.write("options := ");
                writer.writeNode(this.context.callNewRequestOptions(go.codeblock("opts...")));
                writer.newLine();
                this.writeEnvironmentVariables({ writer });
                writer.write("return ");
                writer.writeNode(
                    go.TypeInstantiation.structPointer({
                        typeReference: this.context.getClientClassReference({
                            fernFilepath: this.fernFilepath,
                            subpackage: this.subpackage
                        }),
                        fields
                    })
                );
            })
        };
    }

    private writeEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        this.writeAuthEnvironmentVariables({ writer });
        this.writeHeaderEnvironmentVariables({ writer });
    }

    private writeHeaderEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        for (const header of this.context.ir.headers) {
            if (header.env == null) {
                continue;
            }
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(header.name.name),
                env: header.env
            });
        }
    }

    private writeAuthEnvironmentVariables({ writer }: { writer: go.Writer }): void {
        if (this.context.ir.auth == null) {
            return;
        }
        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "basic":
                    this.writeBasicAuthEnvironmmentVariables({ writer, scheme });
                    break;
                case "bearer":
                    this.writeBearerAuthEnvironmmentVariables({ writer, scheme });
                    break;
                case "header":
                    this.writeHeaderAuthEnvironmmentVariables({ writer, scheme });
                    break;
                case "oauth":
                    // TODO: OAuth is not supported yet.
                    break;
            }
        }
    }

    private writeBasicAuthEnvironmmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: BasicAuthScheme;
    }): void {
        if (scheme.usernameEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.username),
                env: scheme.usernameEnvVar
            });
        }
        if (scheme.passwordEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.password),
                env: scheme.passwordEnvVar
            });
        }
    }

    private writeBearerAuthEnvironmmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: BearerAuthScheme;
    }): void {
        if (scheme.tokenEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.token),
                env: scheme.tokenEnvVar
            });
        }
    }

    private writeHeaderAuthEnvironmmentVariables({
        writer,
        scheme
    }: {
        writer: go.Writer;
        scheme: HeaderAuthScheme;
    }): void {
        if (scheme.headerEnvVar != null) {
            this.writeEnvConditional({
                writer,
                propertyReference: this.getOptionsPropertyReference(scheme.name.name),
                env: scheme.headerEnvVar
            });
        }
    }

    private writeEnvConditional({
        writer,
        propertyReference,
        env
    }: {
        writer: go.Writer;
        propertyReference: go.Selector;
        env: string;
    }): void {
        writer.write("if ");
        writer.writeNode(propertyReference);
        writer.writeLine(' == "" {');
        writer.indent();
        writer.writeNode(propertyReference);
        writer.write(" = ");
        writer.writeNode(this.context.callGetenv(env));
        writer.newLine();
        writer.dedent();
        writer.writeLine("}");
    }

    private getOptionsPropertyReference(name: Name): go.Selector {
        return go.selector({ on: go.codeblock("options"), selector: go.codeblock(this.context.getFieldName(name)) });
    }

    private instantiateClient({ subpackage }: { subpackage: Subpackage }): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: this.getClientConstructor({ subpackage }),
                arguments_: [go.codeblock("opts...")],
                multiline: false
            })
        );
    }

    private instantiateRawClient(): go.TypeInstantiation {
        return go.TypeInstantiation.reference(
            go.invokeFunc({
                func: go.typeReference({
                    name: this.context.getRawClientConstructorName(this.subpackage),
                    importPath: this.context.getClientFileLocation({
                        fernFilepath: this.fernFilepath,
                        subpackage: this.subpackage
                    }).importPath
                }),
                arguments_: [go.codeblock("options")],
                multiline: false
            })
        );
    }

    private getClientConstructor({ subpackage }: { subpackage: Subpackage }): go.TypeReference {
        return go.typeReference({
            name: this.context.getClientConstructorName(subpackage),
            importPath: this.context.getClientFileLocation({ fernFilepath: subpackage.fernFilepath, subpackage })
                .importPath
        });
    }

    private getPackageName(): string {
        return this.context.getClientPackageName({ fernFilepath: this.fernFilepath, subpackage: this.subpackage });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .directory;
    }

    private getImportPath(): string {
        return this.context.getClientFileLocation({ fernFilepath: this.fernFilepath, subpackage: this.subpackage })
            .importPath;
    }
}
