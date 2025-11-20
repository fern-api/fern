import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import {
    HttpEndpoint,
    HttpService,
    InferredAuthScheme,
    IntermediateRepresentation,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class InferredAuthProviderGenerator extends FileGenerator<
    PhpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private readonly ir: IntermediateRepresentation;
    private readonly authScheme: InferredAuthScheme;
    private readonly endpoint: HttpEndpoint;
    private readonly service: HttpService;

    constructor(context: SdkGeneratorContext, ir: IntermediateRepresentation, authScheme: InferredAuthScheme) {
        super(context);
        this.ir = ir;
        this.authScheme = authScheme;

        const serviceId = authScheme.tokenEndpoint.endpoint.serviceId;
        const service = ir.services[serviceId];
        if (!service) {
            throw new Error(`Service with ID ${serviceId} not found.`);
        }
        this.service = service;

        const endpointId = authScheme.tokenEndpoint.endpoint.endpointId;
        const endpoint = service.endpoints.find((e) => e.id === endpointId);
        if (!endpoint) {
            throw new Error(`Endpoint with ID ${endpointId} not found in service ${serviceId}.`);
        }
        this.endpoint = endpoint;
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of("Auth"), RelativeFilePath.of("InferredAuthProvider.php"));
    }

    public doGenerate(): PhpFile {
        const authNamespace = this.context.getRootNamespace() + "\\Auth";
        const rootClientName = this.context.getRootClientClassName();
        
        const class_ = php.class_({
            name: "InferredAuthProvider",
            namespace: authNamespace
        });

        const rootClientRef = php.classReference({
            name: rootClientName,
            namespace: this.context.getRootNamespace()
        });

        class_.addField(
            php.field({
                name: "$client",
                access: "private",
                type: php.Type.reference(rootClientRef),
                docs: `@var ${rootClientName} $client`
            })
        );

        class_.addField(
            php.field({
                name: "$authTokenParameters",
                access: "private",
                type: php.Type.map(php.Type.string(), php.Type.mixed()),
                docs: "@var array<string, mixed> $authTokenParameters"
            })
        );

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            const dateTimeRef = php.classReference({
                name: "DateTime",
                namespace: ""
            });
            
            class_.addField(
                php.field({
                    name: "$expiresAt",
                    access: "private",
                    type: php.Type.optional(php.Type.reference(dateTimeRef)),
                    docs: "@var ?\\DateTime $expiresAt"
                })
            );

            class_.addField(
                php.field({
                    name: "$cachedAuthHeaders",
                    access: "private",
                    type: php.Type.optional(php.Type.map(php.Type.string(), php.Type.string())),
                    docs: "@var ?array<string, string> $cachedAuthHeaders"
                })
            );
        }

        class_.addConstructor(this.generateConstructor(rootClientRef));
        class_.addMethod(this.generateGetAuthHeadersMethod());

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            class_.addMethod(this.generateGetCachedAuthHeadersMethod());
        }
        class_.addMethod(this.generateGetAuthHeadersFromTokenEndpointMethod());

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            class_.addMethod(this.generateGetExpiresAtMethod());
        }

        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of("Auth"),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private generateConstructor(rootClientRef: php.ClassReference): php.Class.Constructor {
        return {
            access: "public",
            parameters: [
                php.parameter({
                    name: "client",
                    type: php.Type.reference(rootClientRef)
                }),
                php.parameter({
                    name: "authTokenParameters",
                    type: php.Type.map(php.Type.string(), php.Type.mixed()),
                    docs: "@var array<string, mixed> $authTokenParameters"
                })
            ],
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$this->client = $client");
                writer.writeTextStatement("$this->authTokenParameters = $authTokenParameters");
            })
        };
    }

    private generateGetAuthHeadersMethod(): php.Method {
        const hasExpiry = this.authScheme.tokenEndpoint.expiryProperty != null;

        return php.method({
            access: "public",
            name: "getAuthHeaders",
            return_: php.Type.map(php.Type.string(), php.Type.string()),
            parameters: [],
            docs: "Get authentication headers.\n\n@return array<string, string>",
            body: php.codeblock((writer) => {
                if (hasExpiry) {
                    writer.writeLine("try {");
                    writer.indent();
                    writer.writeTextStatement("return $this->getCachedAuthHeaders()");
                    writer.dedent();
                    writer.writeLine("} catch (\\Exception $e) {");
                    writer.indent();
                    writer.writeTextStatement("$this->cachedAuthHeaders = null");
                    writer.writeTextStatement("$this->expiresAt = null");
                    writer.writeTextStatement("throw $e");
                    writer.dedent();
                    writer.writeLine("}");
                } else {
                    writer.writeTextStatement("return $this->getAuthHeadersFromTokenEndpoint()");
                }
            })
        });
    }

    private generateGetCachedAuthHeadersMethod(): php.Method {
        return php.method({
            access: "private",
            name: "getCachedAuthHeaders",
            return_: php.Type.map(php.Type.string(), php.Type.string()),
            parameters: [],
            docs: "Get cached authentication headers.\n\n@return array<string, string>",
            body: php.codeblock((writer) => {
                writer.controlFlow("if", php.codeblock("$this->expiresAt !== null && $this->expiresAt <= new \\DateTime()"));
                writer.writeTextStatement("$this->cachedAuthHeaders = null");
                writer.endControlFlow();
                writer.writeLine();
                writer.controlFlow("if", php.codeblock("$this->cachedAuthHeaders === null"));
                writer.writeTextStatement("$this->cachedAuthHeaders = $this->getAuthHeadersFromTokenEndpoint()");
                writer.endControlFlow();
                writer.writeLine();
                writer.writeTextStatement("return $this->cachedAuthHeaders");
            })
        });
    }

    private generateGetAuthHeadersFromTokenEndpointMethod(): php.Method {
        return php.method({
            access: "private",
            name: "getAuthHeadersFromTokenEndpoint",
            return_: php.Type.map(php.Type.string(), php.Type.string()),
            parameters: [],
            docs: "Get authentication headers from token endpoint.\n\n@return array<string, string>",
            body: php.codeblock((writer) => {
                const requestClassName = this.getRequestClassName();
                
                writer.write("$request = new ");
                writer.write(requestClassName);
                writer.writeTextStatement("($this->authTokenParameters)");
                writer.writeLine();
                
                writer.write("$response = $this->client->");
                writer.write(this.getTokenEndpointMethodPath());
                writer.writeTextStatement("($request)");
                writer.writeLine();

                if (this.authScheme.tokenEndpoint.expiryProperty) {
                    writer.write("$this->expiresAt = $this->getExpiresAt(");
                    writer.write(this.getResponsePropertyAccess("$response", this.authScheme.tokenEndpoint.expiryProperty));
                    writer.writeTextStatement(")");
                    writer.writeLine();
                }

                writer.writeLine("return [");
                for (const header of this.authScheme.tokenEndpoint.authenticatedRequestHeaders) {
                    writer.write("    '");
                    writer.write(header.headerName);
                    writer.write("' => ");
                    if (header.valuePrefix) {
                        writer.write(`'${header.valuePrefix}' . `);
                    }
                    writer.write(this.getResponsePropertyAccess("$response", header.responseProperty));
                    writer.writeLine(",");
                }
                writer.writeTextStatement("]");
            })
        });
    }

    private generateGetExpiresAtMethod(): php.Method {
        const bufferInMinutes = 2;
        const dateTimeRef = php.classReference({
            name: "DateTime",
            namespace: ""
        });
        
        return php.method({
            access: "private",
            name: "getExpiresAt",
            return_: php.Type.reference(dateTimeRef),
            parameters: [
                php.parameter({
                    name: "expiresInSeconds",
                    type: php.Type.int()
                })
            ],
            docs: "Calculate expiry time with buffer.\n\n@param int $expiresInSeconds\n@return \\DateTime",
            body: php.codeblock((writer) => {
                writer.writeTextStatement("$expiryTime = time() + $expiresInSeconds - " + bufferInMinutes + " * 60");
                writer.writeTextStatement("return (new \\DateTime())->setTimestamp($expiryTime)");
            })
        });
    }

    private getTokenEndpointMethodPath(): string {
        const subpackageId = this.authScheme.tokenEndpoint.endpoint.subpackageId;
        if (subpackageId) {
            const subpackage = this.ir.subpackages[subpackageId];
            if (!subpackage) {
                throw new Error(`Subpackage with ID ${subpackageId} not found.`);
            }
            return `${subpackage.name.camelCase.safeName}->${this.endpoint.name.camelCase.unsafeName}`;
        }
        return this.endpoint.name.camelCase.unsafeName;
    }

    private getResponsePropertyAccess(variable: string, property: ResponseProperty): string {
        let access = variable;
        
        if (property.propertyPath) {
            for (const pathItem of property.propertyPath) {
                access += `->${pathItem.name.camelCase.unsafeName}`;
            }
        }
        
        access += `->${property.property.name.name.camelCase.unsafeName}`;
        
        return access;
    }

    private getRequestClassName(): string {
        const serviceLocation = this.context.getLocationForServiceId(this.authScheme.tokenEndpoint.endpoint.serviceId);
        
        let requestName: string;
        if (this.endpoint.sdkRequest?.shape.type === "wrapper") {
            requestName = this.endpoint.sdkRequest.shape.wrapperName.pascalCase.safeName;
        } else {
            requestName = this.endpoint.name.pascalCase.safeName;
        }
        
        if (!requestName.endsWith("Request")) {
            requestName += "Request";
        }
        
        return `\\${serviceLocation.namespace}\\Requests\\${requestName}`;
    }
}
