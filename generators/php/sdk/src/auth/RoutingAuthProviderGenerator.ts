import { getWireValue } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";

import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Describes a single auth scheme that participates in per-endpoint routing. Each
 * descriptor carries the scheme's routing key (the identifier used in
 * `HttpEndpoint.security`) plus enough information for both the RoutingAuthProvider
 * (which builds the scheme's headers) and the root client (which supplies the
 * scheme's credentials to the provider's constructor).
 */
export type RoutingScheme =
    | { kind: "bearer"; key: string; paramName: string }
    | { kind: "header"; key: string; paramName: string; headerName: string; prefix?: string }
    | { kind: "basic"; key: string; usernameParam?: string; passwordParam?: string }
    | { kind: "oauth"; key: string; paramName: string }
    | { kind: "inferred"; key: string; paramName: string };

const OAUTH_TOKEN_PROVIDER_PARAM = "oauthTokenProvider";
const INFERRED_AUTH_PROVIDER_PARAM = "inferredAuthProvider";

const AUTHORIZATION_HEADER = "Authorization";
const BEARER_PREFIX = "Bearer";
const BASIC_PREFIX = "Basic";

/**
 * Derives, in declaration order, the auth schemes that the RoutingAuthProvider must be
 * able to satisfy. Both the provider generator and the root client wire-up use this so
 * the constructor parameter names and routing keys never drift apart.
 */
export function getRoutingSchemes(context: SdkGeneratorContext): RoutingScheme[] {
    const schemes: RoutingScheme[] = [];
    for (const scheme of context.ir.auth.schemes) {
        switch (scheme.type) {
            case "bearer":
                schemes.push({ kind: "bearer", key: scheme.key, paramName: context.getParameterName(scheme.token) });
                break;
            case "header":
                schemes.push({
                    kind: "header",
                    key: scheme.key,
                    paramName: context.getParameterName(scheme.name),
                    headerName: getWireValue(scheme.name),
                    prefix: scheme.prefix
                });
                break;
            case "basic": {
                const usernameOmitted = !!scheme.usernameOmit;
                const passwordOmitted = !!scheme.passwordOmit;
                if (usernameOmitted && passwordOmitted) {
                    break;
                }
                schemes.push({
                    kind: "basic",
                    key: scheme.key,
                    usernameParam: usernameOmitted ? undefined : context.getParameterName(scheme.username),
                    passwordParam: passwordOmitted ? undefined : context.getParameterName(scheme.password)
                });
                break;
            }
            case "oauth":
                // Only route OAuth when its token provider is actually generated
                // (respects the generateOauthClients config).
                if (context.getOauth() != null) {
                    schemes.push({ kind: "oauth", key: scheme.key, paramName: OAUTH_TOKEN_PROVIDER_PARAM });
                }
                break;
            case "inferred":
                schemes.push({ kind: "inferred", key: scheme.key, paramName: INFERRED_AUTH_PROVIDER_PARAM });
                break;
            default:
                break;
        }
    }
    return schemes;
}

/**
 * Generates the `RoutingAuthProvider` core class emitted only under ENDPOINT_SECURITY.
 *
 * The provider holds every configured scheme's credentials and, given an endpoint's
 * static security requirements, returns only the headers for the FIRST requirement whose
 * schemes ALL have credentials available (OR across the list, AND within a requirement).
 * If no requirement is satisfiable it throws, naming the missing schemes joined by
 * ` AND ` / ` OR `. Credential resolution for provider-backed schemes (OAuth / inferred)
 * is deferred behind closures so a token endpoint is only called when its scheme is
 * actually selected.
 */
