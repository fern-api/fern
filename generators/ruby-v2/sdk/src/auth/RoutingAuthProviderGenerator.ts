import { getWireValue } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { astNodeToCodeBlockWithComments } from "../utils/astNodeToCodeBlockWithComments.js";
import { Comments } from "../utils/comments.js";

const OAUTH_PROVIDER_PARAMETER_NAME = "oauth_provider";
const INFERRED_AUTH_PROVIDER_PARAMETER_NAME = "inferred_auth_provider";
const AVAILABLE_VARIABLE_NAME = "available_auth_headers";
const SECURITY_PARAMETER_NAME = "security";

interface RoutingParameter {
    name: string;
    docs: string;
}

/**
 * Generates the `Internal::RoutingAuthProvider` class used under endpoint-security
 * auth. Unlike the flat `ALL`/`ANY` policy (where a single set of auth headers is
 * baked into every request), endpoint-security applies only the schemes an endpoint
 * declares. Each endpoint passes its static `security` requirement to
 * `auth_headers_for_endpoint`, which builds only the headers for the FIRST
 * requirement whose schemes ALL have credentials available (OR across the list, AND
 * within a requirement). If none is satisfiable, it raises naming the missing
 * schemes. Mirrors the TypeScript RoutingAuthProvider and the Python
 * `get_auth_headers_for_endpoint` client-wrapper method.
 */
