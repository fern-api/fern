import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { InferredAuthScheme, Literal, Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments";
import { Comments } from "../utils/comments";

const TOKEN_PARAMETER_NAME = "token";

interface InferredAuthParameter {
    snakeName: string;
    isOptional: boolean;
    literal?: Literal;
}

export class RootClientGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({ name: this.context.getRootClientClassName() });

        class_.addMethod(this.getInitializeMethod());

        for (const subpackage of this.getSubpackages()) {
            // skip subpackages that have no endpoints (recursively)
            if (!this.context.subPackageHasEndpoints(subpackage)) {
                continue;
            }
            class_.addMethod(this.getSubpackageClientGetter(subpackage, rootModule));
        }
        rootModule.addStatement(class_);
        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    private getDirectory(): RelativeFilePath {
        return this.context.getRootFolderPath();
    }

    public getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getFilename(): string {
        return "client.rb";
    }

    private getInitializeMethod(): ruby.Method {
        const parameters: ruby.KeywordParameter[] = [];

        const baseUrlParameter = ruby.parameters.keyword({
            name: "base_url",
            type: ruby.Type.nilable(ruby.Type.string()),
            initializer: undefined,
            docs: "Override the default base URL for the API, e.g., `https://api.example.com`"
        });
        parameters.push(baseUrlParameter);

        const authenticationParameters = this.getAuthenticationParameters();
        parameters.push(...authenticationParameters);

        const method = ruby.method({
            name: "initialize",
            kind: ruby.MethodKind.Instance,
            parameters: {
                keyword: parameters
            },
            returnType: ruby.Type.void()
        });

        const inferredAuth = this.context.getInferredAuth();
        if (inferredAuth != null) {
            method.addStatement(this.getInferredAuthInitializationStatement(inferredAuth));
        }

        method.addStatement(
            ruby.codeblock((writer) => {
                writer.write(`@raw_client = `);
                writer.writeNode(this.context.getRawClientClassReference());
                writer.writeLine(`.new(`);
                writer.indent();
                writer.writeLine(`base_url: base_url,`);
                writer.write(`headers: `);
                writer.writeNode(this.getRawClientHeaders());
                if (inferredAuth != null) {
                    writer.writeLine(`.merge(@auth_provider.get_auth_headers)`);
                } else {
                    writer.newLine();
                }
                writer.dedent();
                writer.writeLine(`)`);
            })
        );

        return method;
    }

    private getInferredAuthInitializationStatement(scheme: InferredAuthScheme): ruby.AstNode {
        const inferredParams = this.getParametersForInferredAuth(scheme);
        return ruby.codeblock((writer) => {
            writer.write(`@auth_provider = `);
            writer.writeNode(this.getInferredAuthProviderClassReference());
            writer.writeLine(`.new(`);
            writer.indent();
            for (let i = 0; i < inferredParams.length; i++) {
                const param = inferredParams[i];
                const isLast = i === inferredParams.length - 1;
                writer.writeLine(`${param.snakeName}: ${param.snakeName}${isLast ? "" : ","}`);
            }
            writer.dedent();
            writer.writeLine(`)`);
        });
    }

    private getInferredAuthProviderClassReference(): ruby.ClassReference {
        return ruby.classReference({
            name: "InferredAuthProvider",
            modules: [this.context.getRootModule().name],
            fullyQualified: true
        });
    }

    private getAuthenticationParameters(): ruby.KeywordParameter[] {
        const parameters: ruby.KeywordParameter[] = [];

        for (const scheme of this.context.ir.auth.schemes) {
            switch (scheme.type) {
                case "bearer": {
                    const param = ruby.parameters.keyword({
                        name: TOKEN_PARAMETER_NAME,
                        type: ruby.Type.string(),
                        initializer:
                            scheme.tokenEnvVar != null
                                ? ruby.codeblock((writer) => {
                                      writer.write(`ENV.fetch("${scheme.tokenEnvVar}", nil)`);
                                  })
                                : undefined,
                        docs: undefined
                    });
                    parameters.push(param);
                    break;
                }
                case "header": {
                    const param = ruby.parameters.keyword({
                        name: scheme.name.name.snakeCase.safeName,
                        type: ruby.Type.string(),
                        initializer:
                            scheme.headerEnvVar != null
                                ? ruby.codeblock((writer) => {
                                      writer.write(`ENV.fetch("${scheme.headerEnvVar}", nil)`);
                                  })
                                : undefined,
                        docs: undefined
                    });
                    parameters.push(param);
                    break;
                }
                case "inferred": {
                    const inferredParams = this.getParametersForInferredAuth(scheme);
                    for (const inferredParam of inferredParams) {
                        const param = ruby.parameters.keyword({
                            name: inferredParam.snakeName,
                            type: inferredParam.isOptional ? ruby.Type.nilable(ruby.Type.string()) : ruby.Type.string(),
                            initializer: inferredParam.isOptional ? ruby.nilValue() : undefined,
                            docs: undefined
                        });
                        parameters.push(param);
                    }
                    break;
                }
                default:
                    break;
            }
        }

        return parameters;
    }

    private getParametersForInferredAuth(scheme: InferredAuthScheme): InferredAuthParameter[] {
        const parameters: InferredAuthParameter[] = [];

        // Get the token endpoint to extract request properties
        const tokenEndpointReference = scheme.tokenEndpoint.endpoint;
        const service = this.context.ir.services[tokenEndpointReference.serviceId];
        if (service == null) {
            this.context.logger.warn(`Service with id ${tokenEndpointReference.serviceId} not found for inferred auth`);
            return [];
        }

        const endpoint = service.endpoints.find((e) => e.id === tokenEndpointReference.endpointId);
        if (endpoint == null) {
            this.context.logger.warn(
                `Endpoint with id ${tokenEndpointReference.endpointId} not found for inferred auth`
            );
            return [];
        }

        // Extract parameters from the token endpoint request
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest != null && sdkRequest.shape.type === "wrapper") {
            // Get the request body properties
            const requestBody = endpoint.requestBody;
            if (requestBody != null && requestBody.type === "inlinedRequestBody") {
                for (const property of requestBody.properties) {
                    const literal = this.maybeLiteral(property.valueType);
                    if (literal == null) {
                        // Only add non-literal properties as constructor parameters
                        parameters.push({
                            snakeName: property.name.name.snakeCase.unsafeName,
                            isOptional: this.isOptional(property.valueType)
                        });
                    }
                }
            }

            // Also add header parameters from the endpoint
            for (const header of endpoint.headers) {
                const literal = this.maybeLiteral(header.valueType);
                if (literal == null) {
                    parameters.push({
                        snakeName: header.name.name.snakeCase.unsafeName,
                        isOptional: this.isOptional(header.valueType)
                    });
                }
            }
        }

        return parameters;
    }

    private isOptional(typeReference: { type: string }): boolean {
        return typeReference.type === "container" || typeReference.type === "unknown";
    }

    private maybeLiteral(typeReference: {
        type: string;
        container?: { type: string; literal?: Literal };
    }): Literal | undefined {
        if (typeReference.type === "container") {
            const container = typeReference as { type: string; container: { type: string; literal?: Literal } };
            if (container.container?.type === "literal") {
                return container.container.literal;
            }
        }
        return undefined;
    }

    private getRawClientHeaders(): ruby.TypeLiteral {
        const headers: ruby.HashEntry[] = [];

        if (this.context.ir.sdkConfig.platformHeaders.userAgent != null) {
            headers.push({
                key: ruby.TypeLiteral.string("User-Agent"),
                value: ruby.TypeLiteral.string(this.context.ir.sdkConfig.platformHeaders.userAgent.value)
            });
        }

        headers.push({
            key: ruby.TypeLiteral.string(this.context.ir.sdkConfig.platformHeaders.language),
            value: ruby.TypeLiteral.string("Ruby")
        });

        for (const header of this.context.ir.auth.schemes) {
            switch (header.type) {
                case "bearer":
                    headers.push({
                        key: ruby.TypeLiteral.string("Authorization"),
                        value: ruby.TypeLiteral.string(`Bearer #{${TOKEN_PARAMETER_NAME}}`)
                    });
                    break;
                case "header": {
                    const headerParamName = header.name.name.snakeCase.safeName;
                    const headerName = header.name.wireValue;
                    const headerValue =
                        header.prefix != null ? `${header.prefix} #{${headerParamName}}` : `#{${headerParamName}}`;
                    headers.push({
                        key: ruby.TypeLiteral.string(headerName),
                        value: ruby.TypeLiteral.string(headerValue)
                    });
                    break;
                }
                default:
                    break;
            }
        }

        return ruby.TypeLiteral.hash(headers);
    }

    private getSubpackageClientGetter(subpackage: FernIr.Subpackage, rootModule: ruby.Module_): ruby.Method {
        return new ruby.Method({
            name: subpackage.name.snakeCase.safeName,
            kind: ruby.MethodKind.Instance,
            returnType: ruby.Type.class_(
                ruby.classReference({
                    name: "Client",
                    modules: [rootModule.name, subpackage.name.pascalCase.safeName],
                    fullyQualified: true
                })
            ),
            statements: [
                ruby.codeblock((writer) => {
                    writer.writeLine(
                        `@${subpackage.name.snakeCase.safeName} ||= ` +
                            `${rootModule.name}::` +
                            `${subpackage.name.pascalCase.safeName}::` +
                            `Client.new(client: @raw_client)`
                    );
                })
            ]
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.context.ir.rootPackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