export class RoutingAuthProviderGenerator extends FileGenerator<PhpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public static readonly CLASS_NAME = "RoutingAuthProvider";
    public static readonly GET_AUTH_HEADERS_METHOD = "getAuthHeaders";

    private readonly schemes: RoutingScheme[];

    constructor(context: SdkGeneratorContext) {
        super(context);
        this.schemes = getRoutingSchemes(context);
    }

    public doGenerate(): PhpFile {
        const class_ = php.class_({
            name: RoutingAuthProviderGenerator.CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            docs:
                "Routes authentication per-endpoint. Given an endpoint's declared security\n" +
                "requirements, it applies the headers for the first requirement whose schemes\n" +
                "all have credentials available."
        });

        this.addFields(class_);
        class_.addConstructor(this.getConstructor());
        class_.addMethod(this.getGetAuthHeadersMethod());

        return new PhpFile({
            clazz: class_,
            directory: RelativeFilePath.of("Core"),
            rootNamespace: this.context.getRootNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of("Core"), RelativeFilePath.of(`${RoutingAuthProviderGenerator.CLASS_NAME}.php`));
    }

    private addFields(class_: php.Class): void {
        for (const param of this.getConstructorParameterSpecs()) {
            class_.addField(
                php.field({
                    name: `$${param.name}`,
                    access: "private",
                    type: param.type
                })
            );
        }
    }

    private getConstructor(): php.Class.Constructor {
        const specs = this.getConstructorParameterSpecs();
        return {
            parameters: specs.map((spec) =>
                php.parameter({
                    name: spec.name,
                    type: spec.type,
                    docs: spec.docs
                })
            ),
            body: php.codeblock((writer) => {
                for (const spec of specs) {
                    writer.writeTextStatement(`$this->${spec.name} = $${spec.name}`);
                }
            })
        };
    }

    private getConstructorParameterSpecs(): { name: string; type: php.Type; docs?: string }[] {
        const specs: { name: string; type: php.Type; docs?: string }[] = [];
        for (const scheme of this.schemes) {
            switch (scheme.kind) {
                case "bearer":
                case "header":
                    specs.push({ name: scheme.paramName, type: php.Type.optional(php.Type.string()) });
                    break;
                case "basic":
                    if (scheme.usernameParam != null) {
                        specs.push({ name: scheme.usernameParam, type: php.Type.optional(php.Type.string()) });
                    }
                    if (scheme.passwordParam != null) {
                        specs.push({ name: scheme.passwordParam, type: php.Type.optional(php.Type.string()) });
                    }
                    break;
                case "oauth":
                    specs.push({
                        name: scheme.paramName,
                        type: php.Type.optional(
                            php.Type.reference(
                                php.classReference({
                                    name: "OAuthTokenProvider",
                                    namespace: this.context.getCoreNamespace()
                                })
                            )
                        )
                    });
                    break;
                case "inferred":
                    specs.push({
                        name: scheme.paramName,
                        type: php.Type.optional(
                            php.Type.reference(
                                php.classReference({
                                    name: "InferredAuthProvider",
                                    namespace: this.context.getCoreNamespace()
                                })
                            )
                        )
                    });
                    break;
                default:
                    break;
            }
        }
        return specs;
    }

    private getGetAuthHeadersMethod(): php.Method {
        const securityType = php.Type.optional(
            php.Type.array(php.Type.map(php.Type.string(), php.Type.array(php.Type.string())))
        );
        return php.method({
            name: RoutingAuthProviderGenerator.GET_AUTH_HEADERS_METHOD,
            access: "public",
            parameters: [
                php.parameter({
                    name: "security",
                    type: securityType,
                    initializer: php.codeblock("null"),
                    docs: "The endpoint's security requirements (an OR-list of AND-maps of scheme keys to scopes)."
                })
            ],
            return_: php.Type.map(php.Type.string(), php.Type.string()),
            docs: "Returns the auth headers for the first satisfiable security requirement.",
            body: php.codeblock((writer) => {
                writer.controlFlow("if", php.codeblock("$security === null || count($security) === 0"));
                writer.writeTextStatement("return []");
                writer.endControlFlow();
                writer.writeLine();

                writer.writeLine("/** @var array<string, callable(): array<string, string>> $available */");
                writer.writeTextStatement("$available = []");
                this.writeAvailableSchemes(writer);
                writer.writeLine();

                // OR across requirements: pick the first fully-satisfiable requirement.
                writer.controlFlow("foreach", php.codeblock("$security as $requirement"));
                writer.writeTextStatement("$schemeKeys = array_keys($requirement)");
                writer.writeTextStatement("$satisfiable = true");
                writer.controlFlow("foreach", php.codeblock("$schemeKeys as $schemeKey"));
                writer.controlFlow("if", php.codeblock("!isset($available[$schemeKey])"));
                writer.writeTextStatement("$satisfiable = false");
                writer.writeTextStatement("break");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.controlFlow("if", php.codeblock("$satisfiable"));
                writer.writeTextStatement("$headers = []");
                writer.controlFlow("foreach", php.codeblock("$schemeKeys as $schemeKey"));
                writer.writeTextStatement("$headers = array_merge($headers, $available[$schemeKey]())");
                writer.endControlFlow();
                writer.writeTextStatement("return $headers");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeLine();

                // No requirement satisfiable: raise, naming the missing schemes.
                writer.writeTextStatement("$requirementHints = []");
                writer.controlFlow("foreach", php.codeblock("$security as $requirement"));
                writer.writeTextStatement("$missing = []");
                writer.controlFlow("foreach", php.codeblock("array_keys($requirement) as $schemeKey"));
                writer.controlFlow("if", php.codeblock("!isset($available[$schemeKey])"));
                writer.writeTextStatement("$missing[] = $schemeKey");
                writer.endControlFlow();
                writer.endControlFlow();
                writer.writeTextStatement("$requirementHints[] = implode(' AND ', $missing)");
                writer.endControlFlow();
                writer.writeLine("throw new \\Exception(");
                writer.writeLine(
                    '    "No authentication credentials provided that satisfy the endpoint\'s security requirements. "'
                );
                writer.writeLine("    . \"Please provide credentials for: \" . implode(' OR ', $requirementHints)");
                writer.writeTextStatement(")");
            })
        });
    }

    private writeAvailableSchemes(writer: php.Writer): void {
        for (const scheme of this.schemes) {
            switch (scheme.kind) {
                case "bearer": {
                    const local = scheme.paramName;
                    writer.writeTextStatement(`$${local} = $this->${local}`);
                    writer.controlFlow("if", php.codeblock(`$${local} !== null`));
                    writer.writeTextStatement(
                        `$available['${scheme.key}'] = fn (): array => ['${AUTHORIZATION_HEADER}' => "${BEARER_PREFIX} {$${local}}"]`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "header": {
                    const local = scheme.paramName;
                    writer.writeTextStatement(`$${local} = $this->${local}`);
                    writer.controlFlow("if", php.codeblock(`$${local} !== null`));
                    const value = scheme.prefix != null ? `"${scheme.prefix} {$${local}}"` : `$${local}`;
                    writer.writeTextStatement(
                        `$available['${scheme.key}'] = fn (): array => ['${scheme.headerName}' => ${value}]`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "basic": {
                    const usernameLocal = scheme.usernameParam;
                    const passwordLocal = scheme.passwordParam;
                    const conditions: string[] = [];
                    if (usernameLocal != null) {
                        writer.writeTextStatement(`$${usernameLocal} = $this->${usernameLocal}`);
                        conditions.push(`$${usernameLocal} !== null`);
                    }
                    if (passwordLocal != null) {
                        writer.writeTextStatement(`$${passwordLocal} = $this->${passwordLocal}`);
                        conditions.push(`$${passwordLocal} !== null`);
                    }
                    const usernameExpr = usernameLocal != null ? `{$${usernameLocal}}` : "";
                    const passwordExpr = passwordLocal != null ? `{$${passwordLocal}}` : "";
                    writer.controlFlow("if", php.codeblock(conditions.join(" && ")));
                    writer.writeTextStatement(
                        `$available['${scheme.key}'] = fn (): array => ['${AUTHORIZATION_HEADER}' => "${BASIC_PREFIX} " . base64_encode("${usernameExpr}:${passwordExpr}")]`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "oauth": {
                    const local = scheme.paramName;
                    writer.writeTextStatement(`$${local} = $this->${local}`);
                    writer.controlFlow("if", php.codeblock(`$${local} !== null`));
                    writer.writeTextStatement(
                        `$available['${scheme.key}'] = fn (): array => ['${AUTHORIZATION_HEADER}' => "${BEARER_PREFIX} " . $${local}->getToken()]`
                    );
                    writer.endControlFlow();
                    break;
                }
                case "inferred": {
                    const local = scheme.paramName;
                    writer.writeTextStatement(`$${local} = $this->${local}`);
                    writer.controlFlow("if", php.codeblock(`$${local} !== null`));
                    writer.writeTextStatement(
                        `$available['${scheme.key}'] = fn (): array => $${local}->getAuthHeaders()`
                    );
                    writer.endControlFlow();
                    break;
                }
                default:
                    break;
            }
        }
    }
}
