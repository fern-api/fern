import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

export class RootClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly package: Package;
    private readonly projectName: string;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.package = context.ir.rootPackage;
        this.projectName = context.ir.apiName.pascalCase.safeName;
    }

    public generate(): RustFile {
        const subpackages = this.getSubpackages();
        const clientName = this.getRootClientName();

        // Build the complete module file using AST
        const writer = rust.writer();
        
        // Imports
        this.writeImports(writer, subpackages);
        writer.newLine();
        writer.newLine();

        // ClientConfig struct
        this.generateClientConfigStruct().write(writer);
        writer.newLine();
        writer.newLine();

        // ClientConfig impl
        this.generateClientConfigImpl().write(writer);
        writer.newLine();
        writer.newLine();

        // RequestOptions struct
        this.generateRequestOptionsStruct().write(writer);
        writer.newLine();
        writer.newLine();

        // RequestOptions impl
        this.generateRequestOptionsImpl().write(writer);
        writer.newLine();
        writer.newLine();

        // HttpClient struct
        this.generateHttpClientStruct().write(writer);
        writer.newLine();
        writer.newLine();

        // HttpClient impl
        this.generateHttpClientImpl().write(writer);
        writer.newLine();
        writer.newLine();

        // ApiClientBuilder struct
        this.generateApiClientBuilderStruct().write(writer);
        writer.newLine();
        writer.newLine();

        // ApiClientBuilder impl
        this.generateApiClientBuilderImpl().write(writer);
        writer.newLine();
        writer.newLine();

        // Root client struct
        this.generateRootClientStruct(subpackages).write(writer);
        writer.newLine();
        writer.newLine();

        // Root client impl
        this.generateRootClientImpl(subpackages).write(writer);
        writer.newLine();
        writer.newLine();

        // Send/Sync impls
        this.writeSendSyncImpls(writer, clientName);

        return new RustFile({
            filename: "mod.rs",
            directory: RelativeFilePath.of("src/client"),
            fileContents: writer.toString()
        });
    }

    private writeImports(writer: rust.Writer, subpackages: Subpackage[]): void {
        writer.writeLine("use std::time::Duration;");
        writer.writeLine("use std::collections::HashMap;");
        writer.writeLine("use reqwest::{Client, RequestBuilder, Response};");
        writer.writeLine("use serde::{Serialize, Deserialize};");
        writer.writeLine("use crate::error::ApiError;");

        subpackages.forEach(subpackage => {
            const clientName = this.getSubClientName(subpackage);
            const moduleName = this.getSubClientModuleName(subpackage);
            writer.writeLine(`use crate::${moduleName}::${clientName};`);
        });
    }

    private generateClientConfigStruct(): rust.Struct {
        return rust.struct({
            name: "ClientConfig",
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug", "Clone"] })
            ],
            fields: [
                rust.field({
                    name: "base_url",
                    type: rust.Type.string(),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "api_key",
                    type: rust.Type.option(rust.Type.string()),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "bearer_token",
                    type: rust.Type.option(rust.Type.string()),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "timeout",
                    type: rust.Type.reference(new rust.Reference({ name: "Duration" })),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "max_retries",
                    type: rust.Type.primitive(rust.PrimitiveType.U32),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "custom_headers",
                    type: rust.Type.hashMap(rust.Type.string(), rust.Type.string()),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "user_agent",
                    type: rust.Type.string(),
                    visibility: { type: "public" }
                })
            ]
        });
    }

    private generateClientConfigImpl(): rust.ImplBlock {
        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: "ClientConfig" })),
            methods: [
                rust.method({
                    name: "new",
                    visibility: { type: "public" },
                    parameters: [{
                        name: "base_url",
                        parameterType: rust.Type.reference(new rust.Reference({ 
                            name: "impl Into<String>" 
                        })),
                        isRef: false
                    }],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromExpression(
                        rust.Expression.structLiteral("Self", [
                            { name: "base_url", value: rust.Expression.methodCall({
                                target: rust.Expression.reference("base_url"),
                                method: "into",
                                args: []
                            })},
                            { name: "api_key", value: rust.Expression.none() },
                            { name: "bearer_token", value: rust.Expression.none() },
                            { name: "timeout", value: rust.Expression.methodCall({
                                target: rust.Expression.reference("Duration"),
                                method: "from_secs",
                                args: [rust.Expression.raw("30")]
                            })},
                            { name: "max_retries", value: rust.Expression.raw("3") },
                            { name: "custom_headers", value: rust.Expression.methodCall({
                                target: rust.Expression.reference("HashMap"),
                                method: "new",
                                args: []
                            })},
                            { name: "user_agent", value: rust.Expression.methodCall({
                                target: rust.Expression.stringLiteral("Fern Rust SDK"),
                                method: "to_string",
                                args: []
                            })}
                        ])
                    )
                })
            ]
        });
    }

    private generateRequestOptionsStruct(): rust.Struct {
        return rust.struct({
            name: "RequestOptions",
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug", "Clone", "Default"] })
            ],
            fields: [
                rust.field({
                    name: "timeout",
                    type: rust.Type.option(rust.Type.reference(new rust.Reference({ name: "Duration" }))),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "headers",
                    type: rust.Type.hashMap(rust.Type.string(), rust.Type.string()),
                    visibility: { type: "public" }
                }),
                rust.field({
                    name: "max_retries",
                    type: rust.Type.option(rust.Type.primitive(rust.PrimitiveType.U32)),
                    visibility: { type: "public" }
                })
            ]
        });
    }

    private generateRequestOptionsImpl(): rust.ImplBlock {
        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: "RequestOptions" })),
            methods: [
                rust.method({
                    name: "new",
                    visibility: { type: "public" },
                    parameters: [],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromExpression(
                        rust.Expression.methodCall({
                            target: rust.Expression.reference("Self"),
                            method: "default",
                            args: []
                        })
                    )
                }),
                rust.method({
                    name: "with_timeout",
                    visibility: { type: "public" },
                    parameters: [
                        { name: "self", parameterType: rust.Type.str(), isSelf: true, isMut: true },
                        { name: "timeout", parameterType: rust.Type.reference(new rust.Reference({ name: "Duration" })) }
                    ],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.assignment(
                            rust.Expression.fieldAccess(rust.Expression.self(), "timeout"),
                            rust.Expression.some(rust.Expression.reference("timeout"))
                        ),
                        rust.Statement.expression(rust.Expression.self())
                    ])
                }),
                rust.method({
                    name: "with_header",
                    visibility: { type: "public" },
                    parameters: [
                        { name: "self", parameterType: rust.Type.str(), isSelf: true, isMut: true },
                        { name: "key", parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" })) },
                        { name: "value", parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" })) }
                    ],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.expression(rust.Expression.methodCall({
                            target: rust.Expression.fieldAccess(rust.Expression.self(), "headers"),
                            method: "insert",
                            args: [
                                rust.Expression.methodCall({ target: rust.Expression.reference("key"), method: "into", args: [] }),
                                rust.Expression.methodCall({ target: rust.Expression.reference("value"), method: "into", args: [] })
                            ]
                        })),
                        rust.Statement.expression(rust.Expression.self())
                    ])
                }),
                rust.method({
                    name: "with_max_retries",
                    visibility: { type: "public" },
                    parameters: [
                        { name: "self", parameterType: rust.Type.str(), isSelf: true, isMut: true },
                        { name: "retries", parameterType: rust.Type.primitive(rust.PrimitiveType.U32) }
                    ],
                    returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.assignment(
                            rust.Expression.fieldAccess(rust.Expression.self(), "max_retries"),
                            rust.Expression.some(rust.Expression.reference("retries"))
                        ),
                        rust.Statement.expression(rust.Expression.self())
                    ])
                })
            ]
        });
    }

    private generateHttpClientStruct(): rust.Struct {
        return rust.struct({
            name: "HttpClient",
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug", "Clone"] })
            ],
            fields: [
                rust.field({
                    name: "client",
                    type: rust.Type.reference(new rust.Reference({ name: "Client" }))
                }),
                rust.field({
                    name: "config",
                    type: rust.Type.reference(new rust.Reference({ name: "ClientConfig" }))
                })
            ]
        });
    }

    private generateHttpClientImpl(): rust.ImplBlock {
        // This is complex enough that we'll use raw strings for the method bodies
        // In a real implementation, we'd have more AST nodes for error handling, async blocks, etc.
        const methods: rust.Method[] = [
            rust.method({
                name: "new",
                visibility: { type: "public" },
                parameters: [{
                    name: "config",
                    parameterType: rust.Type.reference(new rust.Reference({ name: "ClientConfig" }))
                }],
                returnType: rust.Type.result(
                    rust.Type.reference(new rust.Reference({ name: "Self" })),
                    rust.Type.reference(new rust.Reference({ name: "ApiError" }))
                ),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.raw(`let client = Client::builder()
            .timeout(config.timeout)
            .user_agent(&config.user_agent)
            .build()
            .map_err(ApiError::Network)?;

        Ok(Self { client, config })`)
                ])
            })
        ];

        // Add HTTP method helpers
        ["get", "post", "put", "delete", "patch"].forEach(method => {
            methods.push(rust.method({
                name: method,
                visibility: { type: "public" },
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                    { name: "path", parameterType: rust.Type.str(), isRef: true }
                ],
                returnType: rust.Type.reference(new rust.Reference({ name: "RequestBuilder" })),
                body: rust.CodeBlock.fromExpression(
                    rust.Expression.methodCall({
                        target: rust.Expression.self(),
                        method: "request",
                        args: [
                            rust.Expression.stringLiteral(method.toUpperCase()),
                            rust.Expression.reference("path")
                        ]
                    })
                )
            }));
        });

        // Add complex methods with raw implementations
        methods.push(
            rust.method({
                name: "request",
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                    { name: "method", parameterType: rust.Type.str(), isRef: true },
                    { name: "path", parameterType: rust.Type.str(), isRef: true }
                ],
                returnType: rust.Type.reference(new rust.Reference({ name: "RequestBuilder" })),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.raw(`let url = format!("{}{}", self.config.base_url.trim_end_matches('/'), path);
        let mut request = match method {
            "GET" => self.client.get(&url),
            "POST" => self.client.post(&url),
            "PUT" => self.client.put(&url),
            "DELETE" => self.client.delete(&url),
            "PATCH" => self.client.patch(&url),
            _ => self.client.get(&url), // fallback
        };

        // Add custom headers from config
        for (key, value) in &self.config.custom_headers {
            request = request.header(key, value);
        }

        // Add authentication
        if let Some(ref bearer_token) = self.config.bearer_token {
            request = request.header("Authorization", format!("Bearer {}", bearer_token));
        } else if let Some(ref api_key) = self.config.api_key {
            request = request.header("Authorization", format!("Bearer {}", api_key));
        }

        request`)
                ])
            }),
            rust.method({
                name: "send",
                visibility: { type: "public" },
                isAsync: true,
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                    { name: "request", parameterType: rust.Type.reference(new rust.Reference({ name: "RequestBuilder" })) }
                ],
                returnType: rust.Type.result(
                    rust.Type.reference(new rust.Reference({ name: "R" })),
                    rust.Type.reference(new rust.Reference({ name: "ApiError" }))
                ),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.raw(`let response = request
            .send()
            .await
            .map_err(ApiError::Network)?;

        self.handle_response(response).await`)
                ])
            }),
            rust.method({
                name: "send_json",
                visibility: { type: "public" },
                isAsync: true,
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                    { name: "request", parameterType: rust.Type.reference(new rust.Reference({ name: "RequestBuilder" })) },
                    { name: "body", parameterType: rust.Type.reference(new rust.Reference({ name: "T" })), isRef: true }
                ],
                returnType: rust.Type.result(
                    rust.Type.reference(new rust.Reference({ name: "R" })),
                    rust.Type.reference(new rust.Reference({ name: "ApiError" }))
                ),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.raw(`let response = request
            .json(body)
            .send()
            .await
            .map_err(ApiError::Network)?;

        self.handle_response(response).await`)
                ])
            }),
            rust.method({
                name: "handle_response",
                isAsync: true,
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                    { name: "response", parameterType: rust.Type.reference(new rust.Reference({ name: "Response" })) }
                ],
                returnType: rust.Type.result(
                    rust.Type.reference(new rust.Reference({ name: "R" })),
                    rust.Type.reference(new rust.Reference({ name: "ApiError" }))
                ),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.raw(`let status = response.status();
        
        if status.is_success() {
            response
                .json::<R>()
                .await
                .map_err(ApiError::Serialization)
        } else {
            let status_code = status.as_u16();
            let body = response.text().await.ok();
            Err(ApiError::from_response(status_code, body.as_deref()))
        }`)
                ])
            })
        );

        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: "HttpClient" })),
            methods
        });
    }

    private generateApiClientBuilderStruct(): rust.Struct {
        return rust.struct({
            name: "ApiClientBuilder",
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug"] })
            ],
            fields: [
                rust.field({
                    name: "config",
                    type: rust.Type.reference(new rust.Reference({ name: "ClientConfig" }))
                })
            ]
        });
    }

    private generateApiClientBuilderImpl(): rust.ImplBlock {
        const clientName = this.getRootClientName();
        const methods: rust.Method[] = [
            rust.method({
                name: "new",
                visibility: { type: "public" },
                parameters: [{
                    name: "base_url",
                    parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" }))
                }],
                returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                body: rust.CodeBlock.fromExpression(
                    rust.Expression.structLiteral("Self", [
                        { name: "config", value: rust.Expression.methodCall({
                            target: rust.Expression.reference("ClientConfig"),
                            method: "new",
                            args: [rust.Expression.reference("base_url")]
                        })}
                    ])
                )
            })
        ];

        // Add builder methods
        const builderMethods = [
            { name: "api_key", field: "api_key", wrap: true },
            { name: "bearer_token", field: "bearer_token", wrap: true },
            { name: "timeout", field: "timeout", wrap: false, type: "Duration" },
            { name: "max_retries", field: "max_retries", wrap: false, type: "u32" },
            { name: "user_agent", field: "user_agent", wrap: true }
        ];

        builderMethods.forEach(({ name, field, wrap, type }) => {
            methods.push(rust.method({
                name,
                visibility: { type: "public" },
                parameters: [
                    { name: "self", parameterType: rust.Type.str(), isSelf: true, isMut: true },
                    { 
                        name: name === "max_retries" ? "retries" : name === "bearer_token" ? "token" : name === "api_key" ? "key" : name,
                        parameterType: rust.Type.reference(new rust.Reference({ 
                            name: wrap ? "impl Into<String>" : (type || "String") 
                        }))
                    }
                ],
                returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
                body: rust.CodeBlock.fromStatements([
                    rust.Statement.assignment(
                        rust.Expression.fieldAccess(
                            rust.Expression.fieldAccess(rust.Expression.self(), "config"),
                            field
                        ),
                        wrap ? rust.Expression.some(rust.Expression.methodCall({
                            target: rust.Expression.reference(name === "max_retries" ? "retries" : name === "bearer_token" ? "token" : name === "api_key" ? "key" : name),
                            method: "into",
                            args: []
                        })) : rust.Expression.reference(name === "max_retries" ? "retries" : name)
                    ),
                    rust.Statement.expression(rust.Expression.self())
                ])
            }));
        });

        // Add header method
        methods.push(rust.method({
            name: "header",
            visibility: { type: "public" },
            parameters: [
                { name: "self", parameterType: rust.Type.str(), isSelf: true, isMut: true },
                { name: "key", parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" })) },
                { name: "value", parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" })) }
            ],
            returnType: rust.Type.reference(new rust.Reference({ name: "Self" })),
            body: rust.CodeBlock.fromStatements([
                rust.Statement.expression(rust.Expression.methodCall({
                    target: rust.Expression.fieldAccess(
                        rust.Expression.fieldAccess(rust.Expression.self(), "config"),
                        "custom_headers"
                    ),
                    method: "insert",
                    args: [
                        rust.Expression.methodCall({ target: rust.Expression.reference("key"), method: "into", args: [] }),
                        rust.Expression.methodCall({ target: rust.Expression.reference("value"), method: "into", args: [] })
                    ]
                })),
                rust.Statement.expression(rust.Expression.self())
            ])
        }));

        // Add build method
        methods.push(rust.method({
            name: "build",
            visibility: { type: "public" },
            parameters: [
                { name: "self", parameterType: rust.Type.str(), isSelf: true }
            ],
            returnType: rust.Type.result(
                rust.Type.reference(new rust.Reference({ name: clientName })),
                rust.Type.reference(new rust.Reference({ name: "ApiError" }))
            ),
            body: rust.CodeBlock.fromExpression(
                rust.Expression.methodCall({
                    target: rust.Expression.reference(clientName),
                    method: "new",
                    args: [rust.Expression.fieldAccess(rust.Expression.self(), "config")]
                })
            )
        }));

        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: "ApiClientBuilder" })),
            methods
        });
    }

    private generateRootClientStruct(subpackages: Subpackage[]): rust.Struct {
        const clientName = this.getRootClientName();
        
        const fields = [
            rust.field({
                name: "config",
                type: rust.Type.reference(new rust.Reference({ name: "ClientConfig" }))
            }),
            ...subpackages.map(subpackage => 
                rust.field({
                    name: subpackage.name.snakeCase.safeName,
                    type: rust.Type.reference(new rust.Reference({ 
                        name: this.getSubClientName(subpackage) 
                    })),
                    visibility: { type: "public" }
                })
            )
        ];

        return rust.struct({
            name: clientName,
            visibility: { type: "public" },
            attributes: [
                rust.attribute({ name: "derive", args: ["Debug", "Clone"] })
            ],
            fields
        });
    }

    private generateRootClientImpl(subpackages: Subpackage[]): rust.ImplBlock {
        const clientName = this.getRootClientName();
        
        return rust.implBlock({
            targetType: rust.Type.reference(new rust.Reference({ name: clientName })),
            methods: [
                rust.method({
                    name: "new",
                    visibility: { type: "public" },
                    parameters: [{
                        name: "config",
                        parameterType: rust.Type.reference(new rust.Reference({ name: "ClientConfig" }))
                    }],
                    returnType: rust.Type.result(
                        rust.Type.reference(new rust.Reference({ name: "Self" })),
                        rust.Type.reference(new rust.Reference({ name: "ApiError" }))
                    ),
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.let({
                            name: "http_client",
                            value: rust.Expression.try(rust.Expression.methodCall({
                                target: rust.Expression.reference("HttpClient"),
                                method: "new",
                                args: [rust.Expression.methodCall({
                                    target: rust.Expression.reference("config"),
                                    method: "clone",
                                    args: []
                                })]
                            }))
                        }),
                        rust.Statement.raw(""),
                        rust.Statement.expression(rust.Expression.ok(
                            rust.Expression.structLiteral("Self", [
                                { name: "config", value: rust.Expression.reference("config") },
                                ...subpackages.map(subpackage => ({
                                    name: subpackage.name.snakeCase.safeName,
                                    value: rust.Expression.methodCall({
                                        target: rust.Expression.reference(this.getSubClientName(subpackage)),
                                        method: "new",
                                        args: [rust.Expression.methodCall({
                                            target: rust.Expression.reference("http_client"),
                                            method: "clone",
                                            args: []
                                        })]
                                    })
                                }))
                            ])
                        ))
                    ])
                }),
                rust.method({
                    name: "builder",
                    visibility: { type: "public" },
                    parameters: [{
                        name: "base_url",
                        parameterType: rust.Type.reference(new rust.Reference({ name: "impl Into<String>" }))
                    }],
                    returnType: rust.Type.reference(new rust.Reference({ name: "ApiClientBuilder" })),
                    body: rust.CodeBlock.fromExpression(
                        rust.Expression.methodCall({
                            target: rust.Expression.reference("ApiClientBuilder"),
                            method: "new",
                            args: [rust.Expression.reference("base_url")]
                        })
                    )
                }),
                rust.method({
                    name: "config",
                    visibility: { type: "public" },
                    parameters: [{
                        name: "self",
                        parameterType: rust.Type.str(),
                        isSelf: true,
                        isRef: true
                    }],
                    returnType: rust.Type.reference(new rust.Reference({ 
                        name: "&ClientConfig" 
                    })),
                    body: rust.CodeBlock.fromExpression(
                        rust.Expression.referenceOf(
                            rust.Expression.fieldAccess(rust.Expression.self(), "config")
                        )
                    )
                }),
                rust.method({
                    name: "apply_options",
                    parameters: [
                        { name: "self", parameterType: rust.Type.str(), isSelf: true, isRef: true },
                        { name: "request", parameterType: rust.Type.reference(new rust.Reference({ 
                            name: "&mut RequestBuilder" 
                        })) },
                        { name: "options", parameterType: rust.Type.option(rust.Type.reference(new rust.Reference({ 
                            name: "RequestOptions" 
                        }))) }
                    ],
                    body: rust.CodeBlock.fromStatements([
                        rust.Statement.raw(`if let Some(opts) = options {
            // Apply timeout if specified
            if let Some(timeout) = opts.timeout {
                *request = request.clone().timeout(timeout);
            }
            
            // Apply custom headers
            for (key, value) in opts.headers {
                *request = request.clone().header(key, value);
            }
            
            // Note: max_retries would be handled by retry middleware
        }`)
                    ])
                })
            ]
        });
    }

    private writeSendSyncImpls(writer: rust.Writer, clientName: string): void {
        writer.writeLine("// Ensure thread safety");
        writer.writeLine(`unsafe impl Send for ${clientName} {}`);
        writer.writeLine(`unsafe impl Sync for ${clientName} {}`);
        writer.writeLine(`unsafe impl Send for HttpClient {}`);
        writer.writeLine(`unsafe impl Sync for HttpClient {}`);
    }

    private getSubpackages(): Subpackage[] {
        return this.package.subpackages
            .map(subpackageId => this.context.getSubpackageOrThrow(subpackageId))
            .filter(subpackage => subpackage.service != null || subpackage.hasEndpointsInTree);
    }

    private getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.safeName}Client`;
    }

    private getSubClientModuleName(subpackage: Subpackage): string {
        return subpackage.name.snakeCase.safeName;
    }

    private getRootClientName(): string {
        return this.context.getClientName();
    }
} 