export class RoutingAuthProviderGenerator extends FileGenerator<RubyFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public static readonly CLASS_NAME = "RoutingAuthProvider";

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const internalModule = ruby.module({ name: "Internal" });
        const class_ = ruby.class_({ name: RoutingAuthProviderGenerator.CLASS_NAME });

        class_.addMethod(this.getInitializeMethod());
        class_.addMethod(this.getAuthHeadersMethod());
        class_.addMethod(this.getAuthHeadersForEndpointMethod());

        internalModule.addStatement(class_);
        rootModule.addStatement(internalModule);

        return new RubyFile({
            node: astNodeToCodeBlockWithComments(rootModule, [Comments.FrozenStringLiteral]),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getDirectory(): RelativeFilePath {
        return join(this.context.getRootFolderPath(), RelativeFilePath.of("internal"));
    }

    private getFilename(): string {
        return "routing_auth_provider.rb";
    }

    /**
     * The credential-bearing constructor parameters, one per auth scheme the API
     * declares. Every parameter defaults to nil so a caller can supply only the
     * credentials for the schemes they intend to use.
     */
    private getRoutingParameters(): RoutingParameter[] {
        const parameters: RoutingParameter[] = [];

        if (this.context.getBearerAuth() != null) {
            parameters.push({ name: this.context.getBearerTokenParameterName(), docs: "The bearer token." });
        }
        for (const headerScheme of this.context.getHeaderAuthSchemes()) {
            parameters.push({
                name: this.context.getCredentialParameterName(headerScheme.name),
                docs: "The header auth credential."
            });
        }
        const basicAuth = this.context.getBasicAuth();
        if (basicAuth != null) {
            if (basicAuth.usernameOmit !== true) {
                parameters.push({
                    name: this.context.getCredentialParameterName(basicAuth.username),
                    docs: "The basic auth username."
                });
            }
            if (basicAuth.passwordOmit !== true) {
                parameters.push({
                    name: this.context.getCredentialParameterName(basicAuth.password),
                    docs: "The basic auth password."
                });
            }
        }
        if (this.context.getOAuthAuth() != null) {
            parameters.push({ name: OAUTH_PROVIDER_PARAMETER_NAME, docs: "The OAuth token provider." });
        }
        if (this.context.getInferredAuth() != null) {
            parameters.push({ name: INFERRED_AUTH_PROVIDER_PARAMETER_NAME, docs: "The inferred auth token provider." });
        }

        return parameters;
    }

    private getInitializeMethod(): ruby.Method {
        const parameters = this.getRoutingParameters().map((parameter) =>
            ruby.parameters.keyword({
                name: parameter.name,
                type: ruby.Type.untyped(),
                initializer: ruby.nilValue(),
                docs: parameter.docs
            })
        );

        const method = ruby.method({
            name: "initialize",
            kind: ruby.MethodKind.Instance,
            parameters: { keyword: parameters },
            returnType: ruby.Type.void()
        });

        method.addStatement(
            ruby.codeblock((writer) => {
                for (const parameter of this.getRoutingParameters()) {
                    writer.writeLine(`@${parameter.name} = ${parameter.name}`);
                }
            })
        );

        return method;
    }

    /**
     * Endpoint-security routes auth per-endpoint via `auth_headers_for_endpoint`, so
     * the RawClient's per-request auth-header resolution (which calls `auth_headers`)
     * must contribute nothing. Returning an empty hash keeps that path a no-op.
     */
    private getAuthHeadersMethod(): ruby.Method {
        const method = ruby.method({
            name: "auth_headers",
            kind: ruby.MethodKind.Instance,
            docstring: "Endpoint-security applies auth per-endpoint, so no auth headers are added to every request.",
            returnType: ruby.Type.hash(ruby.Type.string(), ruby.Type.string())
        });
        method.addStatement(ruby.codeblock("{}"));
        return method;
    }

    private getAuthHeadersForEndpointMethod(): ruby.Method {
        const method = ruby.method({
            name: "auth_headers_for_endpoint",
            kind: ruby.MethodKind.Instance,
            docstring:
                "Returns the auth headers for a single endpoint given its static security requirements.\nBuilds only the headers for the first requirement whose schemes all have credentials available (OR across the list, AND within a requirement). Raises when none is satisfiable.",
            parameters: {
                keyword: [
                    ruby.parameters.keyword({
                        name: SECURITY_PARAMETER_NAME,
                        type: ruby.Type.untyped(),
                        docs: "The endpoint's security requirements (an OR-list of AND-maps of scheme key to scopes)."
                    })
                ]
            },
            returnType: ruby.Type.hash(ruby.Type.string(), ruby.Type.string())
        });

        method.addStatement(ruby.codeblock((writer) => this.writeAuthHeadersForEndpointBody(writer)));

        return method;
    }

    private writeAuthHeadersForEndpointBody(writer: ruby.Writer): void {
        writer.writeLine(`return {} if ${SECURITY_PARAMETER_NAME}.nil? || ${SECURITY_PARAMETER_NAME}.empty?`);
        writer.newLine();

        // available_auth_headers maps each scheme key that currently has credentials
        // to the header(s) it contributes.
        writer.writeLine(`${AVAILABLE_VARIABLE_NAME} = {}`);

        const bearerAuth = this.context.getBearerAuth();
        if (bearerAuth != null) {
            const tokenName = this.context.getBearerTokenParameterName();
            writer.writeLine(
                `${AVAILABLE_VARIABLE_NAME}[${JSON.stringify(bearerAuth.key)}] = { "Authorization" => "Bearer #{@${tokenName}}" } unless @${tokenName}.nil?`
            );
        }

        for (const headerScheme of this.context.getHeaderAuthSchemes()) {
            const paramName = this.context.getCredentialParameterName(headerScheme.name);
            const wireValue = getWireValue(headerScheme.name);
            let value: string;
            if (headerScheme.prefix != null) {
                // Escape Ruby interpolation sigils so a spec-supplied prefix cannot inject code.
                const safePrefix = headerScheme.prefix.replace(/#(?=[{$@])/g, "\\#");
                value = `"${safePrefix} #{@${paramName}}"`;
            } else {
                value = `@${paramName}.to_s`;
            }
            writer.writeLine(
                `${AVAILABLE_VARIABLE_NAME}[${JSON.stringify(headerScheme.key)}] = { ${JSON.stringify(wireValue)} => ${value} } unless @${paramName}.nil?`
            );
        }

        const basicAuth = this.context.getBasicAuth();
        if (basicAuth != null) {
            const usernameOmitted = basicAuth.usernameOmit === true;
            const passwordOmitted = basicAuth.passwordOmit === true;
            if (!(usernameOmitted && passwordOmitted)) {
                const usernameName = this.context.getCredentialParameterName(basicAuth.username);
                const passwordName = this.context.getCredentialParameterName(basicAuth.password);
                let credentialStr: string;
                if (usernameOmitted) {
                    credentialStr = `":#{@${passwordName}}"`;
                } else if (passwordOmitted) {
                    credentialStr = `"#{@${usernameName}}:"`;
                } else {
                    credentialStr = `"#{@${usernameName}}:#{@${passwordName}}"`;
                }
                const conditions: string[] = [];
                if (!usernameOmitted) {
                    conditions.push(`!@${usernameName}.nil?`);
                }
                if (!passwordOmitted) {
                    conditions.push(`!@${passwordName}.nil?`);
                }
                writer.writeLine(
                    `${AVAILABLE_VARIABLE_NAME}[${JSON.stringify(basicAuth.key)}] = { "Authorization" => "Basic #{Base64.strict_encode64(${credentialStr})}" } if ${conditions.join(" && ")}`
                );
            }
        }

        const oauthAuth = this.context.getOAuthAuth();
        if (oauthAuth != null) {
            writer.writeLine(
                `${AVAILABLE_VARIABLE_NAME}[${JSON.stringify(oauthAuth.key)}] = @${OAUTH_PROVIDER_PARAMETER_NAME}.auth_headers unless @${OAUTH_PROVIDER_PARAMETER_NAME}.nil?`
            );
        }

        const inferredAuth = this.context.getInferredAuth();
        if (inferredAuth != null) {
            writer.writeLine(
                `${AVAILABLE_VARIABLE_NAME}[${JSON.stringify(inferredAuth.key)}] = @${INFERRED_AUTH_PROVIDER_PARAMETER_NAME}.auth_headers unless @${INFERRED_AUTH_PROVIDER_PARAMETER_NAME}.nil?`
            );
        }

        writer.newLine();

        // OR across requirements: return the first requirement whose schemes are all satisfiable.
        writer.writeLine(`${SECURITY_PARAMETER_NAME}.each do |requirement|`);
        writer.indent();
        writer.writeLine(
            `next unless requirement.keys.all? { |scheme_key| ${AVAILABLE_VARIABLE_NAME}.key?(scheme_key) }`
        );
        writer.newLine();
        writer.writeLine("combined_headers = {}");
        writer.writeLine(
            `requirement.each_key { |scheme_key| combined_headers.merge!(${AVAILABLE_VARIABLE_NAME}[scheme_key]) }`
        );
        writer.writeLine("return combined_headers");
        writer.dedent();
        writer.writeLine("end");
        writer.newLine();

        // None satisfiable: raise naming the missing schemes, joined with AND within a
        // requirement and OR across requirements.
        writer.writeLine(`missing_schemes = ${SECURITY_PARAMETER_NAME}.map do |requirement|`);
        writer.indent();
        writer.writeLine(
            `requirement.keys.reject { |scheme_key| ${AVAILABLE_VARIABLE_NAME}.key?(scheme_key) }.join(" AND ")`
        );
        writer.dedent();
        writer.writeLine("end");
        writer.writeLine(
            'raise ArgumentError, "No authentication credentials provided that satisfy the endpoint\'s security requirements. Please provide credentials for: #{missing_schemes.join(" OR ")}"'
        );
    }
}
