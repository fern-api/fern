import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, CodeBlock, Expression, PrimitiveType, PUBLIC, rust, UseStatement } from "@fern-api/rust-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

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

        if (this.hasEnvironments()) {
            const environmentEnumName = this.getEnvironmentEnumName();
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

        return rust.struct({
            name: "ClientConfig",
            visibility: PUBLIC,
            attributes: [Attribute.derive(["Debug", "Clone"])],
            fields
        });
    }

    private generateDefaultImpl() {
        const userAgent = `${this.context.ir.apiName.pascalCase.safeName} Rust SDK`;
        const environmentEnumName = this.getEnvironmentEnumName();
        const hasDefaultEnvironment = this.context.ir.environments?.defaultEnvironment !== undefined;

        const defaultMethod = rust.method({
            name: "default",
            parameters: [],
            returnType: rust.Type.reference(rust.reference({ name: "Self" })),
            body: CodeBlock.fromExpression(
                Expression.structConstruction("Self", [
                    {
                        name: "base_url",
                        value:
                            this.hasEnvironments() && hasDefaultEnvironment
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
                        name: "timeout",
                        value: Expression.functionCall("Duration::from_secs", [Expression.numberLiteral(60)])
                    },
                    {
                        name: "max_retries",
                        value: Expression.numberLiteral(3)
                    },
                    {
                        name: "custom_headers",
                        value: Expression.functionCall("HashMap::new", [])
                    },
                    {
                        name: "user_agent",
                        value: Expression.toString(Expression.stringLiteral(userAgent))
                    }
                ])
            )
        });

        return rust.implBlock({
            targetType: rust.Type.reference(rust.reference({ name: "ClientConfig" })),
            traitName: "Default",
            methods: [defaultMethod]
        });
    }

    private hasEnvironments(): boolean {
        return this.context.ir.environments?.environments != null;
    }

    private getEnvironmentEnumName(): string {
        const customConfig = this.context.customConfig;
        return customConfig.environmentEnumName || "Environment";
    }
}
