import { RelativeFilePath } from "@fern-api/fs-utils";
import { OAuthTokenExchange, RustFile } from "@fern-api/rust-base";
import { Attribute, CodeBlock, Expression, PrimitiveType, PUBLIC, rust, UseStatement } from "@fern-api/rust-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export class ClientConfigGenerator {
    private readonly context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public generate(): RustFile {
        const clientConfigStruct = this.generateClientConfigStruct();
        const defaultImpl = this.generateDefaultImpl();

        const module = rust.module({
            useStatements: this.generateImports(),
            rawDeclarations: [clientConfigStruct.toString(), defaultImpl.toString()]
        });

        return new RustFile({
            filename: "config.rs",
            directory: RelativeFilePath.of("src"),
            fileContents: module.toString()
        });
    }

    private generateImports() {
        const imports = [
            new UseStatement({ path: "std::collections", items: ["HashMap"] }),
            new UseStatement({ path: "std::time", items: ["Duration"] })
        ];

        if (this.context.hasEnvironments()) {
            const environmentEnumName = this.context.getEnvironmentEnumName();
            imports.push(new UseStatement({ path: "crate", items: [environmentEnumName] }));
        }

        return imports;
    }

    private generateClientConfigStruct() {
        const fields = [
            rust.field({
                name: "base_url",
                type: rust.Type.string(),
                visibility: PUBLIC
            }),
            rust.field({
                name: "api_key",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "token",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "username",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "password",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "client_id",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "client_secret",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "oauth_token_endpoint",
                type: rust.Type.option(rust.Type.string()),
                visibility: PUBLIC
            }),
            rust.field({
                name: "oauth_token_exchange",
                type: rust.Type.option(
                    rust.Type.reference(rust.reference({ name: "crate::OAuthTokenExchangeConfig" }))
                ),
                visibility: PUBLIC
            }),
            rust.field({
                name: "timeout",
                type: rust.Type.reference(rust.reference({ name: "Duration" })),
                visibility: PUBLIC
            }),
            rust.field({
                name: "max_retries",
                type: rust.Type.primitive(PrimitiveType.U32),
                visibility: PUBLIC
            }),
            rust.field({
                name: "custom_headers",
                type: rust.Type.reference(rust.reference({ name: "HashMap<String, String>" })),
                visibility: PUBLIC
            }),
            rust.field({
                name: "user_agent",
                type: rust.Type.string(),
                visibility: PUBLIC
            })
        ];

        if (this.context.hasMultipleBaseUrls()) {
            const environmentEnumName = this.context.getEnvironmentEnumName();
            fields.push(
                rust.field({
                    name: "environment",
                    type: rust.Type.option(rust.Type.reference(rust.reference({ name: environmentEnumName }))),
                    visibility: PUBLIC
                })
            );
        }

        return rust.struct({
            name: "ClientConfig",
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone"])],
            fields
        });
    }

    private generateDefaultImpl() {
        const userAgent = `${this.context.case.pascalSafe(this.context.ir.apiName)} Rust SDK`;
        const environmentEnumName = this.context.getEnvironmentEnumName();
        const hasDefaultEnvironment = this.context.ir.environments?.defaultEnvironment !== undefined;

        // Platform headers for Fern SDK identification
        const sdkName = this.context.getCrateName();
        const sdkVersion = this.context.getCrateVersion();

        const defaultMethod = rust.method({
            name: "default",
            parameters: [],
            returnType: rust.Type.reference(rust.reference({ name: "Self" })),
            body: CodeBlock.fromExpression(
                Expression.structConstruction("Self", [
                    {
                        name: "base_url",
                        value:
                            this.context.hasEnvironments() && hasDefaultEnvironment
                                ? Expression.methodCall({
                                      target: Expression.methodCall({
                                          target: Expression.functionCall(`${environmentEnumName}::default`, []),
                                          method: "url",
                                          args: []
                                      }),
                                      method: "to_string",
                                      args: []
                                  })
                                : Expression.functionCall("String::new", [])
                    },
                    {
                        name: "api_key",
                        value: Expression.none()
                    },
                    {
                        name: "token",
                        value: Expression.none()
                    },
                    {
                        name: "username",
                        value: Expression.none()
                    },
                    {
                        name: "password",
                        value: Expression.none()
                    },
                    {
                        name: "client_id",
                        value: Expression.none()
                    },
                    {
                        name: "client_secret",
                        value: Expression.none()
                    },
                    {
                        name: "oauth_token_endpoint",
                        value: (() => {
                            const tokenEndpoint = this.context.getOAuthTokenEndpointPath();
                            return tokenEndpoint != null
                                ? Expression.raw(`Some(${JSON.stringify(tokenEndpoint)}.to_string())`)
                                : Expression.none();
                        })()
                    },
                    {
                        name: "oauth_token_exchange",
                        value: (() => {
                            const exchange = this.context.getOAuthTokenExchange();
                            return exchange != null
                                ? Expression.raw(this.buildOAuthTokenExchangeExpr(exchange))
                                : Expression.none();
                        })()
                    },
                    {
                        name: "timeout",
                        value: Expression.functionCall("Duration::from_secs", [Expression.numberLiteral(60)])
                    },
                    {
                        name: "max_retries",
                        value: Expression.numberLiteral(this.context.customConfig.maxRetries ?? 3)
                    },
                    {
                        name: "custom_headers",
                        value: Expression.raw(
                            `HashMap::from([
            ("X-Fern-Language".to_string(), "Rust".to_string()),
            ("X-Fern-SDK-Name".to_string(), "${sdkName}".to_string()),
            ("X-Fern-SDK-Version".to_string(), "${sdkVersion}".to_string()),
        ])`
                        )
                    },
                    {
                        name: "user_agent",
                        value: Expression.toString(Expression.stringLiteral(userAgent))
                    },
                    ...(this.context.hasMultipleBaseUrls()
                        ? [
                              {
                                  name: "environment",
                                  value: Expression.raw(
                                      hasDefaultEnvironment
                                          ? `Some(${environmentEnumName}::default())`
                                          : "None"
                                  )
                              }
                          ]
                        : [])
                ])
            )
        });

        return rust.implBlock({
            targetType: rust.Type.reference(rust.reference({ name: "ClientConfig" })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private buildOAuthTokenExchangeExpr(exchange: OAuthTokenExchange): string {
        const extraProperties =
            exchange.extraRequestProperties.length > 0
                ? `HashMap::from([
${exchange.extraRequestProperties
    .map(
        (property) =>
            `                (${JSON.stringify(property.name)}.to_string(), ${JSON.stringify(property.value)}.to_string()),`
    )
    .join("\n")}
            ])`
                : "HashMap::new()";
        return `Some(crate::OAuthTokenExchangeConfig {
            client_id_property: ${JSON.stringify(exchange.clientIdProperty)}.to_string(),
            client_secret_property: ${JSON.stringify(exchange.clientSecretProperty)}.to_string(),
            extra_request_properties: ${extraProperties},
            access_token_property: ${JSON.stringify(exchange.accessTokenProperty)}.to_string(),
            expires_in_property: ${JSON.stringify(exchange.expiresInProperty)}.to_string(),
            form_encoded: ${exchange.formEncoded},
        })`;
    }
}
